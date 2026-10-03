import * as React from "react";
import { Check } from "@/components/shared/icons";

import { cn } from "@/lib/utils";

/**
 * Case à cocher accessible : l'input natif reste dans le flux (focus clavier,
 * validation `required`, lecteurs d'écran) mais est masqué visuellement au
 * profit d'un carré stylé piloté par `peer-checked`.
 *
 * Le SVG est ciblé via `[&>svg]` depuis le frère direct de l'input : `peer-*`
 * ne s'applique qu'à un frère, jamais à un descendant.
 */
function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center">
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn("peer absolute inset-0 z-10 cursor-pointer opacity-0", className)}
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-md border border-border-strong bg-surface transition-all duration-200",
          "peer-checked:border-transparent peer-checked:bg-gradient-to-br peer-checked:from-primary peer-checked:to-primary-end",
          "peer-checked:[&>svg]:opacity-100",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        )}
      >
        <Check className="h-3.5 w-3.5 text-white opacity-0 transition-opacity" />
      </span>
    </span>
  );
}

export { Checkbox };
