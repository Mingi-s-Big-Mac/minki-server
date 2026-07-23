import { randomInt } from 'node:crypto';

import { AppError } from '../../common/errors/app-error.js';
import { hashPassword, verifyPassword } from '../../common/security/password.js';
import {
  createOpaqueToken,
  expiresAtFromNow,
  hashToken,
  signAccessToken,
} from '../../common/security/token.js';
import { getEnv } from '../../config/env.js';
import { createAuthRepository } from './auth.repository.js';
import { createMailProvider } from './mail.provider.js';

const maxVerificationAttempts = 5;

function emailDomainOf(email) {
  return email.split('@').at(-1).toLowerCase();
}

function ensureAllowedDomain(email, config) {
  const domain = emailDomainOf(email);
  if (!config.allowedEmailDomains.includes(domain)) {
    throw new AppError('허용되지 않은 학교 이메일 도메인입니다.', {
      statusCode: 400,
      code: 'EMAIL_DOMAIN_NOT_ALLOWED',
    });
  }
  return domain;
}

function createCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

function publicAuthTokens(user, refreshToken) {
  return {
    accessToken: signAccessToken(user),
    refreshToken,
    user,
  };
}

export function createAuthService({
  repository = createAuthRepository(),
  mailProvider = createMailProvider(),
  config = getEnv(),
} = {}) {
  async function issueTokens(user) {
    const refreshToken = createOpaqueToken();
    await repository.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: expiresAtFromNow(config.refreshTokenExpiresIn),
    });
    return publicAuthTokens(user, refreshToken);
  }

  return {
    async requestEmailVerification({ email, purpose }) {
      const domain = ensureAllowedDomain(email, config);
      const school = await repository.findSchoolByDomain(domain);
      const code = createCode();
      const verification = await repository.createEmailVerification({
        email,
        purpose,
        codeHash: await hashPassword(code),
        expiresAt: expiresAtFromNow(config.emailVerificationExpiresIn),
      });

      await mailProvider.sendEmailVerification({ email, code, purpose });

      return {
        id: verification.id,
        email,
        schoolMatched: Boolean(school),
        delivery: mailProvider.enabled ? 'email' : 'not_configured',
        ...(config.nodeEnv === 'test' ? { testCode: code } : {}),
      };
    },
    async confirmEmailVerification({ email, code, purpose }) {
      ensureAllowedDomain(email, config);
      const verification = await repository.findLatestVerification(email, purpose);
      if (!verification || verification.verifiedAt || verification.expiresAt <= new Date()) {
        throw new AppError('유효하지 않거나 만료된 인증 코드입니다.', {
          statusCode: 400,
          code: 'EMAIL_VERIFICATION_INVALID',
        });
      }

      if (verification.attemptCount >= maxVerificationAttempts) {
        throw new AppError('인증 코드 시도 횟수를 초과했습니다.', {
          statusCode: 429,
          code: 'EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED',
        });
      }

      const matches = await verifyPassword(code, verification.codeHash);
      if (!matches) {
        await repository.incrementVerificationAttempts(verification.id);
        throw new AppError('유효하지 않거나 만료된 인증 코드입니다.', {
          statusCode: 400,
          code: 'EMAIL_VERIFICATION_INVALID',
        });
      }

      await repository.markVerificationVerified(verification.id);
      return { verified: true };
    },
    async signUp(input) {
      ensureAllowedDomain(input.email, config);
      const existing = await repository.findUserByEmail(input.email);
      if (existing) {
        throw new AppError('이미 가입된 이메일입니다.', {
          statusCode: 409,
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      const verification = await repository.findLatestVerification(input.email, 'SIGN_UP');
      if (!verification?.verifiedAt) {
        throw new AppError('이메일 인증이 필요합니다.', {
          statusCode: 400,
          code: 'EMAIL_NOT_VERIFIED',
        });
      }

      const user = await repository.signUpWithVerification({
        verificationId: verification.id,
        user: {
          email: input.email,
          passwordHash: await hashPassword(input.password),
          nickname: input.nickname,
          grade: input.grade,
          majorText: input.majorText,
          majorId: input.majorId,
          schoolId: input.schoolId,
          emailVerifiedAt: new Date(),
        },
      });

      return issueTokens(user);
    },
    async signIn({ email, password }) {
      const user = await repository.findUserByEmail(email);
      const valid =
        user && user.status === 'ACTIVE' && (await verifyPassword(password, user.passwordHash));
      if (!valid) {
        throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', {
          statusCode: 401,
          code: 'INVALID_CREDENTIALS',
        });
      }

      const publicUser = await repository.updateLastLogin(user.id);
      return issueTokens(publicUser);
    },
    async refresh({ refreshToken }) {
      const existing = await repository.findRefreshToken(hashToken(refreshToken));
      if (
        !existing ||
        existing.revokedAt ||
        existing.expiresAt <= new Date() ||
        existing.user.status !== 'ACTIVE'
      ) {
        throw new AppError('유효하지 않은 refresh token입니다.', {
          statusCode: 401,
          code: 'REFRESH_TOKEN_INVALID',
        });
      }

      const nextRefreshToken = createOpaqueToken();
      await repository.rotateRefreshToken({
        tokenId: existing.id,
        replacement: {
          userId: existing.userId,
          tokenHash: hashToken(nextRefreshToken),
          expiresAt: expiresAtFromNow(config.refreshTokenExpiresIn),
        },
      });

      const user = await repository.findPublicUserById(existing.userId);
      return publicAuthTokens(user, nextRefreshToken);
    },
    async signOut({ refreshToken }) {
      await repository.revokeRefreshToken(hashToken(refreshToken));
      return { signedOut: true };
    },
    getMe(userId) {
      return repository.findPublicUserById(userId);
    },
  };
}
