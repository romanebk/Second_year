"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "@/components/shared/icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_SOURCE } from "@/lib/constants";
import type { Product } from "@/types/database";

type IngestResponse = {
  inserted?: number;
  updated?: number;
  failed?: number;
  errors?: string[];
  error?: string;
};

/**
 * Déclenche le service d'ingestion Google Trends, puis recharge les produits
 * qu'il a écrits pour rafraîchir la liste sans recharger la page.
 *
 * L'appel passe par /api/admin/ingest-trends, qui re-vérifie le rôle admin
 * côté serveur : ce bouton n'est qu'un déclencheur, pas la protection.
 */
export function TrendsIngestButton({
  onIngested,
}: {
  onIngested: (products: Product[]) => void;
}) {
  const [running, setRunning] = useState(false);

  async function handleClick() {
    setRunning(true);
    const toastId = toast.loading("Ingestion Google Trends en cours… (cela peut prendre plusieurs minutes)");

    try {
      const res = await fetch("/api/admin/ingest-trends", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as IngestResponse;

      if (!res.ok) {
        toast.error(data.error ?? "L'ingestion a échoué.", { id: toastId });
        return;
      }

      const inserted = data.inserted ?? 0;
      const updated = data.updated ?? 0;

      if (inserted + updated === 0) {
        toast.warning(
          data.failed
            ? `Aucun produit écrit — ${data.failed} échec(s). Consultez les journaux du service.`
            : "Aucun produit retourné par Google Trends.",
          { id: toastId },
        );
      } else {
        toast.success(`${inserted} ajouté(s), ${updated} mis à jour.`, { id: toastId });
      }

      // Relit les produits issus du service pour refléter l'état réel en base.
      const supabase = createClient();
      const { data: rows } = await supabase
        .from("products")
        .select("*")
        .eq("source", PRODUCT_SOURCE.pytrends)
        .order("updated_at", { ascending: false });

      if (rows) onIngested(rows as Product[]);
    } catch {
      toast.error("Impossible de joindre le service d'ingestion.", { id: toastId });
    } finally {
      setRunning(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={running}>
      {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Google Trends
    </Button>
  );
}
