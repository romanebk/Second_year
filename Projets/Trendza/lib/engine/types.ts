import type { Product } from "@/types/database";

export type SourceId =
  | "google_trends"
  | "tiktok_trends"
  | "tiktok_shop"
  | "amazon_bestsellers"
  | "aliexpress"
  | "temu"
  | "etsy"
  | "pinterest_trends"
  | "meta_ads_library"
  | "instagram"
  | "reddit"
  | "youtube_shorts";

export type SourceStatus = "live" | "simulated" | "degraded" | "unavailable";

export type SourceDescriptor = {
  id: SourceId;
  label: string;
  icon: string;
  envKey: string;
  url: string;
  notes: string;
  status: SourceStatus;
};

export type SourceSignal = {
  source: SourceId;
  detected: boolean;
  /** 0-100 : fréquence d'apparition du produit sur la source. */
  frequency: number;
  /** -100..100 : croissance de la demande. */
  growth: number;
  /** Vitesse de croissance (dérivée normalisée). */
  velocity: number;
  /** 0-100 : niveau de viralité. */
  virality: number;
  /** Pays où le signal est observé. */
  countries: string[];
  /** Mots-clés / catégorie dominante observée. */
  category: string;
  /** Nombre d'échantillons analysés (fictif en mode simulation). */
  samples: number;
  /** Courbe simplifiée : indice 0-100 par mois (12 points). */
  trend: number[];
};

export type ScoreCriterion = {
  id: string;
  label: string;
  weight: number;
  value: number;
};

export type OpportunityScore = {
  total: number;
  criteria: ScoreCriterion[];
  confidence: number;
  rationale: {
    why: string;
    strengths: string[];
    risks: string[];
    recommendations: string[];
  };
};

export type CountryScore = {
  code: string;
  label: string;
  total: number;
  axes: { id: string; label: string; value: number }[];
  summary: string;
};

export type MarketAnalysis = {
  country: CountryScore;
  comparison: CountryScore[];
};

export type CompetitionAnalysis = {
  priceRange: { min: number; max: number; median: number };
  averageListingQuality: number;
  estimatedSellers: number;
  saturation: number;
  strengths: string[];
  weaknesses: string[];
  angle: string;
};

export type SeasonLevel = "ideal" | "good" | "medium" | "avoid";

export type SeasonalityMonth = {
  mois: number;
  label: string;
  level: SeasonLevel;
  events: string[];
};

export type CommercialEvent = {
  label: string;
  start: number;
  end: number;
  icon: string;
};

export type SeasonalityCalendar = {
  months: SeasonalityMonth[];
  events: CommercialEvent[];
  idealPeriod: string;
};

export type FinancialInput = {
  prixVente: number;
  prixAchat: number;
  transport: number;
  pub: number;
  tvaPct: number;
  commissionsPct: number;
  fraisPct: number;
};

export type FinancialPlan = {
  input: FinancialInput;
  tvaAmount: number;
  commissions: number;
  frais: number;
  coutTotal: number;
  margeBrute: number;
  margeNette: number;
  tauxBrut: number;
  tauxNet: number;
  benefice: number;
  roasCible: number;
  cpaMax: number;
  prixConseille: number;
};

export type PredictionHorizon = {
  horizon: number;
  label: string;
  probability: number;
  confidence: number;
  trend: "up" | "stable" | "down";
};

export type PredictionReport = {
  horizons: PredictionHorizon[];
  outlook: string;
};

export type Supplier = {
  id: string;
  label: string;
  plateforme: string;
  prix: number;
  delai: number;
  qualite: number;
  reputation: number;
  fiabilite: number;
  notes: string;
};

export type SupplierReport = {
  suppliers: Supplier[];
  recommendedId: string;
  rationale: string;
};

export type TrendzaAlert = {
  id: string;
  severity: "info" | "warning" | "danger" | "success";
  title: string;
  message: string;
};

export type TrendzaAnalysis = {
  product: Product;
  pays: string;
  paysLabel: string;
  mois: number;
  moisLabel: string;
  generatedAt: string;
  score: OpportunityScore;
  sources: {
    signals: SourceSignal[];
    confidence: number;
    coverage: number;
    degraded: SourceId[];
    /** Sources estimées (aucun connecteur temps réel actif). */
    simulated: SourceId[];
  };
  market: MarketAnalysis;
  competition: CompetitionAnalysis;
  seasonality: SeasonalityCalendar;
  financial: FinancialPlan;
  prediction: PredictionReport;
  suppliers: SupplierReport;
  alerts: TrendzaAlert[];
  recommendation: string;
};

export type AnalysisRequest = {
  product: Product;
  pays: string;
  mois: number;
  budget?: number;
  niche?: string;
  enabledSources?: SourceId[];
};

export type ChatContext = {
  pays?: string;
  mois?: number;
  budget?: number;
  niche?: string;
};

export type ChatAnswer = {
  message: string;
  products?: {
    id: string;
    nom: string;
    score: number;
    imageUrl: string;
    categorie: string;
  }[];
};
