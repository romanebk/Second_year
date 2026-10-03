import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string }>;

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "primary",
  className,
}: {
  icon: IconComponent;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "success" | "accent";
  className?: string;
}) {
  const accentStyles: Record<typeof accent, string> = {
    primary: "from-primary/25 to-primary-end/25 text-primary",
    success: "from-success/20 to-success/10 text-success",
    accent: "from-accent/20 to-accent/10 text-accent",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-5 backdrop-blur-sm transition-all duration-300",
        "hover:border-primary/30 hover:shadow-[0_0_40px_-16px_rgba(124,58,237,0.35)]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70",
          accentStyles[accent],
        )}
      />
      <div className="relative flex items-center gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
            accentStyles[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
      {hint && <p className="relative mt-3 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
