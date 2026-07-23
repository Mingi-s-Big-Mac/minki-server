import { z } from 'zod';

export const createConversationSchema = z.object({
  body: z.object({
    title: z.string().trim().max(120).optional(),
  }),
});

export const conversationIdSchema = z.object({
  params: z.object({ conversationId: z.string().uuid() }),
});

export const createMessageSchema = z.object({
  params: z.object({ conversationId: z.string().uuid() }),
  body: z.object({
    content: z.string().trim().min(1).max(4000),
  }),
});
