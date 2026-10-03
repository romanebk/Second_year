"use client";

import { useState } from "react";
import { Heart } from "@/components/shared/icons";
import { motion } from "motion/react";
import { toast } from "sonner";

import { ProductCard } from "@/components/dashboard/product-card";
import { GlowButton } from "@/components/shared/glow-button";
import { createClient } from "@/lib/supabase/client";
import { removeFavorite } from "@/lib/data/favorites";
import type { Product } from "@/types/database";

export function FavoritesGrid({
  initialProducts,
  userId,
}: {
  initialProducts: Product[];
  userId: string;
}) {
  const [products, setProducts] = useState(initialProducts);

  async function handleRemove(productId: string) {
    const supabase = createClient();
    const { error } = await removeFavorite(supabase, userId, productId);

    if (error) {
      toast.error("Une erreur est survenue, réessayez.");
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    toast.success("Retiré des favoris");
  }

  if (products.length === 0) {
    return (
      <div className="relative mt-6 overflow-hidden rounded-3xl border border-dashed border-border-strong bg-surface/30 px-6 py-24 text-center">
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary-end/25 text-primary">
          <Heart className="h-8 w-8" />
        </div>
        <p className="mt-6 font-heading text-xl font-semibold">Aucun favori pour l&apos;instant</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Explorez le catalogue et cliquez sur le cœur d&apos;un produit pour le retrouver
          ici.
        </p>
        <div className="mt-6">
          <GlowButton href="/catalogue">
            Explorer le catalogue
          </GlowButton>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
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
            isFavorite
            onToggleFavorite={handleRemove}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
