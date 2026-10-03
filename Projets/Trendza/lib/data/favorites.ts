import type { SupabaseClient } from "@supabase/supabase-js";

import type { Product } from "@/types/database";

export async function getFavoriteProductIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data.map((row) => row.product_id as string);
}

export async function getFavoriteProducts(
  supabase: SupabaseClient,
  userId: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("product:products(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data
    .map((row) => row.product as unknown as Product)
    .filter((product): product is Product => Boolean(product));
}

export async function addFavorite(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
) {
  return supabase.from("favorites").insert({ user_id: userId, product_id: productId });
}

export async function removeFavorite(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
) {
  return supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}
