import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { validateRequest } from '../../common/middleware/validate.js';
import { createInterestsController } from './interests.controller.js';
import { interestOccupationSchema } from './interests.schema.js';

export function createInterestsRouter(controller = createInterestsController()) {
  const router = Router();
  router.use(authenticate);
  router.get('/occupations', controller.list);
  router.post(
    '/occupations/:occupationId',
    validateRequest(interestOccupationSchema),
    controller.add,
  );
  router.delete(
    '/occupations/:occupationId',
    validateRequest(interestOccupationSchema),
    controller.remove,
  );
  return router;
}
