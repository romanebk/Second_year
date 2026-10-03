const { FORMATIONS } = require('./data/formationsCatalog');
const { prisma } = require('../../../backend/src/prisma');

const useDb = Boolean(process.env.DATABASE_URL);

/** Fallback mémoire si DATABASE_URL absent (dev local sans Neon). */
const memoryFormations = FORMATIONS.map((f) => ({ ...f, modules: f.modules.map((m) => ({ ...m })) }));
const memoryEnrollments = new Map(); // userId -> [{ formationId, modulesCompleted, enrolledAt, completedAt }]
const memoryPayments = new Map();    // formationId -> [{ userId, phone, amount, currency, provider, paidAt }]
const memoryBadges = new Map();      // userId -> [{ formationId, formationTitle, type, label, earnedAt }]

function dbEnabled() {
  return useDb;
}

// ─── Catalogue ────────────────────────────────────────────────────────────────

async function listFormations({ category, isFree, page = 1, limit } = {}) {
  const pageNum = Math.max(1, parseInt(page) || 1);

  if (!useDb) {
    let filtered = memoryFormations;
    if (category && category !== 'toutes') {
      filtered = filtered.filter((f) => f.category === category.toUpperCase());
    }
    if (isFree !== undefined) {
      const free = isFree === 'true' || isFree === true;
      filtered = filtered.filter((f) => f.isFree === free);
    }
    const total = filtered.length;
    const limitNum = Math.max(1, parseInt(limit) || total || 10);
    const start = (pageNum - 1) * limitNum;
    const data = filtered.slice(start, start + limitNum);
    return { data, total, page: pageNum, limit: limitNum, hasMore: start + limitNum < total };
  }

  const where = {};
  if (category && category !== 'toutes') where.category = category.toUpperCase();
  if (isFree !== undefined) where.isFree = isFree === 'true' || isFree === true;

  const total = await prisma.formation.count({ where });
  const limitNum = Math.max(1, parseInt(limit) || total || 10);
  const start = (pageNum - 1) * limitNum;

  const data = await prisma.formation.findMany({
    where,
    skip: start,
    take: limitNum,
    orderBy: { createdAt: 'desc' },
  });

  return { data, total, page: pageNum, limit: limitNum, hasMore: start + limitNum < total };
}

async function getFormationCore(id) {
  if (!useDb) return memoryFormations.find((f) => f.id === id) || null;
  return prisma.formation.findUnique({ where: { id } });
}

// ─── Inscriptions ───────────────────────────────────────────────────────────

async function getEnrollment(formationId, userId) {
  if (!useDb) {
    return (memoryEnrollments.get(userId) || []).find((e) => e.formationId === formationId) || null;
  }
  return prisma.formationEnrollment.findUnique({
    where: { userId_formationId: { userId, formationId } },
  });
}

async function getUserEnrollments(userId) {
  if (!useDb) {
    return (memoryEnrollments.get(userId) || [])
      .map((enrollment) => {
        const formation = memoryFormations.find((f) => f.id === enrollment.formationId);
        return formation ? { enrollment, formation } : null;
      })
      .filter(Boolean);
  }
  const rows = await prisma.formationEnrollment.findMany({
    where: { userId },
    include: { formation: true },
  });
  return rows.map((row) => ({ enrollment: row, formation: row.formation }));
}

async function enrollUser(formationId, userId) {
  if (!useDb) {
    const formation = memoryFormations.find((f) => f.id === formationId);
    if (!formation) return { error: 'not_found' };
    const list = memoryEnrollments.get(userId) || [];
    if (list.some((e) => e.formationId === formationId)) return { error: 'already_enrolled' };
    if (formation.enrolledCount >= formation.capacity) return { error: 'full' };

    formation.enrolledCount++;
    const enrollment = {
      formationId,
      modulesCompleted: [],
      enrolledAt: new Date().toISOString(),
      completedAt: null,
    };
    list.push(enrollment);
    memoryEnrollments.set(userId, list);
    return { enrollment };
  }

  const formation = await prisma.formation.findUnique({ where: { id: formationId } });
  if (!formation) return { error: 'not_found' };

  const existing = await prisma.formationEnrollment.findUnique({
    where: { userId_formationId: { userId, formationId } },
  });
  if (existing) return { error: 'already_enrolled' };
  if (formation.enrolledCount >= formation.capacity) return { error: 'full' };

  const [enrollment] = await prisma.$transaction([
    prisma.formationEnrollment.create({ data: { userId, formationId, modulesCompleted: [] } }),
    prisma.formation.update({ where: { id: formationId }, data: { enrolledCount: { increment: 1 } } }),
  ]);
  return { enrollment };
}

