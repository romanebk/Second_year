import type { Action, ModeId } from "@/lib/types";

/**
 * Actions par niveau d'intensité — pour un public adulte (18+).
 * On garde du chaud explicite mais on évite les mots les plus crus (bite/chatte/salope).
 *
 *  warm     = sensuel adulte (préliminaires assumés, baisers profonds, mains baladeuses)
 *  sensual  = très chaud (oral léger, mordillage intense, fessées)
 *  hot      = full intensité (oral profond, fessées fortes, BDSM léger)
 *
 *  Crescendo pioche progressivement dans warm → sensual → hot.
 */

export const ACTIONS_WARM: Action[] = [
  { emoji: "💋", word: "Embrasser", verb: "embrasser profondément", duration: "short" },
  { emoji: "🫦", word: "Mordiller", verb: "mordiller doucement", duration: "short" },
  { emoji: "👅", word: "Lécher", verb: "lécher lentement", duration: "medium" },
  { emoji: "💆", word: "Masser", verb: "masser sensuellement", duration: "long" },
  { emoji: "✊", word: "Empoigner", verb: "empoigner fermement", duration: "short" },
  { emoji: "👃", word: "Sentir", verb: "respirer le parfum de", duration: "short" },
  { emoji: "🌬️", word: "Souffler chaud", verb: "souffler chaud sur", duration: "short" },
  { emoji: "🤲", word: "Caresser", verb: "caresser longuement", duration: "long" },
  { emoji: "💌", word: "Chuchoter", verb: "chuchoter une envie chaude à", duration: "short" },
  { emoji: "🔥", word: "Embraser", verb: "allumer le désir en touchant", duration: "medium" },
];

export const ACTIONS_SENSUAL: Action[] = [
  { emoji: "👅", word: "Sucer", verb: "sucer doucement", duration: "long" },
  { emoji: "🫦", word: "Mordre", verb: "mordre", duration: "short" },
  { emoji: "💋", word: "Dévorer", verb: "dévorer de baisers", duration: "medium" },
  { emoji: "🤲", word: "Pétrir", verb: "pétrir et caresser", duration: "long" },
  { emoji: "👅", word: "Lécher", verb: "lécher avidement", duration: "long" },
  { emoji: "🤚", word: "Fesser", verb: "donner une fessée à", duration: "short" },
  { emoji: "✊", word: "Tirer cheveux", verb: "tirer doucement les cheveux en embrassant", duration: "short" },
  { emoji: "🔥", word: "Aspirer", verb: "aspirer", duration: "medium" },
  { emoji: "💧", word: "Mouiller", verb: "humidifier de la langue", duration: "medium" },
  { emoji: "🌹", word: "Effleurer", verb: "effleurer du bout des doigts", duration: "long" },
  { emoji: "🫦", word: "Suçoter", verb: "suçoter sans relâche", duration: "long" },
  { emoji: "👅", word: "Goûter", verb: "goûter doucement", duration: "long" },
];

export const ACTIONS_HOT: Action[] = [
  { emoji: "👅", word: "Faire l'amour\navec la langue", verb: "faire l'amour avec la langue à", duration: "xlong" },
  { emoji: "🍑", word: "Lécher", verb: "lécher profondément", duration: "long" },
  { emoji: "💦", word: "Faire jouir", verb: "faire jouir avec la bouche en s'occupant de", duration: "xlong" },
  { emoji: "🤲", word: "Branler", verb: "caresser intensément", duration: "long" },
  { emoji: "🤚", word: "Fesser fort", verb: "fesser franchement", duration: "short" },
  { emoji: "👅", word: "Sucer fort", verb: "sucer sans s'arrêter", duration: "xlong" },
  { emoji: "✊", word: "Maintenir", verb: "tenir les poignets et embrasser", duration: "medium" },
  { emoji: "🫦", word: "Aspirer fort", verb: "aspirer et mordre tour à tour", duration: "long" },
  { emoji: "🦷", word: "Mordre fort", verb: "mordre franchement (pas trop fort)", duration: "short" },
  { emoji: "🔥", word: "Téter", verb: "téter sans pitié", duration: "long" },
  { emoji: "👁️‍🗨️", word: "Bandeau", verb: "bander les yeux et caresser", duration: "xlong" },
  { emoji: "💋", word: "69", verb: "se mettre en 69 avec", duration: "xlong" },
  { emoji: "🤚", word: "Griffer", verb: "griffer doucement le dos en embrassant", duration: "medium" },
  { emoji: "🔥", word: "Chevaucher", verb: "se faire chevaucher par", duration: "xlong" },
  { emoji: "💦", word: "Mouiller", verb: "rendre fou/folle d'envie", duration: "long" },
];

export function getActionsForMode(modeId: ModeId, crescendoStep = 0): Action[] {
  if (modeId === "warm") return ACTIONS_WARM;
  if (modeId === "sensual") return [...ACTIONS_WARM.slice(2), ...ACTIONS_SENSUAL];
  if (modeId === "hot") return [...ACTIONS_SENSUAL.slice(4), ...ACTIONS_HOT];
  if (modeId === "crescendo") {
    if (crescendoStep < 3) return ACTIONS_WARM;
    if (crescendoStep < 6) return [...ACTIONS_WARM.slice(4), ...ACTIONS_SENSUAL];
    return [...ACTIONS_SENSUAL, ...ACTIONS_HOT];
  }
  return ACTIONS_WARM;
}

/** Convert duration enum to seconds. */
export function durationSeconds(d?: Action["duration"]): number {
  switch (d) {
    case "short": return 30;
    case "medium": return 60;
    case "long": return 90;
    case "xlong": return 150;
    default: return 60;
  }
}
