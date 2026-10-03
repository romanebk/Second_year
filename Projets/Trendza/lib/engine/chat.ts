import type { Product } from "@/types/database";
import type { ChatAnswer, ChatContext } from "@/lib/engine/types";
import { COUNTRIES, MONTHS } from "@/lib/constants";
import { runAnalysis } from "@/lib/engine/pipeline";
import { averageSignals } from "@/lib/engine/sources/stats";
import { matchesKeyword, tokenize } from "@/lib/engine/text";

type Topic =
  | "produit"
  | "tendance"
  | "concurrence"
  | "rentabilite"
  | "viral"
  | "niche"
  | "fournisseur"
  | "saison"
  | "aide"
  | "salutation";

type Timeframe = "hiver" | "ete" | "automne" | "printemps" | "noel" | "ramadan" | "rentree" | "blackfriday";

type Intent = {
  pays?: string;
  budget?: number;
  /** All matched topics, in keyword-table order — a question can carry several. */
  topics: Topic[];
  timeframe?: Timeframe;
};

// "marge" is folded into "rentabilite" (same response segment) but kept as its
// own keyword set so a question naming only marge still triggers detection.
const TOPIC_KEYWORDS: Record<Topic | "marge", string[]> = {
  produit: ["produit", "vendre", "produits", "lancer", "quoi", "koi"],
  tendance: ["tendance", "tendances", "trend", "populaire", "à la mode"],
  concurrence: ["concurrence", "concurrent", "saturé", "saturée", "compétiteur"],
  rentabilite: ["rentable", "rentabilité", "bénéfice", "profit", "marge", "bénéfices"],
  marge: ["marge"],
  viral: ["viral", "virale", "tiktok", "shorts", "réseaux"],
  niche: ["niche", "peu de concurrence", "sans concurrence"],
  fournisseur: ["fournisseur", "fournisseurs", "livraison", "délai", "aliexpress"],
  saison: ["saison", "saisonnalité", "hiver", "été", "automne", "printemps", "noël", "black friday", "ramadan", "rentrée"],
  aide: ["aide", "help", "que peux-tu", "comment ça marche", "fonctionnalités", "quoi faire"],
  salutation: ["bonjour", "bonsoir", "salut", "hello", "coucou", "hey"],
};

const TIME_KEYWORDS: Record<Timeframe, string[]> = {
  hiver: ["hiver", "janvier", "février", "décembre", "noël"],
  ete: ["été", "juin", "juillet", "août", "vacances", "soldes d'été"],
  automne: ["automne", "septembre", "octobre", "novembre", "rentrée"],
  printemps: ["printemps", "mars", "avril", "mai"],
  noel: ["noël", "noel", "cadeau"],
  ramadan: ["ramadan"],
  rentree: ["rentrée", "rentrée scolaire"],
  blackfriday: ["black friday", "blackfriday", "bf"],
};

// Demonyms and major cities, in addition to the official label — someone is far
// more likely to type "vendre au Sénégal" or "je suis ivoirien" than the ISO label alone.
const COUNTRY_ALIASES: Record<string, string[]> = {
  US: ["états-unis", "états unis", "usa", "amerique", "américain", "américaine", "new york"],
  CI: ["ivoire", "ivoirien", "ivoirienne", "abidjan"],
  SN: ["sénégalais", "sénégalaise", "dakar"],
  FR: ["français", "française", "paris", "hexagone"],
  CM: ["camerounais", "camerounaise", "douala", "yaoundé"],
  ML: ["malien", "malienne", "bamako"],
  BJ: ["béninois", "béninoise", "cotonou"],
  TG: ["togolais", "togolaise", "lomé"],
  CA: ["canadien", "canadienne", "québec", "montréal"],
};

const CURRENCY_PATTERN = "(?:fcfa|f\\s?cfa|xof|cfa|francs?|€|euros?|eur|\\$|dollars?|usd)";
const NUMBER_PATTERN = "(\\d[\\d\\s.,]*\\d|\\d)\\s*(k)?";

