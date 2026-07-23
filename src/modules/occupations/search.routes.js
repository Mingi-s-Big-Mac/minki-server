import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { validateRequest } from '../../common/middleware/validate.js';
import { createOccupationsController } from './occupations.controller.js';
import { suggestionsSchema } from './occupations.schema.js';

export function createSearchRouter(controller = createOccupationsController()) {
  const router = Router();
  router.use(authenticate);
  router.get('/suggestions', validateRequest(suggestionsSchema), controller.suggestions);
  return router;
}
