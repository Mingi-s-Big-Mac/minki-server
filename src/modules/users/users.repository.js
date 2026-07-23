import { getPrismaClient } from '../../config/prisma.js';
import { publicUserSelect } from '../auth/auth.repository.js';

export function createUsersRepository(prisma = getPrismaClient()) {
  return {
    findById(id) {
      return prisma.user.findFirst({ where: { id, status: 'ACTIVE' } });
    },
    findPublicById(id) {
      return prisma.user.findFirst({ where: { id, status: 'ACTIVE' }, select: publicUserSelect });
    },
    updateMe(id, data) {
      return prisma.user.update({ where: { id }, data, select: publicUserSelect });
    },
    async changePassword(id, passwordHash) {
      return prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id }, data: { passwordHash } });
        await tx.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      });
    },
    async deleteUser(id) {
      return prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id },
          data: { status: 'DELETED', deletedAt: new Date() },
        });
        await tx.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      });
    },
    async stats(userId) {
      const [interestCount, aiQuestionCount, roadmapCount] = await Promise.all([
        prisma.interestOccupation.count({ where: { userId } }),
        prisma.message.count({
          where: { role: 'USER', conversation: { userId, deletedAt: null } },
        }),
        prisma.roadmap.count({ where: { userId } }),
      ]);
      return { interestOccupationCount: interestCount, aiQuestionCount, roadmapCount };
    },
    activities(userId) {
      return prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    },
  };
}
