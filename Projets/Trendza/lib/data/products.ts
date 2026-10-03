import type { SupabaseClient } from "@supabase/supabase-js";

import type { Product } from "@/types/database";

export type ProductFilters = {
  pays: string;
  mois: number;
  categorie?: string;
  budget?: "faible" | "moyenne" | "elevee";
};

function margeValue(marge: string): number {
  const match = marge.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function matchesBudget(marge: string, budget?: ProductFilters["budget"]): boolean {
  if (!budget) return true;
  const value = margeValue(marge);
  if (budget === "faible") return value < 30;
  if (budget === "moyenne") return value >= 30 && value <= 50;
  return value > 50;
}

export async function getProducts(
  supabase: SupabaseClient,
  filters: ProductFilters,
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .contains("pays_cible", [filters.pays])
    .contains("mois_pertinents", [filters.mois])
    .order("score", { ascending: false });

  if (filters.categorie) {
    query = query.eq("categorie", filters.categorie);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as Product[]).filter((product) =>
    matchesBudget(product.marge_estimee, filters.budget),
  );
}

export async function getProductById(
  supabase: SupabaseClient,
  id: string,
): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) return null;
  return data as Product;
}

export async function getCatalogueProducts(
  supabase: SupabaseClient,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("score", { ascending: false });

  if (error || !data) return [];
  return data as Product[];
}
