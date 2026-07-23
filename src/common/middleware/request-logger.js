import { randomUUID } from 'node:crypto';

import pinoHttp from 'pino-http';

export function createRequestLogger(logger) {
  return pinoHttp({
    logger,
    genReqId(request, response) {
      const requestId = request.headers['x-request-id'] || randomUUID();
      response.setHeader('X-Request-Id', requestId);
      return requestId;
    },
    serializers: {
      req(request) {
        return {
          id: request.id,
          method: request.method,
          path: request.url?.split('?', 1)[0],
          remoteAddress: request.remoteAddress,
        };
      },
      res(response) {
        return { statusCode: response.statusCode };
      },
    },
    customLogLevel(_request, response, error) {
      if (error || response.statusCode >= 500) return 'error';
      if (response.statusCode >= 400) return 'warn';
      return 'info';
    },
  });
}
