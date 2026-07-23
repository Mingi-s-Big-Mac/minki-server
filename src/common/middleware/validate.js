import { AppError } from '../errors/app-error.js';

function toDetails(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export function validateRequest(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      next(
        new AppError('요청 값이 올바르지 않습니다.', {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: toDetails(result.error),
        }),
      );
      return;
    }

    request.validated = result.data;
    next();
  };
}
