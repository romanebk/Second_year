import type { ModeDef } from "@/lib/types";

export const MODES: ModeDef[] = [
  {
    id: "warm",
    name: "Échauffement",
    shortName: "Warm-up",
    emoji: "🌸",
    description: "Caresses douces, premiers baisers, regards complices.",
    intensity: 1,
  },
  {
    id: "sensual",
    name: "Sensuel",
    shortName: "Sensuel",
    emoji: "🍒",
    description: "La langue, les dents, la peau qui frissonne.",
    intensity: 3,
  },
  {
    id: "hot",
    name: "Sans tabou",
    shortName: "Hot",
    emoji: "💋",
    description: "Tout est permis, partout, pour tout le monde.",
    intensity: 5,
    ribbon: "Top 🔥",
  },
  {
    id: "kama",
    name: "Kamasutra",
    shortName: "Kama",
    emoji: "🪷",
    description: "Positions illustrées avec niveau de difficulté.",
    intensity: 4,
  },
  {
    id: "crescendo",
    name: "Crescendo",
    shortName: "Crescendo",
    emoji: "📈",
    description: "Le jeu monte d'un cran tout seul. Tenez bon !",
    intensity: 5,
    ribbon: "Auto ⚡",
  },
];

export function getMode(id: string): ModeDef | undefined {
  return MODES.find((m) => m.id === id);
}
