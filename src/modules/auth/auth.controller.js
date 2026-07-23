import { sendSuccess } from '../../common/response/api-response.js';
import { createAuthService } from './auth.service.js';

export function createAuthController(service = createAuthService()) {
  return {
    async signUp(request, response) {
      const data = await service.signUp(request.validated.body);
      return sendSuccess(response, data, { statusCode: 201 });
    },
    async signIn(request, response) {
      return sendSuccess(response, await service.signIn(request.validated.body));
    },
    signOut(_request, response) {
      return sendSuccess(response, { signedOut: true });
    },
    async me(request, response) {
      return sendSuccess(response, await service.getMe(request.user.id));
    },
  };
}
