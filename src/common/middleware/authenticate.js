import jwt from 'jsonwebtoken';

import { AppError } from '../errors/app-error.js';
import { getEnv } from '../../config/env.js';

export function authenticate(request, _response, next) {
  const authorization = request.headers.authorization;
  const [scheme, token] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    next(new AppError('인증이 필요합니다.', { statusCode: 401, code: 'UNAUTHORIZED' }));
    return;
  }

  try {
    const payload = jwt.verify(token, getEnv().accessTokenSecret);
    request.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError('유효하지 않은 인증 정보입니다.', { statusCode: 401, code: 'UNAUTHORIZED' }));
  }
}
