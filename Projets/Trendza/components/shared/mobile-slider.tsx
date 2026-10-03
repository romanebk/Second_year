"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MobileSliderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Auto-scrolling horizontal carousel visible only on mobile (md:hidden).
 * On desktop the parent grid takes over.
 */
export function MobileSlider({ children, className }: MobileSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let raf: number;
    const speed = 0.4;
    let paused = false;

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };

    const tick = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onEnter, { passive: true });
    el.addEventListener("touchend", onLeave, { passive: true });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onEnter);
      el.removeEventListener("touchend", onLeave);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className={cn(
        "scrollbar-none flex gap-4 overflow-x-auto md:hidden",
        "[mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]",
        "[&>*]:min-w-[260px] [&>*]:shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
