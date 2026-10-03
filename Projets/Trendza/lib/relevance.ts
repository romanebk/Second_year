import type { Product } from "@/types/database";
import { COUNTRIES, MONTHS } from "@/lib/constants";

/** Short, human-readable explanation of why a product surfaced for this country/month. */
export function explainRelevance(product: Product, pays: string, mois: number): string {
  const paysLabel = COUNTRIES.find((c) => c.code === pays)?.label ?? pays;
  const moisLabel = MONTHS.find((m) => m.value === mois)?.label ?? "";

  if (product.score >= 85) {
    return `Forte demande attendue en ${moisLabel} sur le marché ${paysLabel} — score de tendance élevé (${product.score}/100).`;
  }
  if (product.score >= 70) {
    return `Bon potentiel saisonnier en ${moisLabel} pour le marché ${paysLabel}.`;
  }
  return `Opportunité de niche pour ${paysLabel} pendant cette période de l'année.`;
}
