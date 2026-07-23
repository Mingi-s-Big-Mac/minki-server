import { AppError } from '../../common/errors/app-error.js';
import { createAiProvider } from './ai.provider.js';
import { createConversationsRepository } from './conversations.repository.js';

export function createConversationsService({
  repository = createConversationsRepository(),
  provider = createAiProvider(),
} = {}) {
  return {
    create: (userId, input) => repository.create(userId, input),
    list: (userId) => repository.list(userId),
    async detail(userId, id) {
      const conversation = await repository.findById(userId, id);
      if (!conversation) {
        throw new AppError('대화를 찾을 수 없습니다.', {
          statusCode: 404,
          code: 'CONVERSATION_NOT_FOUND',
        });
      }
      return conversation;
    },
    async remove(userId, id) {
      await repository.delete(userId, id);
      return { deleted: true };
    },
    async createMessage(userId, conversationId, { content }) {
      let answer;
      try {
        answer = await provider.answer({ content, conversationId, userId });
      } catch {
        const failed = await repository.saveQuestionAndFailure({ userId, conversationId, content });
        if (!failed) {
          throw new AppError('대화를 찾을 수 없습니다.', {
            statusCode: 404,
            code: 'CONVERSATION_NOT_FOUND',
          });
        }
        throw new AppError('AI 응답 생성에 실패했습니다.', {
          statusCode: 503,
          code: 'AI_RESPONSE_FAILED',
          details: { aiMessageId: failed.aiMessage.id, status: failed.aiMessage.status },
        });
      }

      const saved = await repository.saveAnswer({ userId, conversationId, content, answer });
      if (!saved) {
        throw new AppError('대화를 찾을 수 없습니다.', {
          statusCode: 404,
          code: 'CONVERSATION_NOT_FOUND',
        });
      }
      return saved;
    },
  };
}
