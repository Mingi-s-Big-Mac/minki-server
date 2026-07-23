import { z } from 'zod';

import { gradePolicy } from '../../common/domain/grade.js';

export const updateMeSchema = z.object({
  body: z.object({
    nickname: z.string().trim().min(1).max(40).optional(),
    grade: z.number().int().min(gradePolicy.min).max(gradePolicy.max).optional(),
    majorText: z.string().trim().min(1).max(80).optional(),
    schoolId: z.string().uuid().nullable().optional(),
    majorId: z.string().uuid().nullable().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
});
