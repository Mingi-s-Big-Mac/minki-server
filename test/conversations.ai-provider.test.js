import { describe, expect, it } from 'vitest';

import { createAiProvider } from '../src/modules/conversations/ai.provider.js';

describe('conversations ai provider', () => {
  it('maps chat sources to citations against upserted Source rows', async () => {
    const created = [];
    const prisma = {
      source: {
        findFirst: async () => null,
        create: async ({ data }) => {
          const record = { id: `source-${created.length + 1}`, ...data };
          created.push(record);
          return record;
        },
      },
    };
    const client = {
      enabled: true,
      post: async (path, body) => {
        expect(path).toBe('/api/chat');
        expect(body).toEqual({ conversation_id: 'conversation-id', message: 'hi' });
        return { answer: 'hello there', sources: [{ id: 1, title: 'NCS module' }] };
      },
    };
    const provider = createAiProvider({ client, prisma });

    const result = await provider.answer({ content: 'hi', conversationId: 'conversation-id' });

    expect(result.content).toBe('hello there');
    expect(result.citations).toEqual([{ sourceId: 'source-1' }]);
    expect(created[0]).toMatchObject({ externalId: 'ai-chat-source-1', title: 'NCS module' });
  });

  it('throws AI_SERVICE_NOT_CONFIGURED when the client is disabled', async () => {
    const provider = createAiProvider({ client: { enabled: false }, prisma: {} });

    await expect(
      provider.answer({ content: 'hi', conversationId: 'conversation-id' }),
    ).rejects.toMatchObject({ code: 'AI_SERVICE_NOT_CONFIGURED' });
  });
});
