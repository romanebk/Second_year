// Persistance Prisma (Neon/Postgres) avec fallback mémoire si DATABASE_URL absent.
const { prisma } = require('../../../backend/src/prisma');

const useDb = Boolean(process.env.DATABASE_URL);

const SEED_POSTS = [
  {
    id: '1',
    author: '@JeanD',
    avatar: null,
    time: '2h ago',
    location: 'Abomey-Calavi',
    text: 'La nouvelle piste cyclable est enfin ouverte ! Une belle avancée pour la mobilité douce.',
    image: null,
    likes: 42,
    comments: [
      { id: 'c1', author: '@PaulT', text: 'Super initiative !', likes: 3 },
      { id: 'c2', author: '@KoffiB', text: 'Quand est-ce que ça arrive dans notre quartier ?', likes: 1 },
    ],
    shares: 5,
    theme: 'Urbanisme',
    ville: 'Abomey-Calavi',
  },
  {
    id: '2',
    author: '@MarieL',
    avatar: null,
    time: '5h ago',
    location: 'Porto-Novo',
    text: 'Signalement: Panneau publicitaire dégradé près du marché.',
    image: null,
    likes: 18,
    comments: [],
    shares: 3,
    theme: 'Environnement',
    ville: 'Porto-Novo',
  },
  {
    id: '3',
    author: '@PaulT',
    avatar: null,
    time: '1j ago',
    location: 'Cotonou',
    text: 'Campagne de sensibilisation sur le tri des déchets ce samedi au stade. Venez nombreux !',
    image: null,
    likes: 67,
    comments: [],
    shares: 15,
    theme: 'Environnement',
    ville: 'Cotonou',
  },
  {
    id: '4',
    author: '@SophieK',
    avatar: null,
    time: '2j ago',
    location: 'Parakou',
    text: 'Atelier santé gratuit pour les seniors ce mercredi à la mairie. Inscriptions ouvertes.',
    image: null,
    likes: 34,
    comments: [],
    shares: 7,
    theme: 'Santé',
    ville: 'Parakou',
  },
  {
    id: '5',
    author: '@AlexD',
    avatar: null,
    time: '3j ago',
    location: 'Cotonou',
    text: 'Réunion de quartier sur les projets d\'urbanisme : venez donner votre avis !',
    image: null,
    likes: 25,
    comments: [],
    shares: 4,
    theme: 'Urbanisme',
    ville: 'Cotonou',
  },
];

const memoryPosts = SEED_POSTS.map((p) => ({ ...p, comments: p.comments.map((c) => ({ ...c })) }));
const memoryConsultations = [];

function dbEnabled() {
  return useDb;
}

// ─── Posts ────────────────────────────────────────────────────────────────────

async function listPosts({ ville, theme, search } = {}) {
  let result;
  if (useDb) {
    result = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  } else {
    result = [...memoryPosts];
  }

  if (ville && ville !== 'Toutes') {
    result = result.filter((p) => p.ville === ville);
  }
  if (theme && theme !== 'Tous') {
    result = result.filter((p) => p.theme === theme);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) => p.text.toLowerCase().includes(q) || p.author.toLowerCase().includes(q),
    );
  }
  return result;
}

async function findPost(id) {
  if (useDb) return prisma.post.findUnique({ where: { id } });
  return memoryPosts.find((p) => p.id === id) || null;
}

async function createPost(post) {
  if (useDb) return prisma.post.create({ data: post });
  memoryPosts.unshift(post);
  return post;
}

async function likePost(id) {
  if (useDb) {
    try {
      const post = await prisma.post.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });
      return post.likes;
    } catch {
      return null;
    }
  }
  const post = memoryPosts.find((p) => p.id === id);
  if (!post) return null;
  post.likes += 1;
  return post.likes;
}

async function addComment(id, comment) {
  if (useDb) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return null;
    const comments = Array.isArray(post.comments) ? post.comments : [];
    comments.push(comment);
    await prisma.post.update({ where: { id }, data: { comments } });
    return { comment, totalComments: comments.length };
  }
  const post = memoryPosts.find((p) => p.id === id);
  if (!post) return null;
  post.comments.push(comment);
  return { comment, totalComments: post.comments.length };
}

async function deletePost(id) {
  if (useDb) {
    try {
      await prisma.post.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  const index = memoryPosts.findIndex((p) => p.id === id);
  if (index === -1) return false;
  memoryPosts.splice(index, 1);
  return true;
}

async function countPosts() {
  if (useDb) return prisma.post.count();
  return memoryPosts.length;
}

// ─── Consultations ────────────────────────────────────────────────────────────

async function createConsultation(request) {
  if (useDb) return prisma.consultationRequest.create({ data: request });
  memoryConsultations.push(request);
  return request;
}

async function listConsultations() {
  if (useDb) return prisma.consultationRequest.findMany({ orderBy: { createdAt: 'desc' } });
  return [...memoryConsultations];
}

async function countConsultations() {
  if (useDb) return prisma.consultationRequest.count();
  return memoryConsultations.length;
}

module.exports = {
  dbEnabled,
  SEED_POSTS,
  listPosts,
  findPost,
  createPost,
  likePost,
  addComment,
  deletePost,
  countPosts,
  createConsultation,
  listConsultations,
  countConsultations,
};
