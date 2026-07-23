import { getPagination } from '../../common/pagination.js';
import { getPrismaClient } from '../../config/prisma.js';

const select = { id: true, name: true, slug: true, description: true };

function createList(model, prisma) {
  return async ({ query, page, size }) => {
    const pagination = getPagination({ page, size });
    const where = {
      active: true,
      ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma[model].findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
        select,
      }),
      prisma[model].count({ where }),
    ]);
    return { items, total, pagination };
  };
}

export function createCatalogRepository(prisma = getPrismaClient()) {
  return {
    categories: async ({ query, page, size }) => {
      const pagination = getPagination({ page, size });
      const where = {
        active: true,
        ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
      };
      const [items, total] = await Promise.all([
        prisma.occupationCategory.findMany({
          where,
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
          skip: pagination.skip,
          take: pagination.take,
          select: { id: true, name: true, slug: true, displayOrder: true },
        }),
        prisma.occupationCategory.count({ where }),
      ]);
      return { items, total, pagination };
    },
    skills: createList('skill', prisma),
    qualifications: createList('qualification', prisma),
    majors: createList('major', prisma),
  };
}
