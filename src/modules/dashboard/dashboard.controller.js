import { sendSuccess } from '../../common/response/api-response.js';
import { createDashboardService } from './dashboard.service.js';

export function createDashboardController(service = createDashboardService()) {
  return {
    get: async (request, response) => sendSuccess(response, await service.get(request.user.id)),
  };
}
