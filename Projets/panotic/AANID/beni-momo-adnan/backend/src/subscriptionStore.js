// Forfaits AANID (Amateur / Professionnel / Régie) — persistance Prisma avec
// fallback mémoire si DATABASE_URL absent.
const { prisma } = require('../../../backend/src/prisma');

const useDb = Boolean(process.env.DATABASE_URL);
const memorySubscriptions = new Map(); // userId -> { plan, activatedAt }

async function getSubscription(userId) {
  if (!useDb) return memorySubscriptions.get(userId) || null;
  const row = await prisma.userSubscription.findUnique({ where: { userId } });
  return row ? { plan: row.plan, activatedAt: row.activatedAt.toISOString() } : null;
}

async function setSubscription(userId, plan) {
  const activatedAt = new Date();
  if (!useDb) {
    const sub = { plan, activatedAt: activatedAt.toISOString() };
    memorySubscriptions.set(userId, sub);
    return sub;
  }
  const row = await prisma.userSubscription.upsert({
    where: { userId },
    update: { plan, activatedAt },
    create: { userId, plan, activatedAt },
  });
  return { plan: row.plan, activatedAt: row.activatedAt.toISOString() };
}

module.exports = { getSubscription, setSubscription };
