import type { ScoreCriterion } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

function barColor(value: number) {
  if (value >= 70) return "bg-gradient-to-r from-success to-primary";
  if (value >= 45) return "bg-gradient-to-r from-primary to-primary-end";
  return "bg-gradient-to-r from-amber-500 to-destructive";
}

export function ScoreBreakdown({ criteria }: { criteria: ScoreCriterion[] }) {
  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {criteria.map((c) => (
        <div key={c.id}>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">{c.label}</span>
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{Math.round(c.value)}</span> · poids {c.weight}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className={cn("h-full rounded-full transition-all duration-700", barColor(c.value))}
              style={{ width: `${c.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
