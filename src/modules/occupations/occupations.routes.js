import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { validateRequest } from '../../common/middleware/validate.js';
import { compareSchema, occupationIdSchema, occupationListSchema } from './occupations.schema.js';
import { createOccupationsController } from './occupations.controller.js';

export function createOccupationsRouter(controller = createOccupationsController()) {
  const router = Router();
  router.use(authenticate);
  router.get('/compare', validateRequest(compareSchema), controller.compare);
  router.get('/', validateRequest(occupationListSchema), controller.list);
  router.get('/:occupationId', validateRequest(occupationIdSchema), controller.detail);
  return router;
}
