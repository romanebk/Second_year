/**
 * Seed Neon/Postgres avec villes, formations et compte démo.
 */
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { FORMATIONS } = require('../../beni-momo-adnan/backend/src/data/formationsCatalog');
const carteStore = require('../../rayann/backend/src/carteStore');
const postStore = require('../../undef/backend/src/postStore');
const etatStore = require('../../bryan-fanou/backend/src/etatStore');

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

const VILLES = [
  {
    id: 'cotonou',
    nom: 'Cotonou',
    pays: 'Bénin',
    region: 'Littoral',
    lat: 6.3703,
    lng: 2.3912,
    description: 'Capitale économique du Bénin',
    population: 679012,
    superficie: 79,
    couleur: '#C19A6B',
    favorisCount: 128,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 8, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles' },
      { id: 'formations', label: 'Formations', count: 12, icon: 'book', color: '#3BB273', description: 'Cours disponibles' },
      { id: 'etats', label: 'États des Lieux', count: 5, icon: 'clipboard', color: '#E94E3C', description: 'Rapports récents' },
      { id: 'posts', label: 'Posts', count: 24, icon: 'message-square', color: '#1E73BE', description: 'Publications' },
    ],
    stats: {
      signalements: { total: 45, resolus: 32, enAttente: 13 },
      panneaux: { total: 156, disponibles: 89, loues: 52, maintenance: 15 },
      formations: { total: 12, gratuites: 7, payantes: 5 },
      utilisateurs: 3420,
    },
  },
  {
    id: 'porto-novo',
    nom: 'Porto-Novo',
    pays: 'Bénin',
    region: 'Ouémé',
    lat: 6.4969,
    lng: 2.6289,
    description: 'Capitale administrative du Bénin',
    population: 264320,
    superficie: 110,
    couleur: '#6E8B5B',
    favorisCount: 67,
    rubriques: [],
    stats: {
      signalements: { total: 28, resolus: 20, enAttente: 8 },
      panneaux: { total: 98, disponibles: 60, loues: 30, maintenance: 8 },
      formations: { total: 8, gratuites: 5, payantes: 3 },
      utilisateurs: 1890,
    },
  },
];

async function main() {
  console.log('🌱 Seed AANID → Neon/Postgres');

  for (const v of VILLES) {
    await prisma.ville.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  }
  console.log(`  ✓ ${VILLES.length} villes`);

  for (const f of FORMATIONS) {
    await prisma.formation.upsert({
      where: { id: f.id },
      update: { ...f, modules: f.modules },
      create: { ...f, modules: f.modules },
    });
  }
  console.log(`  ✓ ${FORMATIONS.length} formations`);

  const demoPassword = await bcrypt.hash('Demo1234!', BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email: 'demo@aanid.bj' },
    update: {
      fullName: 'Utilisateur Démo',
      passwordHash: demoPassword,
      emailVerified: true,
      city: 'Cotonou',
      phone: '22900000000',
    },
    create: {
      email: 'demo@aanid.bj',
      fullName: 'Utilisateur Démo',
      passwordHash: demoPassword,
      emailVerified: true,
      city: 'Cotonou',
      phone: '22900000000',
      role: 'CITOYEN',
    },
  });
  console.log('  ✓ compte démo demo@aanid.bj / Demo1234!');

  // ─── Carte interactive (rayann) ──────────────────────────────────────────
  // Villes minimales : créées seulement si absentes (ne pas écraser les villes riches)
  for (const v of carteStore.SEED_VILLES) {
    await prisma.ville.upsert({
      where: { id: v.id },
      update: {},
      create: v,
    });
  }
  for (const s of carteStore.SEED_SIGNALEMENTS) {
    await prisma.signalement.upsert({ where: { id: s.id }, update: {}, create: s });
  }
  for (const p of carteStore.SEED_PANNEAUX) {
    await prisma.panneau.upsert({ where: { id: p.id }, update: {}, create: p });
  }
  for (const z of carteStore.SEED_ZONES) {
    await prisma.zone.upsert({ where: { id: z.id }, update: {}, create: z });
  }
  console.log(`  ✓ carte : ${carteStore.SEED_SIGNALEMENTS.length} signalements, ${carteStore.SEED_PANNEAUX.length} panneaux, ${carteStore.SEED_ZONES.length} zones`);

  // ─── Posts / Réseaux (undef) ─────────────────────────────────────────────
  for (const p of postStore.SEED_POSTS) {
    await prisma.post.upsert({ where: { id: p.id }, update: {}, create: p });
  }
  console.log(`  ✓ ${postStore.SEED_POSTS.length} posts`);

  // ─── États des lieux (bryan-fanou) ───────────────────────────────────────
  for (const s of etatStore.SEED_SIGNALEMENTS) {
    await prisma.etatSignalement.upsert({ where: { id: s.id }, update: {}, create: s });
  }
  console.log(`  ✓ ${etatStore.SEED_SIGNALEMENTS.length} signalements états des lieux`);

  console.log('✅ Seed terminé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
