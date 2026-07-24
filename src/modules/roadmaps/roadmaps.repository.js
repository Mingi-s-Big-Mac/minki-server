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
    findSkillsByIds(ids) {
      if (!ids?.length) return [];
      return prisma.skill.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true },
      });
    },
    create(data) {
      return prisma.roadmap.create({ data, include: roadmapInclude });
    },
    complete(id, semesters) {
      return prisma.$transaction(async (tx) => {
        for (const [index, semester] of semesters.entries()) {
          await tx.roadmapSemester.create({
            data: {
              roadmapId: id,
              semesterOrder: index + 1,
              title: semester.period,
              items: {
                create: semester.items.map((item, itemIndex) => ({
                  type: item.type,
                  title: item.title,
                  sourceId: item.sourceId,
                  displayOrder: itemIndex,
                })),
              },
            },
          });
        }

        return tx.roadmap.update({
          where: { id },
          data: { status: 'COMPLETED' },
          include: roadmapInclude,
        });
      });
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
      return prisma.$transaction(async (tx) => {
        const roadmap = await tx.roadmap.findFirst({ where: { id, userId } });
        if (!roadmap) return { count: 0 };

        await tx.roadmapItem.deleteMany({ where: { roadmapSemester: { roadmapId: id } } });
        await tx.roadmapSemester.deleteMany({ where: { roadmapId: id } });
        return tx.roadmap.deleteMany({ where: { id, userId } });
      });
    },
  };
}
