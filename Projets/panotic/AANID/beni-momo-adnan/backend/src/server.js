const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const kkiapay = require('./kkiapay');
const formationStore = require('./formationStore');
const subscriptionStore = require('./subscriptionStore');

const router = express.Router();

const SECRET = process.env.AANID_ACCESS_SECRET || 'dev-only-access-secret-CHANGE-ME';

if (formationStore.dbEnabled()) {
  console.log('[AANID] Formations → PostgreSQL (Neon/Prisma)');
} else {
  console.warn('[AANID] Formations → mémoire (DATABASE_URL absent, données perdues au redémarrage)');
}

// Documents PDF des formations
router.use('/formations/assets', express.static(path.join(__dirname, '../assets/formations')));

// ─── Middleware auth ─────────────────────────────────────────────────────────

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Token d'accès manquant" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, SECRET, { issuer: 'aanid', audience: 'aanid-app' });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function getUserFromToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.slice(7), SECRET, { issuer: 'aanid', audience: 'aanid-app' }).sub;
  } catch {
    return null;
  }
}

// ─── Routes formations ────────────────────────────────────────────────────────

// GET /formations
router.get('/formations', async (req, res) => {
  const { category, isFree, page, limit } = req.query;
  const result = await formationStore.listFormations({ category, isFree, page, limit });
  res.json(result);
});

// GET /formations/mine (doit être AVANT /formations/:id)
router.get('/formations/mine', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  const rows = await formationStore.getUserEnrollments(userId);

  const result = rows.map(({ enrollment, formation }) => {
    const totalModules = formation.modules.length;
    const completedCount = enrollment.modulesCompleted.length;
    const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
    return {
      ...formation,
      modulesCompleted: enrollment.modulesCompleted,
      progress,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
    };
  });

  res.json(result);
});

// GET /formations/mine/badges (doit être AVANT /formations/:id)
router.get('/formations/mine/badges', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  res.json(await formationStore.getUserBadges(userId));
});

// GET /formations/:id
router.get('/formations/:id', async (req, res) => {
  const formation = await formationStore.getFormationCore(req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation non trouvée' });
  }

  const userId = req.headers['authorization'] ? getUserFromToken(req) : null;
  const enrollment = userId ? await formationStore.getEnrollment(formation.id, userId) : null;
  const paymentState = await formationStore.getPaymentState(formation, userId);

  res.json({
    ...formation,
    modules: formationStore.decorateModules(formation, paymentState.paidTranches),
    isEnrolled: !!enrollment,
    payment: formation.paymentPlan ? {
      plan: formation.paymentPlan,
      paidTranches: paymentState.paidTranches,
      totalPaid: paymentState.totalPaid,
      remaining: Math.max(0, (formation.paymentPlan.total || formation.price) - paymentState.totalPaid),
      nextTranche: paymentState.nextTranche,
      isFullyPaid: paymentState.isFullyPaid,
    } : null,
    userProgress: enrollment ? {
      modulesCompleted: enrollment.modulesCompleted,
      completedAt: enrollment.completedAt || null,
      enrolledAt: enrollment.enrolledAt,
    } : null,
  });
});

// POST /formations/:id/enroll
router.post('/formations/:id/enroll', authenticateToken, async (req, res) => {
  const userId = req.user.sub;

  // Formations payantes : l'inscription exige au minimum la première tranche
  // (plan par tranches) ou le paiement complet (paiement unique).
  const formation = await formationStore.getFormationCore(req.params.id);
  if (formation && !formation.isFree) {
    const state = await formationStore.getPaymentState(formation, userId);
    const firstTranche = formation.paymentPlan?.tranches?.[0];
    const inscriptionOk = firstTranche
      ? state.paidTranches.includes(firstTranche.id)
      : state.isFullyPaid;
    if (!inscriptionOk) {
      return res.status(402).json({
        error: firstTranche
          ? `Payez d'abord la tranche « ${firstTranche.label} » (${firstTranche.amount.toLocaleString()} FCFA) pour vous inscrire.`
          : 'Payez cette formation pour vous inscrire.',
        code: 'PAYMENT_REQUIRED',
      });
    }
  }

  const { error } = await formationStore.enrollUser(req.params.id, userId);

  if (error === 'not_found') return res.status(404).json({ error: 'Formation non trouvée' });
  if (error === 'already_enrolled') return res.status(409).json({ error: 'Vous êtes déjà inscrit à cette formation' });
  if (error === 'full') return res.status(400).json({ error: 'Cette formation est complète' });

  res.status(201).json({ message: 'Inscription réussie', formationId: req.params.id });
});

