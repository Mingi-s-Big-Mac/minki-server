import { AppError } from '../../common/errors/app-error.js';
import { hashPassword, verifyPassword } from '../../common/security/password.js';
import { signAccessToken } from '../../common/security/token.js';
import { getEnv } from '../../config/env.js';
import { createAuthRepository } from './auth.repository.js';

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

function issueSession(user) {
  return {
    accessToken: signAccessToken(user),
    user,
  };
}

export function createAuthService({ repository = createAuthRepository(), config = getEnv() } = {}) {
  return {
    async signUp(input) {
      const domain = ensureAllowedDomain(input.email, config);
      const existing = await repository.findUserByEmail(input.email);
      if (existing) {
        throw new AppError('이미 가입된 이메일입니다.', {
          statusCode: 409,
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      const school = await repository.findSchoolByDomain(domain);
      const user = await repository.createUser({
        email: input.email,
        passwordHash: await hashPassword(input.password),
        nickname: input.nickname,
        grade: input.grade,
        majorText: input.majorText,
        majorId: input.majorId,
        schoolId: input.schoolId ?? school?.id,
      });

      return issueSession(user);
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
      return issueSession(publicUser);
    },
    getMe(userId) {
      return repository.findPublicUserById(userId);
    },
  };
}
