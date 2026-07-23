import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.js';
import { validateRequest } from '../../common/middleware/validate.js';
import {
  confirmEmailVerificationSchema,
  refreshSchema,
  requestEmailVerificationSchema,
  signInSchema,
  signOutSchema,
  signUpSchema,
} from './auth.schema.js';
import { createAuthController } from './auth.controller.js';

export function createAuthRouter(controller = createAuthController()) {
  const router = Router();
  const strictLimiter = createRateLimiter({ max: 10, windowMs: 60_000 });

  router.post(
    '/email-verifications',
    strictLimiter,
    validateRequest(requestEmailVerificationSchema),
    controller.requestEmailVerification,
  );
  router.post(
    '/email-verifications/confirm',
    strictLimiter,
    validateRequest(confirmEmailVerificationSchema),
    controller.confirmEmailVerification,
  );
  router.post('/sign-up', validateRequest(signUpSchema), controller.signUp);
  router.post('/sign-in', strictLimiter, validateRequest(signInSchema), controller.signIn);
  router.post('/refresh', validateRequest(refreshSchema), controller.refresh);
  router.post('/sign-out', validateRequest(signOutSchema), controller.signOut);
  router.get('/me', authenticate, controller.me);

  return router;
}
