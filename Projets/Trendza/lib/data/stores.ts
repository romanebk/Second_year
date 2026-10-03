import type { SupabaseClient } from "@supabase/supabase-js";

import type { Plateforme, Store } from "@/types/database";

export async function getStores(supabase: SupabaseClient, userId: string): Promise<Store[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Store[];
}

export async function createStore(
  supabase: SupabaseClient,
  payload: { user_id: string; nom: string; plateforme: Plateforme; pays: string },
): Promise<{ data: Store | null; error: { message: string } | null }> {
  const { data, error } = await supabase.from("stores").insert(payload).select().single();
  return { data: data as Store | null, error };
}

export async function deleteStore(supabase: SupabaseClient, storeId: string) {
  return supabase.from("stores").delete().eq("id", storeId);
}
