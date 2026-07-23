import express from 'express';
import { Writable } from 'node:stream';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createLogger } from '../src/common/logger/logger.js';
import { createRequestLogger } from '../src/common/middleware/request-logger.js';

const config = {
  nodeEnv: 'test',
  logLevel: 'info',
};

function createLogCapture() {
  const chunks = [];
  const destination = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });

  return {
    destination,
    output: () => chunks.join(''),
  };
}

describe('sensitive log data', () => {
  it('redacts explicitly logged sensitive fields', () => {
    const capture = createLogCapture();
    const logger = createLogger(config, capture.destination);

    logger.info({
      authorization: 'Bearer direct-secret',
      cookie: 'session=direct-cookie',
      password: 'direct-password',
      token: 'direct-token',
      databaseUrl: 'postgresql://user:direct-db-password@db:5432/app',
      req: {
        headers: {
          authorization: 'Bearer nested-secret',
          cookie: 'session=nested-cookie',
        },
        body: {
          password: 'nested-password',
          token: 'nested-token',
        },
      },
    });

    const output = capture.output();
    for (const secret of [
      'direct-secret',
      'direct-cookie',
      'direct-password',
      'direct-token',
      'direct-db-password',
      'nested-secret',
      'nested-cookie',
      'nested-password',
      'nested-token',
    ]) {
      expect(output).not.toContain(secret);
    }
    expect(output).toContain('[REDACTED]');
  });

  it('omits headers, cookies, and query values from HTTP request logs', async () => {
    const capture = createLogCapture();
    const logger = createLogger(config, capture.destination);
    const app = express();
    app.use(createRequestLogger(logger));
    app.get('/probe', (_request, response) => response.sendStatus(204));

    await request(app)
      .get('/probe?token=query-secret')
      .set('Authorization', 'Bearer header-secret')
      .set('Cookie', 'session=cookie-secret')
      .expect(204);

    const output = capture.output();
    expect(output).not.toContain('query-secret');
    expect(output).not.toContain('header-secret');
    expect(output).not.toContain('cookie-secret');
    expect(output).toContain('"path":"/probe"');
  });
});
