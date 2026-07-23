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
  ALLOWED_EMAIL_DOMAINS: z.string().trim().optional().default(''),
  ACCESS_TOKEN_SECRET: z.string().trim().min(16).optional(),
  ACCESS_TOKEN_EXPIRES_IN: z.string().trim().min(1).default('7d'),
  REFRESH_TOKEN_SECRET: z.string().trim().min(16).optional(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().trim().min(1).default('30d'),
  EMAIL_VERIFICATION_EXPIRES_IN: z.string().trim().min(1).default('10m'),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_SECURE: z.coerce.boolean().optional().default(false),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().trim().optional(),
  AI_SERVICE_URL: z.string().url().optional(),
  AI_SERVICE_API_KEY: z.string().optional(),
  AI_SERVICE_TIMEOUT_MS: z.coerce.number().int().min(100).max(60000).default(5000),
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

  if (result.data.NODE_ENV === 'production') {
    const missingSecrets = [];
    if (!result.data.ACCESS_TOKEN_SECRET) missingSecrets.push('ACCESS_TOKEN_SECRET');

    if (missingSecrets.length > 0) {
      throw new EnvironmentValidationError(
        missingSecrets.map((name) => ({
          path: [name],
          message: 'is required in production',
        })),
      );
    }
  }

  return Object.freeze({
    nodeEnv: result.data.NODE_ENV,
    port: result.data.PORT,
    databaseUrl: result.data.DATABASE_URL,
    corsOrigins,
    logLevel: result.data.LOG_LEVEL,
    trustProxy: result.data.NODE_ENV === 'production' ? 1 : false,
    allowedEmailDomains: result.data.ALLOWED_EMAIL_DOMAINS.split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean),
    accessTokenSecret:
      result.data.ACCESS_TOKEN_SECRET ??
      (result.data.NODE_ENV === 'production' ? undefined : 'development-access-token-secret'),
    accessTokenExpiresIn: result.data.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenSecret:
      result.data.REFRESH_TOKEN_SECRET ??
      (result.data.NODE_ENV === 'production' ? undefined : 'development-refresh-token-secret'),
    refreshTokenExpiresIn: result.data.REFRESH_TOKEN_EXPIRES_IN,
    emailVerificationExpiresIn: result.data.EMAIL_VERIFICATION_EXPIRES_IN,
    smtp: {
      host: result.data.SMTP_HOST,
      port: result.data.SMTP_PORT,
      secure: result.data.SMTP_SECURE,
      user: result.data.SMTP_USER,
      password: result.data.SMTP_PASSWORD,
      from: result.data.SMTP_FROM,
    },
    aiService: {
      url: result.data.AI_SERVICE_URL,
      apiKey: result.data.AI_SERVICE_API_KEY,
      timeoutMs: result.data.AI_SERVICE_TIMEOUT_MS,
    },
  });
}

let cachedEnv;

export function getEnv() {
  cachedEnv ??= parseEnv(process.env);
  return cachedEnv;
}