// POST /formations/:id/unenroll
router.post('/formations/:id/unenroll', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  const { error } = await formationStore.unenrollUser(req.params.id, userId);

  if (error === 'not_found') return res.status(404).json({ error: 'Formation non trouvée' });
  if (error === 'not_enrolled') return res.status(404).json({ error: "Vous n'êtes pas inscrit à cette formation" });

  res.json({ message: 'Désinscription réussie', formationId: req.params.id });
});

// PATCH /formations/:id/progress
router.patch('/formations/:id/progress', authenticateToken, async (req, res) => {
  const { moduleId, completed } = req.body;
  if (typeof moduleId !== 'string') {
    return res.status(400).json({ error: 'moduleId requis' });
  }

  const userId = req.user.sub;

  // Un module verrouillé (tranche non payée) ne peut pas être suivi
  const formation = await formationStore.getFormationCore(req.params.id);
  if (formation?.paymentPlan) {
    const state = await formationStore.getPaymentState(formation, userId);
    const mod = (formation.modules || []).find((m) => m.id === moduleId);
    if (mod?.trancheId && !state.paidTranches.includes(mod.trancheId)) {
      return res.status(402).json({
        error: 'Ce module est verrouillé. Payez la tranche correspondante pour y accéder.',
        code: 'MODULE_LOCKED',
      });
    }
  }

  const result = await formationStore.updateModuleProgress(req.params.id, userId, moduleId, completed);

  if (result.error === 'not_enrolled') {
    return res.status(404).json({ error: 'Vous n\'êtes pas inscrit à cette formation' });
  }
  if (result.error === 'invalid_module') {
    return res.status(400).json({ error: 'Module invalide' });
  }

  if (result.justCompleted) {
    await formationStore.awardBadge(userId, req.params.id, result.formationTitle);
  }

  res.json({
    message: 'Progression mise à jour',
    formationId: req.params.id,
    moduleId,
    modulesCompleted: result.enrollment.modulesCompleted,
    progress: result.progress,
    completedAt: result.enrollment.completedAt,
  });
});

// ─── Paiement Mobile Money (KKiaPay ou simulation) ──────────────────────────
// Flux KKiaPay : le frontend ouvre le widget avec la clé publique, obtient un
// transactionId, puis rappelle POST /pay avec ce transactionId pour vérification.

// GET /payments/config — config publique du widget (pas d'auth : clé publique)
router.get('/payments/config', (req, res) => {
  res.json({
    provider: kkiapay.isConfigured() ? 'kkiapay' : 'simulation',
    ...kkiapay.publicConfig(),
  });
});

