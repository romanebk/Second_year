const express = require('express');
const store = require('./etatStore');

const router = express.Router();

// ─── Données analytiques (mock statique) ──────────────────────────────────────

const kpis = {
  panneauxRecenses: { valeur: 1284, delta: 6.2, direction: 'up', details: 'dont 812 modernes' },
  panneauxObsoletes: { valeur: 472, delta: 2.1, direction: 'up', details: '36,8% du parc total' },
  signalementsActifs: { valeur: 63, delta: 11, direction: 'up', details: '18 en attente de validation' },
  tauxConformite: { valeur: 78.4, delta: 3.4, direction: 'up', details: 'objectif annuel : 85%' },
};

const evolution = [
  { jour: 'J1', modernes: 812, obsoletes: 472, signalements: 63 },
  { jour: 'J8', modernes: 830, obsoletes: 465, signalements: 68 },
  { jour: 'J16', modernes: 855, obsoletes: 458, signalements: 72 },
  { jour: 'J23', modernes: 870, obsoletes: 450, signalements: 78 },
  { jour: 'J30', modernes: 892, obsoletes: 445, signalements: 82 },
];

const STATUTS = ['Nouveau', 'En cours', 'Urgent', 'Résolu'];
const STATUT_COLORS = {
  Nouveau: '#6b6b6b',
  'En cours': '#C99A4E',
  Urgent: '#D4654A',
  Résolu: '#8B9D77',
};

const CATEGORIES_SIGNALEMENT = [
  'Panneau dégradé',
  'Panneau dangereux',
  'Panneau obsolète',
  'Emplacement inapproprié',
  'Besoin de maintenance',
];

const ZONES = ['Akpakpa', 'Ganhi', 'Dantokpa', 'Haie Vive', 'Cadjèhoun', 'Fidjrossè'];

const H = 3600 * 1000;

const CATEGORY_COLORS = {
  'Panneau dégradé': '#D4654A',
  'Panneau dangereux': '#D4654A',
  'Panneau obsolète': '#C99A4E',
  'Emplacement inapproprié': '#A8B4C4',
  'Besoin de maintenance': '#8B9D77',
};

const categoryBaseCounts = {
  'Panneau dégradé': 23,
  'Panneau dangereux': 11,
  'Panneau obsolète': 16,
  'Emplacement inapproprié': 6,
  'Besoin de maintenance': 3,
};

function withColor(signalement) {
  return { ...signalement, statutColor: STATUT_COLORS[signalement.statut] || STATUT_COLORS.Nouveau };
}

function computeCategories(signalements) {
  const counts = { ...categoryBaseCounts };
  signalements.forEach(s => {
    if (counts[s.categorie] != null) counts[s.categorie] += 1;
  });
  const max = Math.max(...Object.values(counts), 1);
  return CATEGORIES_SIGNALEMENT.map(nom => ({
    nom,
    count: counts[nom] || 0,
    color: CATEGORY_COLORS[nom] || '#A8B4C4',
    pct: Math.round(((counts[nom] || 0) / max) * 100),
  }));
}

const carte = {
  heatmapPoints: [
    { cx: 110, cy: 90, r: 55, intensite: 'forte' },
    { cx: 220, cy: 150, r: 50, intensite: 'moyenne' },
    { cx: 60, cy: 170, r: 40, intensite: 'moyenne' },
  ],
  pins: [
    { top: 40, left: 70, color: '#8B9D77' },
    { top: 95, left: 150, color: '#C99A4E' },
    { top: 70, left: 200, color: '#D4654A' },
    { top: 150, left: 240, color: '#A8B4C4' },
    { top: 160, left: 60, color: '#D4654A' },
    { top: 180, left: 130, color: '#8B9D77' },
  ],
  totalPoints: 1284,
};

const conformite = {
  taux: 78.4,
  objectif: 85,
  conforme: true,
  aRevoir: false,
};