async function unenrollUser(formationId, userId) {
  if (!useDb) {
    const formation = memoryFormations.find((f) => f.id === formationId);
    if (!formation) return { error: 'not_found' };
    const list = memoryEnrollments.get(userId);
    const idx = list ? list.findIndex((e) => e.formationId === formationId) : -1;
    if (idx === -1) return { error: 'not_enrolled' };

    list.splice(idx, 1);
    formation.enrolledCount = Math.max(0, formation.enrolledCount - 1);
    if (list.length === 0) memoryEnrollments.delete(userId);
    return {};
  }

  const existing = await prisma.formationEnrollment.findUnique({
    where: { userId_formationId: { userId, formationId } },
  });
  if (!existing) return { error: 'not_enrolled' };

  await prisma.$transaction([
    prisma.formationEnrollment.delete({ where: { userId_formationId: { userId, formationId } } }),
    prisma.formation.update({ where: { id: formationId }, data: { enrolledCount: { decrement: 1 } } }),
  ]);
  return {};
}

// ─── Progression ────────────────────────────────────────────────────────────

async function updateModuleProgress(formationId, userId, moduleId, completed) {
  if (!useDb) {
    const list = memoryEnrollments.get(userId);
    const enrollment = list && list.find((e) => e.formationId === formationId);
    if (!enrollment) return { error: 'not_enrolled' };

    const formation = memoryFormations.find((f) => f.id === formationId);
    const moduleExists = formation?.modules.some((m) => m.id === moduleId);
    if (!moduleExists) return { error: 'invalid_module' };

    if (completed === true) {
      if (!enrollment.modulesCompleted.includes(moduleId)) enrollment.modulesCompleted.push(moduleId);
    } else {
      enrollment.modulesCompleted = enrollment.modulesCompleted.filter((id) => id !== moduleId);
    }

    const totalModules = formation.modules.length;
    const progress = totalModules > 0 ? Math.round((enrollment.modulesCompleted.length / totalModules) * 100) : 0;
    const justCompleted = progress === 100 && !enrollment.completedAt;
    if (justCompleted) enrollment.completedAt = new Date().toISOString();

    return { enrollment, progress, justCompleted, formationTitle: formation.title };
  }

  const existing = await prisma.formationEnrollment.findUnique({
    where: { userId_formationId: { userId, formationId } },
  });
  if (!existing) return { error: 'not_enrolled' };

  const formation = await prisma.formation.findUnique({ where: { id: formationId } });
  const moduleExists = formation?.modules.some((m) => m.id === moduleId);
  if (!moduleExists) return { error: 'invalid_module' };

  let modulesCompleted = Array.isArray(existing.modulesCompleted) ? existing.modulesCompleted : [];
  if (completed === true) {
    if (!modulesCompleted.includes(moduleId)) modulesCompleted = [...modulesCompleted, moduleId];
  } else {
    modulesCompleted = modulesCompleted.filter((id) => id !== moduleId);
  }

  const totalModules = formation.modules.length;
  const progress = totalModules > 0 ? Math.round((modulesCompleted.length / totalModules) * 100) : 0;
  const justCompleted = progress === 100 && !existing.completedAt;

  const enrollment = await prisma.formationEnrollment.update({
    where: { userId_formationId: { userId, formationId } },
    data: {
      modulesCompleted,
      completedAt: justCompleted ? new Date() : existing.completedAt,
    },
  });

  return { enrollment, progress, justCompleted, formationTitle: formation.title };
}

// ─── Badges ─────────────────────────────────────────────────────────────────

