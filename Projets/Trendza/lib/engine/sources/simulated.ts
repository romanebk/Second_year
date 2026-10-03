import type { Product } from "@/types/database";
import type { SourceId, SourceSignal } from "@/lib/engine/types";
import { CATEGORIES } from "@/lib/constants";
import { clamp, intRange, range, round1, seedFrom } from "@/lib/engine/rng";

const CATEGORY_DEMAND: Record<string, number> = {
  Beauté: 0.9,
  Tech: 0.85,
  Mode: 0.78,
  "Bien-être": 0.72,
  Maison: 0.68,
  Sport: 0.66,
  Cuisine: 0.6,
  "Bébé": 0.58,
};

const CATEGORY_VIRALITY: Record<string, number> = {
  Mode: 0.85,
  Beauté: 0.8,
  "Bien-être": 0.65,
  "Bébé": 0.6,
  Maison: 0.55,
  Cuisine: 0.5,
  Sport: 0.7,
  Tech: 0.75,
};

const SOURCE_BIAS: Record<SourceId, { bias: number; growth: number; threshold: number }> = {
  google_trends: { bias: 0, growth: 0, threshold: 18 },
  tiktok_trends: { bias: 6, growth: 6, threshold: 12 },
  tiktok_shop: { bias: 2, growth: 4, threshold: 16 },
  amazon_bestsellers: { bias: 4, growth: -3, threshold: 20 },
  aliexpress: { bias: 3, growth: 1, threshold: 18 },
  temu: { bias: 5, growth: 5, threshold: 15 },
  etsy: { bias: -2, growth: 2, threshold: 22 },
  pinterest_trends: { bias: 1, growth: 4, threshold: 16 },
  meta_ads_library: { bias: -3, growth: -1, threshold: 24 },
  instagram: { bias: 4, growth: 5, threshold: 14 },
  reddit: { bias: -4, growth: -2, threshold: 26 },
  youtube_shorts: { bias: 5, growth: 6, threshold: 14 },
};

/**
 * Génère un signal simulé mais déterministe pour une source.
 * La simulation est corrélée au score produit, à la catégorie et à la saison,
 * de façon à ce que les sources concordent de manière crédible.
 */
export function simulatedSignal(
  source: SourceId,
  product: Product,
  pays: string,
  mois: number,
  niche?: string,
): SourceSignal {
  const rng = seedFrom("signal", source, product.id, pays, mois, niche ?? "");
  const cfg = SOURCE_BIAS[source];

  const productDemand = clamp(product.score / 100, 0, 1);
  const seasonal = product.mois_pertinents.includes(mois)
    ? 1
    : product.mois_pertinents.some((m) => Math.abs(m - mois) === 1 || (mois === 1 && m === 12) || (mois === 12 && m === 1))
      ? 0.68
      : 0.42;
  const catDemand = CATEGORY_DEMAND[product.categorie] ?? 0.6;
  const baseDemand = clamp(0.5 * productDemand + 0.28 * seasonal + 0.22 * catDemand, 0.05, 0.98);

  const frequency = clamp(baseDemand * 100 + cfg.bias + range(rng, -6, 6), 1, 100);
  const growth = clamp(
    (baseDemand - 0.38) * 160 + cfg.growth + range(rng, -10, 10),
    -70,
    85,
  );
  const velocity = clamp(growth * 0.62 + range(rng, -8, 8), -55, 80);
  const viralBase = CATEGORY_VIRALITY[product.categorie] ?? 0.6;
  const virality = clamp(productDemand * 55 + viralBase * 35 + range(rng, -8, 8), 5, 98);

  const detected = frequency >= cfg.threshold;

  const paysCibles = product.pays_cible.length ? product.pays_cible : [pays];
  const countryBoost = paysCibles.includes(pays);
  const countries = detected
    ? (countryBoost ? [...new Set([pays, ...paysCibles])] : paysCibles).slice(0, 4)
    : [];

  const trend: number[] = [];
  for (let m = 1; m <= 12; m++) {
    const seasonalM = product.mois_pertinents.includes(m)
      ? 1
      : product.mois_pertinents.some((x) => Math.abs(x - m) === 1 || (m === 1 && x === 12) || (m === 12 && x === 1))
        ? 0.7
        : 0.45;
    trend.push(clamp(Math.round(baseDemand * 100 * seasonalM + cfg.bias * 0.5 + range(rng, -4, 4)), 2, 100));
  }

  return {
    source,
    detected,
    frequency: round1(frequency),
    growth: round1(growth),
    velocity: round1(velocity),
    virality: round1(virality),
    countries,
    category: product.categorie,
    samples: intRange(rng, 200, 5000),
    trend,
  };
}

export function simulatedCatalogSignal(
  source: SourceId,
  query: string,
  seed: string,
): { frequency: number; growth: number; virality: number } {
  const rng = seedFrom("catalog", source, query, seed);
  return {
    frequency: round1(range(rng, 12, 96)),
    growth: round1(range(rng, -30, 70)),
    virality: round1(range(rng, 10, 90)),
  };
}

export function fallbackCategory(): string {
  return CATEGORIES[0];
}
