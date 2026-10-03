import type { Product } from "@/types/database";
import type { TrendzaAlert } from "@/lib/engine/types";
import type { SignalsReport } from "@/lib/engine/sources";
import { collectSignals } from "@/lib/engine/sources";
import { averageSignals } from "@/lib/engine/sources/stats";
import { analyzeCompetition } from "@/lib/engine/competition";
import { analyzeMarket } from "@/lib/engine/market";
import { buildAlerts } from "@/lib/engine/alerts";

export type InsightProduct = {
  product: Product;
  growth: number;
  velocity: number;
  virality: number;
  saturation: number;
};

type EnrichedWithSignals = InsightProduct & { signals: SignalsReport };

export type DashboardInsights = {
  topToday: InsightProduct[];
  topWeek: InsightProduct[];
  topMonth: InsightProduct[];
  growing: InsightProduct[];
  avoid: InsightProduct[];
  niches: { label: string; growth: number; count: number }[];
  opportunities: InsightProduct[];
  alerts: TrendzaAlert[];
};

/** Calcule les sections du tableau de bord à partir du catalogue filtré. */
export async function buildDashboardInsights(
  products: Product[],
  pays: string,
  mois: number,
): Promise<DashboardInsights> {
  const enriched: EnrichedWithSignals[] = await Promise.all(
    products.map(async (product) => {
      const signals = await collectSignals(product, pays, mois);
      const market = analyzeMarket(product, pays);
      const competition = analyzeCompetition(product, market.country, signals);
      return {
        product,
        growth: averageSignals(signals, "growth"),
        velocity: averageSignals(signals, "velocity"),
        virality: averageSignals(signals, "virality"),
        saturation: competition.saturation,
        signals,
      };
    }),
  );

  const byScore = (a: InsightProduct, b: InsightProduct) => b.product.score - a.product.score;
  const byGrowth = (a: InsightProduct, b: InsightProduct) => b.growth - a.growth;
  const byVelocity = (a: InsightProduct, b: InsightProduct) => b.velocity - a.velocity;

  const topToday = [...enriched].sort(byScore).slice(0, 5);
  const topWeek = [...enriched].sort(byVelocity).slice(0, 5);
  const topMonth = [...enriched].sort(byGrowth).slice(0, 5);
  const growing = enriched.filter((i) => i.growth >= 20).sort(byGrowth).slice(0, 5);
  const avoid = enriched.filter((i) => i.product.score < 55).sort(byScore).slice(0, 5);
  const opportunities = enriched
    .filter((i) => i.product.score >= 75 && i.saturation <= 55)
    .sort(byScore)
    .slice(0, 5);

  const niches = new Map<string, { growth: number; count: number }>();
  enriched.forEach((i) => {
    const cat = i.product.categorie;
    const entry = niches.get(cat) ?? { growth: 0, count: 0 };
    entry.growth += i.growth;
    entry.count += 1;
    niches.set(cat, entry);
  });
  const nichesList = [...niches.entries()]
    .filter(([, v]) => v.count >= 1)
    .map(([label, v]) => ({ label, growth: v.growth / v.count, count: v.count }))
    .filter((n) => n.growth >= 15)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 4);

  const alerts: TrendzaAlert[] = [];
  for (const item of enriched) {
    alerts.push(...buildAlerts(item.product, pays, mois, item.signals, item.product.score));
  }
  const severityOrder: Record<TrendzaAlert["severity"], number> = { danger: 0, warning: 1, success: 2, info: 3 };

  return {
    topToday,
    topWeek,
    topMonth,
    growing,
    avoid,
    niches: nichesList,
    opportunities,
    alerts: alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]).slice(0, 6),
  };
}
