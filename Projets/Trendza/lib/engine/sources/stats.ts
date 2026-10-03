import type { SourceSignal } from "@/lib/engine/types";
import type { SignalsReport } from "@/lib/engine/sources";

/** Moyenne d'une métrique sur les signaux détectés (repli : tous les signaux). */
export function averageSignals(
  report: SignalsReport,
  key: "frequency" | "growth" | "velocity" | "virality",
): number {
  const signals = report.signals;
  if (!signals.length) return 0;
  const active = signals.filter((s) => s.detected);
  const pool: SourceSignal[] = active.length ? active : signals;
  return pool.reduce((sum, s) => sum + s[key], 0) / pool.length;
}

/** Nombre de sources concordantes (signal détecté + croissance positive). */
export function concordantCount(report: SignalsReport): number {
  return report.signals.filter((s) => s.detected && s.growth > 0).length;
}
