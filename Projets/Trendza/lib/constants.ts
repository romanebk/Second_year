export const COUNTRIES = [
  { code: "US", label: "États-Unis" },
  { code: "CA", label: "Canada" },
  { code: "FR", label: "France" },
  { code: "CI", label: "Côte d'Ivoire" },
  { code: "SN", label: "Sénégal" },
  { code: "CM", label: "Cameroun" },
  { code: "ML", label: "Mali" },
  { code: "BJ", label: "Bénin" },
  { code: "TG", label: "Togo" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const MONTHS = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
] as const;

export const CATEGORIES = [
  "Beauté",
  "Maison",
  "Tech",
  "Mode",
  "Sport",
  "Bébé",
  "Cuisine",
  "Bien-être",
] as const;

export type Categorie = (typeof CATEGORIES)[number];

export const NIVEAUX = [
  {
    value: "debutant",
    label: "Débutant",
    description: "Je débute dans l'e-commerce et je veux des conseils simples.",
  },
  {
    value: "pro",
    label: "Confirmé",
    description: "J'ai déjà vendu en ligne et je veux aller vite.",
  },
] as const;

export type Niveau = (typeof NIVEAUX)[number]["value"];

export const PLATEFORMES = [
  { value: "woocommerce", label: "WordPress / WooCommerce" },
  { value: "mychariow", label: "MyChariow" },
  { value: "autre", label: "Autre plateforme" },
] as const;

export type Plateforme = (typeof PLATEFORMES)[number]["value"];

export const BUDGETS = [
  { value: "faible", label: "Marge faible (< 30%)" },
  { value: "moyenne", label: "Marge moyenne (30–50%)" },
  { value: "elevee", label: "Marge élevée (> 50%)" },
] as const;

/**
 * Provenance d'un produit du catalogue. Valeur imposée par le code, jamais
 * saisie librement : elle permet de distinguer les produits saisis à la main
 * de ceux écrits par le service d'ingestion, et de les re-synchroniser sans
 * écraser le travail manuel.
 *
 * ⚠️ `pytrends` doit rester identique à la constante du service Python
 * (`services/trends-ingestion/ingest.py`).
 */
export const PRODUCT_SOURCE = {
  seed: "seed",
  manualAdmin: "manual_admin",
  csvImport: "csv_import",
  pytrends: "pytrends",
} as const;

export type ProductSource = (typeof PRODUCT_SOURCE)[keyof typeof PRODUCT_SOURCE];

/** Libellés affichés pour la provenance d'un produit. */
export const PRODUCT_SOURCE_LABELS: Record<string, string> = {
  [PRODUCT_SOURCE.seed]: "Démonstration",
  [PRODUCT_SOURCE.manualAdmin]: "Saisie manuelle",
  [PRODUCT_SOURCE.csvImport]: "Import CSV",
  [PRODUCT_SOURCE.pytrends]: "Google Trends",
};
