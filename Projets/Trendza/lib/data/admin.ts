import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminUser, Product } from "@/types/database";

export async function getAdminUsers(
  supabase: SupabaseClient,
): Promise<{ users: AdminUser[]; error: string | null }> {
  const { data, error } = await supabase.rpc("admin_users");
  if (error || !data) return { users: [], error: error?.message ?? "Impossible de charger les utilisateurs." };
  return { users: data as unknown as AdminUser[], error: null };
}

export async function getAllProducts(
  supabase: SupabaseClient,
): Promise<{ products: Product[]; error: string | null }> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return { products: [], error: error?.message ?? "Impossible de charger les produits." };
  return { products: data as Product[], error: null };
}

export type ProductInput = {
  nom: string;
  description: string;
  categorie: string;
  image_url: string;
  prix_conseille: number;
  marge_estimee: string;
  score: number;
  pays_cible: string[];
  mois_pertinents: number[];
  public_cible: string;
  arguments_vente: string[];
  angles_marketing: string[];
  source: string;
};

export async function createProduct(
  supabase: SupabaseClient,
  payload: ProductInput,
): Promise<{ data: Product | null; error: { message: string } | null }> {
  const { data, error } = await supabase.from("products").insert(payload).select().single();
  return { data: data as Product | null, error };
}

export async function updateProduct(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<ProductInput>,
): Promise<{ data: Product | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  return { data: data as Product | null, error };
}

export async function deleteProduct(
  supabase: SupabaseClient,
  id: string,
): Promise<{ error: { message: string } | null }> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { error };
}
