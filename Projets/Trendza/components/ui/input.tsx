import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-border-strong bg-surface px-4 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground",
        "focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
