import { describe, expect, it } from 'vitest';

import { createRoadmapProvider } from '../src/modules/roadmaps/roadmap.provider.js';

describe('roadmap ai provider', () => {
  it('translates a timeline step into typed roadmap items sharing one resolved source', async () => {
    const prisma = {
      source: {
        findFirst: async () => null,
        create: async ({ data }) => ({ id: 'source-1', ...data }),
      },
    };
    const client = {
      enabled: true,
      post: async (path, body) => {
        expect(path).toBe('/api/roadmap');
        expect(body).toEqual({
          grade: '2',
          major: 'CS',
          job: 'Backend Developer',
          skills: ['Python'],
        });
        return {
          timeline: [
            {
              period: '2학년 2학기',
              tasks: ['프로젝트 진행'],
              certifications: ['정보처리기사'],
              skills: ['SQL'],
              source: 'NCS 학습모듈',
            },
          ],
        };
      },
    };
    const provider = createRoadmapProvider({ client, prisma });

    const result = await provider.generate({
      grade: 2,
      major: 'CS',
      job: 'Backend Developer',
      skills: ['Python'],
    });

    expect(result).toEqual([
      {
        period: '2학년 2학기',
        items: [
          { type: 'TASK', title: '프로젝트 진행', sourceId: 'source-1' },
          { type: 'SKILL', title: 'SQL', sourceId: 'source-1' },
          { type: 'QUALIFICATION', title: '정보처리기사', sourceId: 'source-1' },
        ],
      },
    ]);
  });

  it('throws AI_SERVICE_NOT_CONFIGURED when the client is disabled', async () => {
    const provider = createRoadmapProvider({ client: { enabled: false }, prisma: {} });

    await expect(
      provider.generate({ grade: 2, major: 'CS', job: 'Backend Developer', skills: [] }),
    ).rejects.toMatchObject({ code: 'AI_SERVICE_NOT_CONFIGURED' });
  });
});
