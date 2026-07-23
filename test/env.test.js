import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';

import { EnvironmentValidationError, parseEnv } from '../src/config/env.js';

const validEnv = {
  NODE_ENV: 'development',
  PORT: '3000',
  DATABASE_URL: 'postgresql://app:password@localhost:5432/minki',
  CORS_ORIGIN: 'http://localhost:3000,https://example.com',
  LOG_LEVEL: 'info',
};

describe('environment validation', () => {
  it('parses and normalizes valid values', () => {
    expect(parseEnv(validEnv)).toMatchObject({
      nodeEnv: 'development',
      port: 3000,
      databaseUrl: validEnv.DATABASE_URL,
      corsOrigins: ['http://localhost:3000', 'https://example.com'],
      logLevel: 'info',
      trustProxy: false,
      allowedEmailDomains: [],
      accessTokenSecret: 'development-access-token-secret',
      refreshTokenSecret: 'development-refresh-token-secret',
    });
  });

  it('reports missing required values without exposing values', () => {
    expect(() => parseEnv({})).toThrow(EnvironmentValidationError);
    expect(() => parseEnv({})).toThrow(/NODE_ENV/);
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it('rejects invalid ports and database protocols', () => {
    expect(() =>
      parseEnv({ ...validEnv, PORT: '70000', DATABASE_URL: 'mysql://localhost/test' }),
    ).toThrow(/PORT.*DATABASE_URL/);
  });

  it('rejects malformed CORS origins', () => {
    expect(() => parseEnv({ ...validEnv, CORS_ORIGIN: 'http://localhost:3000/path' })).toThrow(
      /CORS_ORIGIN/,
    );
  });

  it('requires token secrets in production', () => {
    expect(() => parseEnv({ ...validEnv, NODE_ENV: 'production' })).toThrow(
      /ACCESS_TOKEN_SECRET.*REFRESH_TOKEN_SECRET/,
    );
  });

  it('requires complete SMTP configuration when email delivery is enabled', () => {
    expect(() => parseEnv({ ...validEnv, SMTP_HOST: 'smtp.example.com' })).toThrow(
      /SMTP_HOST, SMTP_PORT, and SMTP_FROM/,
    );
    expect(() =>
      parseEnv({
        ...validEnv,
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: '587',
        SMTP_FROM: 'no-reply@example.com',
        SMTP_USER: 'smtp-user',
      }),
    ).toThrow(/SMTP_PASSWORD/);
  });

  it('treats empty optional provider variables as unset', () => {
    expect(
      parseEnv({
        ...validEnv,
        SMTP_HOST: '',
        SMTP_PORT: '',
        SMTP_FROM: '',
        AI_SERVICE_URL: '',
      }),
    ).toMatchObject({ smtp: { host: undefined, port: undefined, from: undefined } });
  });

  it('stops before listening when required variables are missing', () => {
    const childEnv = { ...process.env };
    for (const name of ['NODE_ENV', 'PORT', 'DATABASE_URL', 'CORS_ORIGIN', 'LOG_LEVEL']) {
      delete childEnv[name];
    }

    const result = spawnSync(process.execPath, ['src/server.js'], {
      cwd: process.cwd(),
      env: childEnv,
      encoding: 'utf8',
      timeout: 10_000,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Invalid environment variables');
    expect(result.stderr).toContain('DATABASE_URL');
    expect(result.stdout).not.toContain('Server started');
  });
});
