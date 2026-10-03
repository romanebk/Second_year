"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  emoji: string;
  left: number;
  size: number;
  delay: number;
}

const DEFAULT_EMOJIS = ["💋", "🌹", "🔥", "✨", "💖"];
const NEON_EMOJIS = ["⚡", "🔥", "💀", "💎", "✦"];

export function EmojiRain({
  trigger,
  emojis = DEFAULT_EMOJIS,
  count = 18,
  duration = 2000,
}: {
  trigger: number; // change to fire
  emojis?: string[];
  count?: number;
  duration?: number;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const ps = Array.from({ length: count }, (_, i) => ({
      id: trigger * 1000 + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      size: 1.2 + Math.random() * 1.8,
      delay: Math.random() * 400,
    }));
    setParticles(ps);
    const t = setTimeout(() => setParticles([]), duration + 500);
    return () => clearTimeout(t);
  }, [trigger, count, duration, emojis]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-fall"
          style={{
            left: `${p.left}%`,
            top: "-30px",
            fontSize: `${p.size}rem`,
            animationDelay: `${p.delay}ms`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export const RAIN_EMOJIS = { default: DEFAULT_EMOJIS, neon: NEON_EMOJIS };
