"use client";

import { useState, type FormEvent } from "react";
import { Loader2, PackagePlus } from "@/components/shared/icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createProduct, updateProduct, type ProductInput } from "@/lib/data/admin";
import {
  CATEGORIES,
  COUNTRIES,
  MONTHS,
  PRODUCT_SOURCE,
  PRODUCT_SOURCE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/database";

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function ProductFormContent({
  product,
  onSaved,
  onClose,
}: {
  product?: Product;
  onSaved: (product: Product) => void;
  onClose: () => void;
}) {
  const isEdit = Boolean(product);
  const [nom, setNom] = useState(product?.nom ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categorie, setCategorie] = useState(product?.categorie ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [prix, setPrix] = useState(product ? String(product.prix_conseille) : "");
  const [marge, setMarge] = useState(product?.marge_estimee ?? "");
  const [score, setScore] = useState(product ? String(product.score) : "");
  const [paysCible, setPaysCible] = useState<string[]>(product?.pays_cible ?? []);
  const [mois, setMois] = useState<number[]>(product?.mois_pertinents ?? []);
  const [publicCible, setPublicCible] = useState(product?.public_cible ?? "");
  const [argumentsVente, setArgumentsVente] = useState(product?.arguments_vente.join("\n") ?? "");
  const [angles, setAngles] = useState(product?.angles_marketing.join("\n") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function togglePays(code: string) {
    setPaysCible((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function toggleMois(value: number) {
    setMois((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: ProductInput = {
      nom: nom.trim(),
      description: description.trim(),
      categorie,
      image_url: imageUrl.trim(),
      prix_conseille: Number(prix),
      marge_estimee: marge.trim(),
      score: Number(score),
      pays_cible: paysCible,
      mois_pertinents: mois,
      public_cible: publicCible.trim(),
      arguments_vente: toLines(argumentsVente),
      angles_marketing: toLines(angles),
      // La provenance est imposée, jamais saisie : elle sert à distinguer les
      // produits saisis à la main de ceux écrits par le service d'ingestion.
      // En édition, on conserve la provenance d'origine du produit.
      source: product?.source ?? PRODUCT_SOURCE.manualAdmin,
    };

    if (
      !payload.nom ||
      !payload.description ||
      !payload.categorie ||
      !payload.image_url ||
      !payload.prix_conseille ||
      !payload.score
    ) {
      setError("Merci de remplir les champs obligatoires (nom, description, catégorie, image, prix, score).");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const result = isEdit && product
      ? await updateProduct(supabase, product.id, payload)
      : await createProduct(supabase, payload);
    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error?.message ?? "Impossible d'enregistrer le produit.");
      return;
    }

    toast.success(isEdit ? "Produit mis à jour" : "Produit ajouté");
    onSaved(result.data);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="p-nom">Nom *</Label>
        <Input id="p-nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Brasero pliable en acier" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="p-desc">Description *</Label>
        <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description courte du produit." required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-cat">Catégorie *</Label>
          <Select value={categorie} onValueChange={setCategorie}>
            <SelectTrigger id="p-cat">
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="p-url">Image (URL) *</Label>
          <Input id="p-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-prix">Prix conseillé (XOF) *</Label>
          <Input id="p-prix" type="number" min={0} value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="29900" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-marge">Marge estimée</Label>
          <Input id="p-marge" value={marge} onChange={(e) => setMarge(e.target.value)} placeholder="Ex : 45%" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-score">Score (0-100) *</Label>
          <Input id="p-score" type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} placeholder="90" required />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Marchés cibles</Label>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => togglePays(c.code)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                paysCible.includes(c.code)
                  ? "border-transparent bg-gradient-to-r from-primary to-primary-end text-white"
                  : "border-border-strong bg-surface text-muted-foreground hover:border-primary/40",
              )}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Mois pertinents</Label>
        <div className="flex flex-wrap gap-2">
          {MONTHS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => toggleMois(m.value)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                mois.includes(m.value)
                  ? "border-transparent bg-gradient-to-r from-primary to-primary-end text-white"
                  : "border-border-strong bg-surface text-muted-foreground hover:border-primary/40",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-public">Public cible</Label>
          <Input id="p-public" value={publicCible} onChange={(e) => setPublicCible(e.target.value)} placeholder="Ex : Familles et amateurs de soirées" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Provenance</Label>
          <p className="flex h-11 items-center rounded-xl border border-border bg-surface/50 px-4 text-sm text-muted-foreground">
            {PRODUCT_SOURCE_LABELS[product?.source ?? PRODUCT_SOURCE.manualAdmin] ??
              product?.source}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="p-args">Arguments de vente (un par ligne)</Label>
        <Textarea id="p-args" value={argumentsVente} onChange={(e) => setArgumentsVente(e.target.value)} placeholder={"Compact et pliable\nTrès recherché en fin d'année"} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="p-angles">Angles marketing (un par ligne)</Label>
        <Textarea id="p-angles" value={angles} onChange={(e) => setAngles(e.target.value)} placeholder={"Mise en avant saisonnière\nOffre de lancement"} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button type="submit" variant="gradient" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Enregistrer les modifications" : "Ajouter au catalogue"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProductFormDialog({
  product,
  onSaved,
  trigger,
}: {
  product?: Product;
  onSaved: (product: Product) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(product);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="gradient">
            <PackagePlus className="h-4 w-4" />
            Ajouter un produit
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          <DialogDescription>
            Ajoutez un produit tendance au catalogue. Choisissez la catégorie et les marchés cibles.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ProductFormContent
            product={product}
            onSaved={onSaved}
            onClose={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
