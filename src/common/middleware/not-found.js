import { NotFoundError } from '../errors/app-error.js';

export function notFoundHandler(_request, _response, next) {
  next(new NotFoundError());
}
