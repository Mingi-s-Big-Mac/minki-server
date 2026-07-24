import { describe, expect, it } from 'vitest';

import { createRoadmapsService } from '../src/modules/roadmaps/roadmaps.service.js';

function createRepository(overrides = {}) {
  return {
    findOccupation: async () => ({ id: 'occupation-id', name: 'Demo job' }),
    findSkillsByIds: async () => [{ id: 'skill-id', name: 'Python' }],
    create: async () => ({ id: 'roadmap-id', status: 'GENERATING' }),
    complete: async (id, semesters) => ({ id, status: 'COMPLETED', semesters }),
    markFailed: async () => ({ id: 'roadmap-id', status: 'FAILED' }),
    ...overrides,
  };
}

describe('roadmaps service', () => {
  it('marks roadmap as failed when provider fails', async () => {
    const repository = createRepository();
    const provider = { generate: async () => Promise.reject(new Error('provider unavailable')) };
    const service = createRoadmapsService({ repository, provider });

    await expect(
      service.create('user-id', {
        grade: 2,
        major: 'Computer Science',
        targetOccupationId: 'occupation-id',
        currentSkillIds: [],
      }),
    ).rejects.toMatchObject({
      code: 'ROADMAP_GENERATION_FAILED',
      details: { roadmapId: 'roadmap-id', status: 'FAILED' },
    });
  });

  it('translates occupation/skill ids to names for the AI request and persists the timeline', async () => {
    const repository = createRepository();
    let capturedRequest;
    const provider = {
      generate: async (request) => {
        capturedRequest = request;
        return [
          {
            period: '2학년 2학기',
            items: [{ type: 'TASK', title: 'do a thing', sourceId: 'source-id' }],
          },
        ];
      },
    };
    const service = createRoadmapsService({ repository, provider });

    const result = await service.create('user-id', {
      grade: 2,
      major: 'Computer Science',
      targetOccupationId: 'occupation-id',
      currentSkillIds: ['skill-id'],
    });

    expect(capturedRequest).toEqual({
      grade: 2,
      major: 'Computer Science',
      job: 'Demo job',
      skills: ['Python'],
    });
    expect(result).toMatchObject({ id: 'roadmap-id', status: 'COMPLETED' });
  });
});
