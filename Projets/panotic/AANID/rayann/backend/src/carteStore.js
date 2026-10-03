// Persistance Prisma (Neon/Postgres) avec fallback mémoire si DATABASE_URL absent.
const { prisma } = require('../../../backend/src/prisma');

const useDb = Boolean(process.env.DATABASE_URL);

const SEED_VILLES = [
  { id: 'cotonou', nom: 'Cotonou', pays: 'Bénin', lat: 6.3653, lng: 2.4183 },
  { id: 'lome', nom: 'Lomé', pays: 'Togo', lat: 6.1725, lng: 1.2314 },
  { id: 'porto-novo', nom: 'Porto-Novo', pays: 'Bénin', lat: 6.4969, lng: 2.6289 },
  { id: 'parakou', nom: 'Parakou', pays: 'Bénin', lat: 9.3375, lng: 2.6260 },
  { id: 'abomey-calavi', nom: 'Abomey-Calavi', pays: 'Bénin', lat: 6.4486, lng: 2.3557 },
  { id: 'bohicon', nom: 'Bohicon', pays: 'Bénin', lat: 7.1794, lng: 2.0661 },
];

const SEED_SIGNALEMENTS = [
  { id: 'sig-1', type: 'DEGRADE', description: 'Panneau publicitaire dégradé par les intempéries, structure rouillée et bâche déchirée.', lat: 6.3700, lng: 2.4200, imageUrl: null, status: 'VALIDATED', votesCount: 12, createdAt: '2025-11-15T08:30:00Z', villeId: 'cotonou' },
  { id: 'sig-2', type: 'ILLEGAL', description: 'Affichage sauvage sur un mur classé, aucune autorisation municipale.', lat: 6.3580, lng: 2.4350, imageUrl: null, status: 'PENDING', votesCount: 8, createdAt: '2025-11-20T14:15:00Z', villeId: 'cotonou' },
  { id: 'sig-3', type: 'DANGEREUX', description: 'Panneau mal fixé risque de chute sur la voie publique.', lat: 6.3720, lng: 2.4150, imageUrl: null, status: 'VALIDATED', votesCount: 25, createdAt: '2025-11-10T10:00:00Z', villeId: 'cotonou' },
  { id: 'sig-4', type: 'OBSOLETE', description: 'Panneau numérique hors service depuis 6 mois, écran fissuré.', lat: 6.3550, lng: 2.4250, imageUrl: null, status: 'RESOLVED', votesCount: 5, createdAt: '2025-10-05T09:00:00Z', villeId: 'cotonou' },
  { id: 'sig-5', type: 'BON_ETAT', description: 'Nouveau panneau digital installé, bon fonctionnement.', lat: 6.3620, lng: 2.4100, imageUrl: null, status: 'VALIDATED', votesCount: 3, createdAt: '2025-11-25T16:45:00Z', villeId: 'cotonou' },
  { id: 'sig-6', type: 'TRAVAUX', description: 'Zone en travaux, panneau démonté temporairement.', lat: 6.3660, lng: 2.4280, imageUrl: null, status: 'PENDING', votesCount: 2, createdAt: '2025-11-28T11:20:00Z', villeId: 'cotonou' },
  { id: 'sig-7', type: 'DEGRADE', description: 'Abribus publicitaire vandalisé, vitre brisée.', lat: 6.1750, lng: 1.2350, imageUrl: null, status: 'VALIDATED', votesCount: 15, createdAt: '2025-11-18T13:00:00Z', villeId: 'lome' },
  { id: 'sig-8', type: 'ILLEGAL', description: 'Panneau publicitaire non autorisé sur un monument.', lat: 6.1680, lng: 1.2250, imageUrl: null, status: 'PENDING', votesCount: 7, createdAt: '2025-11-22T10:30:00Z', villeId: 'lome' },
  { id: 'sig-9', type: 'DANGEREUX', description: 'Structure instable après tempête, risque pour les piétons.', lat: 6.1800, lng: 1.2400, imageUrl: null, status: 'VALIDATED', votesCount: 20, createdAt: '2025-11-12T15:00:00Z', villeId: 'lome' },
  { id: 'sig-10', type: 'OBSOLETE', description: 'Ancien panneau 4x3 non entretenu, informations illisibles.', lat: 6.1700, lng: 1.2280, imageUrl: null, status: 'REJECTED', votesCount: 1, createdAt: '2025-10-28T08:00:00Z', villeId: 'lome' },
  { id: 'sig-11', type: 'DEGRADE', description: 'Panneau classique décoloré par le soleil, structure affaiblie.', lat: 6.4980, lng: 2.6300, imageUrl: null, status: 'VALIDATED', votesCount: 6, createdAt: '2025-11-14T09:30:00Z', villeId: 'porto-novo' },
  { id: 'sig-12', type: 'TRAVAUX', description: 'Installation d\'un nouveau panneau digital en cours.', lat: 6.4950, lng: 2.6250, imageUrl: null, status: 'PENDING', votesCount: 0, createdAt: '2025-11-30T07:00:00Z', villeId: 'porto-novo' },
  { id: 'sig-13', type: 'DANGEREUX', description: 'Poteau électrique supportant un panneau incliné dangereusement.', lat: 9.3400, lng: 2.6280, imageUrl: null, status: 'VALIDATED', votesCount: 18, createdAt: '2025-11-05T11:00:00Z', villeId: 'parakou' },
  { id: 'sig-14', type: 'BON_ETAT', description: 'Totem publicitaire récemment installé, bon état général.', lat: 6.4500, lng: 2.3570, imageUrl: null, status: 'VALIDATED', votesCount: 4, createdAt: '2025-11-27T14:30:00Z', villeId: 'abomey-calavi' },
  { id: 'sig-15', type: 'ILLEGAL', description: 'Affichage publicitaire sur espace vert sans permis.', lat: 7.1800, lng: 2.0680, imageUrl: null, status: 'PENDING', votesCount: 9, createdAt: '2025-11-19T16:00:00Z', villeId: 'bohicon' },
];

