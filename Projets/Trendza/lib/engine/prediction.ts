import type { PredictionHorizon, PredictionReport } from "@/lib/engine/types";
import type { SignalsReport } from "@/lib/engine/sources";
import { averageSignals } from "@/lib/engine/sources/stats";
import { clamp, round1 } from "@/lib/engine/rng";

const HORIZONS = [
  { horizon: 30, label: "30 jours" },
  { horizon: 60, label: "60 jours" },
  { horizon: 90, label: "90 jours" },
  { horizon: 180, label: "6 mois" },
];

function seasonalBonusAtHorizon(product: { mois_pertinents: number[] }, horizonDays: number): number {
  const targetMonth = (new Date().getMonth() + 1 + Math.floor(horizonDays / 30)) % 12 || 12;
  if (product.mois_pertinents.includes(targetMonth)) return 18;
  const adjacent = product.mois_pertinents.some(
    (m) => Math.abs(m - targetMonth) === 1 || (targetMonth === 1 && m === 12) || (targetMonth === 12 && m === 1),
  );
  return adjacent ? 6 : -10;
}

/** Estimation de rentabilité future (30/60/90/180 jours) + indice de confiance. */
export function predict(product: { mois_pertinents: number[] }, signals: SignalsReport): PredictionReport {
  const growth = averageSignals(signals, "growth");
  const velocity = averageSignals(signals, "velocity");

  const horizons: PredictionHorizon[] = HORIZONS.map((h) => {
    const decay = h.horizon / 30;
    const seasonal = seasonalBonusAtHorizon(product, h.horizon);
    const momentum = growth * (1 - 0.15 * decay) + velocity * (1 - 0.3 * decay) * 0.5;

    let probability = 50 + momentum * 0.4 + seasonal * 0.5;
    probability = clamp(probability, 3, 96);
    if (growth < -25) probability = clamp(probability - 15, 3, 96);

    const trend: PredictionHorizon["trend"] =
      probability >= 62 ? "up" : probability <= 42 ? "down" : "stable";

    return {
      horizon: h.horizon,
      label: h.label,
      probability: round1(probability),
      confidence: round1(clamp(signals.confidence * (1 - decay * 0.08), 30, 98)),
      trend,
    };
  });

  const last = horizons[horizons.length - 1];
  const outlook =
    last.probability >= 60
      ? `La demande devrait rester soutenue sur 6 mois (probabilité ${last.probability}%).`
      : last.probability >= 45
        ? `La rentabilité se stabiliserait autour de ${last.probability}% sur 6 mois : surveiller la saisonnalité.`
        : `Le pic de demande est probablement passé (${last.probability}%) : viser un lancement plus court.`;

  return { horizons, outlook };
}