// POST /formations/:id/pay — { phone, transactionId? }
// Formations avec paymentPlan : chaque appel paie la PROCHAINE tranche due
// (dans l'ordre du plan). Sans plan : paiement unique du prix total.
router.post('/formations/:id/pay', authenticateToken, async (req, res) => {
  const { phone, transactionId } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: 'Numéro de téléphone requis' });
  }

  const formation = await formationStore.getFormationCore(req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation non trouvée' });
  }
  if (formation.isFree) {
    return res.status(400).json({ error: 'Cette formation est gratuite' });
  }

  const userId = req.user.sub;
  const state = await formationStore.getPaymentState(formation, userId);
  if (state.isFullyPaid) {
    return res.status(409).json({ error: 'Paiement déjà effectué pour cette formation' });
  }

  const plan = formation.paymentPlan;
  const tranche = plan ? state.nextTranche : null;
  const dueAmount = tranche ? tranche.amount : formation.price;
  const trancheInfo = tranche ? { tranche: { id: tranche.id, label: tranche.label, amount: tranche.amount } } : {};

  const planProgress = async () => {
    const after = await formationStore.getPaymentState(formation, userId);
    return plan ? {
      totalPaid: after.totalPaid,
      remaining: Math.max(0, (plan.total || formation.price) - after.totalPaid),
      paidTranches: after.paidTranches,
      nextTranche: after.nextTranche,
      isFullyPaid: after.isFullyPaid,
    } : {};
  };

  if (kkiapay.isConfigured()) {
    if (!transactionId) {
      // Le client doit d'abord ouvrir le widget KKiaPay
      return res.status(200).json({
        provider: 'kkiapay',
        status: 'requires_widget',
        formationId: formation.id,
        amount: dueAmount,
        currency: formation.currency,
        ...trancheInfo,
        ...kkiapay.publicConfig(),
      });
    }
    try {
      const tx = await kkiapay.verifyTransaction(transactionId);
      if (!kkiapay.isPaidStatus(tx.status)) {
        const failed = kkiapay.isFailedStatus(tx.status);
        return res.status(failed ? 402 : 202).json({
          provider: 'kkiapay',
          status: failed ? 'failed' : 'pending',
          formationId: formation.id,
          transactionId,
          message: failed ? 'Le paiement a échoué ou a été annulé.' : 'Paiement en cours de traitement.',
        });
      }
      if (typeof tx.amount === 'number' && tx.amount < dueAmount) {
        return res.status(402).json({ error: 'Montant payé insuffisant' });
      }
      await formationStore.recordPayment(formation.id, userId, phone, dueAmount, formation.currency, 'kkiapay', tranche?.id || null);
      return res.status(201).json({
        provider: 'kkiapay',
        status: 'approved',
        message: tranche ? `Tranche « ${tranche.label} » payée avec succès` : 'Paiement vérifié avec succès',
        formationId: formation.id,
        transactionId,
        amount: dueAmount,
        currency: formation.currency,
        ...trancheInfo,
        ...(await planProgress()),
      });
    } catch (err) {
      return res.status(502).json({ error: `Vérification du paiement impossible : ${err.message}` });
    }
  }

  // Aucune clé KKiaPay configurée : simulation (dev / démo)
  await formationStore.recordPayment(formation.id, userId, phone, dueAmount, formation.currency, 'simulation', tranche?.id || null);
  res.status(201).json({
    provider: 'simulation',
    status: 'approved',
    message: tranche ? `Tranche « ${tranche.label} » payée avec succès` : 'Paiement effectué avec succès',
    formationId: formation.id,
    amount: dueAmount,
    currency: formation.currency,
    ...trancheInfo,
    ...(await planProgress()),
  });
});

// GET /formations/:id/payment-status
router.get('/formations/:id/payment-status', authenticateToken, async (req, res) => {
  const formation = await formationStore.getFormationCore(req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation non trouvée' });
  }

  const userId = req.user.sub;
  const state = await formationStore.getPaymentState(formation, userId);
  const plan = formation.paymentPlan;

  res.json({
    formationId: formation.id,
    isFree: formation.isFree,
    isPaid: state.isFullyPaid,
    status: state.isFullyPaid ? 'approved' : null,
    amount: formation.price,
    currency: formation.currency,
    ...(plan ? {
      plan,
      totalPaid: state.totalPaid,
      remaining: Math.max(0, (plan.total || formation.price) - state.totalPaid),
      paidTranches: state.paidTranches,
      nextTranche: state.nextTranche,
      canEnroll: formation.isFree || state.paidTranches.includes(plan.tranches?.[0]?.id),
    } : {}),
  });
});

// ─── Abonnements (forfaits AANID) ────────────────────────────────────────────

const SUBSCRIPTION_PLANS = {
  Amateur: { price: 0 },
  Professionnel: { price: 5000 },
  Régie: { price: 25000 },
};

// GET /subscriptions/me
router.get('/subscriptions/me', authenticateToken, async (req, res) => {
  const sub = await subscriptionStore.getSubscription(req.user.sub);
  res.json({
    plan: sub?.plan || 'Amateur',
    activatedAt: sub?.activatedAt || null,
    pendingPlan: null,
  });
});

