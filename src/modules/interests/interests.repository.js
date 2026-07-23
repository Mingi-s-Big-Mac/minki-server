import { getPrismaClient } from '../../config/prisma.js';

export function createInterestsRepository(prisma = getPrismaClient()) {
  return {
    list(userId) {
      return prisma.interestOccupation.findMany({
        where: { userId, occupation: { active: true } },
        orderBy: { createdAt: 'desc' },
        include: {
          occupation: {
            include: { category: { select: { id: true, name: true, slug: true } } },
          },
        },
      });
    },
    findOccupation(id) {
      return prisma.occupation.findFirst({ where: { id, active: true }, select: { id: true } });
    },
    async add(userId, occupationId) {
      await prisma.interestOccupation.upsert({
        where: { userId_occupationId: { userId, occupationId } },
        create: { userId, occupationId },
        update: {},
      });
      await prisma.userActivity.create({
        data: {
          userId,
          type: 'INTEREST_OCCUPATION_SAVED',
          targetType: 'Occupation',
          targetId: occupationId,
        },
      });
    },
    remove(userId, occupationId) {
      return prisma.interestOccupation.deleteMany({ where: { userId, occupationId } });
    },
  };
}
