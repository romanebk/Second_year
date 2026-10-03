import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profiles";
import { getAccesPremium } from "@/lib/subscription";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const profile = await getProfile(supabase, user.id);

  if (!profile?.onboarded) {
    redirect("/onboarding");
  }

  // Sert uniquement à afficher les cadenas dans la navigation. Le contrôle
  // qui protège réellement les pages est `requireSubscription`, appelé dans
  // chaque page premium.
  const acces = await getAccesPremium(supabase, user.id, profile.role);

  return (
    <AppShell
      userEmail={user.email}
      isAdmin={profile.role === "admin"}
      abonnementActif={acces.actif}
    >
      {children}
    </AppShell>
  );
}
