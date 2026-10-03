import { cn } from "@/lib/utils";

function scoreTone(score: number) {
  if (score >= 80) return { ring: "#C026D3", text: "text-fuchsia-400" };
  if (score >= 60) return { ring: "#FB923C", text: "text-accent" };
  return { ring: "#34D399", text: "text-success" };
}

/** Small circular gauge showing a 0-100 trend score. */
export function TrendScoreBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const tone = scoreTone(score);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative flex h-11 w-11 items-center justify-center", className)}>
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth="4"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={tone.ring}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={cn("absolute text-[11px] font-semibold", tone.text)}>{score}</span>
    </div>
  );
}
