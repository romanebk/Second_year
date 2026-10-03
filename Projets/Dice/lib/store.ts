"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ModeId,
  Player,
  Settings,
  GameSession,
  RollResult,
  PositionDraw,
  Action,
  Zone,
  Position,
} from "@/lib/types";
import { getActionsForMode } from "@/lib/content/actions";
import { getZonesForMode } from "@/lib/content/zones";
import { getRandomPosition } from "@/lib/content/positions";

interface State {
  // Setup
  player1: Player;
  player2: Player;
  ageConfirmed: boolean;
  setupComplete: boolean;

  // Settings
  settings: Settings;

  // Game
  session: GameSession;
  /** 6 face values for action die (visible on the cube) */
  diceActions: Action[];
  /** 6 face values for zone die */
  diceZones: Zone[];
  /** Current pending result (after a roll, before "next") */
  currentResult: RollResult | PositionDraw | null;
  /** Indices of the faces that landed up after the last roll */
  currentActionIdx: number;
  currentZoneIdx: number;
  /** Whose turn is it (alternates) */
  currentPlayerIdx: 0 | 1;

  // Actions
  setPlayers: (p1: Player, p2: Player) => void;
  confirmAge: () => void;
  completeSetup: () => void;
  resetSetup: () => void;

  updateSettings: (s: Partial<Settings>) => void;

  startSession: (modeId: ModeId) => void;
  endSession: () => void;
  rollDice: () => { result: RollResult; actionIdx: number; zoneIdx: number };
  drawPosition: () => PositionDraw;
  nextTurn: () => void;
  clearCurrent: () => void;
  /** Reshuffle the 6 visible faces (used by Crescendo when stepping up) */
  reshuffleDice: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  timerEnabled: true,
  timerSeconds: 60,
  vibrationEnabled: true,
  soundEnabled: false,
  use3D: true,
};

const EMPTY_SESSION: GameSession = {
  modeId: null,
  turn: 0,
  crescendoStep: 0,
  history: [],
  startedAt: null,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function take6<T>(arr: T[]): T[] {
  // Take 6 distinct items, repeating if pool < 6
  if (arr.length >= 6) return shuffle(arr).slice(0, 6);
  const result: T[] = [];
  while (result.length < 6) result.push(...shuffle(arr));
  return result.slice(0, 6);
}

export const useGame = create<State>()(
  persist(
    (set, get) => ({
      player1: { name: "", emoji: "👨" },
      player2: { name: "", emoji: "👩" },
      ageConfirmed: false,
      setupComplete: false,

      settings: DEFAULT_SETTINGS,

      session: EMPTY_SESSION,
      diceActions: [],
      diceZones: [],
      currentResult: null,
      currentActionIdx: 0,
      currentZoneIdx: 0,
      currentPlayerIdx: 0,

      setPlayers: (p1, p2) => set({ player1: p1, player2: p2 }),
      confirmAge: () => set({ ageConfirmed: true }),
      completeSetup: () => {
        const { player1, player2, ageConfirmed } = get();
        if (player1.name.trim() && player2.name.trim() && ageConfirmed) {
          set({ setupComplete: true });
        }
      },
      resetSetup: () =>
        set({
          player1: { name: "", emoji: "👨" },
          player2: { name: "", emoji: "👩" },
          ageConfirmed: false,
          setupComplete: false,
          session: EMPTY_SESSION,
          diceActions: [],
          diceZones: [],
          currentResult: null,
          currentActionIdx: 0,
          currentZoneIdx: 0,
          currentPlayerIdx: 0,
        }),

      updateSettings: (s) => set({ settings: { ...get().settings, ...s } }),

      startSession: (modeId) => {
        const actions = getActionsForMode(modeId, 0);
        const zones = getZonesForMode(modeId, 0);
        set({
          session: {
            modeId,
            turn: 0,
            crescendoStep: 0,
            history: [],
            startedAt: Date.now(),
          },
          diceActions: take6(actions),
          diceZones: take6(zones),
          currentResult: null,
          currentActionIdx: 0,
          currentZoneIdx: 0,
          currentPlayerIdx: 0,
        });
      },

      endSession: () =>
        set({
          session: EMPTY_SESSION,
          diceActions: [],
          diceZones: [],
          currentResult: null,
          currentActionIdx: 0,
          currentZoneIdx: 0,
          currentPlayerIdx: 0,
        }),

      reshuffleDice: () => {
        const { session } = get();
        if (!session.modeId) return;
        const actions = getActionsForMode(session.modeId, session.crescendoStep);
        const zones = getZonesForMode(session.modeId, session.crescendoStep);
        set({ diceActions: take6(actions), diceZones: take6(zones) });
      },

      rollDice: () => {
        const state = get();
        const { session, diceActions, diceZones } = state;
        if (!session.modeId) throw new Error("No active session");

        const actionIdx = Math.floor(Math.random() * diceActions.length);
        const zoneIdx = Math.floor(Math.random() * diceZones.length);
        const action = diceActions[actionIdx];
        const zone = diceZones[zoneIdx];
        const player = state.currentPlayerIdx === 0 ? state.player1 : state.player2;

        const result: RollResult = { action, zone, player, ts: Date.now() };
        set({ currentResult: result, currentActionIdx: actionIdx, currentZoneIdx: zoneIdx });
        return { result, actionIdx, zoneIdx };
      },

      drawPosition: () => {
        const state = get();
        const { session } = state;
        if (!session.modeId) throw new Error("No active session");

        const recentIds = session.history
          .slice(-5)
          .map((h) => ("position" in h ? h.position.id : null))
          .filter((id): id is string => id !== null);

        const position: Position = getRandomPosition(recentIds);
        const player = state.currentPlayerIdx === 0 ? state.player1 : state.player2;

        const draw: PositionDraw = { position, player, ts: Date.now() };
        set({ currentResult: draw });
        return draw;
      },

      nextTurn: () => {
        const state = get();
        const { session, currentResult, currentPlayerIdx } = state;
        if (!session.modeId) return;

        const newHistory = currentResult ? [...session.history, currentResult] : session.history;
        const newTurn = session.turn + 1;
        const newCrescendoStep =
          session.modeId === "crescendo" ? Math.floor(newTurn / 2) : session.crescendoStep;

        const stepChanged = newCrescendoStep !== session.crescendoStep;

        const next: Partial<State> = {
          session: {
            ...session,
            turn: newTurn,
            crescendoStep: newCrescendoStep,
            history: newHistory,
          },
          currentResult: null,
          currentPlayerIdx: currentPlayerIdx === 0 ? 1 : 0,
        };

        if (stepChanged && session.modeId === "crescendo") {
          const actions = getActionsForMode(session.modeId, newCrescendoStep);
          const zones = getZonesForMode(session.modeId, newCrescendoStep);
          next.diceActions = take6(actions);
          next.diceZones = take6(zones);
        }

        set(next as Partial<State>);
      },

      clearCurrent: () => set({ currentResult: null }),
    }),
    {
      name: "dice-desir-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        player1: state.player1,
        player2: state.player2,
        ageConfirmed: state.ageConfirmed,
        setupComplete: state.setupComplete,
        settings: state.settings,
      }),
    }
  )
);
