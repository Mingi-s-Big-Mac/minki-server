import { Router } from 'express';

import { createAuthRouter } from '../modules/auth/auth.routes.js';
import { createCatalogRouter } from '../modules/catalog/catalog.routes.js';
import { createConversationsRouter } from '../modules/conversations/conversations.routes.js';
import { createDashboardRouter } from '../modules/dashboard/dashboard.routes.js';
import { createHealthRouter } from '../modules/health/health.routes.js';
import { createInterestsRouter } from '../modules/interests/interests.routes.js';
import { createOccupationsRouter } from '../modules/occupations/occupations.routes.js';
import { createSearchRouter } from '../modules/occupations/search.routes.js';
import { createRoadmapsRouter } from '../modules/roadmaps/roadmaps.routes.js';
import { createSchoolsRouter } from '../modules/schools/schools.routes.js';
import { createUsersRouter } from '../modules/users/users.routes.js';

export function createApiRouter(checkDatabase) {
  const router = Router();

  router.use('/auth', createAuthRouter());
  router.use('/users', createUsersRouter());
  router.use('/schools', createSchoolsRouter());
  router.use('/catalog', createCatalogRouter());
  router.use('/search', createSearchRouter());
  router.use('/occupations', createOccupationsRouter());
  router.use('/interests', createInterestsRouter());
  router.use('/dashboard', createDashboardRouter());
  router.use('/roadmaps', createRoadmapsRouter());
  router.use('/conversations', createConversationsRouter());
  router.use('/health', createHealthRouter(checkDatabase));

  return router;
}
