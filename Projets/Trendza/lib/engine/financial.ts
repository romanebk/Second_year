import type { FinancialInput, FinancialPlan } from "@/lib/engine/types";
import { clamp, round1 } from "@/lib/engine/rng";

/**
 * Simulateur financier : calcule marges, bénéfice, ROAS cible et CPA maximal.
 * Fonction pure — utilisable côté serveur (analyse) et côté client (simulateur).
 *
 * - coût total = achat + transport + commissions + frais
 * - marge brute = prix de vente − coût total
 * - marge nette = marge brute − coût publicitaire
 * - CPA maximal = marge brute (montant max d'acquisition avant perte)
 * - ROAS cible = prix de vente / marge brute (seuil d'équilibre publicitaire)
 * - prix conseillé = prix qui assure ~30% de marge nette sur la base des coûts
 */
export function computeFinancial(input: FinancialInput): FinancialPlan {
  const tvaAmount = input.prixVente * (input.tvaPct / 100);
  const commissions = input.prixVente * (input.commissionsPct / 100);
  const frais = input.prixVente * (input.fraisPct / 100);

  const coutTotal = input.prixAchat + input.transport + commissions + frais;
  const margeBrute = input.prixVente - coutTotal;
  const margeNette = margeBrute - input.pub;

  const tauxBrut = input.prixVente > 0 ? (margeBrute / input.prixVente) * 100 : 0;
  const tauxNet = input.prixVente > 0 ? (margeNette / input.prixVente) * 100 : 0;

  const cpaMax = margeBrute;
  const roasCible = margeBrute > 0 ? input.prixVente / margeBrute : 0;

  const TARGET_NET_MARGIN = 0.3;
  const prixConseille =
    input.prixVente > 0
      ? input.prixVente
      : Math.ceil((input.prixAchat + input.transport + input.pub) / (1 - TARGET_NET_MARGIN));

  return {
    input,
    tvaAmount: round1(tvaAmount),
    commissions: round1(commissions),
    frais: round1(frais),
    coutTotal: round1(coutTotal),
    margeBrute: round1(margeBrute),
    margeNette: round1(margeNette),
    tauxBrut: round1(clamp(tauxBrut, -100, 200)),
    tauxNet: round1(clamp(tauxNet, -100, 200)),
    benefice: round1(margeNette),
    roasCible: round1(clamp(roasCible, 0, 100)),
    cpaMax: round1(clamp(cpaMax, 0, 1_000_000)),
    prixConseille,
  };
}

/** Plan financier par défaut dérivé des données produit (base du simulateur). */
export function defaultFinancialInput(product: {
  prix_conseille: number;
  marge_estimee: string;
}): FinancialInput {
  const prixVente = product.prix_conseille;
  const margeMatch = product.marge_estimee.match(/\d+/);
  const margePct = margeMatch ? Number(margeMatch[0]) : 35;

  return {
    prixVente,
    prixAchat: Math.round(prixVente * (1 - margePct / 100)),
    transport: Math.round(prixVente * 0.06),
    pub: Math.round(prixVente * 0.18),
    tvaPct: 20,
    commissionsPct: 8,
    fraisPct: 3,
  };
}
