"use client";

import { useState } from "react";
import { Heart } from "@/components/shared/icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { addFavorite, removeFavorite } from "@/lib/data/favorites";

export function FavoriteButton({
  productId,
  userId,
  initialFavorite,
}: {
  productId: string;
  userId: string;
  initialFavorite: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const next = !isFavorite;
    setIsFavorite(next);

    const { error } = next
      ? await addFavorite(supabase, userId, productId)
      : await removeFavorite(supabase, userId, productId);

    setLoading(false);

    if (error) {
      setIsFavorite(!next);
      toast.error("Une erreur est survenue, réessayez.");
      return;
    }

    toast.success(next ? "Ajouté aux favoris" : "Retiré des favoris");
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      <Heart className={isFavorite ? "h-4 w-4 fill-fuchsia-400 text-fuchsia-400" : "h-4 w-4"} />
      {isFavorite ? "Dans vos favoris" : "Ajouter aux favoris"}
    </Button>
  );
}
