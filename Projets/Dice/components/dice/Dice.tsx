"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { isWebGLSupported } from "@/components/dice/Dice3D";
import { DiceCSS } from "@/components/dice/DiceCSS";

// Lazy-load the heavy 3D component (saves ~150 ko if WebGL disabled)
const Dice3D = dynamic(() => import("@/components/dice/Dice3D").then((m) => m.Dice3D), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[16/10] max-h-[360px] grid place-items-center text-muted text-sm">
      Chargement…
    </div>
  ),
});

interface Props {
  rolling: boolean;
  onRollDone?: () => void;
}

/**
 * Smart wrapper: picks Dice3D (WebGL + use3D setting on) or DiceCSS otherwise.
 */
export function Dice({ rolling, onRollDone }: Props) {
  const diceActions = useGame((s) => s.diceActions);
  const diceZones = useGame((s) => s.diceZones);
  const currentActionIdx = useGame((s) => s.currentActionIdx);
  const currentZoneIdx = useGame((s) => s.currentZoneIdx);
  const use3D = useGame((s) => s.settings.use3D);

  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(isWebGLSupported());
  }, []);

  // Trigger onRollDone for CSS path (3D handles internally)
  useEffect(() => {
    if (!rolling) return;
    if (webgl && use3D) return; // 3D will call onRollDone itself
    const t = setTimeout(() => onRollDone?.(), 1750);
    return () => clearTimeout(t);
  }, [rolling, webgl, use3D, onRollDone]);

  if (webgl === null) {
    return <div className="w-full aspect-[16/10] max-h-[360px]" />;
  }

  if (webgl && use3D && diceActions.length === 6 && diceZones.length === 6) {
    return (
      <Dice3D
        actions={diceActions}
        zones={diceZones}
        rolling={rolling}
        selectedActionIdx={currentActionIdx}
        selectedZoneIdx={currentZoneIdx}
        onRollDone={onRollDone}
      />
    );
  }

  return (
    <DiceCSS
      actions={diceActions}
      zones={diceZones}
      rolling={rolling}
      targetActionIdx={currentActionIdx}
      targetZoneIdx={currentZoneIdx}
    />
  );
}
