import { z } from 'zod';

const logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => value.startsWith('postgresql://'), {
      message: 'must use the postgresql:// protocol',
    }),
  CORS_ORIGIN: z.string().trim().min(1),
  LOG_LEVEL: z.enum(logLevels),
});

export class EnvironmentValidationError extends Error {
  constructor(issues) {
    const summary = issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ');

    super(`Invalid environment variables: ${summary}`);
    this.name = 'EnvironmentValidationError';
  }
}

export function parseEnv(values) {
  const result = envSchema.safeParse(values);

  if (!result.success) {
    throw new EnvironmentValidationError(result.error.issues);
  }

  const corsOrigins = result.data.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  const invalidCorsOrigin = corsOrigins.find((origin) => {
    if (origin === '*') return false;

    try {
      const url = new URL(origin);
      return !['http:', 'https:'].includes(url.protocol) || url.origin !== origin;
    } catch {
      return true;
    }
  });

  if (invalidCorsOrigin !== undefined) {
    throw new EnvironmentValidationError([
      { path: ['CORS_ORIGIN'], message: 'must contain valid HTTP origin values' },
    ]);
  }

  return Object.freeze({
    nodeEnv: result.data.NODE_ENV,
    port: result.data.PORT,
    databaseUrl: result.data.DATABASE_URL,
    corsOrigins,
    logLevel: result.data.LOG_LEVEL,
    trustProxy: result.data.NODE_ENV === 'production' ? 1 : false,
  });
}

let cachedEnv;

export function getEnv() {
  cachedEnv ??= parseEnv(process.env);
  return cachedEnv;
}
