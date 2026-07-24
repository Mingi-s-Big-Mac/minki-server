import { AppError } from '../../common/errors/app-error.js';
import { createAiClient } from '../../common/ai/ai-client.js';
import { resolveAiSource } from '../../common/ai/resolve-source.js';
import { getEnv } from '../../config/env.js';
import { getPrismaClient } from '../../config/prisma.js';

const itemTypeOf = {
  tasks: 'TASK',
  skills: 'SKILL',
  certifications: 'QUALIFICATION',
};

export function createRoadmapProvider({
  config = getEnv(),
  client = createAiClient(config.aiService),
  prisma = getPrismaClient(),
} = {}) {
  return {
    async generate({ grade, major, job, skills }) {
      if (!client.enabled) {
        throw new AppError('로드맵 생성 AI 서비스가 구성되지 않았습니다.', {
          statusCode: 503,
          code: 'AI_SERVICE_NOT_CONFIGURED',
        });
      }

      const result = await client.post('/api/roadmap', {
        grade: String(grade),
        major,
        job,
        skills,
      });

      return Promise.all(
        result.timeline.map(async (step) => {
          const sourceRecord = await resolveAiSource(prisma, {
            externalId: `ai-roadmap-source-${step.source}`,
            organization: '진로 AI 로드맵',
            title: step.source,
          });

          const items = [];
          for (const field of ['tasks', 'skills', 'certifications']) {
            for (const title of step[field] ?? []) {
              items.push({ type: itemTypeOf[field], title, sourceId: sourceRecord.id });
            }
          }

          return { period: step.period, items };
        }),
      );
    },
  };
}
