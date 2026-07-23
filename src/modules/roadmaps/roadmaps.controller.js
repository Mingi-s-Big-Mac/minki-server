import { sendSuccess } from '../../common/response/api-response.js';
import { createRoadmapsService } from './roadmaps.service.js';

export function createRoadmapsController(service = createRoadmapsService()) {
  return {
    create: async (request, response) =>
      sendSuccess(response, await service.create(request.user.id, request.validated.body), {
        statusCode: 201,
      }),
    list: async (request, response) => sendSuccess(response, await service.list(request.user.id)),
    detail: async (request, response) =>
      sendSuccess(
        response,
        await service.detail(request.user.id, request.validated.params.roadmapId),
      ),
    remove: async (request, response) =>
      sendSuccess(
        response,
        await service.remove(request.user.id, request.validated.params.roadmapId),
      ),
  };
}
