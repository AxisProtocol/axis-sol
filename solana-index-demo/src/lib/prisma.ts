import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// For local development with DATABASE_URL
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// For Cloudflare Workers with D1
export function getPrisma(db: D1Database) {
  const adapter = new PrismaD1(db);
  return new PrismaClient({
    adapter,
    log: ['error'],
  });
}
