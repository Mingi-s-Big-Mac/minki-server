import { getPrismaClient } from '../../config/prisma.js';
import { publicUserSelect } from '../auth/auth.repository.js';

export function createDashboardRepository(prisma = getPrismaClient()) {
  return {
    async get(userId) {
      const [user, interests, recentSearches, activities, categories] = await Promise.all([
        prisma.user.findFirst({
          where: { id: userId, status: 'ACTIVE' },
          select: publicUserSelect,
        }),
        prisma.interestOccupation.findMany({
          where: { userId, occupation: { active: true } },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { occupation: { select: { id: true, name: true, slug: true, summary: true } } },
        }),
        prisma.recentSearch.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.userActivity.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.occupationCategory.findMany({
          where: { active: true },
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
          take: 10,
          select: { id: true, name: true, slug: true },
        }),
      ]);
      return { user, interests, recentSearches, activities, categories };
    },
  };
}
