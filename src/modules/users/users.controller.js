import { sendSuccess } from '../../common/response/api-response.js';
import { createUsersService } from './users.service.js';

export function createUsersController(service = createUsersService()) {
  return {
    me: async (request, response) => sendSuccess(response, await service.getMe(request.user.id)),
    updateMe: async (request, response) =>
      sendSuccess(response, await service.updateMe(request.user.id, request.validated.body)),
    changePassword: async (request, response) =>
      sendSuccess(response, await service.changePassword(request.user.id, request.validated.body)),
    deleteMe: async (request, response) =>
      sendSuccess(response, await service.deleteMe(request.user.id)),
    stats: async (request, response) => sendSuccess(response, await service.stats(request.user.id)),
    activities: async (request, response) =>
      sendSuccess(response, await service.activities(request.user.id)),
  };
}
