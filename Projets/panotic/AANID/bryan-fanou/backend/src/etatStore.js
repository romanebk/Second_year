// Persistance Prisma (Neon/Postgres) avec fallback mémoire si DATABASE_URL absent.
const { prisma } = require('../../../backend/src/prisma');

const useDb = Boolean(process.env.DATABASE_URL);

const now = Date.now();
const H = 3600 * 1000;

const SEED_SIGNALEMENTS = [
  { id: 'sig-1', titre: 'Panneau dégradé — Av. Steinmetz', zone: 'Akpakpa', categorie: 'Panneau dégradé', description: 'Structure rouillée et affiche déchirée.', createdAt: new Date(now - 2 * H).toISOString(), type: 'photo', statut: 'Urgent' },
  { id: 'sig-2', titre: 'Panneau obsolète — Rond-point Étoile Rouge', zone: 'Ganhi', categorie: 'Panneau obsolète', description: 'Campagne expirée depuis plusieurs mois.', createdAt: new Date(now - 5 * H).toISOString(), type: 'vidéo', statut: 'En cours' },
  { id: 'sig-3', titre: 'Emplacement inapproprié — Marché Dantokpa', zone: 'Dantokpa', categorie: 'Emplacement inapproprié', description: 'Panneau gênant la circulation piétonne.', createdAt: new Date(now - 24 * H).toISOString(), type: null, statut: 'Nouveau' },
  { id: 'sig-4', titre: 'Besoin de maintenance — Bd. de la Marina', zone: 'Haie Vive', categorie: 'Besoin de maintenance', description: 'Éclairage du panneau hors service.', createdAt: new Date(now - 48 * H).toISOString(), type: null, statut: 'Résolu' },
];

const memorySignalements = SEED_SIGNALEMENTS.map((s) => ({ ...s }));

function dbEnabled() {
  return useDb;
}

async function listSignalements() {
  if (useDb) {
    const rows = await prisma.etatSignalement.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  }
  return [...memorySignalements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function createSignalement(signalement) {
  if (useDb) {
    const row = await prisma.etatSignalement.create({ data: signalement });
    return { ...row, createdAt: row.createdAt.toISOString() };
  }
  memorySignalements.unshift(signalement);
  return signalement;
}

async function updateStatut(id, statut) {
  if (useDb) {
    try {
      const row = await prisma.etatSignalement.update({ where: { id }, data: { statut } });
      return { ...row, createdAt: row.createdAt.toISOString() };
    } catch {
      return null;
    }
  }
  const signalement = memorySignalements.find((s) => s.id === id);
  if (!signalement) return null;
  signalement.statut = statut;
  return signalement;
}

async function countSignalements() {
  if (useDb) return prisma.etatSignalement.count();
  return memorySignalements.length;
}

module.exports = {
  dbEnabled,
  SEED_SIGNALEMENTS,
  listSignalements,
  createSignalement,
  updateStatut,
  countSignalements,
};
