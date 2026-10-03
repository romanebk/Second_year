// Intégration KKiaPay (Mobile Money MTN/Moov + cartes — Bénin).
// Flux : le widget KKiaPay s'ouvre côté client avec la clé publique, retourne un
// transactionId, que le backend vérifie ici avec la clé privée.
// Configuration par variables d'environnement :
//   KKIAPAY_PUBLIC_KEY   : clé publique (widget côté client)
//   KKIAPAY_PRIVATE_KEY  : clé privée (vérification serveur)
//   KKIAPAY_SECRET       : secret (vérification serveur)
//   KKIAPAY_ENVIRONMENT  : 'sandbox' (défaut) ou 'live'
// Sans clé privée configurée, les routes de paiement basculent en mode simulation.

const ENV = process.env.KKIAPAY_ENVIRONMENT === 'live' ? 'live' : 'sandbox';
const BASE_URL = ENV === 'live'
  ? 'https://api.kkiapay.me'
  : 'https://api-sandbox.kkiapay.me';

function isConfigured() {
  return Boolean(process.env.KKIAPAY_PRIVATE_KEY) && typeof fetch === 'function';
}

/** Config exposée au frontend pour ouvrir le widget. */
function publicConfig() {
  return {
    publicKey: process.env.KKIAPAY_PUBLIC_KEY || '',
    sandbox: ENV !== 'live',
  };
}

/**
 * Vérifie une transaction KKiaPay côté serveur.
 * @returns {{ status: string, amount: number }} status: 'SUCCESS' | 'PENDING' | 'FAILED' | ...
 */
async function verifyTransaction(transactionId) {
  const response = await fetch(`${BASE_URL}/api/v1/transactions/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-api-key': process.env.KKIAPAY_PUBLIC_KEY || '',
      'x-private-key': process.env.KKIAPAY_PRIVATE_KEY,
      'x-secret-key': process.env.KKIAPAY_SECRET || '',
    },
    body: JSON.stringify({ transactionId }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.error || `KKiaPay HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

function isPaidStatus(status) {
  return status === 'SUCCESS';
}

function isFailedStatus(status) {
  return status === 'FAILED' || status === 'DECLINED' || status === 'REVERTED';
}

module.exports = {
  isConfigured,
  publicConfig,
  verifyTransaction,
  isPaidStatus,
  isFailedStatus,
  ENV,
};
