import { AppError } from '../errors/app-error.js';
import { createErrorBody } from '../response/api-response.js';

function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return new AppError('요청 본문이 올바른 JSON 형식이 아닙니다.', {
      statusCode: 400,
      code: 'INVALID_JSON',
    });
  }

  return new AppError('서버 내부 오류가 발생했습니다.');
}

export function createErrorHandler(config) {
  return function errorHandler(error, request, response, next) {
    const normalizedError = normalizeError(error);
    const isUnhandled = !(error instanceof AppError) && normalizedError.statusCode >= 500;

    if (isUnhandled) {
      request.log.error(
        { errorName: error?.name, requestId: request.id },
        'Unhandled request error',
      );
    } else {
      request.log.warn(
        { errorCode: normalizedError.code, statusCode: normalizedError.statusCode },
        'Request failed',
      );
    }

    if (response.headersSent) {
      next(error);
      return;
    }

    const includeDetails = config.nodeEnv !== 'production';
    const responseError = includeDetails
      ? normalizedError
      : new AppError(normalizedError.message, {
          statusCode: normalizedError.statusCode,
          code: normalizedError.code,
        });

    response
      .status(responseError.statusCode)
      .json(createErrorBody(responseError, request.id, includeDetails));
  };
}
