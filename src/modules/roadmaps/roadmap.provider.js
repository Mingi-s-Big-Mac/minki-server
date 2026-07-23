import { AppError } from '../../common/errors/app-error.js';
import { getEnv } from '../../config/env.js';

export function createRoadmapProvider(config = getEnv()) {
  return {
    async generate() {
      if (!config.aiService.url) {
        throw new AppError('로드맵 생성 AI 서비스가 구성되지 않았습니다.', {
          statusCode: 503,
          code: 'AI_SERVICE_NOT_CONFIGURED',
        });
      }
      throw new AppError('로드맵 생성 AI 서비스 연동 계약이 확정되지 않았습니다.', {
        statusCode: 503,
        code: 'AI_SERVICE_CONTRACT_UNDEFINED',
      });
    },
  };
}
