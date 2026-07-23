import { AppError } from '../../common/errors/app-error.js';
import { createInterestsRepository } from './interests.repository.js';

export function createInterestsService(repository = createInterestsRepository()) {
  return {
    async list(userId) {
      const items = await repository.list(userId);
      return items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        occupation: item.occupation,
      }));
    },
    async add(userId, occupationId) {
      const occupation = await repository.findOccupation(occupationId);
      if (!occupation) {
        throw new AppError('직무를 찾을 수 없습니다.', {
          statusCode: 404,
          code: 'OCCUPATION_NOT_FOUND',
        });
      }
      await repository.add(userId, occupationId);
      return { saved: true };
    },
    async remove(userId, occupationId) {
      await repository.remove(userId, occupationId);
      return { deleted: true };
    },
  };
}