// POST /subscriptions/pay — { plan, phone, transactionId? }
router.post('/subscriptions/pay', authenticateToken, async (req, res) => {
  const { plan, phone, transactionId } = req.body || {};
  const planDef = SUBSCRIPTION_PLANS[plan];
  if (!planDef) {
    return res.status(400).json({ error: `Forfait invalide. Valeurs possibles : ${Object.keys(SUBSCRIPTION_PLANS).join(', ')}` });
  }
  if (planDef.price === 0) {
    return res.status(400).json({ error: 'Ce forfait est gratuit' });
  }
  if (!phone) {
    return res.status(400).json({ error: 'Numéro de téléphone requis' });
  }

  const userId = req.user.sub;
  const current = await subscriptionStore.getSubscription(userId);
  if (current?.plan === plan) {
    return res.status(409).json({ error: 'Vous êtes déjà abonné à ce forfait' });
  }

  if (kkiapay.isConfigured()) {
    if (!transactionId) {
      return res.status(200).json({
        provider: 'kkiapay',
        status: 'requires_widget',
        plan,
        amount: planDef.price,
        currency: 'XOF',
        ...kkiapay.publicConfig(),
      });
    }
    try {
      const tx = await kkiapay.verifyTransaction(transactionId);
      if (!kkiapay.isPaidStatus(tx.status)) {
        const failed = kkiapay.isFailedStatus(tx.status);
        return res.status(failed ? 402 : 202).json({
          provider: 'kkiapay',
          status: failed ? 'failed' : 'pending',
          plan,
          transactionId,
          message: failed ? 'Le paiement a échoué ou a été annulé.' : 'Paiement en cours de traitement.',
        });
      }
      if (typeof tx.amount === 'number' && tx.amount < planDef.price) {
        return res.status(402).json({ error: 'Montant payé insuffisant' });
      }
      await subscriptionStore.setSubscription(userId, plan);
      return res.status(201).json({
        provider: 'kkiapay',
        status: 'approved',
        plan,
        transactionId,
        amount: planDef.price,
        currency: 'XOF',
        message: 'Abonnement activé',
      });
    } catch (err) {
      return res.status(502).json({ error: `Vérification du paiement impossible : ${err.message}` });
    }
  }

  // Simulation sans clé KKiaPay
  await subscriptionStore.setSubscription(userId, plan);
  res.status(201).json({
    provider: 'simulation',
    status: 'approved',
    plan,
    amount: planDef.price,
    currency: 'XOF',
    message: 'Abonnement activé',
  });
});

// ─── Données villes (Afrique de l'Ouest) ──────────────────────────────────────

