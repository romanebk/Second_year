"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/store";
import { getMode } from "@/lib/content/modes";
import { durationSeconds } from "@/lib/content/actions";
import { AppHeader } from "@/components/ui/AppHeader";
import { Dice } from "@/components/dice/Dice";
import { Timer } from "@/components/game/Timer";
import { EmojiRain } from "@/components/effects/EmojiRain";
import { useMounted, useVibrate } from "@/lib/hooks";

function CrescendoIndicator({ step }: { step: number }) {
  // step 0–2 = warm, 3–5 = sensual, 6+ = hot
  const phase = step < 3 ? "soft" : step < 6 ? "sensuel" : "brûlure";
  const phaseEmoji = step < 3 ? "🌸" : step < 6 ? "🍒" : "🔥";
  const intensity = Math.min(5, Math.max(1, Math.floor(step / 2) + 1));
  return (
    <span className="inline-flex items-center gap-1.5 bg-warm text-ink border-2 border-ink rounded-full px-2 py-1 text-[0.7rem] font-bold">
      <span>{phaseEmoji}</span>
      <span className="uppercase tracking-widest">{phase}</span>
      <span className="font-mono opacity-60">{"●".repeat(intensity)}{"○".repeat(5 - intensity)}</span>
    </span>
  );
}

export default function GamePage() {
  const router = useRouter();
  const mounted = useMounted();
  const vibrate = useVibrate();

  const setupComplete = useGame((s) => s.setupComplete);
  const session = useGame((s) => s.session);
  const player1 = useGame((s) => s.player1);
  const player2 = useGame((s) => s.player2);
  const currentResult = useGame((s) => s.currentResult);
  const currentPlayerIdx = useGame((s) => s.currentPlayerIdx);
  const settings = useGame((s) => s.settings);
  const rollDice = useGame((s) => s.rollDice);
  const nextTurn = useGame((s) => s.nextTurn);
  const endSession = useGame((s) => s.endSession);

  const [rolling, setRolling] = useState(false);
  const [rainTrigger, setRainTrigger] = useState(0);

  useEffect(() => {
    if (mounted && (!setupComplete || !session.modeId)) router.replace("/modes");
  }, [mounted, setupComplete, session.modeId, router]);

  if (!mounted || !session.modeId) return null;

  const mode = getMode(session.modeId);
  if (!mode) return null;

  // Kama mode should redirect — safety net
  if (session.modeId === "kama") {
    router.replace("/kamasutra");
    return null;
  }

  const player = currentPlayerIdx === 0 ? player1 : player2;
  const otherPlayer = currentPlayerIdx === 0 ? player2 : player1;
  const result = currentResult && "action" in currentResult ? currentResult : null;

  function handleRoll() {
    if (rolling) return;
    if (settings.vibrationEnabled) vibrate([30, 20, 30, 20, 50]);
    setRolling(true);
    rollDice();
    setTimeout(() => {
      setRolling(false);
      setRainTrigger((t) => t + 1);
      if (settings.vibrationEnabled) vibrate(150);
    }, 1700);
  }

  function handleNext() {
    nextTurn();
  }

  function handleQuit() {
    endSession();
    router.push("/modes");
  }

  return (
    <>
      <AppHeader showBack title={mode.name} />
      <main className="max-w-md mx-auto p-4 pb-12 relative z-10">
        {/* Mode pill + turn count */}
        <div className="flex justify-center items-center gap-2 mt-2 flex-wrap">
          <span className="inline-flex items-center gap-2 bg-accent text-white border-2 border-ink rounded-full px-3 py-1 font-bold text-sm shadow-pop">
            <span>{mode.emoji}</span>
            {mode.name}
          </span>
          <span className="bg-surface border-2 border-ink rounded-full px-2 py-1 text-xs font-mono">
            T.{session.turn + 1}
          </span>
          {mode.id === "crescendo" && <CrescendoIndicator step={session.crescendoStep} />}
        </div>

        {/* Whose turn */}
        <motion.div
          key={`turn-${currentPlayerIdx}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-6"
        >
          <div className="text-[0.7rem] uppercase tracking-widest font-bold text-muted">
            À toi de jouer
          </div>
          <div className="display text-4xl md:text-5xl mt-1 italic text-accent">{player.name} {player.emoji}</div>
        </motion.div>

        {/* Dice arena */}
        <div className="relative mt-8">
          <EmojiRain trigger={rainTrigger} />
          <Dice rolling={rolling} />
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result && !rolling && (
            <motion.div
              key={`r-${result.ts}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="card mt-8 relative text-center"
            >
              <span className="stamp absolute -top-3 left-1/2 -translate-x-1/2">Action !</span>
              <div className="font-display font-extrabold text-xl md:text-2xl mt-2 text-balance leading-tight">
                <span className="italic text-accent">{result.action.verb}</span>{" "}
                <span className="underline-mustard">{result.zone.withArticle}</span>{" "}
                de {otherPlayer.name}
              </div>

              {settings.timerEnabled && (
                <div className="mt-4 flex justify-center">
                  <Timer
                    key={result.ts}
                    seconds={durationSeconds(result.action.duration)}
                    running
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-center mt-8">
          {!result || rolling ? (
            <button
              type="button"
              onClick={handleRoll}
              disabled={rolling}
              className="btn-primary !text-base disabled:opacity-50"
            >
              🎲 {rolling ? "On lance..." : "Lancer les dés"}
            </button>
          ) : (
            <>
              <button type="button" onClick={handleRoll} className="btn-secondary">
                ↻ Re-tirer
              </button>
              <button type="button" onClick={handleNext} className="btn-primary">
                Tour suivant →
              </button>
            </>
          )}
          <button type="button" onClick={handleQuit} className="btn-secondary !text-xs">
            ✕ Quitter
          </button>
        </div>
      </main>
    </>
  );
}
