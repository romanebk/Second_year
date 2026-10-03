import { cn } from "@/lib/utils";
import { FaIcon } from "@/components/shared/fa-icon";

export function AnalysisSection({
  id,
  icon,
  title,
  subtitle,
  children,
  className,
}: {
  id?: string;
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-3xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-end text-white">
          <FaIcon name={icon} className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
