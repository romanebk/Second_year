const express = require('express');
const store = require('./postStore');

const router = express.Router();

// ============================================
// POSTS / RÉSEAUX
// ============================================

// GET /posts - Liste des posts avec filtres optionnels
router.get('/posts', async (req, res) => {
  try {
    const result = await store.listPosts(req.query);
    res.json({ success: true, data: result, count: result.length });
  } catch (err) {
    console.error('[undef] listPosts:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /posts/:id - Détail d'un post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await store.findPost(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post introuvable' });
    res.json({ success: true, data: post });
  } catch (err) {
    console.error('[undef] findPost:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Image acceptée : URL http(s) ou data URI (photo importée, max ~1,5 Mo encodée)
const MAX_IMAGE_LENGTH = 1_500_000;
function sanitizeImage(image) {
  if (typeof image !== 'string' || !image) return null;
  if (image.length > MAX_IMAGE_LENGTH) return undefined;
  if (/^https?:\/\//.test(image) || /^data:image\/(png|jpe?g|webp|gif);base64,/.test(image)) return image;
  return null;
}

// POST /posts - Créer un post
router.post('/posts', async (req, res) => {
  const { text, author, location, theme, ville, image } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Le texte est obligatoire' });
  }

  const safeImage = sanitizeImage(image);
  if (safeImage === undefined) {
    return res.status(400).json({ success: false, message: 'Image trop lourde (1 Mo maximum)' });
  }

  const newPost = {
    id: String(Date.now()),
    author: author || '@Anonyme',
    avatar: null,
    time: 'À l\'instant',
    location: location || 'Non spécifiée',
    text: text.trim(),
    image: safeImage,
    likes: 0,
    comments: [],
    shares: 0,
    theme: theme || 'Urbanisme',
    ville: ville || 'Cotonou',
  };

  try {
    await store.createPost(newPost);
    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    console.error('[undef] createPost:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /posts/:id/like - Liker un post
router.post('/posts/:id/like', async (req, res) => {
  try {
    const likes = await store.likePost(req.params.id);
    if (likes === null) return res.status(404).json({ success: false, message: 'Post introuvable' });
    res.json({ success: true, data: { likes } });
  } catch (err) {
    console.error('[undef] likePost:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /posts/:id/comment - Ajouter un commentaire
router.post('/posts/:id/comment', async (req, res) => {
  const { text, author } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Le commentaire est obligatoire' });
  }

  const newComment = {
    id: `c${Date.now()}`,
    author: author || '@Anonyme',
    text: text.trim(),
    likes: 0,
  };

  try {
    const result = await store.addComment(req.params.id, newComment);
    if (!result) return res.status(404).json({ success: false, message: 'Post introuvable' });
    res.status(201).json({ success: true, data: result.comment, totalComments: result.totalComments });
  } catch (err) {
    console.error('[undef] addComment:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /posts/:id - Supprimer un post
router.delete('/posts/:id', async (req, res) => {
  try {
    const deleted = await store.deletePost(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Post introuvable' });
    res.json({ success: true, message: 'Post supprimé' });
  } catch (err) {
    console.error('[undef] deletePost:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// CONSULTATION
// ============================================

const SERVICES = [
  {
    id: '1',
    icon: 'chart-column',
    title: 'Études sur la panneautique',
    shortDesc: 'Analyse complète de l\'état actuel de votre panneautique urbaine.',
    desc: 'Analyse approfondie de l\'état actuel de la panneautique dans votre ville.',
    features: [
      'Cartographie précise des panneaux existants',
      'Évaluation de la conformité aux normes',
      'Recommandations d\'amélioration',
      'Rapport PDF détaillé + données brutes',
    ],
  },
  {
    id: '2',
    icon: 'rotate',
    title: 'Réforme du secteur publicitaire',
    shortDesc: 'Diagnostic, propositions de nouvelles stratégies, plans d\'action.',
    desc: 'Accompagnement complet pour réformer le secteur de l\'affichage publicitaire.',
    features: [
      'Diagnostic approfondi du secteur',
      'Propositions de nouvelles stratégies',
      'Plans d\'action détaillés',
      'Accompagnement à la mise en œuvre',
    ],
  },
  {
    id: '3',
    icon: 'chart-line',
    title: 'Études de marché',
    shortDesc: 'Analyse de la concurrence, potentiel publicitaire, tarification.',
    desc: 'Études de marché complètes pour évaluer le potentiel publicitaire.',
    features: [
      'Analyse de la concurrence',
      'Évaluation du potentiel publicitaire',
      'Étude de tarification',
      'Tendances et opportunités',
    ],
  },
];

// GET /consultation/services - Liste des services de consultation
router.get('/consultation/services', (req, res) => {
  res.json({ success: true, data: SERVICES });
});

// GET /consultation/services/:id - Détail d'un service
router.get('/consultation/services/:id', (req, res) => {
  const service = SERVICES.find(s => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, message: 'Service introuvable' });
  res.json({ success: true, data: service });
});

// POST /consultation/request - Soumettre une demande de consultation
router.post('/consultation/request', async (req, res) => {
  const { serviceType, clientType, ville, description, budget, email, telephone } = req.body;

  // Validation
  const errors = [];
  if (!serviceType) errors.push('Type de service requis');
  if (!clientType) errors.push('Type de client requis');
  if (!ville) errors.push('Ville requise');
  if (!description) errors.push('Description requise');
  if (!email) errors.push('Email requis');
  if (!telephone) errors.push('Téléphone requis');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants', errors });
  }

  const newRequest = {
    id: `CONS-${Date.now()}`,
    serviceType,
    clientType,
    ville,
    description,
    budget: budget || null,
    email,
    telephone,
    status: 'en_attente',
    createdAt: new Date().toISOString(),
  };

  try {
    await store.createConsultation(newRequest);
    res.status(201).json({
      success: true,
      message: 'Votre demande a été envoyée ! Notre équipe vous contactera sous 48h.',
      data: newRequest,
    });
  } catch (err) {
    console.error('[undef] createConsultation:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /consultation/requests - Liste des demandes (admin)
router.get('/consultation/requests', async (req, res) => {
  try {
    const consultations = await store.listConsultations();
    res.json({ success: true, data: consultations, count: consultations.length });
  } catch (err) {
    console.error('[undef] listConsultations:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /health - Health check pour le module
router.get('/undef/health', async (req, res) => {
  res.json({
    status: 'ok',
    module: 'undef (Posts/Réseaux & Consultation)',
    storage: store.dbEnabled() ? 'postgres' : 'memory',
    postsCount: await store.countPosts().catch(() => null),
    consultationsCount: await store.countConsultations().catch(() => null),
  });
});

module.exports = router;
