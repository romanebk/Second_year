import type { CompetitionAnalysis } from "@/lib/engine/types";
import { FaIcon } from "@/components/shared/fa-icon";

export function CompetitionPanel({ competition }: { competition: CompetitionAnalysis }) {
  const saturationColor =
    competition.saturation >= 70 ? "text-destructive" : competition.saturation >= 45 ? "text-amber-300" : "text-success";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface/60 p-4">
          <p className="text-xs text-muted-foreground">Fourchette de prix</p>
          <p className="font-heading text-lg font-semibold">
            {competition.priceRange.min.toLocaleString("fr-FR")} –{" "}
            {competition.priceRange.max.toLocaleString("fr-FR")} XOF
          </p>
          <p className="text-xs text-muted-foreground">médiane {competition.priceRange.median.toLocaleString("fr-FR")} XOF</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/60 p-4">
          <p className="text-xs text-muted-foreground">Qualité moyenne des fiches</p>
          <p className="font-heading text-lg font-semibold">{Math.round(competition.averageListingQuality)}/100</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/60 p-4">
          <p className="text-xs text-muted-foreground">Vendeurs estimés</p>
          <p className="font-heading text-lg font-semibold">
            {competition.estimatedSellers.toLocaleString("fr-FR")}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/60 p-4">
          <p className="text-xs text-muted-foreground">Saturation du marché</p>
          <p className={`font-heading text-lg font-semibold ${saturationColor}`}>{Math.round(competition.saturation)}%</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <FaIcon name="faCircleCheck" className="h-3.5 w-3.5 text-success" />
            Forces des concurrents
          </h3>
          <ul className="space-y-1.5">
            {competition.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <FaIcon name="faTriangleExclamation" className="h-3.5 w-3.5 text-destructive" />
            Faiblesses observées
          </h3>
          <ul className="space-y-1.5">
            {competition.weaknesses.map((w) => (
              <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <FaIcon name="faLightbulb" className="h-3.5 w-3.5" />
            Angle de différenciation
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{competition.angle}</p>
        </div>
      </div>
    </div>
  );
}
