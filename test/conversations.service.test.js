import { describe, expect, it } from 'vitest';

import { createConversationsService } from '../src/modules/conversations/conversations.service.js';

describe('conversations service', () => {
  it('does not create fake citations when provider returns none', async () => {
    const repository = {
      saveAnswer: async ({ answer }) => ({
        userMessage: { content: 'question' },
        aiMessage: { content: answer.content, citations: answer.citations ?? [] },
      }),
    };
    const provider = { answer: async () => ({ content: 'answer', citations: [] }) };
    const service = createConversationsService({ repository, provider });

    await expect(
      service.createMessage('user-id', 'conversation-id', { content: 'question' }),
    ).resolves.toMatchObject({ aiMessage: { citations: [] } });
  });

  it('stores a failed assistant message when provider fails', async () => {
    const repository = {
      saveQuestionAndFailure: async () => ({
        userMessage: { content: 'question' },
        aiMessage: { id: 'message-id', status: 'FAILED' },
      }),
    };
    const provider = { answer: async () => Promise.reject(new Error('provider unavailable')) };
    const service = createConversationsService({ repository, provider });

    await expect(
      service.createMessage('user-id', 'conversation-id', { content: 'question' }),
    ).rejects.toMatchObject({
      code: 'AI_RESPONSE_FAILED',
      details: { aiMessageId: 'message-id', status: 'FAILED' },
    });
  });
});
