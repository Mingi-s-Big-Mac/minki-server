import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { createDashboardController } from './dashboard.controller.js';

export function createDashboardRouter(controller = createDashboardController()) {
  const router = Router();
  router.use(authenticate);
  router.get('/', controller.get);
  return router;
}
