import { AppError } from '../../common/errors/app-error.js';
import { createRoadmapProvider } from './roadmap.provider.js';
import { createRoadmapsRepository } from './roadmaps.repository.js';

export function createRoadmapsService({
  repository = createRoadmapsRepository(),
  provider = createRoadmapProvider(),
} = {}) {
  return {
    async create(userId, input) {
      const occupation = await repository.findOccupation(input.targetOccupationId);
      if (!occupation) {
        throw new AppError('직무를 찾을 수 없습니다.', {
          statusCode: 404,
          code: 'OCCUPATION_NOT_FOUND',
        });
      }
      const roadmap = await repository.create({
        userId,
        title: `${occupation.name} 로드맵`,
        grade: input.grade,
        majorText: input.major,
        targetOccupationId: input.targetOccupationId,
        inputSkills: { currentSkillIds: input.currentSkillIds },
        status: 'GENERATING',
      });
      try {
        await provider.generate(input);
      } catch {
        const failed = await repository.markFailed(roadmap.id);
        throw new AppError('로드맵 생성에 실패했습니다.', {
          statusCode: 503,
          code: 'ROADMAP_GENERATION_FAILED',
          details: { roadmapId: failed.id, status: failed.status },
        });
      }
      return roadmap;
    },
    list: (userId) => repository.list(userId),
    async detail(userId, id) {
      const roadmap = await repository.findById(userId, id);
      if (!roadmap)
        throw new AppError('로드맵을 찾을 수 없습니다.', {
          statusCode: 404,
          code: 'ROADMAP_NOT_FOUND',
        });
      return roadmap;
    },
    async remove(userId, id) {
      await repository.delete(userId, id);
      return { deleted: true };
    },
  };
}
