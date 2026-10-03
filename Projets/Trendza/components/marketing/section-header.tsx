import { cn } from "@/lib/utils";

export function SectionHeader({
  badge,
  title,
  description,
  className,
  align = "center",
}: {
  badge?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "section-inset",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {badge && (
        <span className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3.5 py-1 font-sans text-xs font-semibold uppercase tracking-wider text-primary">
          {badge}
        </span>
      )}
      <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 font-sans text-base leading-relaxed text-muted-foreground sm:text-lg lg:mt-5">
          {description}
        </p>
      )}
    </div>
  );
}
