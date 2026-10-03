// Accès API Posts / Réseaux (gateway /api/v1, module undef).
import { getApiBaseUrl } from '@aanid/shared/api';

const API_BASE = getApiBaseUrl();

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || `Erreur serveur (${res.status})`);
  }
  return data;
}

/** Normalise un post API vers le format attendu par l'écran (images[], compteur commentaires). */
export function normalizePost(p) {
  return {
    ...p,
    images: p.image ? [p.image] : [],
    comments: Array.isArray(p.comments) ? p.comments : [],
  };
}

export async function listPosts({ ville, theme, search } = {}) {
  const params = new URLSearchParams();
  if (ville && ville !== 'Toutes') params.set('ville', ville);
  if (theme && theme !== 'Tous') params.set('theme', theme);
  if (search) params.set('search', search);
  const qs = params.toString();
  const { data } = await request(`/posts${qs ? `?${qs}` : ''}`);
  return data.map(normalizePost);
}

export async function createPost({ text, author, location, theme, ville, image }) {
  const { data } = await request('/posts', {
    method: 'POST',
    body: JSON.stringify({ text, author, location, theme, ville, image: image || null }),
  });
  return normalizePost(data);
}

export async function likePost(id) {
  const { data } = await request(`/posts/${id}/like`, { method: 'POST' });
  return data.likes;
}

export async function addComment(id, { text, author }) {
  const result = await request(`/posts/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text, author }),
  });
  return { comment: result.data, totalComments: result.totalComments };
}
