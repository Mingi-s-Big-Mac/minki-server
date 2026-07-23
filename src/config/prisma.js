import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { getEnv } from './env.js';

const globalPrisma = globalThis;

function createPrismaClient() {
  const config = getEnv();
  const adapter = new PrismaPg({
    connectionString: config.databaseUrl,
    connectionTimeoutMillis: 5000,
    max: 10,
  });

  return new PrismaClient({ adapter });
}

export function getPrismaClient() {
  if (!globalPrisma.__minkiPrisma) {
    globalPrisma.__minkiPrisma = createPrismaClient();
  }

  return globalPrisma.__minkiPrisma;
}

export async function disconnectDatabase() {
  if (!globalPrisma.__minkiPrisma) {
    return;
  }

  await globalPrisma.__minkiPrisma.$disconnect();
  delete globalPrisma.__minkiPrisma;
}
