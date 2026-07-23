import { describe, expect, it } from 'vitest';

import { createAuthService } from '../src/modules/auth/auth.service.js';

function createRepository(overrides = {}) {
  const state = {
    user: null,
  };

  return {
    state,
    findSchoolByDomain: async () => null,
    findUserByEmail: async (email) => (state.user?.email === email ? state.user : null),
    findPublicUserById: async (id) =>
      state.user?.id === id ? { ...state.user, passwordHash: undefined } : null,
    createUser: async (user) => {
      state.user = { id: '11111111-1111-4111-8111-111111111111', status: 'ACTIVE', ...user };
      return { ...state.user, passwordHash: undefined };
    },
    updateLastLogin: async () => ({ ...state.user, passwordHash: undefined }),
    ...overrides,
  };
}

const config = {
  nodeEnv: 'test',
  allowedEmailDomains: ['example.ac.kr'],
  accessTokenSecret: 'test_access_token_secret',
  accessTokenExpiresIn: '15m',
};

describe('auth service', () => {
  it('rejects disallowed email domains on sign up', async () => {
    const service = createAuthService({ repository: createRepository(), config });

    await expect(
      service.signUp({
        email: 'student@blocked.ac.kr',
        password: 'password123',
        nickname: 'student',
        grade: 2,
        majorText: 'Computer Science',
      }),
    ).rejects.toMatchObject({ code: 'EMAIL_DOMAIN_NOT_ALLOWED' });
  });

  it('signs up and signs in without email verification', async () => {
    const repository = createRepository();
    const service = createAuthService({ repository, config });

    const signedUp = await service.signUp({
      email: 'student@example.ac.kr',
      password: 'password123',
      nickname: 'student',
      grade: 2,
      majorText: 'Computer Science',
    });
    expect(signedUp.user.passwordHash).toBeUndefined();
    expect(signedUp.accessToken).toBeTruthy();

    const signedIn = await service.signIn({
      email: 'student@example.ac.kr',
      password: 'password123',
    });
    expect(signedIn.accessToken).toBeTruthy();
  });

  it('rejects duplicate sign up', async () => {
    const repository = createRepository();
    const service = createAuthService({ repository, config });

    await service.signUp({
      email: 'student@example.ac.kr',
      password: 'password123',
      nickname: 'student',
      grade: 2,
      majorText: 'Computer Science',
    });

    await expect(
      service.signUp({
        email: 'student@example.ac.kr',
        password: 'password123',
        nickname: 'student2',
        grade: 2,
        majorText: 'Computer Science',
      }),
    ).rejects.toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' });
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
