import { Router } from 'express';

import { createHealthController } from './health.controller.js';

export function createHealthRouter(checkDatabase) {
  const router = Router();
  const controller = createHealthController(checkDatabase);

  router.get('/', controller.getHealth);
  router.get('/db', controller.getDatabaseHealth);

  return router;
}
