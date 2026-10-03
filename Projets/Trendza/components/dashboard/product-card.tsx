"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "@/components/shared/icons";

import { Badge } from "@/components/ui/badge";
import { TrendScoreBadge } from "@/components/dashboard/trend-score-badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({
  product,
  whyRelevant,
  isFavorite = false,
  onToggleFavorite,
  className,
  adminActions,
}: {
  product: Product;
  whyRelevant?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
  className?: string;
  adminActions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/60 transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_40px_-14px_rgba(124,58,237,0.25)]",
        className,
      )}
    >
      <Link href={`/produits/${product.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.nom}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <Badge variant="gradient" className="absolute left-3 top-3">
          {product.categorie}
        </Badge>
        <TrendScoreBadge score={product.score} className="absolute right-3 top-3 rounded-full bg-background/70 backdrop-blur-sm" />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/produits/${product.id}`}>
            <h3 className="font-heading text-base font-semibold leading-snug hover:text-primary transition-colors">
              {product.nom}
            </h3>
          </Link>
          {onToggleFavorite && (
            <button
              type="button"
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              onClick={() => onToggleFavorite(product.id)}
              className="shrink-0 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-fuchsia-400"
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-fuchsia-400 text-fuchsia-400")} />
            </button>
          )}
        </div>

        {whyRelevant && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{whyRelevant}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="font-medium text-foreground">
            {product.prix_conseille.toLocaleString("fr-FR")} XOF
          </span>
          <span className="text-muted-foreground">Marge {product.marge_estimee}</span>
        </div>

        {adminActions && (
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
            {adminActions}
          </div>
        )}
      </div>
    </div>
  );
}
