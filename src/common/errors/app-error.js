export class AppError extends Error {
  constructor(message, { statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export class NotFoundError extends AppError {
  constructor(message = '요청한 리소스를 찾을 수 없습니다.') {
    super(message, { statusCode: 404, code: 'NOT_FOUND' });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = '서비스를 일시적으로 사용할 수 없습니다.') {
    super(message, { statusCode: 503, code: 'SERVICE_UNAVAILABLE' });
  }
}
