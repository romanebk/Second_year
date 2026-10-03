import Image from "next/image";

import { cn } from "@/lib/utils";

/** Brand mark: an upward trend arrow rising toward a spark — "Trendza". */
export function TrendMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M3.5 16.5 9 11l3.5 3.5 5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 9.5h3V13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 2.5Q21.1 3.9 22.5 4.5Q21.1 5.1 20.5 6.5Q19.9 5.1 18.5 4.5Q19.9 3.9 20.5 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Trendza logo: brand gradient tile with the trend-spark mark.
 * Size it with className (e.g. "h-8 w-8"); the mark scales automatically.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Image
        src="/logos/icon.png"
        alt="Logo Trendza"
        fill
        sizes="64px"
        className="object-contain"
        priority
      />
    </span>
  );
}
