import { FaIcon } from "@/components/shared/fa-icon";
import { sourceDescriptor } from "@/lib/engine/sources/registry";
import type { SignalsReport } from "@/lib/engine/sources";
import { cn } from "@/lib/utils";

export function SourcesTable({
  report,
}: {
  report: SignalsReport;
}) {
  const detectedCount = report.signals.filter((s) => s.detected).length;
  const simulatedCount = report.simulated.length;
  const liveCount = report.signals.length - simulatedCount;
  const allSimulated = liveCount === 0 && report.signals.length > 0;

  return (
    <div>
      {simulatedCount > 0 && (
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm leading-relaxed">
          <FaIcon name="faTriangleExclamation" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-foreground/90">
            {allSimulated ? (
              <>
                <strong className="font-medium">
                  Aucune source n&apos;est encore connectée en temps réel.
                </strong>{" "}
                Les valeurs ci-dessous sont des <strong className="font-medium">estimations</strong>{" "}
                calculées par notre modèle à partir des caractéristiques du produit, et non des
                mesures relevées sur ces plateformes.
              </>
            ) : (
              <>
                <strong className="font-medium">
                  {simulatedCount} source{simulatedCount > 1 ? "s" : ""} sur {report.signals.length}
                </strong>{" "}
                {simulatedCount > 1 ? "ne sont pas mesurées" : "n'est pas mesurée"} en temps réel :
                {simulatedCount > 1 ? " leurs valeurs sont des estimations" : " sa valeur est une estimation"}{" "}
                du modèle.
              </>
            )}
          </p>
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface/60 p-4">
          <p className="text-xs text-muted-foreground">Sources concordantes</p>
          <p className="font-heading text-2xl font-bold">
            {detectedCount}
            <span className="text-sm font-normal text-muted-foreground"> / {report.signals.length}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/60 p-4">
          <p className="text-xs text-muted-foreground">
            Indice de confiance{allSimulated ? " (estimé)" : ""}
          </p>
          <p className="font-heading text-2xl font-bold text-primary">{Math.round(report.confidence)}%</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/60 p-4">
          <p className="text-xs text-muted-foreground">Mesuré en temps réel</p>
          <p className="font-heading text-2xl font-bold">
            {liveCount}
            <span className="text-sm font-normal text-muted-foreground"> / {report.signals.length}</span>
          </p>
          {report.degraded.length > 0 && (
            <p className="text-xs text-muted-foreground">
              dont {report.degraded.length} source(s) indisponible(s)
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2.5 pr-4 font-medium">Source</th>
              <th className="px-4 py-2.5 font-medium">Statut</th>
              <th className="px-4 py-2.5 text-right font-medium">Détection</th>
              <th className="px-4 py-2.5 text-right font-medium">Fréquence</th>
              <th className="px-4 py-2.5 text-right font-medium">Croissance</th>
              <th className="px-4 py-2.5 text-right font-medium">Viralité</th>
              <th className="px-4 py-2.5 text-right font-medium">Évolution</th>
            </tr>
          </thead>
          <tbody>
            {report.signals.map((signal) => {
              const desc = sourceDescriptor(signal.source);
              const degraded = report.degraded.includes(signal.source);
              const estimated = report.simulated.includes(signal.source);
              // Trois états distincts : mesuré, estimé (pas de connecteur), en repli
              // (connecteur présent mais en échec). Ne jamais présenter une
              // estimation comme une mesure.
              const status = degraded
                ? { label: "repli", tone: "bg-destructive/10 text-destructive", dot: "bg-destructive" }
                : estimated
                  ? { label: "estimation", tone: "bg-accent/10 text-accent", dot: "bg-accent" }
                  : { label: "mesuré", tone: "bg-success/10 text-success", dot: "bg-success" };
              return (
                <tr key={signal.source} className="border-b border-border/60">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-primary">
                        <FaIcon name={desc.icon} className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="font-medium">{desc.label}</p>
                        <p className="text-[11px] text-muted-foreground">{signal.countries.join(", ") || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        status.tone,
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {signal.detected ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <FaIcon name="faCircleCheck" className="h-3.5 w-3.5" /> oui
                      </span>
                    ) : (
                      <span className="text-muted-foreground">non</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{Math.round(signal.frequency)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={signal.growth >= 0 ? "text-success" : "text-destructive"}>
                      {signal.growth >= 0 ? "+" : ""}
                      {Math.round(signal.growth)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{Math.round(signal.virality)}</td>
                  <td className="px-4 py-3">
                    <div className="ml-auto flex h-8 items-end gap-[2px]">
                      {signal.trend.map((v, i) => (
                        <span
                          key={i}
                          className="w-1 rounded-sm bg-primary/60"
                          style={{ height: `${(v / 100) * 32}px` }}
                          title={String(v)}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
