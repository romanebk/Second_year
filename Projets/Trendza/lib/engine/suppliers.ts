import type { Product } from "@/types/database";
import type { Supplier, SupplierReport } from "@/lib/engine/types";
import { clamp, round1, seedFrom } from "@/lib/engine/rng";
import { countryFactors } from "@/lib/engine/country-data";

type SupplierTemplate = {
  id: string;
  label: string;
  plateforme: string;
  priceRatio: number;
  delaiBase: number;
  qualite: number;
  reputation: number;
  fiabilite: number;
  notes: string;
};

const TEMPLATES: SupplierTemplate[] = [
  {
    id: "aliexpress_standard",
    label: "AliExpress Standard",
    plateforme: "AliExpress",
    priceRatio: 1.0,
    delaiBase: 18,
    qualite: 62,
    reputation: 70,
    fiabilite: 68,
    notes: "Bonne couverture catalogue, délais moyens.",
  },
  {
    id: "aliexpress_choice",
    label: "AliExpress Choice",
    plateforme: "AliExpress",
    priceRatio: 1.08,
    delaiBase: 12,
    qualite: 74,
    reputation: 78,
    fiabilite: 80,
    notes: "Livraison accélérée, meilleure traçabilité.",
  },
  {
    id: "cj_dropshipping",
    label: "CJ Dropshipping",
    plateforme: "CJ Dropshipping",
    priceRatio: 1.05,
    delaiBase: 15,
    qualite: 76,
    reputation: 75,
    fiabilite: 74,
    notes: "Produits sur mesure et marquage possible.",
  },
  {
    id: "grossiste_local",
    label: "Grossiste local",
    plateforme: "Local",
    priceRatio: 1.3,
    delaiBase: 4,
    qualite: 80,
    reputation: 82,
    fiabilite: 85,
    notes: "Réactif, idéal pour tester rapidement sur place.",
  },
];

/**
 * Comparatif fournisseurs. La recommandation pondère prix, délai (ajusté à la
 * logistique du pays ciblé), qualité, réputation et fiabilité.
 */
export function compareSuppliers(product: Product, pays: string): SupplierReport {
  const rng = seedFrom("suppliers", product.id, pays);
  const logistics = countryFactors(pays).logistique;

  const suppliers: Supplier[] = TEMPLATES.map((t, i) => {
    const jitter = 0.9 + rng() * 0.2;
    const price = Math.round(product.prix_conseille * t.priceRatio * jitter);
    const delai = Math.round(t.delaiBase * (0.7 + (1 - logistics) * 0.6) + (i === 0 ? 0 : 0));
    return {
      id: t.id,
      label: t.label,
      plateforme: t.plateforme,
      prix: price,
      delai,
      qualite: round1(clamp(t.qualite * jitter, 0, 100)),
      reputation: round1(clamp(t.reputation * (0.95 + rng() * 0.1), 0, 100)),
      fiabilite: round1(clamp(t.fiabilite * (0.95 + rng() * 0.1), 0, 100)),
      notes: t.notes,
    };
  });

  const score = (s: Supplier) =>
    s.fiabilite * 0.35 +
    s.qualite * 0.25 +
    s.reputation * 0.15 +
    (1 - Math.min(s.delai, 40) / 40) * 0.15 +
    (1 - s.prix / (product.prix_conseille * 1.4)) * 0.1;

  const sorted = [...suppliers].sort((a, b) => score(b) - score(a));
  const recommended = sorted[0];

  const rationale = `Fournisseur recommandé pour ${product.categorie} sur ${pays} : ${recommended.label} (${recommended.delai} jours de livraison, fiabilité ${recommended.fiabilite}/100). ` +
    (recommended.id === "grossiste_local"
      ? "Le délai court compense le prix plus élevé pour démarrer rapidement."
      : `Bon compromis prix/délai pour la logistique de ${pays}.`);

  return { suppliers: sorted, recommendedId: recommended.id, rationale };
}
