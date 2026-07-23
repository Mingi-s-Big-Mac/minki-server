import { z } from 'zod';

export const listQuerySchema = z.object({
  query: z.object({
    query: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(50).default(20),
  }),
});
