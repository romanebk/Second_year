import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient, serviceRoleEstConfigure } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/data/profiles";
import { creerPaiementAbonnement, fedapayEstConfigure } from "@/lib/fedapay";
import {
  creerTransactionAbonnement,
  paddleEstConfigure,
  trouverOuCreerClient,
} from "@/lib/paddle";
import {
  ABONNEMENT_MONTANT_XOF,
  ABONNEMENT_PRIX_EUR_CENTIMES,
  getAccesPremium,
  providerParDefaut,
} from "@/lib/subscription";
import type { PaymentProvider } from "@/types/database";

export const dynamic = "force-dynamic";

function estProvider(valeur: unknown): valeur is PaymentProvider {
  return valeur === "paddle" || valeur === "fedapay";
}

/**
 * Initie un paiement d'abonnement chez l'un des deux agrégateurs.
 *
 * Le client choisit le *moyen* de paiement (carte via Paddle, ou Mobile Money
 * via FedaPay), jamais le *montant* : celui-ci est fixé côté serveur, pour
 * qu'on ne puisse pas se facturer moins que le tarif depuis le navigateur.
 */
export async function POST(request: Request) {
  if (!serviceRoleEstConfigure()) {
    return NextResponse.json(
      {
        error:
          "Le paiement n'est pas encore configuré. Renseignez SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const profile = await getProfile(supabase, user.id);

  const corps = (await request.json().catch(() => ({}))) as { provider?: unknown };
  const provider: PaymentProvider = estProvider(corps.provider)
    ? corps.provider
    : providerParDefaut(profile?.pays);

  const acces = await getAccesPremium(supabase, user.id, profile?.role);

  if (acces.viaAdmin) {
    return NextResponse.json(
      { error: "Votre compte administrateur dispose déjà d'un accès complet." },
      { status: 409 },
    );
  }

  // Un abonnement Paddle actif se reconduit tout seul : relancer un paiement
  // créerait un second abonnement et un double prélèvement.
  if (
    acces.actif &&
    acces.abonnement?.provider === "paddle" &&
    !acces.abonnement.annule_a_la_fin
  ) {
    return NextResponse.json(
      {
        error:
          "Votre abonnement par carte est déjà actif et se renouvelle automatiquement.",
      },
      { status: 409 },
    );
  }

  return provider === "paddle"
    ? checkoutPaddle({ userId: user.id, email: user.email, profile })
    : checkoutFedaPay({ userId: user.id, email: user.email, profile });
}

type Contexte = {
  userId: string;
  email: string;
  profile: Awaited<ReturnType<typeof getProfile>>;
};

/**
 * Carte bancaire en euros. Le navigateur ouvrira ensuite le checkout Paddle
 * avec l'identifiant de transaction renvoyé ici.
 */
async function checkoutPaddle({ userId, email, profile }: Contexte) {
  if (!paddleEstConfigure()) {
    return NextResponse.json(
      {
        error:
          "Le paiement par carte n'est pas encore configuré. Renseignez PADDLE_API_KEY, PADDLE_PRICE_ID et NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.",
      },
      { status: 503 },
    );
  }

  try {
    const nomComplet = [profile?.prenoms, profile?.nom].filter(Boolean).join(" ").trim();
    const customerId = await trouverOuCreerClient({ email, nomComplet });
    const { transactionId } = await creerTransactionAbonnement({ userId, customerId });

    // Trace le paiement en attente. Le webhook s'en servira pour rattacher la
    // transaction à cet utilisateur. Écrit avec la clé service_role, car la
    // RLS interdit toute écriture par l'utilisateur lui-même.
    const admin = createAdminClient();
    const { error } = await admin.from("payments").insert({
      user_id: userId,
      provider: "paddle",
      provider_transaction_id: transactionId,
      montant: ABONNEMENT_PRIX_EUR_CENTIMES,
      devise: "EUR",
      statut: "pending",
    });

    if (error) {
      console.error("checkout Paddle : enregistrement du paiement en attente", error);
      return NextResponse.json(
        { error: "Impossible d'initier le paiement. Réessayez." },
        { status: 500 },
      );
    }

    return NextResponse.json({ provider: "paddle", transactionId });
  } catch (err) {
    console.error("checkout Paddle", err);
    return NextResponse.json(
      { error: "Le prestataire de paiement est momentanément indisponible." },
      { status: 502 },
    );
  }
}

/** Mobile Money en francs CFA. Redirection vers la page hébergée par FedaPay. */
async function checkoutFedaPay({ userId, email, profile }: Contexte) {
  if (!fedapayEstConfigure()) {
    return NextResponse.json(
      {
        error:
          "Le paiement Mobile Money n'est pas encore configuré. Renseignez FEDAPAY_SECRET_KEY.",
      },
      { status: 503 },
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const { transactionId, paymentUrl } = await creerPaiementAbonnement({
      email,
      prenoms: profile?.prenoms,
      nom: profile?.nom,
      callbackUrl: `${siteUrl}/abonnement/retour`,
    });

    const admin = createAdminClient();
    const { error } = await admin.from("payments").insert({
      user_id: userId,
      provider: "fedapay",
      provider_transaction_id: transactionId,
      montant: ABONNEMENT_MONTANT_XOF,
      devise: "XOF",
      statut: "pending",
    });

    if (error) {
      console.error("checkout FedaPay : enregistrement du paiement en attente", error);
      return NextResponse.json(
        { error: "Impossible d'initier le paiement. Réessayez." },
        { status: 500 },
      );
    }

    return NextResponse.json({ provider: "fedapay", paymentUrl });
  } catch (err) {
    console.error("checkout FedaPay", err);
    return NextResponse.json(
      { error: "Le prestataire de paiement est momentanément indisponible." },
      { status: 502 },
    );
  }
}