function filterSignalements(signalements, query) {
  const { statut, categorie, zone, since } = query;
  let filtered = signalements;
  if (statut && statut !== 'tous') {
    filtered = filtered.filter(s => s.statut.toLowerCase() === statut.toLowerCase());
  }
  if (categorie && categorie !== 'toutes') {
    filtered = filtered.filter(s => s.categorie.toLowerCase() === categorie.toLowerCase());
  }
  if (zone && zone !== 'toutes') {
    filtered = filtered.filter(s => s.zone.toLowerCase() === zone.toLowerCase());
  }
  if (since) {
    const days = parseInt(since, 10);
    if (!Number.isNaN(days) && days > 0) {
      const cutoff = Date.now() - days * 24 * H;
      filtered = filtered.filter(s => new Date(s.createdAt).getTime() >= cutoff);
    }
  }
  return filtered;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/etats-lieux', async (req, res) => {
  try {
    const signalements = (await store.listSignalements()).map(withColor);
    res.json({
      kpis: {
        ...kpis,
        signalementsActifs: {
          ...kpis.signalementsActifs,
          valeur: kpis.signalementsActifs.valeur + (signalements.length - 4),
        },
      },
      evolution,
      signalements,
      categories: computeCategories(signalements),
      zones: ZONES,
      statuts: STATUTS,
      typesSignalement: CATEGORIES_SIGNALEMENT,
      carte,
      conformite,
    });
  } catch (err) {
    console.error('[etats-lieux] list:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/etats-lieux/kpis', (req, res) => {
  res.json(kpis);
});

router.get('/etats-lieux/evolution', (req, res) => {
  res.json(evolution);
});

router.get('/etats-lieux/signalements', async (req, res) => {
  try {
    const signalements = (await store.listSignalements()).map(withColor);
    res.json(filterSignalements(signalements, req.query));
  } catch (err) {
    console.error('[etats-lieux] signalements:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /etats-lieux/signalements — créer un signalement
router.post('/etats-lieux/signalements', async (req, res) => {
  const { titre, zone, categorie, description } = req.body || {};

  if (!titre || typeof titre !== 'string' || !titre.trim()) {
    return res.status(400).json({ error: 'Le titre est requis' });
  }
  if (!categorie || !CATEGORIES_SIGNALEMENT.includes(categorie)) {
    return res.status(400).json({ error: `Catégorie invalide. Valeurs possibles : ${CATEGORIES_SIGNALEMENT.join(', ')}` });
  }
  if (!zone || typeof zone !== 'string' || !zone.trim()) {
    return res.status(400).json({ error: 'La zone est requise' });
  }

  const signalement = {
    id: `sig-${Date.now()}`,
    titre: titre.trim(),
    zone: zone.trim(),
    categorie,
    description: (description || '').trim(),
    createdAt: new Date().toISOString(),
    type: null,
    statut: 'Nouveau',
  };

  try {
    const created = await store.createSignalement(signalement);
    res.status(201).json(withColor(created));
  } catch (err) {
    console.error('[etats-lieux] create:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /etats-lieux/signalements/:id — changer le statut
router.patch('/etats-lieux/signalements/:id', async (req, res) => {
  const { statut } = req.body || {};
  if (!STATUTS.includes(statut)) {
    return res.status(400).json({ error: `Statut invalide. Valeurs possibles : ${STATUTS.join(', ')}` });
  }

  try {
    const updated = await store.updateStatut(req.params.id, statut);
    if (!updated) {
      return res.status(404).json({ error: 'Signalement non trouvé' });
    }
    res.json(withColor(updated));
  } catch (err) {
    console.error('[etats-lieux] update:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/etats-lieux/categories', async (req, res) => {
  try {
    const signalements = await store.listSignalements();
    res.json(computeCategories(signalements));
  } catch (err) {
    console.error('[etats-lieux] categories:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/etats-lieux/carte', (req, res) => {
  res.json(carte);
});

router.get('/etats-lieux/conformite', (req, res) => {
  res.json(conformite);
});

module.exports = router;
