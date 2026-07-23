import { Router } from 'express';

import { createHealthRouter } from '../modules/health/health.routes.js';

export function createApiRouter(checkDatabase) {
  const router = Router();

  router.use('/health', createHealthRouter(checkDatabase));

  return router;
}
