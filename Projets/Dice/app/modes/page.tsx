"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { MODES } from "@/lib/content/modes";
import { ModeRow } from "@/components/modes/ModeRow";
import { AppHeader } from "@/components/ui/AppHeader";
import { Pill } from "@/components/ui/Pill";
import { useMounted } from "@/lib/hooks";
import type { ModeId } from "@/lib/types";

export default function ModesPage() {
  const router = useRouter();
  const mounted = useMounted();
  const setupComplete = useGame((s) => s.setupComplete);
  const player1 = useGame((s) => s.player1);
  const startSession = useGame((s) => s.startSession);

  useEffect(() => {
    if (mounted && !setupComplete) router.replace("/");
  }, [mounted, setupComplete, router]);

  function handlePick(modeId: ModeId) {
    startSession(modeId);
    if (modeId === "kama") router.push("/kamasutra");
    else router.push("/game");
  }

  if (!mounted) return null;

  return (
    <>
      <AppHeader title="Choisis ton mode" />
      <main className="max-w-md mx-auto p-4 pb-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 mt-4">
          <Pill dot>5 modes pour 5 ambiances</Pill>
          <h1 className="display text-4xl mt-3">
            Choisis ton <em>menu</em>,<br />
            <span className="pop">{player1.name || "à toi"}</span>
          </h1>
          <p className="text-muted text-sm mt-2">Du tendre soft au franchement coquin.</p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
          className="space-y-3"
        >
          {MODES.map((m) => (
            <motion.div
              key={m.id}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            >
              <ModeRow mode={m} onClick={() => handlePick(m.id)} />
            </motion.div>
          ))}
        </motion.div>
      </main>
    </>
  );
}
