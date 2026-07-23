import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { validateRequest } from '../../common/middleware/validate.js';
import { createRoadmapsController } from './roadmaps.controller.js';
import { createRoadmapSchema, roadmapIdSchema } from './roadmaps.schema.js';

export function createRoadmapsRouter(controller = createRoadmapsController()) {
  const router = Router();
  router.use(authenticate);
  router.post('/', validateRequest(createRoadmapSchema), controller.create);
  router.get('/', controller.list);
  router.get('/:roadmapId', validateRequest(roadmapIdSchema), controller.detail);
  router.delete('/:roadmapId', validateRequest(roadmapIdSchema), controller.remove);
  return router;
}
