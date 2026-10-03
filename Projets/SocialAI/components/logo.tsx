import { cn } from "@/lib/utils";

/**
 * SocialAI brand mark — a geometric "broadcast spark":
 * a rose node radiating a cobalt pulse. Solid, block-based, no AI gradient.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8", className)}
      role="img"
      aria-label="SocialAI"
    >
      <rect width="32" height="32" rx="9" fill="hsl(var(--primary))" />
      <circle cx="12" cy="20" r="3.4" fill="white" />
      <path
        d="M12 20a11 11 0 0 1 11-11"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <path
        d="M12 20a7 7 0 0 1 7-7"
        stroke="hsl(var(--accent))"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="font-heading text-lg font-bold tracking-tight">
          Social<span className="text-primary">AI</span>
        </span>
      )}
    </span>
  );
}
