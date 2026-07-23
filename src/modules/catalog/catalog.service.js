import { createPageMeta } from '../../common/pagination.js';
import { createCatalogRepository } from './catalog.repository.js';

function paged(result) {
  return { data: result.items, meta: createPageMeta(result.total, result.pagination) };
}

export function createCatalogService(repository = createCatalogRepository()) {
  return {
    categories: async (query) => paged(await repository.categories(query)),
    skills: async (query) => paged(await repository.skills(query)),
    qualifications: async (query) => paged(await repository.qualifications(query)),
    majors: async (query) => paged(await repository.majors(query)),
  };
}
