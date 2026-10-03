import type { PredictionReport } from "@/lib/engine/types";
import { FaIcon } from "@/components/shared/fa-icon";
import { cn } from "@/lib/utils";

export function PredictionPanel({ prediction }: { prediction: PredictionReport }) {
  return (
    <div>
      <div className="mb-5 rounded-2xl border border-border bg-surface/60 p-4 text-sm text-muted-foreground">
        <span className="mr-1.5 font-semibold text-white">Perspective :</span>
        {prediction.outlook}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {prediction.horizons.map((h) => {
          const color =
            h.trend === "up" ? "text-success" : h.trend === "down" ? "text-destructive" : "text-amber-300";
          const icon = h.trend === "up" ? "faArrowTrendUp" : h.trend === "down" ? "faArrowTrendDown" : "faGaugeHigh";
          return (
            <div
              key={h.horizon}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface/50 p-5"
            >
              <FaIcon name={icon} className={cn("h-5 w-5", color)} />
              <span className="font-heading text-3xl font-bold">{Math.round(h.probability)}%</span>
              <span className="text-xs text-muted-foreground">rentable dans {h.label}</span>
              <div className="flex w-full items-center justify-center gap-1.5">
                <span className="h-1 w-full overflow-hidden rounded-full bg-surface">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${h.confidence}%` }}
                  />
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                confiance {Math.round(h.confidence)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
