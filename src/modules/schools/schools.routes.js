import { Router } from 'express';

import { validateRequest } from '../../common/middleware/validate.js';
import { listQuerySchema } from '../catalog/list.schema.js';
import { createSchoolsController } from './schools.controller.js';

export function createSchoolsRouter(controller = createSchoolsController()) {
  const router = Router();
  router.get('/', validateRequest(listQuerySchema), controller.list);
  return router;
}
