import { z } from 'zod';

export const interestOccupationSchema = z.object({
  params: z.object({ occupationId: z.string().uuid() }),
});
