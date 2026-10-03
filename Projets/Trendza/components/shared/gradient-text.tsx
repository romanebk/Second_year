import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
  animate = false,
}: {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-primary via-fuchsia-500 to-primary-end bg-clip-text text-transparent",
        animate && "bg-[length:200%_auto] animate-gradient-x",
        className,
      )}
    >
      {children}
    </span>
  );
}
