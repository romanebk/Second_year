import type { SeasonalityCalendar, SeasonLevel } from "@/lib/engine/types";
import { FaIcon } from "@/components/shared/fa-icon";
import { cn } from "@/lib/utils";

const LEVEL_STYLE: Record<SeasonLevel, { chip: string; label: string; icon: string }> = {
  ideal: { chip: "border-transparent bg-gradient-to-r from-primary to-primary-end text-white", label: "Période idéale", icon: "faFire" },
  good: { chip: "border-success/40 bg-success/10 text-success", label: "Bonne période", icon: "faCircleCheck" },
  medium: { chip: "border-amber-400/40 bg-amber-400/10 text-amber-300", label: "Période moyenne", icon: "faCircleInfo" },
  avoid: { chip: "border-destructive/40 bg-destructive/10 text-destructive", label: "Période à éviter", icon: "faCircleXmark" },
};

export function SeasonalityCalendar({ calendar }: { calendar: SeasonalityCalendar }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Période idéale :{" "}
          <span className="font-semibold text-foreground">{calendar.idealPeriod}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {calendar.months.map((month) => {
          const style = LEVEL_STYLE[month.level];
          return (
            <div
              key={month.mois}
              className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface/60 p-3 text-center"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {month.label}
              </span>
              <span className={cn("mt-1 flex h-8 w-8 items-center justify-center rounded-full border text-sm", style.chip)}>
                <FaIcon name={style.icon} className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] text-muted-foreground">{style.label}</span>
              {month.events.length > 0 && (
                <span className="mt-1 text-[10px] text-primary">{month.events.join(" · ")}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <FaIcon name="faCalendarDays" className="h-3.5 w-3.5 text-primary" />
          Événements commerciaux
        </h3>
        <div className="flex flex-wrap gap-2">
          {calendar.events.map((event) => (
            <span
              key={event.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs text-muted-foreground"
            >
              <FaIcon name={event.icon} className="h-3 w-3 text-primary" />
              {event.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
