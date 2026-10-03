import type { AnalysisRequest, TrendzaAnalysis } from "./types";
import { collectSignals } from "./sources";
import { analyzeMarket } from "./market";
import { computeOpportunityScore } from "./scoring/opportunity";
import { analyzeCompetition } from "./competition";
import { computeFinancial, defaultFinancialInput } from "./financial";
import { buildSeasonality } from "./seasonality";
import { predict } from "./prediction";
import { compareSuppliers } from "./suppliers";
import { buildAlerts } from "./alerts";
import { buildRecommendation } from "./nlg";
import { countryLabel } from "./country-data";
import { MONTHS } from "@/lib/constants";
import { InvalidAnalysisRequestError } from "./errors";

/**
 * Pipeline d'analyse complet : un produit + un marché + une période
 * → score, sources, marché, concurrence, finances, saisonnalité,
 * prévisions, fournisseurs, alertes et recommandation IA.
 */
export async function runAnalysis(req: AnalysisRequest): Promise<TrendzaAnalysis> {
  if (!req.product) throw new InvalidAnalysisRequestError("Produit requis.");
  if (!req.pays) throw new InvalidAnalysisRequestError("Pays requis.");
  if (!req.mois || req.mois < 1 || req.mois > 12) {
    throw new InvalidAnalysisRequestError("Mois invalide (1-12).");
  }

  const { product, pays, mois, budget, niche, enabledSources } = req;

  const signals = await collectSignals(product, pays, mois, niche, enabledSources);
  const market = analyzeMarket(product, pays);
  const score = computeOpportunityScore(product, pays, mois, signals, market.country);
  const competition = analyzeCompetition(product, market.country, signals);
  const financial = computeFinancial(defaultFinancialInput(product));
  const seasonality = buildSeasonality(product);
  const prediction = predict(product, signals);
  const suppliers = compareSuppliers(product, pays);
  const alerts = buildAlerts(product, pays, mois, signals, score.total);
  const recommendation = buildRecommendation({
    product,
    paysLabel: market.country.label,
    moisLabel: MONTHS.find((m) => m.value === mois)?.label ?? String(mois),
    mois,
    budget,
    score,
    signals,
  });

  return {
    product,
    pays,
    paysLabel: countryLabel(pays),
    mois,
    moisLabel: MONTHS.find((m) => m.value === mois)?.label ?? String(mois),
    generatedAt: new Date().toISOString(),
    score,
    sources: signals,
    market,
    competition,
    seasonality,
    financial,
    prediction,
    suppliers,
    alerts,
    recommendation,
  };
}
