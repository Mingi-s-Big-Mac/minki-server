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
    createEmailVerification(data) {
      return prisma.emailVerification.create({ data });
    },
    findLatestVerification(email, purpose) {
      return prisma.emailVerification.findFirst({
        where: { email, purpose },
        orderBy: { createdAt: 'desc' },
      });
    },
    incrementVerificationAttempts(id) {
      return prisma.emailVerification.update({
        where: { id },
        data: { attemptCount: { increment: 1 } },
      });
    },
    async signUpWithVerification({ user, verificationId }) {
      return prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({ data: user, select: publicUserSelect });
        await tx.emailVerification.update({
          where: { id: verificationId },
          data: { verifiedAt: new Date() },
        });
        return createdUser;
      });
    },
    markVerificationVerified(id) {
      return prisma.emailVerification.update({ where: { id }, data: { verifiedAt: new Date() } });
    },
    updateLastLogin(id) {
      return prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
        select: publicUserSelect,
      });
    },
    createRefreshToken(data) {
      return prisma.refreshToken.create({ data });
    },
    findRefreshToken(tokenHash) {
      return prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
    },
    async rotateRefreshToken({ tokenId, replacement }) {
      return prisma.$transaction(async (tx) => {
        const created = await tx.refreshToken.create({ data: replacement });
        await tx.refreshToken.update({
          where: { id: tokenId },
          data: { revokedAt: new Date(), replacedByTokenId: created.id },
        });
        return created;
      });
    },
    revokeRefreshToken(tokenHash) {
      return prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    },
  };
}

export { publicUserSelect };
