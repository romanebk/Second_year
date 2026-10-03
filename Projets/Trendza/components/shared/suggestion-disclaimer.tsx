import Link from "next/link";
import { Info } from "@/components/shared/icons";

import { cn } from "@/lib/utils";

/**
 * Rappel que les analyses affichées sont des suggestions, pas une promesse de
 * résultat commercial. À placer sous tout écran présentant des scores, marges
 * ou prévisions.
 */
export function SuggestionDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border border-border bg-surface/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
      <span>
        Ces analyses sont des <strong className="font-medium text-foreground">suggestions</strong>{" "}
        calculées à partir de données de marché : scores, marges et prévisions sont
        indicatifs et ne garantissent aucune vente sur votre boutique. Vérifiez toujours
        la faisabilité et la réglementation avant d&apos;engager un budget.{" "}
        <Link href="/conditions-utilisation" className="text-primary hover:underline">
          En savoir plus
        </Link>
        .
      </span>
    </p>
  );
}
