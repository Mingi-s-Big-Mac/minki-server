import { ServiceUnavailableError } from '../../common/errors/app-error.js';
import { getPrismaClient } from '../../config/prisma.js';

export async function checkDatabaseConnection() {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    throw new ServiceUnavailableError('데이터베이스 연결을 확인할 수 없습니다.');
  }
}
