"use client";

import { useEffect, useState } from "react";
import type { Action, Zone } from "@/lib/types";

interface Props {
  actions: Action[];
  zones: Zone[];
  rolling: boolean;
  targetActionIdx: number;
  targetZoneIdx: number;
}

/**
 * CSS 3D dice fallback when WebGL is unavailable.
 */
export function DiceCSS({ actions, zones, rolling, targetActionIdx, targetZoneIdx }: Props) {
  return (
    <div className="flex justify-center items-center gap-6 md:gap-12 py-4" style={{ perspective: 1000 }}>
      <Die
        faces={actions}
        rolling={rolling}
        targetIdx={targetActionIdx}
        variant="pink"
        label="Action"
      />
      <Die
        faces={zones}
        rolling={rolling}
        targetIdx={targetZoneIdx}
        variant="yellow"
        label="Zone"
      />
    </div>
  );
}

function Die({
  faces,
  rolling,
  targetIdx,
  variant,
  label,
}: {
  faces: { emoji: string; word: string }[];
  rolling: boolean;
  targetIdx: number;
  variant: "pink" | "yellow";
  label: string;
}) {
  const [angle, setAngle] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (rolling) {
      const x = -1440 - Math.random() * 360;
      const y = -1080 - Math.random() * 360;
      const z = (Math.random() - 0.5) * 60;
      setAngle({ x, y, z });
    }
  }, [rolling, targetIdx]);

  const face = faces[targetIdx] ?? null;

  return (
    <div className="relative">
      <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-ink text-bg px-2 py-0.5 rounded-full text-[0.55rem] font-bold tracking-widest uppercase whitespace-nowrap z-10">
        {label}
      </span>
      <div
        className="w-28 h-28 md:w-36 md:h-36 relative ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: rolling
            ? `rotateX(${angle.x}deg) rotateY(${angle.y}deg) rotateZ(${angle.z}deg) translateY(-20px)`
            : `rotateX(0deg) rotateY(0deg) translateY(0)`,
          transition: rolling
            ? "transform 1700ms cubic-bezier(0.16, 1, 0.3, 1)"
            : "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <DieFace face={face} variant={variant} />
      </div>
    </div>
  );
}

function DieFace({
  face,
  variant,
}: {
  face: { emoji: string; word: string } | null;
  variant: "pink" | "yellow";
}) {
  const isPink = variant === "pink";
  // Border accent: pink uses accent (hot pink / neon pink), yellow uses accent2 (terracotta / cyan)
  return (
    <div
      className={`absolute inset-0 border-4 border-ink rounded-pop-lg flex flex-col items-center justify-center text-center p-2 ${
        isPink ? "bg-surface" : "bg-warm"
      } text-ink`}
      style={{
        boxShadow: `4px 4px 0 rgb(var(--ink)), inset 0 0 0 4px rgb(var(--${
          isPink ? "surface" : "warm"
        })), inset 0 0 0 6px rgb(var(--${isPink ? "accent" : "accent2"}))`,
      }}
    >
      {face ? (
        <>
          <div className="text-3xl md:text-4xl leading-none">{face.emoji}</div>
          <div className="font-display font-extrabold text-sm md:text-base mt-1 leading-tight">
            {face.word}
          </div>
        </>
      ) : (
        <div className="text-5xl md:text-6xl font-fat text-accent leading-none">?</div>
      )}
    </div>
  );
}
