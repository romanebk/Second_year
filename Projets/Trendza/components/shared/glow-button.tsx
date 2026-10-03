import Link from "next/link";

import { cn } from "@/lib/utils";

type GlowButtonProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  /** When true, the inner background becomes violet with white text. */
  scrolled?: boolean;
};

/** Button with an animated conic-gradient "light border" — used for primary marketing CTAs. */
export function GlowButton({
  children,
  className,
  href,
  onClick,
  type = "button",
  disabled,
  scrolled = false,
}: GlowButtonProps) {
  const inner = (
    <span className="group relative inline-flex overflow-hidden rounded-full p-[1.5px]">
      <span
        className={cn(
          "absolute inset-[-1000%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,#7C3AED_0%,#C026D3_50%,#7C3AED_100%)] motion-reduce:animate-none transition-opacity duration-300",
          scrolled ? "opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium transition-colors duration-300",
          scrolled
            ? "bg-primary text-white"
            : "bg-background text-foreground group-hover:bg-surface",
        )}
      >
        {children}
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={cn("inline-block", className)}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn("cursor-pointer disabled:opacity-50", className)}
    >
      {inner}
    </button>
  );
}
