import { NextResponse } from "next/server";
import { EventName } from "@paddle/paddle-node-sdk";
import type {
  SubscriptionNotification,
  TransactionNotification,
} from "@paddle/paddle-node-sdk";

import { createAdminClient, serviceRoleEstConfigure } from "@/lib/supabase/admin";
import { verifierWebhook, webhookPaddleEstConfigure } from "@/lib/paddle";
import type { PaymentStatut, SubscriptionStatut } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * Webhook Paddle — avec celui de FedaPay, l'un des deux **seuls** points du
 * système qui accordent un accès premium.
 *
 * Différence de fond avec FedaPay : Paddle gère un vrai abonnement récurrent.
 * On ne calcule donc aucune durée nous-même, on recopie la fin de période de
 * facturation annoncée par Paddle dans `current_period_end`, qui reste la
 * source de vérité unique de l'accès pour le reste de l'application.
 *
 * Garde-fous, dans l'ordre :
 *  1. signature `Paddle-Signature` vérifiée sur le corps brut ;
 *  2. l'utilisateur vient de `custom_data.user_id`, écrit côté serveur au
 *     moment du checkout — jamais d'une valeur choisie par le navigateur ;
 *  3. les écritures sont idempotentes : Paddle peut rejouer un évènement.
 */
export async function POST(request: Request) {
  if (!webhookPaddleEstConfigure() || !serviceRoleEstConfigure()) {
    console.error(
      "webhook Paddle : PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET ou SUPABASE_SERVICE_ROLE_KEY manquant",
    );
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const signature = request.headers.get("paddle-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  // Corps lu brut : le re-sérialiser changerait les octets signés.
  const rawBody = await request.text();

  let event;
  try {
    event = await verifierWebhook(rawBody, signature);
  } catch (err) {
    console.error("webhook Paddle : signature invalide", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionResumed:
      case EventName.SubscriptionCanceled:
      case EventName.SubscriptionPastDue:
      case EventName.SubscriptionPaused:
        await appliquerAbonnement(admin, event.data as SubscriptionNotification);
        break;

      case EventName.TransactionCompleted:
        await tracerPaiement(admin, event.data as TransactionNotification, "approved");
        break;

      case EventName.TransactionPaymentFailed:
        await tracerPaiement(admin, event.data as TransactionNotification, "declined");
        break;

      case EventName.TransactionCanceled:
        await tracerPaiement(admin, event.data as TransactionNotification, "canceled");
        break;

      default:
        // Évènement non pertinent : on accuse réception pour que Paddle
        // cesse de le rejouer.
        return NextResponse.json({ received: true, ignored: event.eventType });
    }
  } catch (err) {
    console.error("webhook Paddle : traitement", event.eventType, err);
    // 500 → Paddle réessaiera, ce qui est le comportement souhaité.
    return NextResponse.json({ error: "Traitement impossible." }, { status: 500 });
  }

  return NextResponse.json({ received: true, event: event.eventType });
}

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Traduit le statut Paddle en statut Trendza.
 *
 * `past_due` reste « actif » volontairement : Paddle relance le prélèvement
 * pendant plusieurs jours, et couper l'accès au premier échec (carte expirée,
 * plafond atteint) pénaliserait un client de bonne foi. La date de fin de
 * période reste de toute façon la limite réelle.
 */
function traduireStatut(statutPaddle: string): SubscriptionStatut {
  switch (statutPaddle) {
    case "active":
    case "trialing":
    case "past_due":
      return "active";
    case "canceled":
      return "canceled";
    case "paused":
      return "canceled";
    default:
      return "pending";
  }
}

/** Identifiant Trendza porté par la transaction ou l'abonnement Paddle. */
function userIdDepuis(customData: unknown): string | null {
  if (!customData || typeof customData !== "object") return null;
  const valeur = (customData as Record<string, unknown>).user_id;
  return typeof valeur === "string" && valeur.length > 0 ? valeur : null;
}

async function appliquerAbonnement(
  admin: AdminClient,
  abonnement: SubscriptionNotification,
): Promise<void> {
  const userId = userIdDepuis(abonnement.customData);

  if (!userId) {
    // Abonnement créé hors de l'application (import, test manuel dans le
    // tableau de bord Paddle) : rien à rattacher.
    console.warn("webhook Paddle : abonnement sans user_id", abonnement.id);
    return;
  }

  const statut = traduireStatut(abonnement.status);
  const finPeriode = abonnement.currentBillingPeriod?.endsAt ?? null;

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      statut,
      provider: "paddle",
      provider_subscription_id: abonnement.id,
      provider_customer_id: abonnement.customerId,
      // Résiliation programmée : l'accès court jusqu'à la fin de la période
      // payée, puis s'éteint sans nouveau prélèvement.
      annule_a_la_fin: abonnement.scheduledChange?.action === "cancel",
      current_period_start: abonnement.currentBillingPeriod?.startsAt ?? null,
      current_period_end: finPeriode,
    },
    { onConflict: "user_id" },
  );

  if (error) throw error;
}

/**
 * Journalise le paiement. Sert de piste d'audit et couvre les renouvellements,
 * dont la transaction n'a jamais été vue au moment du checkout.
 */
async function tracerPaiement(
  admin: AdminClient,
  transaction: TransactionNotification,
  statut: PaymentStatut,
): Promise<void> {
  const userId = userIdDepuis(transaction.customData);

  const { data: existante } = await admin
    .from("payments")
    .select("id, user_id")
    .eq("provider", "paddle")
    .eq("provider_transaction_id", transaction.id)
    .maybeSingle();

  if (existante) {
    const { error } = await admin
      .from("payments")
      .update({ statut })
      .eq("id", (existante as { id: string }).id);
    if (error) throw error;
    return;
  }

  // Renouvellement automatique : on retrouve l'utilisateur par l'abonnement
  // lorsque la transaction ne porte pas elle-même de `custom_data`.
  let proprietaire = userId;

  if (!proprietaire && transaction.subscriptionId) {
    const { data: abonnement } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("provider_subscription_id", transaction.subscriptionId)
      .maybeSingle();
    proprietaire = (abonnement as { user_id: string } | null)?.user_id ?? null;
  }

  if (!proprietaire) {
    console.warn("webhook Paddle : transaction non rattachable", transaction.id);
    return;
  }

  const montant = Number(transaction.details?.totals?.total ?? 0);

  const { error } = await admin.from("payments").insert({
    user_id: proprietaire,
    provider: "paddle",
    provider_transaction_id: transaction.id,
    // Paddle exprime déjà les montants en unité mineure (centimes pour l'euro).
    montant: Number.isFinite(montant) ? montant : 0,
    devise: transaction.currencyCode,
    statut,
  });

  if (error) throw error;
}
