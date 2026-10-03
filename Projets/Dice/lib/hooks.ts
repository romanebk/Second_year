"use client";

import { useEffect, useState } from "react";

export function useVibrate() {
  return (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function useCountdown(seconds: number, running: boolean, onEnd?: () => void) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    const initial = remaining;
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const rem = Math.max(0, initial - elapsed);
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(id);
        onEnd?.();
      }
    };
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return remaining;
}
