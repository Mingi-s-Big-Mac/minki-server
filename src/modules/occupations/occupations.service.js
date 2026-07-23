import { AppError } from '../../common/errors/app-error.js';
import { createPageMeta } from '../../common/pagination.js';
import { createOccupationsRepository } from './occupations.repository.js';

export function createOccupationsService(repository = createOccupationsRepository()) {
  return {
    async list(query, userId) {
      const result = await repository.list(query, userId);
      return { data: result.items, meta: createPageMeta(result.total, result.pagination) };
    },
    async detail(id, userId) {
      const occupation = await repository.findById(id, userId);
      if (!occupation) {
        throw new AppError('직무를 찾을 수 없습니다.', {
          statusCode: 404,
          code: 'OCCUPATION_NOT_FOUND',
        });
      }
      return occupation;
    },
    async compare(ids) {
      if (ids.length < 2) {
        throw new AppError('비교할 직무는 최소 2개 이상이어야 합니다.', {
          statusCode: 400,
          code: 'COMPARE_MIN_COUNT',
        });
      }
      if (ids.length > 4) {
        throw new AppError('비교할 직무는 최대 4개까지 가능합니다.', {
          statusCode: 400,
          code: 'COMPARE_MAX_COUNT',
        });
      }
      if (new Set(ids).size !== ids.length) {
        throw new AppError('중복된 직무 ID는 비교할 수 없습니다.', {
          statusCode: 400,
          code: 'COMPARE_DUPLICATE_ID',
        });
      }
      const occupations = await repository.findManyByIds(ids);
      if (occupations.length !== ids.length) {
        throw new AppError('존재하지 않거나 비활성화된 직무가 포함되어 있습니다.', {
          statusCode: 404,
          code: 'COMPARE_OCCUPATION_NOT_FOUND',
        });
      }
      return ids.map((id) => occupations.find((occupation) => occupation.id === id));
    },
    suggestions(query) {
      return repository.suggestions(query);
    },
  };
}
