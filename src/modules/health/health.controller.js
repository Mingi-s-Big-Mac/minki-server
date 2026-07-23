import { sendSuccess } from '../../common/response/api-response.js';

export function createHealthController(checkDatabase) {
  return {
    getHealth(_request, response) {
      return sendSuccess(response, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      });
    },

    async getDatabaseHealth(_request, response) {
      await checkDatabase();

      return sendSuccess(response, {
        status: 'ok',
        database: 'reachable',
      });
    },
  };
}
