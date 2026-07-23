import { createPageMeta } from '../../common/pagination.js';
import { createSchoolsRepository } from './schools.repository.js';

export function createSchoolsService(repository = createSchoolsRepository()) {
  return {
    async list(query) {
      const result = await repository.list(query);
      return { data: result.items, meta: createPageMeta(result.total, result.pagination) };
    },
  };
}
