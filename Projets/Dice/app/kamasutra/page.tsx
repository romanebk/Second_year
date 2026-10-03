"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/store";
import { POSITIONS } from "@/lib/content/positions";
import { AppHeader } from "@/components/ui/AppHeader";
import { KamaCard } from "@/components/kama/KamaCard";
import { EmojiRain } from "@/components/effects/EmojiRain";
import { useMounted, useVibrate } from "@/lib/hooks";

export default function KamaPage() {
  const router = useRouter();
  const mounted = useMounted();
  const vibrate = useVibrate();

  const setupComplete = useGame((s) => s.setupComplete);
  const session = useGame((s) => s.session);
  const player1 = useGame((s) => s.player1);
  const player2 = useGame((s) => s.player2);
  const currentResult = useGame((s) => s.currentResult);
  const currentPlayerIdx = useGame((s) => s.currentPlayerIdx);
  const drawPosition = useGame((s) => s.drawPosition);
  const nextTurn = useGame((s) => s.nextTurn);
  const endSession = useGame((s) => s.endSession);
  const settings = useGame((s) => s.settings);

  const [drawing, setDrawing] = useState(false);
  const [rain, setRain] = useState(0);

  useEffect(() => {
    if (mounted && (!setupComplete || session.modeId !== "kama")) {
      router.replace("/modes");
    }
  }, [mounted, setupComplete, session.modeId, router]);

  if (!mounted || session.modeId !== "kama") return null;

  const player = currentPlayerIdx === 0 ? player1 : player2;
  const draw = currentResult && "position" in currentResult ? currentResult : null;

  function handleDraw() {
    if (drawing) return;
    if (settings.vibrationEnabled) vibrate([30, 20, 50]);
    setDrawing(true);
    drawPosition();
    setTimeout(() => {
      setDrawing(false);
      setRain((r) => r + 1);
      if (settings.vibrationEnabled) vibrate(150);
    }, 600);
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
      <AppHeader showBack title="Kamasutra" />
      <main className="max-w-md mx-auto p-4 pb-12 relative z-10">
        <div className="flex justify-center mt-2">
          <span className="inline-flex items-center gap-2 bg-warm text-ink border-2 border-ink rounded-full px-3 py-1 font-bold text-sm shadow-pop">
            🪷 Kamasutra · Tour {session.turn + 1}
          </span>
        </div>

        <motion.div
          key={`turn-${currentPlayerIdx}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-5"
        >
          <div className="text-[0.7rem] uppercase tracking-widest font-bold text-muted">
            Position pour
          </div>
          <div className="display text-3xl mt-1 italic text-accent">
            {player.name} {player.emoji} & {(currentPlayerIdx === 0 ? player2 : player1).name}
          </div>
        </motion.div>

        <div className="mt-6 relative">
          <EmojiRain trigger={rain} />
          <AnimatePresence mode="wait">
            {draw ? (
              <motion.div
                key={draw.position.id}
                initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
                style={{ perspective: 1200 }}
              >
                <KamaCard
                  position={draw.position}
                  index={POSITIONS.findIndex((p) => p.id === draw.position.id)}
                  total={POSITIONS.length}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-10"
              >
                <div className="text-6xl">🎴</div>
                <h2 className="display text-2xl mt-3">
                  Tirez votre <em>première carte</em>
                </h2>
                <p className="text-muted text-sm mt-2">
                  Une position aléatoire sera tirée parmi {POSITIONS.length} possibilités.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {!draw || drawing ? (
            <button
              type="button"
              onClick={handleDraw}
              disabled={drawing}
              className="btn-primary !text-base disabled:opacity-50"
            >
              🎴 {drawing ? "On tire..." : "Tirer une carte"}
            </button>
          ) : (
            <>
              <button type="button" onClick={handleDraw} className="btn-secondary">
                ↻ Autre
              </button>
              <button type="button" onClick={handleNext} className="btn-primary">
                On essaie ! →
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
