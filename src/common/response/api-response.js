export function sendSuccess(response, data, { statusCode = 200, meta } = {}) {
  const body = { success: true, data };

  if (meta !== undefined) {
    body.meta = meta;
  }

  return response.status(statusCode).json(body);
}

export function createErrorBody(error, requestId, includeDetails = false) {
  const body = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
    requestId,
  };

  if (includeDetails && error.details !== undefined) {
    body.error.details = error.details;
  }

  return body;
}
