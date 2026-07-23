import { AppError } from '../../common/errors/app-error.js';
import { getEnv } from '../../config/env.js';

export function createAiProvider(config = getEnv()) {
  return {
    async answer() {
      if (!config.aiService.url) {
        throw new AppError('AI 질의응답 서비스가 구성되지 않았습니다.', {
          statusCode: 503,
          code: 'AI_SERVICE_NOT_CONFIGURED',
        });
      }
      throw new AppError('AI 질의응답 서비스 연동 계약이 확정되지 않았습니다.', {
        statusCode: 503,
        code: 'AI_SERVICE_CONTRACT_UNDEFINED',
      });
    },
  };
}
