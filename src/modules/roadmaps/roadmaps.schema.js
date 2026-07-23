import { z } from 'zod';

import { gradePolicy } from '../../common/domain/grade.js';

export const createRoadmapSchema = z.object({
  body: z.object({
    grade: z.number().int().min(gradePolicy.min).max(gradePolicy.max),
    major: z.string().trim().min(1).max(80),
    targetOccupationId: z.string().uuid(),
    currentSkillIds: z.array(z.string().uuid()).default([]),
  }),
});

export const roadmapIdSchema = z.object({
  params: z.object({ roadmapId: z.string().uuid() }),
});
