import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { validateRequest } from '../../common/middleware/validate.js';
import { changePasswordSchema, updateMeSchema } from './users.schema.js';
import { createUsersController } from './users.controller.js';

export function createUsersRouter(controller = createUsersController()) {
  const router = Router();

  router.use(authenticate);
  router.get('/me', controller.me);
  router.patch('/me', validateRequest(updateMeSchema), controller.updateMe);
  router.patch('/me/password', validateRequest(changePasswordSchema), controller.changePassword);
  router.delete('/me', controller.deleteMe);
  router.get('/me/stats', controller.stats);
  router.get('/me/activities', controller.activities);

  return router;
}
