import type { Zone, ModeId } from "@/lib/types";

/**
 * Zones par niveau d'intensité — adultes 18+.
 * On nomme directement, sans euphémisme ni vulgarité extrême.
 */

export const ZONES_WARM: Zone[] = [
  { emoji: "💋", word: "Bouche", withArticle: "la bouche" },
  { emoji: "🫦", word: "Lèvres", withArticle: "les lèvres" },
  { emoji: "👂", word: "Oreille", withArticle: "l'oreille (lobes inclus)" },
  { emoji: "🫦", word: "Cou & nuque", withArticle: "le cou et la nuque" },
  { emoji: "🦴", word: "Dos", withArticle: "tout le dos" },
  { emoji: "🤲", word: "Mains", withArticle: "les mains et les doigts" },
  { emoji: "💆", word: "Tempes", withArticle: "les tempes" },
  { emoji: "🤲", word: "Cuisses", withArticle: "les cuisses" },
  { emoji: "🦶", word: "Pieds", withArticle: "les pieds (et les orteils)" },
  { emoji: "🫶", word: "Ventre", withArticle: "le ventre" },
];

export const ZONES_SENSUAL: Zone[] = [
  { emoji: "🫦", word: "Clavicule", withArticle: "la clavicule et la base du cou" },
  { emoji: "🍒", word: "Tétons", withArticle: "les tétons" },
  { emoji: "🍒", word: "Seins", withArticle: "les seins (le contour, puis le bout)" },
  { emoji: "🍑", word: "Fesses", withArticle: "les fesses" },
  { emoji: "🍑", word: "Hanches", withArticle: "les hanches" },
  { emoji: "🦴", word: "Bas du dos", withArticle: "le bas du dos (creux des reins)" },
  { emoji: "💧", word: "Intérieur cuisses", withArticle: "l'intérieur des cuisses" },
  { emoji: "🤲", word: "Bas-ventre", withArticle: "le bas-ventre, juste au-dessus du sexe" },
  { emoji: "💆", word: "Épaules", withArticle: "les épaules et la poitrine" },
  { emoji: "💋", word: "Aine", withArticle: "le pli de l'aine" },
];

export const ZONES_HOT: Zone[] = [
  { emoji: "🍒", word: "Seins (téter)", withArticle: "les seins, sans modération" },
  { emoji: "🍑", word: "Fesses (mordre)", withArticle: "les fesses (à mordre, à empoigner)" },
  { emoji: "🌷", word: "Sexe", withArticle: "le sexe (langue, lèvres, doigts)" },
  { emoji: "💧", word: "Clitoris", withArticle: "le clitoris (très doucement, puis crescendo)" },
  { emoji: "🍆", word: "Verge", withArticle: "la verge (gland inclus)" },
  { emoji: "🫦", word: "Lèvres intimes", withArticle: "les lèvres intimes" },
  { emoji: "🌹", word: "Vulve entière", withArticle: "toute la vulve, lentement" },
  { emoji: "💋", word: "Périnée", withArticle: "le périnée (zone entre sexe et fesses)" },
  { emoji: "🤲", word: "Bourses", withArticle: "les bourses, doucement" },
  { emoji: "🔥", word: "Point G", withArticle: "le point G (à explorer du doigt)" },
  { emoji: "💦", word: "Endroit préféré", withArticle: "l'endroit qui le/la rend fou·folle" },
  { emoji: "✨", word: "Surprise totale", withArticle: "la zone qu'il/elle te dira en chuchotant" },
];

export function getZonesForMode(modeId: ModeId, crescendoStep = 0): Zone[] {
  if (modeId === "warm") return ZONES_WARM;
  if (modeId === "sensual") return [...ZONES_WARM.slice(3), ...ZONES_SENSUAL];
  if (modeId === "hot") return [...ZONES_SENSUAL.slice(3), ...ZONES_HOT];
  if (modeId === "crescendo") {
    if (crescendoStep < 3) return ZONES_WARM;
    if (crescendoStep < 6) return [...ZONES_WARM.slice(4), ...ZONES_SENSUAL];
    return [...ZONES_SENSUAL, ...ZONES_HOT];
  }
  return ZONES_WARM;
}
