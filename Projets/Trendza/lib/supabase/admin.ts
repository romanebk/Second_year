import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service_role.
 *
 * ⚠️ Cette clé **contourne la Row Level Security**. Réservée aux traitements
 * serveur qui doivent écrire ce que l'utilisateur n'a pas le droit d'écrire :
 * enregistrement d'un paiement, activation d'un abonnement après webhook.
 *
 * `server-only` fait échouer le build si ce module est importé depuis un
 * composant client. Ne jamais préfixer cette variable de `NEXT_PUBLIC_`.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis pour les opérations de paiement.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function serviceRoleEstConfigure(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
