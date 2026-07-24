import { AppError } from '../errors/app-error.js';

export function createAiClient(config, fetchImpl = fetch) {
  const enabled = Boolean(config.url && config.apiKey);

  async function post(path, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);

    let response;
    try {
      response = await fetchImpl(new URL(path, config.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      throw new AppError('AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.', {
        statusCode: 503,
        code: 'AI_SERVICE_UNAVAILABLE',
      });
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 400) {
      throw new AppError('진로와 관련 없거나 처리할 수 없는 입력입니다.', {
        statusCode: 400,
        code: 'AI_INPUT_REJECTED',
      });
    }

    if (!response.ok) {
      throw new AppError('AI 서비스에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', {
        statusCode: 503,
        code: 'AI_SERVICE_UNAVAILABLE',
      });
    }

    return response.json();
  }

  return { enabled, post };
}
