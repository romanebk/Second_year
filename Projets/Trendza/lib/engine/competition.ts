import type { Product } from "@/types/database";
import type { CompetitionAnalysis, CountryScore } from "@/lib/engine/types";
import type { SignalsReport } from "@/lib/engine/sources";
import { averageSignals } from "@/lib/engine/sources/stats";
import { clamp, intRange, round1, seedFrom } from "@/lib/engine/rng";

const SELLER_SCALE: Record<string, number> = {
  "Beauté": 320,
  Tech: 210,
  Mode: 380,
  Maison: 260,
  Sport: 180,
  Cuisine: 150,
  "Bien-être": 140,
  "Bébé": 130,
};

export function analyzeCompetition(
  product: Product,
  market: CountryScore,
  signals: SignalsReport,
): CompetitionAnalysis {
  const rng = seedFrom("competition", product.id, market.code);
  const marketCompetition = market.axes.find((a) => a.id === "concurrence")?.value ?? 50;
  const saturation = clamp(100 - marketCompetition, 0, 100);

  const base = SELLER_SCALE[product.categorie] ?? 200;
  const estimatedSellers = Math.max(
    15,
    Math.round(base * (saturation / 55) * (0.8 + rng() * 0.4)),
  );

  const price = product.prix_conseille;
  const min = Math.round(price * 0.72);
  const max = Math.round(price * 1.35);
  const median = Math.round(price * 0.98);

  const avgGrowth = averageSignals(signals, "growth");
  const avgVirality = averageSignals(signals, "virality");
  const averageListingQuality = clamp(48 + avgVirality * 0.3 + rng() * 8, 0, 100);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (avgVirality >= 60) strengths.push("Forte présence organique (réseaux sociaux).");
  else weaknesses.push("Faible présence organique : dépendance à la publicité payante.");

  if (avgGrowth >= 20) strengths.push("Demande en croissance, marché encore en phase d'adoption.");
  else weaknesses.push("Croissance de la demande modérée.");

  if (saturation >= 70) weaknesses.push("Nombre de vendeurs élevé, offre déjà dense.");
  else strengths.push("Marché peu saturé, fenêtre d'entrée favorable.");

  if (marketCompetition <= 40) strengths.push(`Concurrence directe limitée sur ${market.label}.`);

  const angles: Record<string, string> = {
    "Beauté": "mettre l'accent sur les ingrédients naturels et les packs découverte",
    Maison: "cibler les petits budgets et proposer des variantes de taille",
    Tech: "se différencier par la garantie et le support après-vente",
    Mode: "jouer la rareté et les éditions limitées",
    Sport: "viser les débutants avec un contenu éducatif",
    Cuisine: "proposer des sets combinés plutôt que des produits isolés",
    "Bien-être": "insister sur la preuve d'efficacité et les témoignages",
    "Bébé": "mettre en avant les normes de sécurité et la certification",
  };

  const angle = `Angle de différenciation conseillé pour ${product.categorie} sur ${market.label} : ${angles[product.categorie] ?? "un positionnement premium clarifié"} (+${intRange(rng, 12, 30)}% de valeur perçue possible).`;

  return {
    priceRange: { min, max, median },
    averageListingQuality: round1(averageListingQuality),
    estimatedSellers,
    saturation: round1(saturation),
    strengths: strengths.length ? strengths : ["Aucune force majeure identifiée."],
    weaknesses: weaknesses.length ? weaknesses : ["Aucune faiblesse majeure identifiée."],
    angle,
  };
}
