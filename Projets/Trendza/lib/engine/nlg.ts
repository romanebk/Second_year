import type { Product } from "@/types/database";
import type { MarketAnalysis, OpportunityScore } from "@/lib/engine/types";
import { MONTHS } from "@/lib/constants";
import { averageSignals } from "@/lib/engine/sources/stats";
import type { SignalsReport } from "@/lib/engine/sources";

function formatBudget(budget?: number): string {
  if (!budget) return "";
  return `Si vous disposez d'un budget de ${budget.toLocaleString("fr-FR")} $, `;
}

/** Message de recommandation final, budgétisé et argumenté. */
export function buildRecommendation(args: {
  product: Product;
  paysLabel: string;
  moisLabel: string;
  mois: number;
  budget?: number;
  score: OpportunityScore;
  signals: SignalsReport;
}): string {
  const { product, paysLabel, moisLabel, mois, budget, score, signals } = args;

  const growth = averageSignals(signals, "growth");
  const growthPhrase =
    growth >= 45
      ? "une croissance très forte de la demande"
      : growth >= 15
        ? "une forte croissance"
        : "une croissance soutenue";

  const competitionAxis = score.criteria.find((c) => c.id === "concurrence")?.value ?? 50;
  const competitionPhrase =
    competitionAxis >= 65
      ? "une concurrence encore modérée"
      : competitionAxis >= 45
        ? "une concurrence acceptable"
        : "une concurrence élevée à surveiller";

  const margeAxis = score.criteria.find((c) => c.id === "marge")?.value ?? 50;
  const margePhrase =
    margeAxis >= 70 ? "une excellente marge estimée" : margeAxis >= 50 ? "une bonne marge estimée" : "une marge correcte";

  const idealLabels = product.mois_pertinents
    .slice(0, 2)
    .map((m) => MONTHS.find((x) => x.value === m)?.label ?? String(m))
    .join(" et ");
  const when = product.mois_pertinents.includes(mois)
    ? `Le mois de ${moisLabel} est une période idéale pour ce produit.`
    : `La période idéale reste ${idealLabels}.`;

  const budgetSentence =
    budget && budget >= 300
      ? `Avec ${budget.toLocaleString("fr-FR")} $, vous pouvez lancer une campagne structurée (contenu organique puis publicité ciblée).`
      : budget
        ? `Avec ${budget.toLocaleString("fr-FR")} $, privilégiez le contenu organique avant d'investir en publicité.`
        : `Le lancement peut démarrer dès maintenant sur le marché ${paysLabel}.`;

  return (
    `${formatBudget(budget)}ce produit représente actuellement la meilleure opportunité pour ${paysLabel}. ` +
    `Il présente ${growthPhrase}, ${competitionPhrase} et ${margePhrase}. ` +
    `${when} ${budgetSentence} ` +
    `Indice de confiance des sources : ${score.confidence}%.`
  );
}

/** Explication comparative : pourquoi un pays est plus (ou moins) intéressant. */
export function marketComparisonProse(market: MarketAnalysis): string {
  const main = market.country;
  if (!market.comparison.length) return main.summary;

  const runner = market.comparison[0];
  const mainDemand = main.axes.find((a) => a.id === "demande")?.value ?? 0;
  const runnerDemand = runner.axes.find((a) => a.id === "demande")?.value ?? 0;
  const mainCpc = main.axes.find((a) => a.id === "coutPub")?.value ?? 0;
  const runnerCpc = runner.axes.find((a) => a.id === "coutPub")?.value ?? 0;

  const diff = main.total - runner.total;
  const parts: string[] = [
    `${main.label} obtient ${main.total}/100, ${Math.abs(diff).toFixed(0)} points ${diff >= 0 ? "de plus" : "de moins"} que ${runner.label} (${runner.total}/100).`,
  ];

  if (mainDemand > runnerDemand) {
    parts.push(`La demande estimée y est supérieure (${mainDemand.toFixed(0)} vs ${runnerDemand.toFixed(0)}).`);
  }
  if (mainCpc < runnerCpc) {
    parts.push(`Le coût publicitaire moyen y est plus faible, ce qui améliore le retour sur investissement.`);
  } else if (mainCpc > runnerCpc) {
    parts.push(`Le coût publicitaire y est plus élevé : compenser par un meilleur panier moyen.`);
  }

  if (diff <= 5 && mainDemand <= runnerDemand) {
    parts.push(`L'écart est faible : ${runner.label} peut représenter une alternative intéressante avec moins de concurrence.`);
  }

  return parts.join(" ");
}

/** Courte justification "pourquoi ce score" lisible. */
export function scoreWhyText(score: OpportunityScore): string {
  const top = [...score.criteria].sort((a, b) => b.value - a.value).slice(0, 3);
  return (
    `Score ${score.total}/100. Les critères les plus contributifs : ` +
    top.map((c) => `${c.label} (${c.value}/100)`).join(", ") +
    `, pondérés par leur importance (${top[0]?.weight}% pour le premier). Confiance : ${score.confidence}%.`
  );
}
