import { describe, expect, it } from 'vitest';

import { createAiClient } from '../src/common/ai/ai-client.js';

const config = { url: 'http://ai.example.com', apiKey: 'test-key', timeoutMs: 1000 };

function fakeFetch(response) {
  return async () => response;
}

describe('ai client', () => {
  it('reports disabled when url or key is missing', () => {
    expect(createAiClient({ url: '', apiKey: '', timeoutMs: 1000 }).enabled).toBe(false);
    expect(createAiClient(config).enabled).toBe(true);
  });

  it('sends the API key header and returns parsed JSON on success', async () => {
    let capturedRequest;
    const fetchImpl = async (url, init) => {
      capturedRequest = { url: url.toString(), init };
      return { ok: true, status: 200, json: async () => ({ answer: 'hi', sources: [] }) };
    };
    const client = createAiClient(config, fetchImpl);

    const result = await client.post('/api/chat', { message: 'hi' });

    expect(result).toEqual({ answer: 'hi', sources: [] });
    expect(capturedRequest.url).toBe('http://ai.example.com/api/chat');
    expect(capturedRequest.init.headers['X-API-Key']).toBe('test-key');
  });

  it('maps a 400 response to AI_INPUT_REJECTED', async () => {
    const client = createAiClient(config, fakeFetch({ ok: false, status: 400 }));

    await expect(client.post('/api/chat', {})).rejects.toMatchObject({
      code: 'AI_INPUT_REJECTED',
      statusCode: 400,
    });
  });

  it('maps other non-ok responses to AI_SERVICE_UNAVAILABLE', async () => {
    const client = createAiClient(config, fakeFetch({ ok: false, status: 500 }));

    await expect(client.post('/api/chat', {})).rejects.toMatchObject({
      code: 'AI_SERVICE_UNAVAILABLE',
      statusCode: 503,
    });
  });

  it('maps network/timeout failures to AI_SERVICE_UNAVAILABLE', async () => {
    const client = createAiClient(config, async () => {
      throw new Error('network down');
    });

    await expect(client.post('/api/chat', {})).rejects.toMatchObject({
      code: 'AI_SERVICE_UNAVAILABLE',
      statusCode: 503,
    });
  });
});
