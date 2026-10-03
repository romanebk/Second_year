"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.74-2.1-6.68-4.92H1.32v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.32 14.33A7.2 7.2 0 0 1 4.94 12c0-.81.14-1.6.38-2.33V6.58H1.32A12 12 0 0 0 0 12c0 1.94.46 3.77 1.32 5.42z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.32 6.58l4 3.09C6.26 6.85 8.89 4.75 12 4.75z"
      />
    </svg>
  );
}

export function GoogleButton({
  label = "Continuer avec Google",
  guard,
}: {
  label?: string;
  /**
   * Vérification exécutée avant la redirection OAuth. Si elle renvoie `false`,
   * la connexion est annulée (utilisé à l'inscription pour exiger
   * l'acceptation des CGU, que ce parcours ne passe pas par le formulaire).
   */
  guard?: () => boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (guard && !guard()) return;

    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={loading}
    >
      <GoogleIcon />
      {loading ? "Redirection…" : label}
    </Button>
  );
}
