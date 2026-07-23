import { sendSuccess } from '../../common/response/api-response.js';
import { createCatalogService } from './catalog.service.js';

function sendPage(response, page) {
  return sendSuccess(response, page.data, { meta: page.meta });
}

export function createCatalogController(service = createCatalogService()) {
  return {
    categories: async (request, response) =>
      sendPage(response, await service.categories(request.validated.query)),
    skills: async (request, response) =>
      sendPage(response, await service.skills(request.validated.query)),
    qualifications: async (request, response) =>
      sendPage(response, await service.qualifications(request.validated.query)),
    majors: async (request, response) =>
      sendPage(response, await service.majors(request.validated.query)),
  };
}
