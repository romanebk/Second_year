import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient, serviceRoleEstConfigure } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/data/profiles";
import { resilierAbonnement } from "@/lib/paddle";
import { getAccesPremium } from "@/lib/subscription";

export const dynamic = "force-dynamic";

/**
 * Résilie l'abonnement par carte, à effet à la fin de la période payée.
 *
 * Ne concerne que Paddle : côté FedaPay il n'y a rien à résilier, chaque
 * paiement ouvre 30 jours et rien ne se reconduit tout seul.
 *
 * Pouvoir se désabonner en quelques clics n'est pas une commodité : c'est une
 * obligation pour un abonnement vendu à des consommateurs européens.
 */
export async function POST() {
  if (!serviceRoleEstConfigure()) {
    return NextResponse.json({ error: "Service non configuré." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const profile = await getProfile(supabase, user.id);
  const acces = await getAccesPremium(supabase, user.id, profile?.role);
  const abonnement = acces.abonnement;

  if (!abonnement?.provider_subscription_id || abonnement.provider !== "paddle") {
    return NextResponse.json(
      { error: "Aucun abonnement par carte à résilier sur ce compte." },
      { status: 409 },
    );
  }

  if (abonnement.annule_a_la_fin) {
    return NextResponse.json({ error: "La résiliation est déjà enregistrée." }, { status: 409 });
  }

  try {
    await resilierAbonnement(abonnement.provider_subscription_id);
  } catch (err) {
    console.error("résiliation Paddle", err);
    return NextResponse.json(
      { error: "La résiliation a échoué. Réessayez dans un instant." },
      { status: 502 },
    );
  }

  // Paddle confirmera via `subscription.updated`, mais on inscrit l'intention
  // tout de suite : l'utilisateur doit voir sa demande prise en compte sans
  // attendre l'aller-retour du webhook.
  const admin = createAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({ annule_a_la_fin: true })
    .eq("id", abonnement.id);

  if (error) {
    // La résiliation est bien passée chez Paddle : ne pas alarmer l'utilisateur.
    console.error("résiliation : mise à jour locale", error);
  }

  return NextResponse.json({
    resilie: true,
    finAcces: abonnement.current_period_end,
  });
}
