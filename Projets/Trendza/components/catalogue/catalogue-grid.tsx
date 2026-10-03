"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { LayoutDashboard, Loader2, Pencil, Trash2 } from "@/components/shared/icons";

import { ProductCard } from "@/components/dashboard/product-card";
import { Button } from "@/components/ui/button";
import { GlowButton } from "@/components/shared/glow-button";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { createClient } from "@/lib/supabase/client";
import { deleteProduct } from "@/lib/data/admin";
import { addFavorite, removeFavorite } from "@/lib/data/favorites";
import type { Product } from "@/types/database";

export function CatalogueGrid({
  products,
  favoriteIds,
  userId,
  isAdmin = false,
}: {
  products: Product[];
  favoriteIds: string[];
  userId: string;
  isAdmin?: boolean;
}) {
  const [items, setItems] = useState(products);
  const [favorites, setFavorites] = useState(new Set(favoriteIds));
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleToggleFavorite(productId: string) {
    const supabase = createClient();
    const isFavorite = favorites.has(productId);

    const next = new Set(favorites);
    if (isFavorite) next.delete(productId);
    else next.add(productId);
    setFavorites(next);

    const { error } = isFavorite
      ? await removeFavorite(supabase, userId, productId)
      : await addFavorite(supabase, userId, productId);

    if (error) {
      setFavorites(favorites);
      toast.error("Une erreur est survenue, réessayez.");
      return;
    }

    toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await deleteProduct(supabase, id);
    setDeletingId(null);

    if (error) {
      toast.error("Impossible de supprimer le produit.");
      return;
    }

    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success("Produit supprimé");
  }

  function upsert(product: Product) {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev];
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border-strong bg-surface/30 px-6 py-24 text-center">
        <p className="font-heading text-xl font-semibold">Le catalogue est vide</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Aucun produit pour l&apos;instant.
          {isAdmin && " Ajoutez votre premier produit au catalogue."}
        </p>
        {isAdmin && (
          <div className="mt-6">
            <ProductFormDialog
              onSaved={(product) => setItems((prev) => [product, ...prev])}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/40 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-base font-semibold">Catalogue des tendances</h2>
          <p className="text-xs text-muted-foreground">
            {items.length} produit{items.length > 1 ? "s" : ""} · triés par score de tendance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <ProductFormDialog onSaved={(product) => setItems((prev) => [product, ...prev])} />
          )}
          <GlowButton href="/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            Mon tableau de bord
          </GlowButton>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {items.map((product) => (
          <motion.div
            key={product.id}
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
            }}
          >
            <ProductCard
              product={product}
              isFavorite={favorites.has(product.id)}
              onToggleFavorite={handleToggleFavorite}
              adminActions={
                isAdmin ? (
                  <div className="flex items-center gap-2">
                    <ProductFormDialog
                      product={product}
                      onSaved={upsert}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer le produit"
                      disabled={deletingId === product.id}
                      onClick={() => handleDelete(product.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : undefined
              }
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
