import { cn } from "@/lib/utils";

/** Discreet floating gradient blobs + grid, used behind hero/CTA sections. */
export function AnimatedGradientBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]" />
      <div className="animate-float absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
      <div
        className="animate-float absolute -top-10 right-1/4 h-96 w-96 rounded-full bg-fuchsia-400/15 blur-[130px]"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="animate-float absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-300/20 blur-[110px]"
        style={{ animationDelay: "3s" }}
      />
    </div>
  );
}
