import { rateLimit } from 'express-rate-limit';

import { AppError } from '../errors/app-error.js';

export function createRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler(request, response, next) {
      next(
        new AppError('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', {
          statusCode: 429,
          code: 'TOO_MANY_REQUESTS',
        }),
      );
    },
  });
}
