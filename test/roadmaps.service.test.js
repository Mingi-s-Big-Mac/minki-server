import { describe, expect, it } from 'vitest';

import { createRoadmapsService } from '../src/modules/roadmaps/roadmaps.service.js';

describe('roadmaps service', () => {
  it('marks roadmap as failed when provider fails', async () => {
    const repository = {
      findOccupation: async () => ({ id: 'occupation-id', name: 'Demo job' }),
      create: async () => ({ id: 'roadmap-id', status: 'GENERATING' }),
      markFailed: async () => ({ id: 'roadmap-id', status: 'FAILED' }),
    };
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
});
