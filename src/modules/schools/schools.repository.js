import { getPagination } from '../../common/pagination.js';
import { getPrismaClient } from '../../config/prisma.js';

export function createSchoolsRepository(prisma = getPrismaClient()) {
  return {
    async list({ query, page, size }) {
      const pagination = getPagination({ page, size });
      const where = {
        active: true,
        ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
      };
      const [items, total] = await Promise.all([
        prisma.school.findMany({
          where,
          orderBy: { name: 'asc' },
          skip: pagination.skip,
          take: pagination.take,
          select: { id: true, name: true, emailDomain: true },
        }),
        prisma.school.count({ where }),
      ]);
      return { items, total, pagination };
    },
  };
}
