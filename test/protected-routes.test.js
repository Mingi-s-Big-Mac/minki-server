import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

describe('protected routes', () => {
  it('rejects unauthenticated user APIs', async () => {
    const response = await request(createApp()).get('/api/v1/users/me');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED' },
    });
  });

  it.each([
    '/api/v1/catalog/skills',
    '/api/v1/search/suggestions?query=java',
    '/api/v1/occupations',
  ])('rejects unauthenticated access to %s', async (path) => {
    const response = await request(createApp()).get(path);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