async function awardBadge(userId, formationId, formationTitle) {
  if (!useDb) {
    const list = memoryBadges.get(userId) || [];
    if (list.some((b) => b.formationId === formationId && b.type === 'completion')) return;
    list.push({
      formationId,
      formationTitle,
      type: 'completion',
      label: `${formationTitle} — Réussi`,
      earnedAt: new Date().toISOString(),
    });
    memoryBadges.set(userId, list);
    return;
  }

  const existing = await prisma.formationBadge.findFirst({
    where: { userId, formationId, type: 'completion' },
  });
  if (existing) return;

  await prisma.formationBadge.create({
    data: { userId, formationId, formationTitle, type: 'completion', label: `${formationTitle} — Réussi` },
  });
}

async function getUserBadges(userId) {
  if (!useDb) return memoryBadges.get(userId) || [];
  return prisma.formationBadge.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } });
}

// ─── Paiements ──────────────────────────────────────────────────────────────
// Deux modes : paiement unique (formations sans paymentPlan) et paiement en
// tranches (formations avec paymentPlan). Chaque paiement de tranche est une
// ligne distincte, identifiée par son champ `tranche`.

async function listUserPayments(formationId, userId) {
  if (!useDb) {
    return (memoryPayments.get(formationId) || []).filter((p) => p.userId === userId);
  }
  return prisma.formationPayment.findMany({
    where: { userId, formationId },
    orderBy: { paidAt: 'asc' },
  });
}

/**
 * État du paiement d'un utilisateur pour une formation.
 * @returns {{ totalPaid, paidTranches, nextTranche, isFullyPaid }}
 */
async function getPaymentState(formation, userId) {
  const payments = userId ? await listUserPayments(formation.id, userId) : [];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const plan = formation.paymentPlan;

  if (!plan || !Array.isArray(plan.tranches)) {
    return {
      totalPaid,
      paidTranches: [],
      nextTranche: null,
      isFullyPaid: formation.isFree || payments.length > 0,
    };
  }

  const paidTranches = plan.tranches
    .filter((t) => payments.some((p) => p.tranche === t.id))
    .map((t) => t.id);
  const nextTranche = plan.tranches.find((t) => !paidTranches.includes(t.id)) || null;
  return {
    totalPaid,
    paidTranches,
    nextTranche,
    isFullyPaid: formation.isFree || !nextTranche,
  };
}

async function hasUserPaid(formationId, userId) {
  const formation = await getFormationCore(formationId);
  if (!formation) return false;
  const state = await getPaymentState(formation, userId);
  return state.isFullyPaid;
}

async function recordPayment(formationId, userId, phone, amount, currency, provider, tranche = null) {
  // 'full' = paiement unique d'une formation sans plan par tranches
  const trancheKey = tranche || 'full';

  if (!useDb) {
    const list = memoryPayments.get(formationId) || [];
    if (list.some((p) => p.userId === userId && p.tranche === trancheKey)) return;
    list.push({ userId, phone, amount, currency, provider, tranche: trancheKey, paidAt: new Date().toISOString() });
    memoryPayments.set(formationId, list);
    return;
  }

  await prisma.formationPayment.upsert({
    where: { userId_formationId_tranche: { userId, formationId, tranche: trancheKey } },
    update: {},
    create: { userId, formationId, phone, amount, currency, provider, tranche: trancheKey },
  });
}

/**
 * Annote chaque module avec `locked` selon les tranches payées, et masque le
 * contenu des modules verrouillés. Sans paymentPlan, rien n'est verrouillé.
 */
function decorateModules(formation, paidTranches) {
  const modules = Array.isArray(formation.modules) ? formation.modules : [];
  if (!formation.paymentPlan) {
    return modules.map((m) => ({ ...m, locked: false }));
  }
  return modules.map((m) => {
    const locked = Boolean(m.trancheId) && !paidTranches.includes(m.trancheId);
    if (!locked) return { ...m, locked: false };
    return { ...m, locked: true, content: '' };
  });
}

module.exports = {
  dbEnabled,
  listFormations,
  getFormationCore,
  getEnrollment,
  getUserEnrollments,
  enrollUser,
  unenrollUser,
  updateModuleProgress,
  awardBadge,
  getUserBadges,
  hasUserPaid,
  recordPayment,
  listUserPayments,
  getPaymentState,
  decorateModules,
};
