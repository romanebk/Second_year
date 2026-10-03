import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profiles";
import { getAccesPremium, type AccesPremium } from "@/lib/subscription";
import type { Profile } from "@/types/database";

export type SessionApp = {
  supabase: SupabaseClient;
  user: User;
  profile: Profile | null;
};

/**
 * Exige une session authentifiée. À utiliser en tête de toute page protégée.
 */
export async function requireUser(): Promise<SessionApp> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const profile = await getProfile(supabase, user.id);
  return { supabase, user, profile };
}

/**
 * Exige un abonnement actif (ou le rôle admin).
 *
 * ⚠️ C'est ici que se joue le paywall. Le contrôle est fait **côté serveur,
 * avant tout rendu** : masquer un bloc dans l'interface ne protège rien,
 * puisque les données seraient déjà présentes dans le HTML envoyé.
 *
 * `origine` permet de revenir sur la page demandée après paiement.
 */
export async function requireSubscription(
  origine: string,
): Promise<SessionApp & { acces: AccesPremium }> {
  const session = await requireUser();

  const acces = await getAccesPremium(
    session.supabase,
    session.user.id,
    session.profile?.role,
  );

  if (!acces.actif) {
    redirect(`/abonnement?depuis=${encodeURIComponent(origine)}`);
  }

  return { ...session, acces };
}

/**
 * Exige le rôle administrateur. Redirige vers /catalogue si l'utilisateur
 * n'est pas admin.
 */
export async function requireAdmin(): Promise<SessionApp & { profile: Profile }> {
  const session = await requireUser();

  if (session.profile?.role !== "admin") {
    redirect("/catalogue");
  }

  return session as SessionApp & { profile: Profile };
}