/**
 * Detects a budget mentioned in FCFA/XOF/CFA/francs or €/EUR, with an optional
 * "k" shorthand (e.g. "150k FCFA"), or a bare number introduced by "budget"
 * (e.g. "mon budget est de 300000"). A currency word or the word "budget" is
 * always required so an unrelated number (a month, a quantity) isn't mistaken
 * for one.
 */
function parseBudget(question: string): number | undefined {
  const q = question.toLowerCase();
  const m =
    q.match(new RegExp(`${NUMBER_PATTERN}\\s*${CURRENCY_PATTERN}`, "i")) ??
    q.match(new RegExp(`budget\\D{0,15}${NUMBER_PATTERN}`, "i")) ??
    q.match(new RegExp(`${NUMBER_PATTERN}\\D{0,15}budget`, "i"));
  if (!m) return undefined;

  const raw = m[1].replace(/[\s.,]/g, "");
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;

  return m[2] ? value * 1000 : value;
}

function detectCountry(question: string, words: string[]): string | undefined {
  // Exact matching only: a fuzzy match risks colliding with an unrelated word
  // ("francs" vs "France" at edit distance 1) and silently picking the wrong
  // country, which poisons the whole analysis downstream.
  for (const c of COUNTRIES) {
    if (matchesKeyword(question, words, c.label, false)) return c.code;
    const aliases = COUNTRY_ALIASES[c.code] ?? [];
    if (aliases.some((alias) => matchesKeyword(question, words, alias, false))) return c.code;
  }
  // A deliberate uppercase code ("CI", "SN"...) — case-sensitive so lowercase
  // French words that happen to contain the same two letters ("cadeau" for CA,
  // "ci-dessous" for CI, "chiffre" for FR) never false-match.
  for (const c of COUNTRIES) {
    if (new RegExp(`\\b${c.code}\\b`).test(question)) return c.code;
  }
  return undefined;
}

export function parseIntent(question: string): Intent {
  const words = tokenize(question);

  const pays = detectCountry(question, words);
  const budget = parseBudget(question);

  const topicSet = new Set<Topic>();
  for (const [key, keywords] of Object.entries(TOPIC_KEYWORDS) as [Topic | "marge", string[]][]) {
    if (keywords.some((kw) => matchesKeyword(question, words, kw))) {
      topicSet.add(key === "marge" ? "rentabilite" : key);
    }
  }

  let timeframe: Timeframe | undefined;
  for (const [key, keywords] of Object.entries(TIME_KEYWORDS) as [Timeframe, string[]][]) {
    if (keywords.some((kw) => matchesKeyword(question, words, kw))) {
      timeframe = key;
      break;
    }
  }

  return { pays, budget, topics: [...topicSet], timeframe };
}

const COUNTRY_MONTH_HINT: Partial<Record<Timeframe, number>> = {
  hiver: 1,
  ete: 7,
  automne: 9,
  printemps: 3,
  noel: 12,
  ramadan: 3,
  rentree: 9,
  blackfriday: 11,
};

const HELP_TEXT =
  "Je suis l'assistant Trendza : j'estime le potentiel d'un produit à partir de notre modèle " +
  "d'analyse (12 sources de tendances, actuellement estimées et non mesurées en temps réel). " +
  "Demandez-moi par exemple : « Quel produit vendre aux États-Unis avec 1 000 $ ? », " +
  "« Quel produit sera tendance cet hiver ? » ou « Quel produit est le plus rentable actuellement ? ».";