const villes = [
  // 🇧🇯 BÉNIN
  {
    id: 'cotonou', nom: 'Cotonou', pays: 'Bénin', region: 'Littoral',
    lat: 6.3653, lng: 2.4183,
    description: 'Capitale économique du Bénin et principal pôle urbain. Centre névralgique de la panneautique et de la publicité urbaine en Afrique de l\'Ouest.',
    population: 1200000, superficie: 79,
    couleur: '#1E73BE',
    favorisCount: 245,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 8, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 12, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 24, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 45, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 24, resolus: 18, enAttente: 6 },
      panneaux: { total: 68, disponibles: 22, loues: 35, maintenance: 11 },
      formations: { total: 12, gratuites: 7, payantes: 5 },
      utilisateurs: 1520,
    },
  },
  {
    id: 'porto-novo', nom: 'Porto-Novo', pays: 'Bénin', region: 'Ouémé',
    lat: 6.4969, lng: 2.6289,
    description: 'Capitale politique du Bénin, riche en patrimoine historique. Ville en pleine modernisation de son mobilier urbain.',
    population: 300000, superficie: 52,
    couleur: '#8E44AD',
    favorisCount: 98,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 3, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 5, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 11, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 18, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyens' },
    ],
    stats: {
      signalements: { total: 11, resolus: 7, enAttente: 4 },
      panneaux: { total: 28, disponibles: 9, loues: 14, maintenance: 5 },
      formations: { total: 5, gratuites: 3, payantes: 2 },
      utilisateurs: 420,
    },
  },
  {
    id: 'parakou', nom: 'Parakou', pays: 'Bénin', region: 'Borgou',
    lat: 9.3371, lng: 2.6213,
    description: 'Plus grande ville du nord Bénin, carrefour commercial et hub agricole majeur.',
    population: 260000, superficie: 35,
    couleur: '#E67E22',
    favorisCount: 45,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 2, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 3, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 7, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 10, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 7, resolus: 4, enAttente: 3 },
      panneaux: { total: 15, disponibles: 5, loues: 8, maintenance: 2 },
      formations: { total: 3, gratuites: 2, payantes: 1 },
      utilisateurs: 180,
    },
  },

  // 🇨🇮 CÔTE D'IVOIRE
  {
    id: 'abidjan', nom: 'Abidjan', pays: "Côte d'Ivoire", region: 'Abidjan',
    lat: 5.3600, lng: -4.0083,
    description: 'Capitale économique ivoirienne et l\'une des métropoles les plus dynamiques d\'Afrique de l\'Ouest. Pôle majeur de la publicité urbaine.',
    population: 5600000, superficie: 422,
    couleur: '#1E73BE',
    favorisCount: 312,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 15, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 18, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 35, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 62, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 35, resolus: 25, enAttente: 10 },
      panneaux: { total: 95, disponibles: 30, loues: 50, maintenance: 15 },
      formations: { total: 18, gratuites: 10, payantes: 8 },
      utilisateurs: 3200,
    },
  },
  {
    id: 'yamoussoukro', nom: 'Yamoussoukro', pays: "Côte d'Ivoire", region: 'Yamoussoukro',
    lat: 6.8167, lng: -5.2833,
    description: 'Capitale politique de la Côte d\'Ivoire, connue pour sa célèbre basilique et son urbanisme moderne.',
    population: 355000, superficie: 230,
    couleur: '#8E44AD',
    favorisCount: 67,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 4, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 6, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 9, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 14, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 9, resolus: 6, enAttente: 3 },
      panneaux: { total: 22, disponibles: 7, loues: 12, maintenance: 3 },
      formations: { total: 6, gratuites: 3, payantes: 3 },
      utilisateurs: 210,
    },
  },

  // 🇸🇳 SÉNÉGAL
  {
    id: 'dakar', nom: 'Dakar', pays: 'Sénégal', region: 'Dakar',
    lat: 14.7167, lng: -17.4677,
    description: 'Capitale sénégalaise et l\'un des principaux pôles économiques d\'Afrique francophone. Ville pionnière de la communication urbaine.',
    population: 3800000, superficie: 186,
    couleur: '#F5A623',
    favorisCount: 278,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 12, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 15, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 28, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 52, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 28, resolus: 20, enAttente: 8 },
      panneaux: { total: 82, disponibles: 25, loues: 42, maintenance: 15 },
      formations: { total: 15, gratuites: 8, payantes: 7 },
      utilisateurs: 2800,
    },
  },

  // 🇹🇬 TOGO
  {
    id: 'lome', nom: 'Lomé', pays: 'Togo', region: 'Maritime',
    lat: 6.1319, lng: 1.2228,
    description: 'Capitale togolaise et principal port d\'Afrique de l\'Ouest. Ville en pleine expansion urbaine et commerciale.',
    population: 1500000, superficie: 99,
    couleur: '#3BB273',
    favorisCount: 156,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 6, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 8, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 17, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 30, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 17, resolus: 12, enAttente: 5 },
      panneaux: { total: 40, disponibles: 14, loues: 20, maintenance: 6 },
      formations: { total: 8, gratuites: 5, payantes: 3 },
      utilisateurs: 890,
    },
  },

  // 🇧🇫 BURKINA FASO
  {
    id: 'ouagadougou', nom: 'Ouagadougou', pays: 'Burkina Faso', region: 'Centre',
    lat: 12.3657, lng: -1.5339,
    description: 'Capitale burkinabè, carrefour culturel et politique. Ville engagée dans le développement urbain durable.',
    population: 2500000, superficie: 220,
    couleur: '#E94E3C',
    favorisCount: 134,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 7, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 10, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 20, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 36, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 20, resolus: 14, enAttente: 6 },
      panneaux: { total: 48, disponibles: 16, loues: 25, maintenance: 7 },
      formations: { total: 10, gratuites: 6, payantes: 4 },
      utilisateurs: 1150,
    },
  },

  // 🇬🇭 GHANA
  {
    id: 'accra', nom: 'Accra', pays: 'Ghana', region: 'Greater Accra',
    lat: 5.6037, lng: -0.1870,
    description: 'Capitale ghanéenne, pôle économique et technologique majeur. Métropole cosmopolite en pleine modernisation.',
    population: 4200000, superficie: 200,
    couleur: '#1E73BE',
    favorisCount: 201,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 11, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 14, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 30, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 48, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 30, resolus: 22, enAttente: 8 },
      panneaux: { total: 75, disponibles: 24, loues: 38, maintenance: 13 },
      formations: { total: 14, gratuites: 8, payantes: 6 },
      utilisateurs: 2400,
    },
  },

  // 🇳🇬 NIGERIA
  {
    id: 'lagos', nom: 'Lagos', pays: 'Nigeria', region: 'Lagos',
    lat: 6.5244, lng: 3.3792,
    description: 'Mégalopole nigériane, plus grande ville d\'Afrique et moteur économique du continent. Marché publicitaire le plus dynamique de la région.',
    population: 15000000, superficie: 1171,
    couleur: '#F5A623',
    favorisCount: 425,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 20, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 22, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 50, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 85, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 50, resolus: 35, enAttente: 15 },
      panneaux: { total: 120, disponibles: 35, loues: 65, maintenance: 20 },
      formations: { total: 22, gratuites: 12, payantes: 10 },
      utilisateurs: 5200,
    },
  },
  {
    id: 'abuja', nom: 'Abuja', pays: 'Nigeria', region: 'FCT',
    lat: 9.0579, lng: 7.4951,
    description: 'Capitale fédérale du Nigeria, ville planifiée et moderne. Centre politique et administratif du pays le plus peuplé d\'Afrique.',
    population: 3500000, superficie: 310,
    couleur: '#3BB273',
    favorisCount: 175,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 9, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 13, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 22, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 40, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 22, resolus: 16, enAttente: 6 },
      panneaux: { total: 55, disponibles: 18, loues: 28, maintenance: 9 },
      formations: { total: 13, gratuites: 7, payantes: 6 },
      utilisateurs: 1600,
    },
  },

  // 🇲🇱 MALI
  {
    id: 'bamako', nom: 'Bamako', pays: 'Mali', region: 'Bamako',
    lat: 12.6392, lng: -8.0029,
    description: 'Capitale malienne située sur les rives du fleuve Niger. Carrefour commercial et culturel de l\'Afrique de l\'Ouest.',
    population: 2500000, superficie: 150,
    couleur: '#E67E22',
    favorisCount: 112,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 5, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 7, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 14, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 25, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 14, resolus: 9, enAttente: 5 },
      panneaux: { total: 32, disponibles: 10, loues: 17, maintenance: 5 },
      formations: { total: 7, gratuites: 4, payantes: 3 },
      utilisateurs: 680,
    },
  },

  // 🇳🇪 NIGER
  {
    id: 'niamey', nom: 'Niamey', pays: 'Niger', region: 'Niamey',
    lat: 13.5127, lng: 2.1126,
    description: 'Capitale nigérienne, située sur les berges du fleuve Niger. Ville carrefour du Sahel en pleine mutation urbaine.',
    population: 1300000, superficie: 130,
    couleur: '#8E44AD',
    favorisCount: 78,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 3, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 4, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 8, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 16, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 8, resolus: 5, enAttente: 3 },
      panneaux: { total: 18, disponibles: 6, loues: 9, maintenance: 3 },
      formations: { total: 4, gratuites: 2, payantes: 2 },
      utilisateurs: 340,
    },
  },
];

// GET /villes
router.get('/villes', (req, res) => {
  const { search } = req.query;
  let result = [...villes];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(v =>
      v.nom.toLowerCase().includes(q) ||
      v.pays.toLowerCase().includes(q) ||
      v.region.toLowerCase().includes(q)
    );
  }

  res.json(result.map(v => ({
    id: v.id,
    nom: v.nom,
    pays: v.pays,
    region: v.region,
    lat: v.lat,
    lng: v.lng,
    description: v.description,
    population: v.population,
    couleur: v.couleur,
    favorisCount: v.favorisCount,
    stats: v.stats,
  })));
});

// GET /villes/:id
router.get('/villes/:id', (req, res) => {
  const ville = villes.find(v => v.id === req.params.id);
  if (!ville) return res.status(404).json({ error: 'Ville non trouvée' });
  res.json(ville);
});

module.exports = router;
