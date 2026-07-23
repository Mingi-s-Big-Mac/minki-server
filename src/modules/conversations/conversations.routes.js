import { Router } from 'express';

import { authenticate } from '../../common/middleware/authenticate.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.js';
import { validateRequest } from '../../common/middleware/validate.js';
import { createConversationsController } from './conversations.controller.js';
import {
  conversationIdSchema,
  createConversationSchema,
  createMessageSchema,
} from './conversations.schema.js';

export function createConversationsRouter(controller = createConversationsController()) {
  const router = Router();
  const aiLimiter = createRateLimiter({ max: 20, windowMs: 60_000 });

  router.use(authenticate);
  router.post('/', validateRequest(createConversationSchema), controller.create);
  router.get('/', controller.list);
  router.get('/:conversationId', validateRequest(conversationIdSchema), controller.detail);
  router.delete('/:conversationId', validateRequest(conversationIdSchema), controller.remove);
  router.post(
    '/:conversationId/messages',
    aiLimiter,
    validateRequest(createMessageSchema),
    controller.createMessage,
  );
  return router;
}
