// Widget de paiement KKiaPay (web). Charge https://cdn.kkiapay.me/k.js à la
// demande, ouvre le widget avec la clé publique et résout avec le transactionId.
import { Platform } from 'react-native';

const SCRIPT_URL = 'https://cdn.kkiapay.me/k.js';
let scriptPromise = null;

function loadScript() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return Promise.reject(new Error('Le paiement KKiaPay est disponible sur la version web pour le moment.'));
  }
  if (typeof window.openKkiapayWidget === 'function') return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Impossible de charger le widget KKiaPay'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Ouvre le widget KKiaPay et résout avec le transactionId en cas de succès.
 * @param {{ amount: number, publicKey: string, sandbox: boolean, phone?: string }} options
 * @returns {Promise<string>} transactionId
 */
export async function openKkiapay({ amount, publicKey, sandbox, phone }) {
  await loadScript();
  return new Promise((resolve, reject) => {
    const onSuccess = (response) => {
      cleanup();
      resolve(response?.transactionId);
    };
    const onFailed = () => {
      cleanup();
      reject(new Error('Paiement échoué ou annulé'));
    };
    function cleanup() {
      try {
        window.removeKkiapayListener?.('success', onSuccess);
        window.removeKkiapayListener?.('failed', onFailed);
      } catch { /* listeners déjà retirés */ }
    }
    window.addKkiapayListener?.('success', onSuccess);
    window.addKkiapayListener?.('failed', onFailed);
    window.openKkiapayWidget({
      amount: Math.round(amount),
      key: publicKey,
      sandbox: Boolean(sandbox),
      phone: phone || undefined,
      position: 'center',
    });
  });
}
