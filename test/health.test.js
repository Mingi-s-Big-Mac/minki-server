import pino from 'pino';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { ServiceUnavailableError } from '../src/common/errors/app-error.js';

const testConfig = {
  nodeEnv: 'test',
  port: 3000,
  databaseUrl: 'postgresql://test:test@localhost:5432/test?schema=public',
  corsOrigins: ['http://localhost:3000'],
  logLevel: 'silent',
  trustProxy: false,
};

function buildApp(checkDatabase = vi.fn().mockResolvedValue(undefined)) {
  return createApp({
    config: testConfig,
    logger: pino({ level: 'silent' }),
    checkDatabase,
  });
}

describe('health API', () => {
  it('returns application health', async () => {
    const response = await request(buildApp()).get('/api/v1/health').expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
      },
    });
    expect(response.body.data.timestamp).toEqual(expect.any(String));
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });

  it('checks database health through the injected boundary', async () => {
    const checkDatabase = vi.fn().mockResolvedValue(undefined);
    const response = await request(buildApp(checkDatabase)).get('/api/v1/health/db').expect(200);

    expect(checkDatabase).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      success: true,
      data: { status: 'ok', database: 'reachable' },
    });
  });

  it('returns a sanitized 503 when database health fails', async () => {
    const checkDatabase = vi
      .fn()
      .mockRejectedValue(new ServiceUnavailableError('데이터베이스 연결을 확인할 수 없습니다.'));
    const response = await request(buildApp(checkDatabase)).get('/api/v1/health/db').expect(503);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: '데이터베이스 연결을 확인할 수 없습니다.',
      },
      requestId: expect.any(String),
    });
  });
});

describe('not found handling', () => {
  it('returns the common 404 response', async () => {
    const response = await request(buildApp())
      .get('/api/v1/unknown?token=must-not-appear')
      .expect(404);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'NOT_FOUND',
      },
      requestId: expect.any(String),
    });
    expect(JSON.stringify(response.body)).not.toContain('must-not-appear');
  });
});
