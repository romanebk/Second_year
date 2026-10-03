/**
 * Informations de l'éditeur et dates des documents légaux.
 *
 * ⚠️ Les valeurs marquées `À COMPLÉTER` doivent être renseignées avant toute
 * mise en ligne publique : elles s'affichent telles quelles sur les pages
 * légales. Un seul endroit à modifier — les trois pages lisent ce fichier.
 */

export const LEGAL_PLACEHOLDER = "À COMPLÉTER";

export const COMPANY = {
  /** Nom commercial du service. */
  serviceName: "Trendza",
  /** Personne morale qui édite le service. */
  legalName: "GZP Holding",
  /** Forme juridique (SARL, SAS, SA…). */
  legalForm: LEGAL_PLACEHOLDER,
  /** Capital social. */
  capital: LEGAL_PLACEHOLDER,
  /** Numéro d'immatriculation (RCCM, RCS, SIREN…). */
  registration: LEGAL_PLACEHOLDER,
  /** Siège social. */
  address: LEGAL_PLACEHOLDER,
  /** Directeur de la publication. */
  publisher: LEGAL_PLACEHOLDER,
  /** Email de contact général. */
  email: LEGAL_PLACEHOLDER,
  /** Email dédié aux demandes relatives aux données personnelles. */
  privacyEmail: LEGAL_PLACEHOLDER,
  /** Téléphone de contact. */
  phone: LEGAL_PLACEHOLDER,
} as const;

/** Hébergeurs et sous-traitants techniques réellement utilisés par l'application. */
export const HOSTING = {
  app: {
    name: "Vercel Inc.",
    detail: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com",
  },
  data: {
    name: "Supabase, Inc.",
    detail:
      "970 Toa Payoh North #07-04, Singapour 318992 — supabase.com (base de données et authentification)",
  },
} as const;

/** Date de dernière mise à jour affichée en tête de chaque document. */
export const LEGAL_UPDATED_AT = "8 août 2026";

/**
 * Avertissement central sur la nature du service : Trendza produit des
 * suggestions, pas des garanties de résultat. Réutilisé dans les CGU, les
 * mentions légales et l'interface applicative.
 */
export const NO_GUARANTEE_NOTICE =
  "Trendza fournit des suggestions de produits et des analyses à titre informatif. " +
  "Les scores, tendances, estimations de marge et prévisions sont des indications " +
  "calculées à partir de modèles et de données de marché : ils ne constituent ni un " +
  "conseil commercial personnalisé, ni une promesse de résultat. Trendza ne garantit " +
  "aucun volume de ventes, aucun chiffre d'affaires et aucune rentabilité sur les " +
  "boutiques de ses utilisateurs. Les décisions d'achat, de prix, de stock et de " +
  "communication relèvent de la seule responsabilité de l'utilisateur.";
