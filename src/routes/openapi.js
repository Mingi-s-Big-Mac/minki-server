const ok = { description: 'Successful response' };
const created = { description: 'Created' };
const unauthorized = { description: 'Authentication required' };
const notFound = { description: 'Resource not found' };

function get(summary, tags, responses = { 200: ok }, security) {
  return { get: { summary, tags, responses, ...(security ? { security } : {}) } };
}

function post(summary, tags, responses = { 200: ok }, security) {
  return { post: { summary, tags, responses, ...(security ? { security } : {}) } };
}

function patch(summary, tags, responses = { 200: ok }, security) {
  return { patch: { summary, tags, responses, ...(security ? { security } : {}) } };
}

function remove(summary, tags, responses = { 200: ok }, security) {
  return { delete: { summary, tags, responses, ...(security ? { security } : {}) } };
}

const bearer = [{ bearerAuth: [] }];

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Minki Server API',
    version: '0.1.0',
    description: 'Source-based major and career exploration backend API',
  },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/api/v1/health': get('Application health', ['Health']),
    '/api/v1/health/db': get('Database health', ['Health'], {
      200: ok,
      503: { description: 'Database unavailable' },
    }),
    '/api/v1/auth/email-verifications': post('Request email verification', ['Auth'], {
      201: created,
      503: { description: 'Email delivery service unavailable' },
    }),
    '/api/v1/auth/email-verifications/confirm': post('Confirm email verification', ['Auth']),
    '/api/v1/auth/sign-up': post('Sign up', ['Auth'], { 201: created }),
    '/api/v1/auth/sign-in': post('Sign in', ['Auth']),
    '/api/v1/auth/refresh': post('Rotate refresh token', ['Auth']),
    '/api/v1/auth/sign-out': post('Sign out', ['Auth']),
    '/api/v1/auth/me': get(
      'Get authenticated user',
      ['Auth'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/users/me': {
      ...get('Get my profile', ['Users'], { 200: ok, 401: unauthorized }, bearer),
      ...patch('Update my profile', ['Users'], { 200: ok, 401: unauthorized }, bearer),
      ...remove('Delete my account', ['Users'], { 200: ok, 401: unauthorized }, bearer),
    },
    '/api/v1/users/me/password': patch(
      'Change password',
      ['Users'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/users/me/stats': get(
      'Get my stats',
      ['Users'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/users/me/activities': get(
      'Get my activities',
      ['Users'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/schools': get('List schools', ['Schools']),
    '/api/v1/catalog/categories': get(
      'List occupation categories',
      ['Catalog'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/catalog/skills': get(
      'List skills',
      ['Catalog'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/catalog/qualifications': get(
      'List qualifications',
      ['Catalog'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/catalog/majors': get(
      'List majors',
      ['Catalog'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/search/suggestions': get(
      'Search suggestions',
      ['Search'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/occupations': get(
      'List occupations',
      ['Occupations'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/occupations/{occupationId}': get(
      'Get occupation detail',
      ['Occupations'],
      {
        200: ok,
        401: unauthorized,
        404: notFound,
      },
      bearer,
    ),
    '/api/v1/occupations/compare': get(
      'Compare occupations',
      ['Occupations'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/interests/occupations': get(
      'List interest occupations',
      ['Interests'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/interests/occupations/{occupationId}': {
      ...post(
        'Save interest occupation',
        ['Interests'],
        { 201: created, 401: unauthorized },
        bearer,
      ),
      ...remove(
        'Remove interest occupation',
        ['Interests'],
        { 200: ok, 401: unauthorized },
        bearer,
      ),
    },
    '/api/v1/dashboard': get(
      'Get dashboard',
      ['Dashboard'],
      { 200: ok, 401: unauthorized },
      bearer,
    ),
    '/api/v1/roadmaps': {
      ...post('Create roadmap', ['Roadmaps'], { 201: created, 401: unauthorized }, bearer),
      ...get('List roadmaps', ['Roadmaps'], { 200: ok, 401: unauthorized }, bearer),
    },
    '/api/v1/roadmaps/{roadmapId}': {
      ...get('Get roadmap', ['Roadmaps'], { 200: ok, 401: unauthorized, 404: notFound }, bearer),
      ...remove('Delete roadmap', ['Roadmaps'], { 200: ok, 401: unauthorized }, bearer),
    },
    '/api/v1/conversations': {
      ...post(
        'Create conversation',
        ['Conversations'],
        { 201: created, 401: unauthorized },
        bearer,
      ),
      ...get('List conversations', ['Conversations'], { 200: ok, 401: unauthorized }, bearer),
    },
    '/api/v1/conversations/{conversationId}': {
      ...get(
        'Get conversation',
        ['Conversations'],
        { 200: ok, 401: unauthorized, 404: notFound },
        bearer,
      ),
      ...remove('Delete conversation', ['Conversations'], { 200: ok, 401: unauthorized }, bearer),
    },
    '/api/v1/conversations/{conversationId}/messages': post(
      'Send conversation message',
      ['Conversations'],
      { 201: created, 401: unauthorized },
      bearer,
    ),
  },
};