const SEED_PANNEAUX = [
  { id: 'pan-1', type: 'CLASSIQUE', format: '4x3', regime: 'prive', etat: 'DISPONIBLE', lat: 6.3680, lng: 2.4220, price: 150000, imageUrl: null, createdAt: '2025-06-10T00:00:00Z', villeId: 'cotonou' },
  { id: 'pan-2', type: 'DIGITAL', format: '8x4', regime: 'public', etat: 'LOUE', lat: 6.3600, lng: 2.4300, price: 500000, imageUrl: null, createdAt: '2025-03-15T00:00:00Z', villeId: 'cotonou' },
  { id: 'pan-3', type: 'ABRIBUS', format: '2x1.5', regime: 'prive', etat: 'MAINTENANCE', lat: 6.3650, lng: 2.4120, price: 80000, imageUrl: null, createdAt: '2025-08-01T00:00:00Z', villeId: 'cotonou' },
  { id: 'pan-4', type: 'TOTEM', format: '3x1.5', regime: 'prive', etat: 'DISPONIBLE', lat: 6.3580, lng: 2.4180, price: 200000, imageUrl: null, createdAt: '2025-09-20T00:00:00Z', villeId: 'cotonou' },
  { id: 'pan-5', type: 'CLASSIQUE', format: '4x3', regime: 'public', etat: 'LOUE', lat: 6.3700, lng: 2.4250, price: 180000, imageUrl: null, createdAt: '2025-05-05T00:00:00Z', villeId: 'cotonou' },
  { id: 'pan-6', type: 'DIGITAL', format: '6x3', regime: 'prive', etat: 'DISPONIBLE', lat: 6.1730, lng: 1.2330, price: 450000, imageUrl: null, createdAt: '2025-07-12T00:00:00Z', villeId: 'lome' },
  { id: 'pan-7', type: 'ABRIBUS', format: '2x1.5', regime: 'public', etat: 'DISPONIBLE', lat: 6.1760, lng: 1.2370, price: 75000, imageUrl: null, createdAt: '2025-04-20T00:00:00Z', villeId: 'lome' },
  { id: 'pan-8', type: 'CLASSIQUE', format: '4x3', regime: 'prive', etat: 'LOUE', lat: 6.1690, lng: 1.2260, price: 160000, imageUrl: null, createdAt: '2025-02-14T00:00:00Z', villeId: 'lome' },
  { id: 'pan-9', type: 'TOTEM', format: '3x1.5', regime: 'prive', etat: 'MAINTENANCE', lat: 6.4970, lng: 2.6290, price: 190000, imageUrl: null, createdAt: '2025-10-01T00:00:00Z', villeId: 'porto-novo' },
  { id: 'pan-10', type: 'CLASSIQUE', format: '4x3', regime: 'public', etat: 'DISPONIBLE', lat: 9.3390, lng: 2.6270, price: 120000, imageUrl: null, createdAt: '2025-08-15T00:00:00Z', villeId: 'parakou' },
  { id: 'pan-11', type: 'AUTRE', format: '2x2', regime: 'prive', etat: 'DISPONIBLE', lat: 6.4490, lng: 2.3560, price: 60000, imageUrl: null, createdAt: '2025-11-01T00:00:00Z', villeId: 'abomey-calavi' },
  { id: 'pan-12', type: 'CLASSIQUE', format: '4x3', regime: 'prive', etat: 'LOUE', lat: 7.1780, lng: 2.0650, price: 130000, imageUrl: null, createdAt: '2025-06-20T00:00:00Z', villeId: 'bohicon' },
  { id: 'pan-13', type: 'DIGITAL', format: '8x4', regime: 'public', etat: 'DISPONIBLE', lat: 6.3630, lng: 2.4200, price: 550000, imageUrl: null, createdAt: '2025-11-10T00:00:00Z', villeId: 'cotonou' },
  { id: 'pan-14', type: 'ABRIBUS', format: '2x1.5', regime: 'prive', etat: 'LOUE', lat: 6.1710, lng: 1.2300, price: 85000, imageUrl: null, createdAt: '2025-09-05T00:00:00Z', villeId: 'lome' },
  { id: 'pan-15', type: 'CLASSIQUE', format: '4x3', regime: 'public', etat: 'MAINTENANCE', lat: 6.5000, lng: 2.6320, price: 140000, imageUrl: null, createdAt: '2025-07-25T00:00:00Z', villeId: 'porto-novo' },
];

