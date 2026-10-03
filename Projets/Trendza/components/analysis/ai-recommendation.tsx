import { FaIcon } from "@/components/shared/fa-icon";

export function AiRecommendation({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-surface/40 to-primary-end/10 p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-end text-white">
            <FaIcon name="faWandMagicSparkles" className="h-3.5 w-3.5" />
          </span>
          Recommandation IA
        </p>
        <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">{text}</p>
      </div>
    </div>
  );
}
