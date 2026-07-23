import { sendSuccess } from '../../common/response/api-response.js';
import { createOccupationsService } from './occupations.service.js';

export function createOccupationsController(service = createOccupationsService()) {
  return {
    list: async (request, response) => {
      const page = await service.list(request.validated.query, request.user?.id);
      return sendSuccess(response, page.data, { meta: page.meta });
    },
    detail: async (request, response) =>
      sendSuccess(
        response,
        await service.detail(request.validated.params.occupationId, request.user?.id),
      ),
    compare: async (request, response) =>
      sendSuccess(response, await service.compare(request.validated.query.ids)),
    suggestions: async (request, response) =>
      sendSuccess(response, await service.suggestions(request.validated.query)),
  };
}
