import { CATEGORIES, COUNTRIES, PRODUCT_SOURCE } from "@/lib/constants";
import type { ProductInput } from "@/lib/data/admin";

/**
 * Parseur CSV conforme RFC 4180 (guillemets, virgules et sauts de ligne à
 * l'intérieur d'un champ, guillemet échappé par doublement, CRLF).
 * Écrit à la main plutôt qu'ajouter une dépendance : les descriptions produit
 * contiennent des virgules, un `split(",")` corromprait les données.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Retire le BOM que produisent Excel et Google Sheets.
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      // Un CRLF ne doit clore la ligne qu'une seule fois.
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Dernière ligne sans saut final.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

/** Colonnes acceptées dans le CSV. `requis` bloque l'import si absente/vide. */
export const CSV_COLUMNS = [
  { key: "nom", label: "nom", requis: true },
  { key: "description", label: "description", requis: true },
  { key: "categorie", label: "categorie", requis: true },
  { key: "image_url", label: "image_url", requis: true },
  { key: "score", label: "score", requis: true },
  { key: "pays_cible", label: "pays_cible", requis: false },
  { key: "mois_pertinents", label: "mois_pertinents", requis: false },
  { key: "prix_conseille", label: "prix_conseille", requis: false },
  { key: "marge_estimee", label: "marge_estimee", requis: false },
  { key: "public_cible", label: "public_cible", requis: false },
  { key: "arguments_vente", label: "arguments_vente", requis: false },
  { key: "angles_marketing", label: "angles_marketing", requis: false },
] as const;

export const CSV_TEMPLATE_HEADER = CSV_COLUMNS.map((c) => c.label).join(",");

export const CSV_TEMPLATE = [
  CSV_TEMPLATE_HEADER,
  [
    "Brasero pliable en acier",
    '"Brasero compact et pliable, idéal pour les soirées fraîches."',
    "Maison",
    "https://exemple.com/brasero.jpg",
    "92",
    '"CI|SN|FR"',
    '"11|12|1"',
    "29900",
    "45%",
    "Familles",
    '"Se plie à plat|Acier robuste"',
    '"Soirées de fin d\'année"',
  ].join(","),
].join("\n");

export type CsvRowError = { ligne: number; champ: string; message: string };

export type CsvParseResult = {
  produits: ProductInput[];
  erreurs: CsvRowError[];
  /** Colonnes du fichier ignorées car inconnues. */
  colonnesIgnorees: string[];
};

