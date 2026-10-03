import { cn } from "@/lib/utils";

export function ScoreGauge({
  score,
  size = 180,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - progress / 100);

  const color =
    score >= 80
      ? "stroke-[#34d399]"
      : score >= 60
        ? "stroke-[#7c3aed]"
        : score >= 45
          ? "stroke-[#fbbf24]"
          : "stroke-[#f87171]";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(color, "transition-all duration-1000 ease-out")}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-heading text-4xl font-bold">{Math.round(score)}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
