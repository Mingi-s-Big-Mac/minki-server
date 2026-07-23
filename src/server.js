import { setDefaultResultOrder } from 'node:dns';

import { createLogger } from './common/logger/logger.js';
import { EnvironmentValidationError, getEnv } from './config/env.js';
import { disconnectDatabase } from './config/prisma.js';
import { createApp } from './app.js';

setDefaultResultOrder('ipv4first');

async function startServer() {
  const config = getEnv();
  const logger = createLogger(config);
  const app = createApp({ config, logger });
  const server = app.listen(config.port, (error) => {
    if (error) {
      logger.error({ errorName: error.name, errorCode: error.code }, 'Server failed to listen');
      shutdown('server_error', 1);
      return;
    }

    logger.info({ port: config.port, environment: config.nodeEnv }, 'Server started');
  });

  let shuttingDown = false;

  async function shutdown(signal, exitCode = 0) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Server shutdown started');

    const forceShutdownTimer = setTimeout(() => {
      logger.error('Server shutdown timed out');
      server.closeAllConnections();
      process.exit(1);
    }, 10_000);
    forceShutdownTimer.unref();

    server.close(async (serverError) => {
      try {
        await disconnectDatabase();
      } catch {
        logger.error('Database disconnect failed');
        exitCode = 1;
      } finally {
        clearTimeout(forceShutdownTimer);
        process.exit(serverError ? 1 : exitCode);
      }
    });
  }

  server.on('error', (error) => {
    if (shuttingDown) return;
    logger.error({ errorName: error.name, errorCode: error.code }, 'HTTP server error');
    shutdown('server_error', 1);
  });
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('uncaughtException', () => shutdown('uncaughtException', 1));
  process.once('unhandledRejection', () => shutdown('unhandledRejection', 1));
}

startServer().catch((error) => {
  const message =
    error instanceof EnvironmentValidationError
      ? error.message
      : 'Server failed to start due to an unexpected error.';

  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
