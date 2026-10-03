import type { Product } from "@/types/database";
import type { SourceId, SourceSignal } from "@/lib/engine/types";
import { fetchSource } from "@/lib/engine/sources/adapters";
import { SOURCES } from "@/lib/engine/sources/registry";
import { clamp, round1 } from "@/lib/engine/rng";

export type SignalsReport = {
  signals: SourceSignal[];
  confidence: number;
  coverage: number;
  /** Sources en échec (auth, quota, indisponibilité) : repli sur l'estimation. */
  degraded: SourceId[];
  /**
   * Sources sans connecteur temps réel actif : la valeur affichée est une
   * estimation déterministe, pas une mesure. Doit rester visible dans l'UI
   * tant que les intégrations réelles ne sont pas branchées.
   */
  simulated: SourceId[];
};

export const ALL_SOURCES = SOURCES.map((s) => s.id) as SourceId[];

/**
 * Interroge toutes les sources activées pour un produit/pays/mois.
 * Les sources indisponibles ou en panne sont exclues du calcul de
 * confiance et signalées comme "degraded" (jamais bloquant).
 */
export async function collectSignals(
  product: Product,
  pays: string,
  mois: number,
  niche?: string,
  enabledSources?: SourceId[],
): Promise<SignalsReport> {
  const ids = enabledSources && enabledSources.length ? enabledSources : ALL_SOURCES;
  const query = { product, pays, mois, niche };

  const results = await Promise.allSettled(ids.map((id) => fetchSource(id, query)));

  const signals: SourceSignal[] = [];
  const degraded: SourceId[] = [];
  const simulated: SourceId[] = [];

  results.forEach((result, index) => {
    const id = ids[index];
    if (result.status === "fulfilled") {
      signals.push(result.value.signal);
      if (result.value.mode === "degraded") degraded.push(id);
      // "degraded" est aussi une estimation : la source a échoué et on est
      // retombé sur la simulation. Les deux doivent apparaître comme non mesurés.
      if (result.value.mode !== "live") simulated.push(id);
    } else {
      degraded.push(id);
      simulated.push(id);
    }
  });

  const detected = signals.filter((s) => s.detected).length;
  const growing = signals.filter((s) => s.detected && s.growth > 0).length;
  const agreement = signals.length ? detected / signals.length : 0;
  const direction = signals.length ? growing / signals.length : 0;

  const confidence = round1(clamp(agreement * 60 + direction * 40, 0, 100));
  const coverage = round1(clamp((signals.length / ALL_SOURCES.length) * 100, 0, 100));

  return { signals, confidence, coverage, degraded, simulated };
}
