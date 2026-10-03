"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Loader2, TriangleAlert, Upload } from "@/components/shared/icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { csvToProducts, CSV_TEMPLATE, type CsvParseResult } from "@/lib/admin/csv";
import type { Product } from "@/types/database";

/** Insertion par paquets : évite une requête géante et permet un rapport partiel. */
const BATCH_SIZE = 50;

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trendza-modele-produits.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvImportDialog({ onImported }: { onImported: (products: Product[]) => void }) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<CsvParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFileName(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    const text = await file.text();
    setResult(csvToProducts(text));
  }

  async function handleImport() {
    if (!result || result.produits.length === 0) return;

    setImporting(true);
    const supabase = createClient();
    const inserted: Product[] = [];
    let failed = 0;

    // Les écritures passent par les policies RLS « products_insert_admin » :
    // un non-admin est rejeté par la base même s'il atteignait ce code.
    for (let i = 0; i < result.produits.length; i += BATCH_SIZE) {
      const batch = result.produits.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase.from("products").insert(batch).select();
      if (error) {
        failed += batch.length;
        continue;
      }
      inserted.push(...((data ?? []) as Product[]));
    }

    setImporting(false);

    if (inserted.length > 0) {
      onImported(inserted);
      toast.success(
        `${inserted.length} produit${inserted.length > 1 ? "s" : ""} importé${inserted.length > 1 ? "s" : ""}.`,
      );
    }
    if (failed > 0) {
      toast.error(`${failed} produit(s) n'ont pas pu être enregistrés.`);
    }

    if (inserted.length > 0) {
      reset();
      setOpen(false);
    }
  }

  const produits = result?.produits ?? [];
  const erreurs = result?.erreurs ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="h-4 w-4" />
          Importer un CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import en masse (CSV)</DialogTitle>
          <DialogDescription>
            Chaque ligne devient un produit du catalogue, avec la provenance « Import CSV ».
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-3.5 w-3.5" />
              Télécharger le modèle
            </Button>
            <p className="text-xs text-muted-foreground">
              Colonnes obligatoires : nom, description, categorie, image_url, score.
            </p>
          </div>

          <label
            htmlFor="csv-file"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-border-strong bg-surface/40 px-4 py-8 text-center transition-colors hover:border-primary/40"
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium">
              {fileName ?? "Choisir un fichier CSV"}
            </span>
            <span className="text-xs text-muted-foreground">
              Les listes (pays, mois, arguments) se séparent par « | »
            </span>
            <input
              ref={inputRef}
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>

          {result && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="text-xs text-muted-foreground">Prêts à importer</p>
                  <p className="font-heading text-xl font-bold text-success">{produits.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="text-xs text-muted-foreground">Lignes rejetées</p>
                  <p
                    className={`font-heading text-xl font-bold ${
                      erreurs.length > 0 ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {erreurs.length}
                  </p>
                </div>
              </div>

              {result.colonnesIgnorees.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Colonnes ignorées : {result.colonnesIgnorees.join(", ")}
                </p>
              )}

              {erreurs.length > 0 && (
                <div className="max-h-44 overflow-y-auto rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <TriangleAlert className="h-3.5 w-3.5" />
                    Ces lignes seront ignorées
                  </p>
                  <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {erreurs.slice(0, 40).map((e, i) => (
                      <li key={i}>
                        <span className="font-medium text-foreground">Ligne {e.ligne}</span> ·{" "}
                        {e.champ} — {e.message}
                      </li>
                    ))}
                    {erreurs.length > 40 && <li>… et {erreurs.length - 40} autre(s).</li>}
                  </ul>
                </div>
              )}

              {produits.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-surface">
                      <tr className="text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Nom</th>
                        <th className="px-3 py-2 font-medium">Catégorie</th>
                        <th className="px-3 py-2 text-right font-medium">Score</th>
                        <th className="px-3 py-2 font-medium">Marchés</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produits.slice(0, 30).map((p, i) => (
                        <tr key={i} className="border-t border-border/60">
                          <td className="px-3 py-2">{p.nom}</td>
                          <td className="px-3 py-2 text-muted-foreground">{p.categorie}</td>
                          <td className="px-3 py-2 text-right">{p.score}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {p.pays_cible.join(", ") || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="gradient"
            disabled={importing || produits.length === 0}
            onClick={handleImport}
          >
            {importing && <Loader2 className="h-4 w-4 animate-spin" />}
            Importer {produits.length > 0 ? `${produits.length} produit(s)` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
