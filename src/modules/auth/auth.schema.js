import { z } from 'zod';

import { gradePolicy } from '../../common/domain/grade.js';

const email = z.string().trim().email().toLowerCase();
const password = z.string().min(8);

export const signUpSchema = z.object({
  body: z.object({
    email,
    password,
    nickname: z.string().trim().min(1).max(40),
    grade: z.number().int().min(gradePolicy.min).max(gradePolicy.max),
    majorText: z.string().trim().min(1).max(80),
    schoolId: z.string().uuid().optional(),
    majorId: z.string().uuid().optional(),
  }),
});

export const signInSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1),
  }),
});
