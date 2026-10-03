"use client";

import { useCountdown } from "@/lib/hooks";

export function Timer({
  seconds,
  running,
  onEnd,
}: {
  seconds: number;
  running: boolean;
  onEnd?: () => void;
}) {
  const remaining = useCountdown(seconds, running, onEnd);
  const pct = Math.max(0, Math.min(100, (remaining / seconds) * 100));
  const display = Math.ceil(remaining);

  return (
    <div className="inline-flex items-center gap-3 bg-warm/40 text-ink border-2 border-ink rounded-full px-4 py-1.5 font-semibold text-sm">
      <span>⏱</span>
      <span><strong className="text-ink">{display}s</strong></span>
      <div className="w-24 h-1.5 bg-ink/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
