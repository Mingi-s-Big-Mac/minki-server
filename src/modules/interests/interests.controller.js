import { sendSuccess } from '../../common/response/api-response.js';
import { createInterestsService } from './interests.service.js';

export function createInterestsController(service = createInterestsService()) {
  return {
    list: async (request, response) => sendSuccess(response, await service.list(request.user.id)),
    add: async (request, response) =>
      sendSuccess(
        response,
        await service.add(request.user.id, request.validated.params.occupationId),
        {
          statusCode: 201,
        },
      ),
    remove: async (request, response) =>
      sendSuccess(
        response,
        await service.remove(request.user.id, request.validated.params.occupationId),
      ),
  };
}
