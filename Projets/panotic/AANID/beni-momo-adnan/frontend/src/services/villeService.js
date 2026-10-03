import { getApiBaseUrl } from '@aanid/shared/api';
const API_BASE = getApiBaseUrl();

export async function getVilles(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/villes${params}`);
  if (!res.ok) throw new Error('Erreur chargement villes');
  return res.json();
}

export async function getVilleById(id) {
  const res = await fetch(`${API_BASE}/villes/${id}`);
  if (!res.ok) throw new Error('Ville introuvable');
  return res.json();
}
