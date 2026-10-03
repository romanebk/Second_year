/** Lightweight, dependency-free text-matching helpers for the (LLM-free) chat NLU. */

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function tokenize(s: string): string[] {
  return normalize(s)
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    prev = curr;
  }
  return prev[b.length];
}

/** Max edit distance tolerated for a fuzzy word match, scaled by keyword length. */
function toleranceFor(length: number): number {
  if (length <= 4) return 0;
  if (length <= 7) return 1;
  return 2;
}

/**
 * True if `keyword` matches `text` (already tokenized into `words`): exact substring
 * on the normalized text for phrases (keyword contains a space or hyphen), exact or
 * fuzzy (typo-tolerant) match against individual words otherwise — so "rentabl" or
 * "tendence" still match "rentable" / "tendance".
 *
 * Set `fuzzy: false` for anything where a near-miss is worse than a missed typo —
 * e.g. country names, where "francs" (currency) is one edit from "France" and a
 * wrong country silently poisons the rest of the analysis. Exact matching still
 * costs nothing: a country typed badly enough to miss just falls back to context.
 */
export function matchesKeyword(
  text: string,
  words: string[],
  keyword: string,
  fuzzy = true,
): boolean {
  const kw = normalize(keyword);
  if (kw.includes(" ") || kw.includes("-")) {
    return normalize(text).includes(kw);
  }
  const tolerance = fuzzy ? toleranceFor(kw.length) : 0;
  return words.some((w) => {
    if (w === kw) return true;
    if (tolerance === 0) return false;
    if (Math.abs(w.length - kw.length) > tolerance) return false;
    return levenshtein(w, kw) <= tolerance;
  });
}
