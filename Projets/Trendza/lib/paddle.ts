import "server-only";

import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import type { EventEntity } from "@paddle/paddle-node-sdk";

/**
 * Client Paddle — usage strictement serveur.
 *
 * `server-only` fait échouer le build si ce module est importé depuis un
 * composant client : la clé d'API ne doit jamais partir dans le bundle.
 *
 * Paddle est *Merchant of Record* : c'est lui qui vend au client final, donc
 * lui qui collecte et reverse la TVA du pays de l'acheteur. C'est la raison
 * principale de ce choix pour le marché européen.
 */

let instance: Paddle | null = null;

/**
 * Environnement Paddle. Par sécurité, toute valeur autre que `production`
 * retombe sur le bac à sable : un oubli de configuration ne peut jamais
 * encaisser de vrai argent.
 */
function environnement(): Environment {
  return process.env.PADDLE_ENVIRONMENT === "production"
    ? Environment.production
    : Environment.sandbox;
}

function client(): Paddle {
  if (instance) return instance;

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "PADDLE_API_KEY manquante. Renseignez-la dans .env.local (voir .env.local.example).",
    );
  }

  instance = new Paddle(apiKey, { environment: environnement() });
  return instance;
}

/** Identifiant du prix récurrent créé dans le tableau de bord Paddle. */
export function paddlePriceId(): string | undefined {
  return process.env.PADDLE_PRICE_ID;
}

/**
 * Paddle est-il utilisable ? Vérifie la clé serveur, l'identifiant de prix et
 * le jeton client (nécessaire à l'ouverture du checkout dans le navigateur).
 */
export function paddleEstConfigure(): boolean {
  return Boolean(
    process.env.PADDLE_API_KEY &&
      process.env.PADDLE_PRICE_ID &&
      process.env.PADDLE_CLIENT_TOKEN,
  );
}

export type ConfigPaddleClient = {
  token: string;
  environment: "sandbox" | "production";
};

/**
 * Paramètres que le navigateur doit connaître pour ouvrir le checkout.
 *
 * Le jeton client est public par nature (Paddle le prévoit pour ça), mais il
 * n'est volontairement pas préfixé `NEXT_PUBLIC_` : le transmettre en prop
 * depuis un composant serveur évite d'avoir à déclarer deux fois
 * l'environnement, et garde le fichier d'environnement lisible.
 */
export function configPaddleClient(): ConfigPaddleClient | null {
  const token = process.env.PADDLE_CLIENT_TOKEN;
  if (!token) return null;

  return {
    token,
    environment: environnement() === Environment.production ? "production" : "sandbox",
  };
}

/**
 * Retrouve le client Paddle correspondant à cet email, ou le crée.
 *
 * Paddle refuse deux clients avec le même email ; on cherche donc d'abord.
 * Conserver un client stable évite de fragmenter l'historique de facturation
 * d'un même utilisateur entre plusieurs réabonnements.
 */
export async function trouverOuCreerClient(params: {
  email: string;
  nomComplet?: string | null;
}): Promise<string> {
  const paddle = client();

  const existants = await paddle.customers.list({ email: [params.email] }).next();
  if (existants.length > 0) {
    return existants[0].id;
  }

  const cree = await paddle.customers.create({
    email: params.email,
    name: params.nomComplet?.trim() || null,
  });

  return cree.id;
}

export type TransactionPaddle = {
  transactionId: string;
  customerId: string;
};

/**
 * Crée la transaction que le navigateur ouvrira dans le checkout Paddle.
 *
 * Deux propriétés importantes tiennent au fait que cet appel est serveur :
 *  • le montant vient de `PADDLE_PRICE_ID`, jamais de la requête — un client
 *    ne peut pas se facturer 1 € au lieu de 25 ;
 *  • `customData.user_id` est écrit ici, donc le webhook peut faire confiance
 *    à l'utilisateur qu'il désigne.
 *
 * La transaction naît en statut `draft` : c'est normal, il lui manque encore
 * l'adresse de facturation, que l'acheteur saisit pendant le checkout.
 */
export async function creerTransactionAbonnement(params: {
  userId: string;
  customerId: string;
}): Promise<TransactionPaddle> {
  const priceId = paddlePriceId();
  if (!priceId) {
    throw new Error("PADDLE_PRICE_ID manquant : impossible de créer la transaction.");
  }

  const transaction = await client().transactions.create({
    items: [{ priceId, quantity: 1 }],
    customerId: params.customerId,
    customData: { user_id: params.userId },
  });

  return { transactionId: transaction.id, customerId: params.customerId };
}

/**
 * Résilie un abonnement à la fin de la période déjà payée.
 *
 * `next_billing_period` et non `immediately` : l'utilisateur a payé le mois en
 * cours, il doit en garder l'usage jusqu'au bout.
 */
export async function resilierAbonnement(subscriptionId: string): Promise<void> {
  await client().subscriptions.cancel(subscriptionId, {
    effectiveFrom: "next_billing_period",
  });
}

/**
 * Vérifie la signature `Paddle-Signature` et renvoie l'évènement typé.
 *
 * Lève une exception si la signature est invalide ou trop ancienne — le SDK
 * applique lui-même une tolérance de 5 secondes contre le rejeu.
 */
export async function verifierWebhook(
  rawBody: string,
  signature: string,
): Promise<EventEntity> {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("PADDLE_WEBHOOK_SECRET manquant.");
  }

  return client().webhooks.unmarshal(rawBody, secret, signature);
}

export function webhookPaddleEstConfigure(): boolean {
  return Boolean(process.env.PADDLE_API_KEY && process.env.PADDLE_WEBHOOK_SECRET);
}
