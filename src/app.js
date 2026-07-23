import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { AppError } from './common/errors/app-error.js';
import { createErrorHandler } from './common/middleware/error-handler.js';
import { notFoundHandler } from './common/middleware/not-found.js';
import { createRateLimiter } from './common/middleware/rate-limit.js';
import { createRequestLogger } from './common/middleware/request-logger.js';
import { createLogger } from './common/logger/logger.js';
import { getEnv } from './config/env.js';
import { checkDatabaseConnection } from './modules/health/health.service.js';
import { createApiRouter } from './routes/api.routes.js';
import { openApiDocument } from './routes/openapi.js';

function createCorsOptions(config) {
  return {
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(
        new AppError('허용되지 않은 CORS 출처입니다.', {
          statusCode: 403,
          code: 'CORS_ORIGIN_NOT_ALLOWED',
        }),
      );
    },
    credentials: true,
  };
}

export function createApp(options = {}) {
  const config = options.config ?? getEnv();
  const logger = options.logger ?? createLogger(config);
  const checkDatabase = options.checkDatabase ?? checkDatabaseConnection;
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.use(createRequestLogger(logger));
  app.use(helmet());
  app.use(cors(createCorsOptions(config)));
  app.use(express.json({ limit: '1mb' }));
  app.use(createRateLimiter());

  app.get('/openapi.json', (_request, response) => response.json(openApiDocument));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: false }));
  app.use('/api/v1', createApiRouter(checkDatabase));

  app.use(notFoundHandler);
  app.use(createErrorHandler(config));

  return app;
}
