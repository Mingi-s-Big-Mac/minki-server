import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.js';
import { validateRequest } from '../../common/middleware/validate.js';
import { signInSchema, signUpSchema } from './auth.schema.js';
import { createAuthController } from './auth.controller.js';

export function createAuthRouter(controller = createAuthController()) {
  const router = Router();
  const strictLimiter = createRateLimiter({ max: 10, windowMs: 60_000 });

  router.post('/sign-up', validateRequest(signUpSchema), controller.signUp);
  router.post('/sign-in', strictLimiter, validateRequest(signInSchema), controller.signIn);
  router.post('/sign-out', controller.signOut);
  router.get('/me', authenticate, controller.me);

  return router;
}
