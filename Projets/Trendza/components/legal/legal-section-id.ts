/**
 * Helpers partagés entre les pages légales et leur sommaire : les ancres
 * sont dérivées des titres de section pour rester cohérentes (le composant
 * `LegalSection` et le sommaire utilisent la même fonction).
 */

export function legalSectionId(title: string): string {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return normalized
    .replace(/^[\d.]+[.\s]*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Sépare le numéro « 1. » du libellé d'une section légale. */
export function splitSectionNumber(title: string): { number?: string; label: string } {
  const match = title.match(/^(\d+)\.\s*(.*)$/);
  return match ? { number: match[1], label: match[2] } : { label: title };
}
