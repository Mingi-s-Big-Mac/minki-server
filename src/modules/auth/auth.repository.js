import { getPrismaClient } from '../../config/prisma.js';

const publicUserSelect = {
  id: true,
  email: true,
  nickname: true,
  grade: true,
  majorText: true,
  majorId: true,
  schoolId: true,
  emailVerifiedAt: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

export function createAuthRepository(prisma = getPrismaClient()) {
  return {
    findSchoolByDomain(emailDomain) {
      return prisma.school.findFirst({ where: { emailDomain, active: true } });
    },
    findUserByEmail(email) {
      return prisma.user.findUnique({ where: { email } });
    },
    findPublicUserById(id) {
      return prisma.user.findFirst({ where: { id, status: 'ACTIVE' }, select: publicUserSelect });
    },
    createUser(user) {
      return prisma.user.create({ data: user, select: publicUserSelect });
    },
    updateLastLogin(id) {
      return prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
        select: publicUserSelect,
      });
    },
  };
}

export { publicUserSelect };
