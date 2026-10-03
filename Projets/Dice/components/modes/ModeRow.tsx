import type { ModeDef } from "@/lib/types";

/**
 * Tints :
 *  - Light mode (Pop Désir) : couleurs vives chaudes
 *  - Dark mode (Néon Noir)  : surface sombre + accent néon
 * Toutes les classes utilisent les tokens sémantiques OU des variants dark explicites.
 */
const TINTS: Record<string, string> = {
  warm:      "bg-creamDeep dark:bg-surface dark:text-ink",
  sensual:   "bg-surface text-ink",
  hot:       "bg-accent text-white dark:bg-surface dark:text-ink dark:border-accent",
  kama:      "bg-warm text-ink dark:bg-surface dark:text-ink dark:border-warm",
  crescendo:
    "bg-gradient-to-r from-accent2 to-accent text-white dark:from-surface dark:to-surface dark:text-ink",
};

export function ModeRow({ mode, onClick }: { mode: ModeDef; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 border-2 border-ink rounded-pop-lg p-3 shadow-pop hover:-translate-y-0.5 hover:shadow-pop-lg transition-all text-left ${TINTS[mode.id] ?? "bg-surface"}`}
    >
      {mode.ribbon && (
        <span className="absolute -top-2 right-3 bg-ink text-bg text-[0.55rem] font-bold px-2 py-0.5 rounded uppercase tracking-widest rotate-3">
          {mode.ribbon}
        </span>
      )}

      <div className="w-12 h-12 bg-bg border-2 border-ink rounded-full flex items-center justify-center text-2xl flex-shrink-0">
        {mode.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-display font-extrabold text-base leading-none">{mode.name}</div>
        <div className="text-[0.7rem] opacity-85 mt-1 truncate">{mode.description}</div>
        <div className="flex gap-0.5 mt-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i <= mode.intensity ? "bg-accent" : "bg-current opacity-15"
              }`}
            />
          ))}
        </div>
      </div>

      <span className="text-xl opacity-60">›</span>
    </button>
  );
}
