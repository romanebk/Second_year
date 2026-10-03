"use client";

import Image from "next/image";
import { useState } from "react";
import type { Position } from "@/lib/types";

export function KamaCard({ position, index, total }: { position: Position; index: number; total: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="bg-surface border-4 border-ink rounded-pop-xl p-4 md:p-6 relative overflow-hidden text-ink"
      style={{ boxShadow: "10px 10px 0 rgb(var(--warm)), 14px 14px 0 rgb(var(--ink))", transform: "rotate(1deg)" }}
    >
      {/* header */}
      <div className="flex justify-between items-center border-b-2 border-dashed border-ink/20 pb-2 mb-3">
        <span className="font-fat text-accent2 text-base">
          {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <span className="bg-warm text-ink border-2 border-ink rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest">
          Niveau {position.difficulty}
        </span>
      </div>

      {/* image */}
      <div className="aspect-[4/3] bg-warm/30 border-[3px] border-ink rounded-pop relative overflow-hidden mb-4">
        {!imgError ? (
          <Image
            src={position.imageSrc}
            alt={position.imageAlt}
            fill
            sizes="(max-width: 640px) 90vw, 400px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink/60">
            <span className="text-5xl">🪷</span>
            <span className="text-xs font-mono mt-2">Image à venir</span>
          </div>
        )}
        <span className="absolute top-2 right-2 bg-ink/85 text-bg px-2 py-0.5 rounded-full text-[0.55rem] font-bold tracking-widest uppercase backdrop-blur-sm">
          Position {index + 1}
        </span>
      </div>

      {/* name */}
      <div className="text-ink">
        <h2 className="display font-black text-3xl md:text-4xl leading-[0.95]">
          {position.name.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="italic text-accent">{position.name.split(" ").slice(-1)[0]}</span>
        </h2>
        {position.altName && (
          <span className="bg-ink text-bg inline-block px-2 py-0.5 rounded-full text-[0.55rem] font-semibold tracking-widest uppercase mt-2">
            {position.altName}
          </span>
        )}
      </div>

      <p className="text-ink/85 text-sm leading-relaxed my-3">{position.description}</p>

      {position.howTo && (
        <div className="bg-bg/60 border-l-4 border-accent rounded p-3 mb-3">
          <div className="text-[0.65rem] uppercase tracking-widest font-bold text-accent mb-1">
            Comment faire
          </div>
          <p className="text-ink/90 text-sm leading-relaxed">{position.howTo}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Stat icon="💪" label="Difficulté" value={`${position.difficulty}/5`} />
        <Stat icon="💖" label="Intimité" value={`${position.intimacy}/5`} />
        <Stat icon="⏱" label="Endurance" value={`${position.endurance}/5`} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-warm/30 border-2 border-ink rounded-pop p-2 text-center text-ink">
      <div className="text-base leading-none">{icon}</div>
      <div className="text-[0.55rem] font-bold uppercase tracking-widest mt-0.5">
        {label}
      </div>
      <div className="font-fat text-accent text-base mt-0.5">{value}</div>
    </div>
  );
}
