import type { SupplierReport } from "@/lib/engine/types";
import { FaIcon } from "@/components/shared/fa-icon";
import { cn } from "@/lib/utils";

function QualityBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-end" style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold">{Math.round(value)}</span>
    </div>
  );
}

export function SuppliersPanel({ report }: { report: SupplierReport }) {
  return (
    <div>
      <div className="mb-5 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-muted-foreground">
        <span className="mr-1.5 font-semibold text-white">Recommandation :</span>
        {report.rationale}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {report.suppliers.map((supplier) => {
          const recommended = supplier.id === report.recommendedId;
          return (
            <div
              key={supplier.id}
              className={cn(
                "rounded-2xl border p-4",
                recommended ? "border-primary/50 bg-primary/5" : "border-border bg-surface/50",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-primary">
                    <FaIcon name="faTruckFast" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{supplier.label}</p>
                    <p className="text-[11px] text-muted-foreground">{supplier.plateforme}</p>
                  </div>
                </div>
                {recommended && (
                  <span className="rounded-full bg-gradient-to-r from-primary to-primary-end px-2.5 py-1 text-[10px] font-semibold text-white">
                    Recommandé
                  </span>
                )}
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-surface/70 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Prix</p>
                  <p className="font-semibold">{supplier.prix.toLocaleString("fr-FR")} XOF</p>
                </div>
                <div className="rounded-xl bg-surface/70 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Délai</p>
                  <p className="font-semibold">{supplier.delai} jours</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <QualityBar label="Qualité" value={supplier.qualite} />
                <QualityBar label="Réputation" value={supplier.reputation} />
                <QualityBar label="Fiabilité" value={supplier.fiabilite} />
              </div>

              <p className="mt-3 text-xs text-muted-foreground">{supplier.notes}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
