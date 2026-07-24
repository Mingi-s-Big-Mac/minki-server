import { AppError } from '../../common/errors/app-error.js';
import { createAiClient } from '../../common/ai/ai-client.js';
import { resolveAiSource } from '../../common/ai/resolve-source.js';
import { getEnv } from '../../config/env.js';
import { getPrismaClient } from '../../config/prisma.js';

export function createAiProvider({
  config = getEnv(),
  client = createAiClient(config.aiService),
  prisma = getPrismaClient(),
} = {}) {
  return {
    async answer({ content, conversationId }) {
      if (!client.enabled) {
        throw new AppError('AI 질의응답 서비스가 구성되지 않았습니다.', {
          statusCode: 503,
          code: 'AI_SERVICE_NOT_CONFIGURED',
        });
      }

      const result = await client.post('/api/chat', {
        conversation_id: conversationId,
        message: content,
      });

      const citations = await Promise.all(
        (result.sources ?? []).map(async (source) => {
          const sourceRecord = await resolveAiSource(prisma, {
            externalId: `ai-chat-source-${source.id}`,
            organization: '진로 AI 채팅 응답',
            title: source.title,
          });
          return { sourceId: sourceRecord.id };
        }),
      );

      return { content: result.answer, citations };
    },
  };
}
