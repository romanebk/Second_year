import "server-only";

import { FedaPay, Transaction } from "fedapay";

import { ABONNEMENT_LIBELLE, ABONNEMENT_MONTANT_XOF } from "@/lib/subscription";

/**
 * Client FedaPay — usage strictement serveur.
 *
 * `server-only` fait échouer le build si ce module est importé depuis un
 * composant client : la clé secrète ne doit jamais partir dans le bundle.
 */

let configured = false;

function configurer(): void {
  if (configured) return;

  const apiKey = process.env.FEDAPAY_SECRET_KEY;
  if (!apiKey) {
    throw new Error(
      "FEDAPAY_SECRET_KEY manquante. Renseignez-la dans .env.local (voir .env.local.example).",
    );
  }

  FedaPay.setApiKey(apiKey);
  // 'sandbox' pour les tests, 'live' en production. On reste en sandbox par
  // défaut : un oubli de configuration ne doit jamais encaisser de vrai argent.
  FedaPay.setEnvironment(process.env.FEDAPAY_ENVIRONMENT === "live" ? "live" : "sandbox");

  configured = true;
}

export function fedapayEstConfigure(): boolean {
  return Boolean(process.env.FEDAPAY_SECRET_KEY);
}

export type CreationPaiement = {
  transactionId: string;
  paymentUrl: string;
};

/**
 * Crée une transaction FedaPay et retourne l'URL de paiement hébergée.
 *
 * Le montant est fixé côté serveur : il n'est jamais lu depuis la requête,
 * pour qu'un client ne puisse pas se facturer 100 F au lieu de 15 000.
 */
export async function creerPaiementAbonnement(params: {
  email: string;
  prenoms?: string | null;
  nom?: string | null;
  callbackUrl: string;
}): Promise<CreationPaiement> {
  configurer();

  const transaction = await Transaction.create({
    description: ABONNEMENT_LIBELLE,
    amount: ABONNEMENT_MONTANT_XOF,
    currency: { iso: "XOF" },
    callback_url: params.callbackUrl,
    customer: {
      email: params.email,
      // FedaPay exige des noms non vides ; on retombe sur l'email au besoin.
      firstname: params.prenoms?.trim() || params.email.split("@")[0],
      lastname: params.nom?.trim() || "—",
    },
  });

  const token = await transaction.generateToken();

  const paymentUrl = (token as unknown as { url?: string }).url;
  const transactionId = (transaction as unknown as { id?: number | string }).id;

  if (!paymentUrl || transactionId === undefined) {
    throw new Error("FedaPay n'a pas renvoyé d'URL de paiement exploitable.");
  }

  return { transactionId: String(transactionId), paymentUrl };
}
