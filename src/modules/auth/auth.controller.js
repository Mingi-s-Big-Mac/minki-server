import { sendSuccess } from '../../common/response/api-response.js';
import { createAuthService } from './auth.service.js';

export function createAuthController(service = createAuthService()) {
  return {
    async requestEmailVerification(request, response) {
      const data = await service.requestEmailVerification(request.validated.body);
      return sendSuccess(response, data, { statusCode: 201 });
    },
    async confirmEmailVerification(request, response) {
      return sendSuccess(response, await service.confirmEmailVerification(request.validated.body));
    },
    async signUp(request, response) {
      const data = await service.signUp(request.validated.body);
      return sendSuccess(response, data, { statusCode: 201 });
    },
    async signIn(request, response) {
      return sendSuccess(response, await service.signIn(request.validated.body));
    },
    async refresh(request, response) {
      return sendSuccess(response, await service.refresh(request.validated.body));
    },
    async signOut(request, response) {
      return sendSuccess(response, await service.signOut(request.validated.body));
    },
    async me(request, response) {
      return sendSuccess(response, await service.getMe(request.user.id));
    },
  };
}
