"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { ProductCard } from "@/components/dashboard/product-card";
import { createClient } from "@/lib/supabase/client";
import { addFavorite, removeFavorite } from "@/lib/data/favorites";
import { explainRelevance } from "@/lib/relevance";
import type { Product } from "@/types/database";

export function ProductGrid({
  products,
  favoriteIds,
  userId,
  pays,
  mois,
}: {
  products: Product[];
  favoriteIds: string[];
  userId: string;
  pays?: string;
  mois?: number;
}) {
  const [favorites, setFavorites] = useState(new Set(favoriteIds));

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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border-strong bg-surface/30 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-end/20 text-primary">
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path
              d="M12 2v3M12 19v3M2 12h3M19 12h3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
        </div>
        <p className="mt-5 font-heading text-xl font-semibold">Aucun produit pour ces critères</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Essayez un autre pays, un autre mois ou retirez quelques filtres pour élargir la
          recherche.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
          }}
        >
          <ProductCard
            product={product}
            whyRelevant={pays && mois ? explainRelevance(product, pays, mois) : undefined}
            isFavorite={favorites.has(product.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
