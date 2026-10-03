export type ModeId = "warm" | "sensual" | "hot" | "kama" | "crescendo";

export interface ModeDef {
  id: ModeId;
  name: string;
  shortName: string;
  emoji: string;
  description: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  ribbon?: string;
}

export interface DieFace {
  emoji: string;
  word: string;
}

export interface Action extends DieFace {
  /** Lower form for "X doit [verb]" sentences */
  verb: string;
  /** Per-action recommended duration (used by the Timer) */
  duration?: ActionDuration;
}

export interface Zone extends DieFace {
  /** With article, e.g. "l'oreille" */
  withArticle: string;
}

export type Origin = "kama" | "africa" | "modern";

export interface Position {
  id: string;
  name: string;
  altName?: string;
  /** Short description / mood */
  description: string;
  /** Step-by-step instructions */
  howTo?: string;
  origin?: Origin;
  difficulty: 1 | 2 | 3 | 4 | 5;
  intimacy: 1 | 2 | 3 | 4 | 5;
  endurance: 1 | 2 | 3 | 4 | 5;
  imageSrc: string;
  imageAlt: string;
}

export type ActionDuration = "short" | "medium" | "long" | "xlong";

export interface Player {
  name: string;
  emoji: string;
}

export interface RollResult {
  action: Action;
  zone: Zone;
  player: Player;
  ts: number;
}

export interface PositionDraw {
  position: Position;
  player: Player;
  ts: number;
}

export interface Settings {
  timerEnabled: boolean;
  timerSeconds: number;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  use3D: boolean;
}

export interface GameSession {
  modeId: ModeId | null;
  turn: number;
  /** Used by crescendo mode to ramp intensity */
  crescendoStep: number;
  history: (RollResult | PositionDraw)[];
  startedAt: number | null;
}
