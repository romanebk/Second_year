import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '@aanid/shared/api';

const API_BASE = getApiBaseUrl();
const TOKEN_KEY = '@aanid/v1/access_token';

async function getToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request(path, options = {}, attempt = 0) {
  const maxAttempts = 3;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Réponse serveur invalide');
    }

    if (!response.ok) {
      const error = new Error(data?.error || 'Une erreur est survenue');
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err) {
    const retriable =
      attempt < maxAttempts - 1 &&
      (err.name === 'AbortError' || err.message === 'Network request failed' || err.message?.includes('fetch'));

    if (retriable) {
      await new Promise((resolve) => setTimeout(resolve, 2500 * (attempt + 1)));
      return request(path, options, attempt + 1);
    }

    if (err.name === 'AbortError') {
      throw new Error('Le serveur met trop de temps à répondre. Réessayez dans un instant.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function authRequest(path, options = {}) {
  const token = await getToken();
  if (!token) throw Object.assign(new Error('Non authentifié'), { status: 401 });

  return request(path, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
}

export async function getFormations(category) {
  const params = category && category !== 'toutes' ? `?category=${category}` : '';
  return request(`/formations${params}`);
}

export async function getFormationsPaginated(page = 1, limit = 10, category) {
  const parts = [`page=${page}`, `limit=${limit}`];
  if (category && category !== 'toutes') {
    parts.unshift(`category=${encodeURIComponent(category)}`);
  }
  return request(`/formations?${parts.join('&')}`);
}

export async function getFormationById(id) {
  return request(`/formations/${id}`);
}

export async function enroll(id) {
  return authRequest(`/formations/${id}/enroll`, { method: 'POST' });
}

export async function unenroll(id) {
  return authRequest(`/formations/${id}/unenroll`, { method: 'POST' });
}

export async function getMyFormations() {
  return authRequest('/formations/mine');
}

export async function updateProgress(formationId, moduleId, completed) {
  return authRequest(`/formations/${formationId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ moduleId, completed }),
  });
}

export async function getMyBadges() {
  return authRequest('/formations/mine/badges');
}

export async function payForFormation(formationId, phone, transactionId) {
  return authRequest(`/formations/${formationId}/pay`, {
    method: 'POST',
    body: JSON.stringify(transactionId ? { phone, transactionId } : { phone }),
  });
}

export async function getPaymentStatus(formationId) {
  return authRequest(`/formations/${formationId}/payment-status`);
}
