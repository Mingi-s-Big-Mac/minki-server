import { sendSuccess } from '../../common/response/api-response.js';
import { createSchoolsService } from './schools.service.js';

export function createSchoolsController(service = createSchoolsService()) {
  return {
    async list(request, response) {
      const page = await service.list(request.validated.query);
      return sendSuccess(response, page.data, { meta: page.meta });
    },
  };
}
