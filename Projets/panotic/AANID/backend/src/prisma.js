const { PrismaClient } = require('@prisma/client');

/** Client Prisma singleton (Neon / Postgres). */
const globalForPrisma = global;

const prisma = globalForPrisma.__aanidPrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__aanidPrisma = prisma;
}

module.exports = { prisma };
