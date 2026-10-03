"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Pencil, Search, Trash2 } from "@/components/shared/icons";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { CsvImportDialog } from "@/components/admin/csv-import-dialog";
import { TrendsIngestButton } from "@/components/admin/trends-ingest-button";
import { createClient } from "@/lib/supabase/client";
import { deleteProduct } from "@/lib/data/admin";
import { CATEGORIES, PRODUCT_SOURCE, PRODUCT_SOURCE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/database";

export function ProductsManager({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [query, setQuery] = useState("");
  const [categorie, setCategorie] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      const matchCat = !categorie || p.categorie === categorie;
      const matchQuery = !q || p.nom.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [items, query, categorie]);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TrendsIngestButton
            onIngested={(produits) =>
              setItems((prev) => {
                // Le service peut mettre à jour des produits déjà présents :
                // on remplace par id plutôt que d'empiler des doublons.
                const parId = new Map(prev.map((p) => [p.id, p]));
                for (const p of produits) parId.set(p.id, p);
                return [...parId.values()];
              })
            }
          />
          <CsvImportDialog
            onImported={(produits) => setItems((prev) => [...produits, ...prev])}
          />
          <ProductFormDialog
            onSaved={(product) => setItems((prev) => [product, ...prev])}
          />
        </div>
      </div>

      <div className="scrollbar-none flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategorie(null)}
          className={cn(
            "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
            !categorie
              ? "border-transparent bg-gradient-to-r from-primary to-primary-end text-white shadow-md shadow-primary/25"
              : "border-border-strong bg-surface text-muted-foreground hover:border-primary/40",
          )}
        >
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategorie(categorie === c ? null : c)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              categorie === c
                ? "border-transparent bg-gradient-to-r from-primary to-primary-end text-white shadow-md shadow-primary/25"
                : "border-border-strong bg-surface text-muted-foreground hover:border-primary/40",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/50 transition-all duration-300 hover:border-primary/30"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={product.image_url}
                alt={product.nom}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <Badge variant="gradient" className="absolute left-3 top-3">
                {product.categorie}
              </Badge>
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-background/70 backdrop-blur-sm">
                  Score {product.score}
                </Badge>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <p className="font-heading text-sm font-semibold leading-snug">{product.nom}</p>
              <p className="text-xs text-muted-foreground">
                {product.prix_conseille.toLocaleString("fr-FR")} XOF · Marge {product.marge_estimee}
              </p>
              <p className="text-xs text-muted-foreground">
                {product.pays_cible.length} marché{product.pays_cible.length > 1 ? "s" : ""} ·{" "}
                {product.mois_pertinents.length} mois
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <Badge variant="outline" className="text-[10px]">
                  {PRODUCT_SOURCE_LABELS[product.source] ?? product.source}
                </Badge>
                {product.source === PRODUCT_SOURCE.pytrends && product.prix_conseille === 0 && (
                  <Badge variant="outline" className="border-accent/40 text-[10px] text-accent">
                    À compléter
                  </Badge>
                )}
              </div>

              <div className="mt-auto flex items-center justify-end gap-2 pt-2">
                <ProductFormDialog
                  product={product}
                  onSaved={(updated) =>
                    setItems((prev) =>
                      prev.map((p) => (p.id === updated.id ? updated : p)),
                    )
                  }
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
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong py-16 text-center">
          <p className="font-heading text-lg font-semibold">Aucun produit</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {query || categorie
              ? "Aucun produit ne correspond à vos critères."
              : "Ajoutez votre premier produit au catalogue."}
          </p>
        </div>
      )}
    </div>
  );
}
