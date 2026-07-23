import pino from 'pino';

const redactPaths = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'databaseUrl',
  'DATABASE_URL',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.authorization',
  '*.cookie',
  '*.databaseUrl',
  '*.DATABASE_URL',
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.token',
];

export function createLogger(config, destination) {
  const transport =
    config.nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        }
      : undefined;

  const options = {
    level: config.logLevel,
    redact: { paths: redactPaths, censor: '[REDACTED]' },
    transport,
  };

  return destination ? pino(options, destination) : pino(options);
}
