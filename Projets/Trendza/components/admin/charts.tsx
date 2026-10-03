"use client";

import { useId } from "react";
import { motion } from "motion/react";

export type ChartPoint = { label: string; value: number };

export function AreaChart({
  data,
  height = 180,
  color = "#7C3AED",
  endColor = "#C026D3",
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
  endColor?: string;
}) {
  const id = useId();
  const W = 600;
  const H = 180;
  const pad = 12;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = (W - pad * 2) / Math.max(1, data.length - 1);

  const points = data.map((d, i) => ({
    x: pad + i * stepX,
    y: H - pad - (d.value / max) * (H - pad * 2),
    ...d,
  }));

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  const area = points.length
    ? `${line} L${points[points.length - 1].x.toFixed(2)},${H} L${points[0].x.toFixed(2)},${H} Z`
    : "";

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={endColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {area && <path d={area} fill={`url(#${id})`} />}
        {line && (
          <motion.path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        )}
        {points.map((p, i) => (
          <motion.circle
            key={`${p.label}-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.05, duration: 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BarChart({
  data,
  color = "#7C3AED",
  endColor = "#C026D3",
}: {
  data: ChartPoint[];
  color?: string;
  endColor?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Aucune donnée disponible</p>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`}>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-muted-foreground">{d.label}</span>
            <span className="font-medium tabular-nums">{d.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(to right, ${color}, ${endColor})` }}
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({
  data,
  size = 160,
  stroke = 22,
  centerLabel,
  centerSub,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<
    { label: string; value: number; color: string; dash: number; offset: number }[]
  >((acc, d) => {
    const dash = total ? (d.value / total) * circumference : 0;
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ ...d, dash, offset });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth={stroke}
          />
          {segments.map((d) => (
            <motion.circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${Math.max(d.dash - 3, 0)} ${circumference}`}
              strokeDashoffset={-d.offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold tabular-nums">{centerLabel}</span>
          {centerSub && <span className="text-xs text-muted-foreground">{centerSub}</span>}
        </div>
      </div>

      <ul className="flex flex-col gap-2.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-medium tabular-nums">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
