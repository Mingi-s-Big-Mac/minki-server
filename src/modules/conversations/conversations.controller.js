import { sendSuccess } from '../../common/response/api-response.js';
import { createConversationsService } from './conversations.service.js';

export function createConversationsController(service = createConversationsService()) {
  return {
    create: async (request, response) =>
      sendSuccess(response, await service.create(request.user.id, request.validated.body), {
        statusCode: 201,
      }),
    list: async (request, response) => sendSuccess(response, await service.list(request.user.id)),
    detail: async (request, response) =>
      sendSuccess(
        response,
        await service.detail(request.user.id, request.validated.params.conversationId),
      ),
    remove: async (request, response) =>
      sendSuccess(
        response,
        await service.remove(request.user.id, request.validated.params.conversationId),
      ),
    createMessage: async (request, response) =>
      sendSuccess(
        response,
        await service.createMessage(
          request.user.id,
          request.validated.params.conversationId,
          request.validated.body,
        ),
        { statusCode: 201 },
      ),
  };
}