function segmentFor(
  topic: Topic,
  analysis: Awaited<ReturnType<typeof runAnalysis>>,
  avgGrowth: number,
  avgVirality: number,
): string | undefined {
  switch (topic) {
    case "tendance": {
      const total = analysis.sources.signals.length;
      const detected = analysis.sources.signals.filter((s) => s.detected).length;
      const allEstimated = analysis.sources.simulated.length === total;
      return (
        `Sur ${total} sources ${allEstimated ? "évaluées (estimations)" : "analysées"}, ` +
        `${detected} détectent ce produit. Croissance moyenne : ${Math.round(avgGrowth)}%.`
      );
    }
    case "concurrence":
      return `${analysis.competition.estimatedSellers} vendeurs estimés, saturation ${Math.round(analysis.competition.saturation)}%. ${analysis.competition.angle}`;
    case "rentabilite":
      return (
        `Marge brute estimée : ${Math.round(analysis.financial.tauxBrut)}%, marge nette ${Math.round(analysis.financial.tauxNet)}%, ` +
        `ROAS cible ${analysis.financial.roasCible.toFixed(1)}x, CPA maximal ${analysis.financial.cpaMax.toLocaleString("fr-FR")} XOF.`
      );
    case "viral":
      return `Potentiel de viralité : ${Math.round(avgVirality)}/100.`;
    case "fournisseur":
      return analysis.suppliers.rationale;
    case "saison":
      return `Période idéale : ${analysis.seasonality.idealPeriod}. Alertes : ${analysis.alerts.map((a) => a.title).join(", ") || "aucune alerte active"}.`;
    case "niche":
      return analysis.score.criteria.find((c) => c.id === "concurrence")!.value >= 60
        ? "Le créneau présente peu de concurrence : bonne fenêtre d'entrée."
        : "Le créneau devient plus concurrentiel : avancer rapidement ou différencier l'offre.";
    default:
      return undefined;
  }
}

/**
 * Répond à une question utilisateur à partir des produits et analyses Trendza.
 * Fonctionne sans LLM externe : génération de langage naturel sur les données
 * réellement analysées (score, sources, concurrence, marge, saisonnalité).
 */
export async function answerQuestion(
  question: string,
  context: ChatContext,
  products: Product[],
): Promise<ChatAnswer> {
  const intent = parseIntent(question);

  if (intent.topics.includes("salutation") && !question.includes("?") && question.trim().length < 24) {
    return { message: "Bonjour ! Je suis l'assistant Trendza. Posez-moi une question sur un produit, une tendance ou un marché, et je l'analyse pour vous." };
  }
  if (intent.topics.includes("aide") || intent.topics.includes("salutation")) {
    return { message: HELP_TEXT };
  }

  const pays = intent.pays ?? context.pays ?? "US";
  const mois =
    (intent.timeframe ? COUNTRY_MONTH_HINT[intent.timeframe] : undefined) ??
    context.mois ??
    new Date().getMonth() + 1;
  const budget = intent.budget ?? context.budget;
  const paysLabel = COUNTRIES.find((c) => c.code === pays)?.label ?? pays;
  const moisLabel = MONTHS.find((m) => m.value === mois)?.label ?? String(mois);

  const candidates = products.filter((p) => p.pays_cible.includes(pays)).slice(0, 10);
  const pool = candidates.length ? candidates : products.slice(0, 10);
  if (!pool.length) {
    return { message: `Je n'ai pas encore assez de données pour le marché ${paysLabel}. Ajoutez des produits au catalogue puis réessayez.` };
  }

  const sorted = [...pool].sort((a, b) => b.score - a.score);
  const analysis = await runAnalysis({
    product: sorted[0],
    pays,
    mois,
    budget,
  });

  const avgGrowth = averageSignals(analysis.sources, "growth");
  const avgVirality = averageSignals(analysis.sources, "virality");

  const segments: string[] = [analysis.recommendation];
  for (const topic of intent.topics) {
    const segment = segmentFor(topic, analysis, avgGrowth, avgVirality);
    if (segment) segments.push(segment);
  }

  const productRefs = sorted.slice(0, 3).map((p) => ({
    id: p.id,
    nom: p.nom,
    score: p.score,
    imageUrl: p.image_url,
    categorie: p.categorie,
  }));

  return {
    message: `${segments.join(" ")} (Contexte : ${paysLabel}, ${moisLabel}.)`,
    products: productRefs,
  };
}
