import { cn } from "@/lib/utils";

export function Avatar({
  name,
  email,
  className,
}: {
  name?: string | null;
  email?: string | null;
  className?: string;
}) {
  const source = name?.trim() || email?.trim() || "?";
  const initials = source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-end font-heading text-sm font-semibold text-white",
        className ?? "h-9 w-9",
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
