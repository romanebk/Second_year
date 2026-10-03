import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profiles";
import { getAccesPremium } from "@/lib/subscription";

export const dynamic = "force-dynamic";

/**
 * État de l'abonnement de l'utilisateur courant.
 *
 * En lecture seule : sert à la page de retour de paiement pour détecter
 * l'activation dès que le webhook l'a écrite. N'accorde jamais d'accès.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const profile = await getProfile(supabase, user.id);
  const acces = await getAccesPremium(supabase, user.id, profile?.role);

  return NextResponse.json({
    actif: acces.actif,
    joursRestants: acces.joursRestants,
    finPeriode: acces.abonnement?.current_period_end ?? null,
  });
}
