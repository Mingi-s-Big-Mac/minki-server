import { getPrismaClient } from '../../config/prisma.js';

const citationInclude = {
  source: {
    select: {
      id: true,
      organization: true,
      title: true,
      url: true,
      publishedAt: true,
      accessedAt: true,
      license: true,
    },
  },
  sourceChunk: { select: { id: true, content: true, chunkIndex: true } },
};

const messageInclude = {
  citations: { orderBy: { citationNumber: 'asc' }, include: citationInclude },
};

export function createConversationsRepository(prisma = getPrismaClient()) {
  return {
    create(userId, data) {
      return prisma.conversation.create({ data: { userId, title: data.title } });
    },
    list(userId) {
      return prisma.conversation.findMany({
        where: { userId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
      });
    },
    findById(userId, id) {
      return prisma.conversation.findFirst({
        where: { id, userId, deletedAt: null },
        include: { messages: { orderBy: { createdAt: 'asc' }, include: messageInclude } },
      });
    },
    delete(userId, id) {
      return prisma.conversation.updateMany({
        where: { id, userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    },
    async saveQuestionAndFailure({ userId, conversationId, content }) {
      return prisma.$transaction(async (tx) => {
        const conversation = await tx.conversation.findFirst({
          where: { id: conversationId, userId, deletedAt: null },
        });
        if (!conversation) return null;
        const userMessage = await tx.message.create({
          data: { conversationId, role: 'USER', content, status: 'SAVED' },
        });
        const aiMessage = await tx.message.create({
          data: { conversationId, role: 'ASSISTANT', content: '', status: 'FAILED' },
          include: messageInclude,
        });
        await tx.userActivity.create({
          data: {
            userId,
            type: 'AI_QUESTION_ASKED',
            targetType: 'Conversation',
            targetId: conversationId,
          },
        });
        return { userMessage, aiMessage };
      });
    },
    async saveAnswer({ userId, conversationId, content, answer }) {
      return prisma.$transaction(async (tx) => {
        const conversation = await tx.conversation.findFirst({
          where: { id: conversationId, userId, deletedAt: null },
        });
        if (!conversation) return null;
        const userMessage = await tx.message.create({
          data: { conversationId, role: 'USER', content, status: 'SAVED' },
        });
        const aiMessage = await tx.message.create({
          data: {
            conversationId,
            role: 'ASSISTANT',
            content: answer.content,
            status: 'COMPLETED',
            citations: {
              create: (answer.citations ?? []).map((citation, index) => ({
                sourceId: citation.sourceId,
                sourceChunkId: citation.sourceChunkId,
                citationNumber: index + 1,
                quotedText: citation.quotedText,
                relevanceScore: citation.relevanceScore,
              })),
            },
          },
          include: messageInclude,
        });
        await tx.userActivity.create({
          data: {
            userId,
            type: 'AI_QUESTION_ASKED',
            targetType: 'Conversation',
            targetId: conversationId,
          },
        });
        await tx.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
        return { userMessage, aiMessage };
      });
    },
  };
}
