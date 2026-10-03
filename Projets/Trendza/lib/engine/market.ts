import type { Product } from "@/types/database";
import type { CountryScore, MarketAnalysis } from "@/lib/engine/types";
import { COUNTRY_FACTORS, countryFactors } from "@/lib/engine/country-data";
import { clamp, round1 } from "@/lib/engine/rng";

export type MarketAxis = {
  id: string;
  label: string;
  weight: number;
};

const AXES: MarketAxis[] = [
  { id: "demande", label: "Demande estimée", weight: 0.2 },
  { id: "concurrence", label: "Concurrence", weight: 0.15 },
  { id: "pouvoirAchat", label: "Pouvoir d'achat", weight: 0.15 },
  { id: "coutPub", label: "Coût publicitaire", weight: 0.12 },
  { id: "logistique", label: "Facilité logistique", weight: 0.12 },
  { id: "rentabilite", label: "Potentiel de rentabilité", weight: 0.16 },
  { id: "maturite", label: "Maturité du marché", weight: 0.1 },
];

function axisValues(
  factors: ReturnType<typeof countryFactors>,
  product: Product,
  pays: string,
): Record<string, number> {
  const isTarget = product.pays_cible.includes(pays);
  const demandBoost = isTarget ? 1.08 : 1;

  const demande = clamp(factors.demande * demandBoost * 100, 0, 100);
  const concurrence = clamp((1 - factors.concurrence) * 100, 0, 100);
  const pouvoirAchat = factors.pouvoirAchat * 100;
  const coutPub = clamp((1 - factors.cpc) * 100, 0, 100);
  const logistique = factors.logistique * 100;
  const maturite = factors.maturite * 100;
  const rentabilite = clamp(
    0.4 * (demande / 100) +
      0.25 * (pouvoirAchat / 100) +
      0.2 * (logistique / 100) +
      0.15 * (1 - factors.concurrence),
    0,
    1,
  ) * 100;

  return { demande, concurrence, pouvoirAchat, coutPub, logistique, rentabilite, maturite };
}

export function scoreCountry(
  code: string,
  product: Product,
): CountryScore {
  const factors = countryFactors(code);
  const values = axisValues(factors, product, code);
  const axes = AXES.map((a) => ({ id: a.id, label: a.label, value: round1(values[a.id]) }));
  const total = round1(AXES.reduce((sum, a) => sum + a.weight * values[a.id], 0));

  const strengths = axes.filter((a) => a.value >= 70).map((a) => a.label);
  const mainStrength = strengths[0] ?? axes[0].label;

  const summary = `Marché ${factors.label} : ${mainStrength} en point fort (${Math.max(...axes.map((a) => a.value)).toFixed(0)}/100).`;

  return { code, label: factors.label, total, axes, summary };
}

/** Analyse du marché du pays demandé + tableau comparatif des autres pays. */
export function analyzeMarket(
  product: Product,
  pays: string,
  compareAll = true,
): MarketAnalysis {
  const main = scoreCountry(pays, product);
  const comparison = compareAll
    ? COUNTRY_FACTORS.map((c) => scoreCountry(c.code, product))
        .filter((c) => c.code !== pays)
        .sort((a, b) => b.total - a.total)
    : [];

  return { country: main, comparison };
}