const SEED_ZONES = [
  { id: 'zone-1', name: 'Zone Commerciale Haie Vive', type: 'commerciale', boundary: { type: 'Polygon', coordinates: [[[2.4100, 6.3650], [2.4400, 6.3650], [2.4400, 6.3800], [2.4100, 6.3800], [2.4100, 6.3650]]] }, villeId: 'cotonou' },
  { id: 'zone-2', name: 'Quartier Résidentiel les Cocotiers', type: 'residentielle', boundary: { type: 'Polygon', coordinates: [[[2.4050, 6.3500], [2.4250, 6.3500], [2.4250, 6.3620], [2.4050, 6.3620], [2.4050, 6.3500]]] }, villeId: 'cotonou' },
  { id: 'zone-3', name: 'Zone Interdite Place des Martyrs', type: 'interdite', boundary: { type: 'Polygon', coordinates: [[[2.4300, 6.3550], [2.4380, 6.3550], [2.4380, 6.3610], [2.4300, 6.3610], [2.4300, 6.3550]]] }, villeId: 'cotonou' },
  { id: 'zone-4', name: 'Centre Commercial Lomé', type: 'commerciale', boundary: { type: 'Polygon', coordinates: [[[1.2250, 6.1700], [1.2400, 6.1700], [1.2400, 6.1820], [1.2250, 6.1820], [1.2250, 6.1700]]] }, villeId: 'lome' },
  { id: 'zone-5', name: 'Zone Spéciale Port Autonome', type: 'speciale', boundary: { type: 'Polygon', coordinates: [[[1.2300, 6.1650], [1.2450, 6.1650], [1.2450, 6.1750], [1.2300, 6.1750], [1.2300, 6.1650]]] }, villeId: 'lome' },
  { id: 'zone-6', name: 'Zone Résidentielle Tokoin', type: 'residentielle', boundary: { type: 'Polygon', coordinates: [[[1.2200, 6.1750], [1.2350, 6.1750], [1.2350, 6.1850], [1.2200, 6.1850], [1.2200, 6.1750]]] }, villeId: 'lome' },
  { id: 'zone-7', name: 'Centre Historique Porto-Novo', type: 'speciale', boundary: { type: 'Polygon', coordinates: [[[2.6220, 6.4930], [2.6350, 6.4930], [2.6350, 6.5020], [2.6220, 6.5020], [2.6220, 6.4930]]] }, villeId: 'porto-novo' },
  { id: 'zone-8', name: 'Zone Commerciale Parakou', type: 'commerciale', boundary: { type: 'Polygon', coordinates: [[[2.6220, 9.3350], [2.6320, 9.3350], [2.6320, 9.3420], [2.6220, 9.3420], [2.6220, 9.3350]]] }, villeId: 'parakou' },
  { id: 'zone-9', name: 'Zone Universitaire Abomey-Calavi', type: 'residentielle', boundary: { type: 'Polygon', coordinates: [[[2.3500, 6.4450], [2.3620, 6.4450], [2.3620, 6.4550], [2.3500, 6.4550], [2.3500, 6.4450]]] }, villeId: 'abomey-calavi' },
  { id: 'zone-10', name: 'Marché Central Bohicon', type: 'commerciale', boundary: { type: 'Polygon', coordinates: [[[2.0620, 7.1750], [2.0720, 7.1750], [2.0720, 7.1850], [2.0620, 7.1850], [2.0620, 7.1750]]] }, villeId: 'bohicon' },
];

function dbEnabled() {
  return useDb;
}

function toIso(row) {
  if (row && row.createdAt instanceof Date) {
    return { ...row, createdAt: row.createdAt.toISOString() };
  }
  return row;
}

async function listVilles() {
  if (useDb) {
    const rows = await prisma.ville.findMany({ orderBy: { nom: 'asc' } });
    return rows.map((v) => ({ id: v.id, nom: v.nom, pays: v.pays, lat: v.lat, lng: v.lng }));
  }
  return SEED_VILLES;
}

async function listSignalements() {
  if (useDb) {
    const rows = await prisma.signalement.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toIso);
  }
  return SEED_SIGNALEMENTS;
}

async function listPanneaux() {
  if (useDb) {
    const rows = await prisma.panneau.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toIso);
  }
  return SEED_PANNEAUX;
}

async function listZones() {
  if (useDb) return prisma.zone.findMany({ orderBy: { name: 'asc' } });
  return SEED_ZONES;
}

module.exports = {
  dbEnabled,
  SEED_VILLES,
  SEED_SIGNALEMENTS,
  SEED_PANNEAUX,
  SEED_ZONES,
  listVilles,
  listSignalements,
  listPanneaux,
  listZones,
};
