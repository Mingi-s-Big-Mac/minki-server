export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Minki Server API',
    version: '0.1.0',
    description: '출처 기반 전공·진로 탐색 서비스의 공통 서버 API',
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/v1/health': {
      get: {
        summary: '애플리케이션 상태 확인',
        tags: ['Health'],
        responses: {
          200: { description: '애플리케이션이 실행 중임' },
        },
      },
    },
    '/api/v1/health/db': {
      get: {
        summary: '데이터베이스 연결 상태 확인',
        tags: ['Health'],
        responses: {
          200: { description: 'PostgreSQL에 연결할 수 있음' },
          503: { description: 'PostgreSQL에 연결할 수 없음' },
        },
      },
    },
  },
};
