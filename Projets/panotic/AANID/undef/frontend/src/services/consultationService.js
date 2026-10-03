// Accès API Consultation (gateway /api/v1, module undef).
import { getApiBaseUrl } from '@aanid/shared/api';

const API_BASE = getApiBaseUrl();

export async function submitConsultationRequest(payload) {
  const res = await fetch(`${API_BASE}/consultation/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.success === false) {
    const details = Array.isArray(data?.errors) ? ` (${data.errors.join(', ')})` : '';
    throw new Error((data?.message || `Erreur serveur (${res.status})`) + details);
  }
  return data.data;
}
