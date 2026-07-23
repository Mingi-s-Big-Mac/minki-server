import { getPrismaClient } from '../../config/prisma.js';

const roadmapInclude = {
  targetOccupation: { select: { id: true, name: true, slug: true } },
  semesters: {
    orderBy: { semesterOrder: 'asc' },
    include: { items: { orderBy: { displayOrder: 'asc' }, include: { source: true } } },
  },
};

export function createRoadmapsRepository(prisma = getPrismaClient()) {
  return {
    findOccupation(id) {
      return prisma.occupation.findFirst({
        where: { id, active: true },
        select: { id: true, name: true },
      });
    },
    create(data) {
      return prisma.roadmap.create({ data, include: roadmapInclude });
    },
    markFailed(id) {
      return prisma.roadmap.update({
        where: { id },
        data: { status: 'FAILED' },
        include: roadmapInclude,
      });
    },
    list(userId) {
      return prisma.roadmap.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { targetOccupation: { select: { id: true, name: true, slug: true } } },
      });
    },
    findById(userId, id) {
      return prisma.roadmap.findFirst({ where: { id, userId }, include: roadmapInclude });
    },
    delete(userId, id) {
      return prisma.roadmap.deleteMany({ where: { id, userId } });
    },
  };
}
