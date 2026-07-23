import { getPagination } from '../../common/pagination.js';
import { getPrismaClient } from '../../config/prisma.js';

const sourceSelect = {
  id: true,
  organization: true,
  title: true,
  url: true,
  publishedAt: true,
  accessedAt: true,
  license: true,
};

const occupationDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  skills: {
    orderBy: { displayOrder: 'asc' },
    include: { skill: true, source: { select: sourceSelect } },
  },
  qualifications: {
    orderBy: { displayOrder: 'asc' },
    include: { qualification: true, source: { select: sourceSelect } },
  },
  majors: {
    orderBy: { displayOrder: 'asc' },
    include: { major: true, source: { select: sourceSelect } },
  },
  competencies: {
    orderBy: { displayOrder: 'asc' },
    take: 4,
    include: { source: { select: sourceSelect } },
  },
};

function createWhere({ query, categoryId, skillId, qualificationId, majorId, interested }, userId) {
  return {
    active: true,
    ...(categoryId ? { categoryId } : {}),
    ...(skillId ? { skills: { some: { skillId } } } : {}),
    ...(qualificationId ? { qualifications: { some: { qualificationId } } } : {}),
    ...(majorId ? { majors: { some: { majorId } } } : {}),
    ...(interested === true && userId ? { interests: { some: { userId } } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { skills: { some: { skill: { name: { contains: query, mode: 'insensitive' } } } } },
            {
              qualifications: {
                some: { qualification: { name: { contains: query, mode: 'insensitive' } } },
              },
            },
            { majors: { some: { major: { name: { contains: query, mode: 'insensitive' } } } } },
          ],
        }
      : {}),
  };
}

function mapOccupation(occupation, userId) {
  return {
    id: occupation.id,
    name: occupation.name,
    slug: occupation.slug,
    summary: occupation.summary,
    description: occupation.description,
    outlook: occupation.outlook,
    category: occupation.category,
    interested: userId
      ? occupation.interests?.some((interest) => interest.userId === userId)
      : undefined,
    skills: occupation.skills?.map((item) => ({
      ...item.skill,
      importance: item.importance,
      displayOrder: item.displayOrder,
      description: item.description,
      source: item.source,
    })),
    qualifications: occupation.qualifications?.map((item) => ({
      ...item.qualification,
      importance: item.importance,
      displayOrder: item.displayOrder,
      description: item.description,
      source: item.source,
    })),
    majors: occupation.majors?.map((item) => ({
      ...item.major,
      importance: item.importance,
      displayOrder: item.displayOrder,
      description: item.description,
      source: item.source,
    })),
    competencies: occupation.competencies,
  };
}

export function createOccupationsRepository(prisma = getPrismaClient()) {
  return {
    async list(query, userId) {
      const pagination = getPagination(query);
      const where = createWhere(query, userId);
      const [items, total] = await Promise.all([
        prisma.occupation.findMany({
          where,
          orderBy: query.sort === 'createdAt' ? { createdAt: 'desc' } : { name: 'asc' },
          skip: pagination.skip,
          take: pagination.take,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            interests: userId ? { where: { userId }, select: { userId: true } } : false,
          },
        }),
        prisma.occupation.count({ where }),
      ]);
      return { items: items.map((item) => mapOccupation(item, userId)), total, pagination };
    },
    async findById(id, userId) {
      const occupation = await prisma.occupation.findFirst({
        where: { id, active: true },
        include: {
          ...occupationDetailInclude,
          interests: userId ? { where: { userId }, select: { userId: true } } : false,
        },
      });
      return occupation ? mapOccupation(occupation, userId) : null;
    },
    async findManyByIds(ids) {
      const items = await prisma.occupation.findMany({
        where: { id: { in: ids }, active: true },
        include: occupationDetailInclude,
      });
      return items.map((item) => mapOccupation(item));
    },
    async suggestions({ query, size }) {
      const [occupations, skills, qualifications, majors] = await Promise.all([
        prisma.occupation.findMany({
          where: { active: true, name: { contains: query, mode: 'insensitive' } },
          take: size,
          select: { id: true, name: true },
        }),
        prisma.skill.findMany({
          where: { active: true, name: { contains: query, mode: 'insensitive' } },
          take: size,
          select: { id: true, name: true },
        }),
        prisma.qualification.findMany({
          where: { active: true, name: { contains: query, mode: 'insensitive' } },
          take: size,
          select: { id: true, name: true },
        }),
        prisma.major.findMany({
          where: { active: true, name: { contains: query, mode: 'insensitive' } },
          take: size,
          select: { id: true, name: true },
        }),
      ]);
      return { occupations, skills, qualifications, majors };
    },
  };
}