/** Découpe une liste multi-valeurs : « CI|SN » ou « CI;SN » ou « CI,SN ». */
function splitList(value: string): string[] {
  return value
    .split(/[|;,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

const VALID_COUNTRIES = new Set<string>(COUNTRIES.map((c) => c.code));
const VALID_CATEGORIES = new Set<string>(CATEGORIES);

/**
 * Valide et convertit les lignes CSV en produits prêts à insérer.
 * Une ligne invalide n'interrompt pas l'import : elle est reportée dans
 * `erreurs` et exclue, pour qu'un fichier de 200 lignes ne soit pas rejeté
 * en bloc à cause d'une seule coquille.
 */
export function csvToProducts(text: string): CsvParseResult {
  const rows = parseCsv(text);
  const erreurs: CsvRowError[] = [];

  if (rows.length === 0) {
    return { produits: [], erreurs: [{ ligne: 0, champ: "fichier", message: "Fichier vide." }], colonnesIgnorees: [] };
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const known = new Set<string>(CSV_COLUMNS.map((c) => c.label));
  const colonnesIgnorees = header.filter((h) => h && !known.has(h));

  const missing = CSV_COLUMNS.filter((c) => c.requis && !header.includes(c.label));
  if (missing.length > 0) {
    return {
      produits: [],
      erreurs: [
        {
          ligne: 1,
          champ: "en-tête",
          message: `Colonnes obligatoires manquantes : ${missing.map((m) => m.label).join(", ")}.`,
        },
      ],
      colonnesIgnorees,
    };
  }

  const index = (name: string) => header.indexOf(name);
  const produits: ProductInput[] = [];

  rows.slice(1).forEach((row, i) => {
    // +2 : l'utilisateur compte à partir de 1 et la ligne 1 est l'en-tête.
    const ligne = i + 2;
    const get = (name: string) => {
      const idx = index(name);
      return idx === -1 ? "" : (row[idx] ?? "").trim();
    };
    const rowErrors: CsvRowError[] = [];

    const nom = get("nom");
    const description = get("description");
    const categorie = get("categorie");
    const imageUrl = get("image_url");
    const scoreRaw = get("score");

    if (!nom) rowErrors.push({ ligne, champ: "nom", message: "Nom manquant." });
    if (!description) rowErrors.push({ ligne, champ: "description", message: "Description manquante." });

    if (!categorie) {
      rowErrors.push({ ligne, champ: "categorie", message: "Catégorie manquante." });
    } else if (!VALID_CATEGORIES.has(categorie)) {
      rowErrors.push({
        ligne,
        champ: "categorie",
        message: `Catégorie inconnue « ${categorie} ». Valeurs acceptées : ${CATEGORIES.join(", ")}.`,
      });
    }

    if (!imageUrl) {
      rowErrors.push({ ligne, champ: "image_url", message: "URL d'image manquante." });
    } else if (!/^https?:\/\//i.test(imageUrl)) {
      rowErrors.push({ ligne, champ: "image_url", message: "L'URL doit commencer par http:// ou https://." });
    }

    const score = Number(scoreRaw);
    if (!scoreRaw) {
      rowErrors.push({ ligne, champ: "score", message: "Score manquant." });
    } else if (!Number.isFinite(score) || score < 0 || score > 100) {
      rowErrors.push({ ligne, champ: "score", message: `Score invalide « ${scoreRaw} » (attendu : 0 à 100).` });
    }

    const paysRaw = splitList(get("pays_cible")).map((p) => p.toUpperCase());
    const paysInconnus = paysRaw.filter((p) => !VALID_COUNTRIES.has(p));
    if (paysInconnus.length > 0) {
      rowErrors.push({
        ligne,
        champ: "pays_cible",
        message: `Code pays inconnu : ${paysInconnus.join(", ")}. Attendu : ${[...VALID_COUNTRIES].join(", ")}.`,
      });
    }

    const moisRaw = splitList(get("mois_pertinents")).map(Number);
    const moisInvalides = moisRaw.filter((m) => !Number.isInteger(m) || m < 1 || m > 12);
    if (moisInvalides.length > 0) {
      rowErrors.push({
        ligne,
        champ: "mois_pertinents",
        message: "Mois invalide (attendu : nombres de 1 à 12).",
      });
    }

    const prixRaw = get("prix_conseille");
    const prix = prixRaw ? Number(prixRaw.replace(/[\s.]/g, "").replace(",", ".")) : 0;
    if (prixRaw && !Number.isFinite(prix)) {
      rowErrors.push({ ligne, champ: "prix_conseille", message: `Prix invalide « ${prixRaw} ».` });
    }

    if (rowErrors.length > 0) {
      erreurs.push(...rowErrors);
      return;
    }

    produits.push({
      nom,
      description,
      categorie,
      image_url: imageUrl,
      prix_conseille: Number.isFinite(prix) ? prix : 0,
      marge_estimee: get("marge_estimee"),
      score: Math.round(score),
      pays_cible: paysRaw,
      mois_pertinents: moisRaw,
      public_cible: get("public_cible"),
      arguments_vente: splitList(get("arguments_vente")),
      angles_marketing: splitList(get("angles_marketing")),
      source: PRODUCT_SOURCE.csvImport,
    });
  });

  return { produits, erreurs, colonnesIgnorees };
}
