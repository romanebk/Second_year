import type { Product } from "@/types/database";
import type { CountryScore, OpportunityScore, SourceSignal, ScoreCriterion } from "@/lib/engine/types";
import { clamp, round1 } from "@/lib/engine/rng";
import type { SignalsReport } from "@/lib/engine/sources";

type CriterionDef = {
  id: string;
  label: string;
  weight: number;
};

const CRITERIA: CriterionDef[] = [
  { id: "popularite", label: "Popularité actuelle", weight: 12 },
  { id: "croissance", label: "Croissance de la demande", weight: 14 },
  { id: "saisonnalite", label: "Saisonnalité", weight: 10 },
  { id: "difficulte", label: "Facilité à vendre", weight: 8 },
  { id: "concurrence", label: "Concurrence", weight: 8 },
  { id: "marge", label: "Marge potentielle", weight: 12 },
  { id: "coutPub", label: "Coût publicitaire", weight: 8 },
  { id: "fournisseurs", label: "Qualité des fournisseurs", weight: 8 },
  { id: "viralite", label: "Potentiel de viralité", weight: 10 },
  { id: "logistique", label: "Facilité logistique", weight: 5 },
  { id: "saturation", label: "Niveau de saturation", weight: 5 },
];

function margePercent(product: Product): number {
  const match = product.marge_estimee.match(/\d+/);
  return match ? Number(match[0]) : 35;
}

function average(signals: SourceSignal[], key: "frequency" | "growth" | "velocity" | "virality"): number {
  if (!signals.length) return 0;
  const active = signals.filter((s) => s.detected);
  const pool = active.length ? active : signals;
  return pool.reduce((sum, s) => sum + s[key], 0) / pool.length;
}

/** Score d'opportunité global (0-100) à partir des 11 critères pondérés. */
export function computeOpportunityScore(
  product: Product,
  pays: string,
  mois: number,
  signalsReport: SignalsReport,
  market: CountryScore,
): OpportunityScore {
  const signals = signalsReport.signals;
  const marketAxis = (id: string) => market.axes.find((a) => a.id === id)?.value ?? 50;

  const seasonalFit =
    product.mois_pertinents.includes(mois)
      ? 100
      : product.mois_pertinents.some(
          (m) => Math.abs(m - mois) === 1 || (mois === 1 && m === 12) || (mois === 12 && m === 1),
        )
        ? 68
        : 42;

  const popularity = clamp(average(signals, "frequency") * 1.05, 0, 100);
  const growth = clamp(average(signals, "growth") + 35, 0, 100);
  const virality = clamp(average(signals, "virality"), 0, 100);

  const marge = clamp(margePercent(product), 0, 100);
  const competition = clamp(marketAxis("concurrence") * 0.85 + (100 - clamp(100 - popularity, 0, 100)) * 0.15, 0, 100);
  const saturation = clamp(marketAxis("concurrence") * 0.6 + (100 - growth) * 0.4, 0, 100);
  const coutPub = clamp(marketAxis("coutPub"), 0, 100);
  const logistique = clamp(marketAxis("logistique"), 0, 100);
  const fournisseurs = clamp(logistique * 0.7 + 25, 0, 100);
  const difficulte = clamp(
    (100 - competition) * 0.4 + coutPub * 0.3 + logistique * 0.3,
    0,
    100,
  );

  const values: Record<string, number> = {
    popularite: popularity,
    croissance: growth,
    saisonnalite: seasonalFit,
    difficulte,
    concurrence: competition,
    marge,
    coutPub,
    fournisseurs,
    viralite: virality,
    logistique,
    saturation: 100 - saturation,
  };

  const criteria: ScoreCriterion[] = CRITERIA.map((c) => ({
    id: c.id,
    label: c.label,
    weight: c.weight,
    value: round1(clamp(values[c.id], 0, 100)),
  }));

  const total = round1(
    criteria.reduce((sum, c) => sum + c.weight * (c.value / 100), 0) * 100,
  );

  const strengths = criteria.filter((c) => c.value >= 70).map((c) => c.label);
  const risks = criteria
    .filter((c) => c.value <= 45)
    .map((c) => riskPhrase(c.id, c.label));
  const recommendations = buildRecommendations(criteria, product, pays);

  const allEstimated = signalsReport.simulated.length === signals.length;

  const why = [
    `Score calculé sur 11 critères pondérés.`,
    `Le critère dominant est "${criteria[0].label}" (${criteria[0].value}/100).`,
    `Confiance des sources : ${signalsReport.confidence}% sur ${signals.length} sources ${
      allEstimated ? "évaluées (valeurs estimées, non mesurées)" : "analysées"
    }.`,
  ].join(" ");

  return {
    total,
    criteria,
    confidence: signalsReport.confidence,
    rationale: {
      why,
      strengths: strengths.length ? strengths : ["Profil équilibré, sans point faible majeur."],
      risks: risks.length ? risks : ["Aucun risque majeur détecté sur les critères analysés."],
      recommendations,
    },
  };
}

const RISK_PHRASES: Record<string, () => string> = {
  difficulte: () => `Le produit est difficile à vendre (facilité à vendre faible).`,
  concurrence: () => `Concurrence élevée sur ce marché.`,
  marge: () => `Marge potentielle limitée.`,
  coutPub: () => `Coût publicitaire élevé sur le pays ciblé.`,
  logistique: () => `Logistique compliquée pour ce marché.`,
  saturation: () => `Marché proche de la saturation.`,
  saisonnalite: () => `Hors période idéale en ce moment.`,
};

function riskPhrase(id: string, label: string): string {
  const builder = RISK_PHRASES[id];
  return builder ? builder() : `${label} en dessous de la moyenne.`;
}

function buildRecommendations(criteria: ScoreCriterion[], product: Product, pays: string): string[] {
  const recos: string[] = [];
  const byId = Object.fromEntries(criteria.map((c) => [c.id, c.value]));

  if (byId.saisonnalite < 70) {
    recos.push(
      `Décaler le lancement sur un mois idéal (${product.mois_pertinents
        .slice(0, 3)
        .join(", ")}) pour maximiser la demande.`,
    );
  }
  if (byId.concurrence < 55) {
    recos.push(`Différencier l'offre sur ${pays} : angle marketing spécifique ou bundle.`);
  }
  if (byId.coutPub < 55) {
    recos.push(`Privilégier le contenu organique (TikTok/Shorts) avant de dépenser en publicité.`);
  }
  if (byId.fournisseurs < 60) {
    recos.push(`Vérifier deux fournisseurs minimum et tester la qualité avant volume.`);
  }
  if (recos.length === 0) {
    recos.push(`Positionnement favorable : lancer rapidement pour profiter de la fenêtre de demande.`);
  }
  return recos;
}
