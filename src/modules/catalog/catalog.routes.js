import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { validateRequest } from '../../common/middleware/validate.js';
import { listQuerySchema } from './list.schema.js';
import { createCatalogController } from './catalog.controller.js';

export function createCatalogRouter(controller = createCatalogController()) {
  const router = Router();
  router.use(authenticate);
  router.get('/categories', validateRequest(listQuerySchema), controller.categories);
  router.get('/skills', validateRequest(listQuerySchema), controller.skills);
  router.get('/qualifications', validateRequest(listQuerySchema), controller.qualifications);
  router.get('/majors', validateRequest(listQuerySchema), controller.majors);
  return router;
}
