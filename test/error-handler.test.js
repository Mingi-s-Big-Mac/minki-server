import express from 'express';
import pino from 'pino';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createRequestLogger } from '../src/common/middleware/request-logger.js';
import { createErrorHandler } from '../src/common/middleware/error-handler.js';

describe('global error handler', () => {
  it('returns the common error response without an internal message', async () => {
    const app = express();
    app.use(createRequestLogger(pino({ level: 'silent' })));
    app.get('/error', () => {
      throw new Error('database password should not be returned');
    });
    app.use(createErrorHandler({ nodeEnv: 'production' }));

    const response = await request(app).get('/error').expect(500);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.',
      },
      requestId: expect.any(String),
    });
  });

  it('returns the common 400 response for malformed JSON', async () => {
    const app = express();
    app.use(createRequestLogger(pino({ level: 'silent' })));
    app.use(express.json());
    app.post('/payload', (_request, response) => response.sendStatus(204));
    app.use(createErrorHandler({ nodeEnv: 'production' }));

    const response = await request(app)
      .post('/payload')
      .set('Content-Type', 'application/json')
      .send('{"invalid":')
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: '요청 본문이 올바른 JSON 형식이 아닙니다.',
      },
      requestId: expect.any(String),
    });
  });
});
