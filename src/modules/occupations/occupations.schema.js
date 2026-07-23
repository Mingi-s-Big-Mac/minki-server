import { z } from 'zod';

export const occupationListSchema = z.object({
  query: z.object({
    query: z.string().trim().optional(),
    categoryId: z.string().uuid().optional(),
    skillId: z.string().uuid().optional(),
    qualificationId: z.string().uuid().optional(),
    majorId: z.string().uuid().optional(),
    interested: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(50).default(20),
    sort: z.enum(['name', 'createdAt']).default('name'),
  }),
});

export const occupationIdSchema = z.object({
  params: z.object({ occupationId: z.string().uuid() }),
});

export const compareSchema = z.object({
  query: z.object({
    ids: z.string().transform((value) =>
      value
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  }),
});

export const suggestionsSchema = z.object({
  query: z.object({
    query: z.string().trim().min(1),
    size: z.coerce.number().int().min(1).max(20).default(10),
  }),
});
