"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "@/components/shared/icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Résiliation de l'abonnement par carte.
 *
 * Deux temps volontaires : le premier clic explique ce qui va se passer, le
 * second confirme. Une résiliation déclenchée par mégarde serait pénible à
 * rattraper — il faudrait repasser par un paiement.
 */
export function CancelButton({ finAcces }: { finAcces: string | null }) {
  const router = useRouter();
  const [confirme, setConfirme] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch("/api/abonnement/resilier", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        toast.error(data.error ?? "La résiliation a échoué.");
        setLoading(false);
        return;
      }

      toast.success("Résiliation enregistrée. Votre accès reste ouvert jusqu'à la fin de la période payée.");
      setConfirme(false);
      router.refresh();
    } catch {
      toast.error("Connexion interrompue. Réessayez.");
    }
    setLoading(false);
  }

  if (!confirme) {
    return (
      <button
        type="button"
        onClick={() => setConfirme(true)}
        className="cursor-pointer text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Résilier l&apos;abonnement
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/40 p-4">
      <p className="text-sm text-foreground/90">
        Votre abonnement ne sera plus reconduit.{" "}
        {finAcces
          ? "Vous gardez l'accès complet jusqu'à la fin de la période déjà payée."
          : "Vous gardez l'accès jusqu'au terme en cours."}{" "}
        Aucun nouveau prélèvement ne sera effectué.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Confirmer la résiliation
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirme(false)}
          disabled={loading}
        >
          Garder mon abonnement
        </Button>
      </div>
    </div>
  );
}
