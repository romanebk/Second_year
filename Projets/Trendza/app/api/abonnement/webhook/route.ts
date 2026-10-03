import { NextResponse } from "next/server";
import { Webhook } from "fedapay";

import { createAdminClient, serviceRoleEstConfigure } from "@/lib/supabase/admin";
import { calculerFinDePeriode } from "@/lib/subscription";
import type { Payment, Subscription } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * Webhook FedaPay — **seul** point du système qui accorde un accès premium.
 *
 * Garde-fous, dans l'ordre :
 *  1. signature vérifiée (`X-FEDAPAY-SIGNATURE`) : un appel non signé est rejeté ;
 *  2. la transaction doit exister en base, créée lors du checkout : on en
 *     déduit l'utilisateur, jamais le corps de la requête ;
 *  3. un paiement déjà `approved` n'est pas rejoué : FedaPay peut livrer
 *     plusieurs fois le même évènement.
 */
export async function POST(request: Request) {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;

  if (!secret || !serviceRoleEstConfigure()) {
    console.error("webhook: FEDAPAY_WEBHOOK_SECRET ou SUPABASE_SERVICE_ROLE_KEY manquant");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const signature = request.headers.get("x-fedapay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  // Le corps doit être lu brut : le re-sérialiser changerait les octets et
  // invaliderait la signature.
  const rawBody = await request.text();

  let event: { name?: string; entity?: Record<string, unknown> };
  try {
    event = Webhook.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("webhook: signature invalide", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const nom = String(event.name ?? "");
  const entity = event.entity ?? {};
  const transactionId = entity.id !== undefined ? String(entity.id) : null;

  if (!transactionId) {
    // Évènement sans transaction exploitable : on accuse réception pour
    // éviter que FedaPay ne le rejoue indéfiniment.
    return NextResponse.json({ received: true, ignored: "sans identifiant" });
  }

  const admin = createAdminClient();

  const { data: paiementExistant } = await admin
    .from("payments")
    .select("*")
    .eq("provider", "fedapay")
    .eq("provider_transaction_id", transactionId)
    .maybeSingle();

  const paiement = paiementExistant as Payment | null;

  if (!paiement) {
    // Transaction inconnue : ne correspond à aucun checkout de cette app.
    console.warn("webhook: transaction inconnue", transactionId);
    return NextResponse.json({ received: true, ignored: "transaction inconnue" });
  }

  const nouveauStatut = nom === "transaction.approved"
    ? "approved"
    : nom === "transaction.declined"
      ? "declined"
      : nom === "transaction.canceled"
        ? "canceled"
        : null;

  if (!nouveauStatut) {
    return NextResponse.json({ received: true, ignored: nom });
  }

  // Idempotence : un paiement déjà approuvé ne doit jamais recréditer 30 jours.
  if (paiement.statut === "approved") {
    return NextResponse.json({ received: true, ignored: "déjà traité" });
  }

  await admin
    .from("payments")
    .update({ statut: nouveauStatut, raw_event: JSON.parse(rawBody) })
    .eq("id", paiement.id);

  if (nouveauStatut !== "approved") {
    return NextResponse.json({ received: true, statut: nouveauStatut });
  }

  // Paiement accepté : ouvrir (ou prolonger) la période d'accès.
  const { data: abonnementExistant } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", paiement.user_id)
    .maybeSingle();

  const abonnement = abonnementExistant as Subscription | null;
  const fin = calculerFinDePeriode(abonnement?.current_period_end);

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: paiement.user_id,
      statut: "active",
      provider: "fedapay",
      // FedaPay n'a pas d'objet abonnement : chaque paiement rouvre 30 jours,
      // et il n'y a donc jamais de reconduction à annuler.
      annule_a_la_fin: false,
      current_period_start: new Date().toISOString(),
      current_period_end: fin.toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("webhook: activation de l'abonnement", error);
    // 500 → FedaPay réessaiera, ce qui est le comportement souhaité ici.
    return NextResponse.json({ error: "Activation impossible." }, { status: 500 });
  }

  return NextResponse.json({ received: true, statut: "active", jusquau: fin.toISOString() });
}
