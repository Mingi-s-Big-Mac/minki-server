import { describe, expect, it } from 'vitest';

import { createAuthService } from '../src/modules/auth/auth.service.js';

function createRepository(overrides = {}) {
  const state = {
    verification: null,
    user: null,
    refreshToken: null,
  };

  return {
    state,
    findSchoolByDomain: async () => null,
    findUserByEmail: async (email) => (state.user?.email === email ? state.user : null),
    findPublicUserById: async (id) =>
      state.user?.id === id ? { ...state.user, passwordHash: undefined } : null,
    createEmailVerification: async (data) => {
      state.verification = {
        id: 'verification-id',
        attemptCount: 0,
        createdAt: new Date(),
        ...data,
      };
      return state.verification;
    },
    findLatestVerification: async () => state.verification,
    incrementVerificationAttempts: async () => {
      state.verification.attemptCount += 1;
    },
    markVerificationVerified: async () => {
      state.verification.verifiedAt = new Date();
      return state.verification;
    },
    signUpWithVerification: async ({ user }) => {
      state.user = { id: '11111111-1111-4111-8111-111111111111', status: 'ACTIVE', ...user };
      return { ...state.user, passwordHash: undefined };
    },
    updateLastLogin: async () => ({ ...state.user, passwordHash: undefined }),
    createRefreshToken: async (data) => {
      state.refreshToken = { id: 'refresh-id', ...data };
      return state.refreshToken;
    },
    findRefreshToken: async (tokenHash) =>
      state.refreshToken?.tokenHash === tokenHash
        ? { ...state.refreshToken, user: state.user, userId: state.user.id }
        : null,
    rotateRefreshToken: async ({ replacement }) => {
      state.refreshToken.revokedAt = new Date();
      state.refreshToken = { id: 'refresh-id-2', ...replacement };
      return state.refreshToken;
    },
    revokeRefreshToken: async () => ({ count: 1 }),
    ...overrides,
  };
}

const config = {
  nodeEnv: 'test',
  allowedEmailDomains: ['example.ac.kr'],
  emailVerificationExpiresIn: '10m',
  accessTokenSecret: 'test_access_token_secret',
  accessTokenExpiresIn: '15m',
  refreshTokenSecret: 'test_refresh_token_secret',
  refreshTokenExpiresIn: '30d',
};

describe('auth service', () => {
  it('rejects disallowed email domains', async () => {
    const service = createAuthService({ repository: createRepository(), config });

    await expect(
      service.requestEmailVerification({ email: 'student@blocked.ac.kr', purpose: 'SIGN_UP' }),
    ).rejects.toMatchObject({ code: 'EMAIL_DOMAIN_NOT_ALLOWED' });
  });

  it('reports an unavailable email delivery service without leaking provider errors', async () => {
    const mailProvider = {
      enabled: true,
      sendEmailVerification: async () => {
        throw new Error('SMTP authentication failed');
      },
    };
    const service = createAuthService({
      repository: createRepository(),
      mailProvider,
      config,
    });

    await expect(
      service.requestEmailVerification({ email: 'student@example.ac.kr', purpose: 'SIGN_UP' }),
    ).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE', statusCode: 503 });
  });

  it('rejects sign up before email verification', async () => {
    const repository = createRepository();
    const service = createAuthService({ repository, config });

    await expect(
      service.signUp({
        email: 'student@example.ac.kr',
        password: 'password123',
        nickname: 'student',
        grade: 2,
        majorText: 'Computer Science',
      }),
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' });
  });

  it('signs up, signs in, rotates refresh tokens and signs out', async () => {
    const repository = createRepository();
    const service = createAuthService({
      repository,
      config,
      mailProvider: { enabled: true, sendEmailVerification: async () => ({ sent: true }) },
    });
    const verification = await service.requestEmailVerification({
      email: 'student@example.ac.kr',
      purpose: 'SIGN_UP',
    });
    await service.confirmEmailVerification({
      email: 'student@example.ac.kr',
      purpose: 'SIGN_UP',
      code: verification.testCode,
    });

    const signedUp = await service.signUp({
      email: 'student@example.ac.kr',
      password: 'password123',
      nickname: 'student',
      grade: 2,
      majorText: 'Computer Science',
    });
    expect(signedUp.user.passwordHash).toBeUndefined();

    const signedIn = await service.signIn({
      email: 'student@example.ac.kr',
      password: 'password123',
    });
    const refreshed = await service.refresh({ refreshToken: signedIn.refreshToken });
    expect(refreshed.refreshToken).not.toBe(signedIn.refreshToken);

    await expect(service.refresh({ refreshToken: signedIn.refreshToken })).rejects.toMatchObject({
      code: 'REFRESH_TOKEN_INVALID',
    });
    await expect(service.signOut({ refreshToken: refreshed.refreshToken })).resolves.toEqual({
      signedOut: true,
    });
  });

  it('blocks deleted users from signing in', async () => {
    const repository = createRepository({
      findUserByEmail: async () => ({
        id: 'user-id',
        email: 'student@example.ac.kr',
        status: 'DELETED',
        passwordHash: 'hash',
      }),
    });
    const service = createAuthService({ repository, config });

    await expect(
      service.signIn({ email: 'student@example.ac.kr', password: 'password123' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });
});
