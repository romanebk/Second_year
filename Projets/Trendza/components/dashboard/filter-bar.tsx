"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "@/components/shared/icons";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUDGETS, CATEGORIES } from "@/lib/constants";

export function FilterBar({
  categorie,
  budget,
}: {
  categorie?: string;
  budget?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = Boolean(categorie || budget);

  return (
    <div className="flex flex-col gap-3">
      <div className="scrollbar-none flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => updateParam("categorie", null)}
          className={cn(
            "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
            !categorie
              ? "border-transparent bg-gradient-to-r from-primary to-primary-end text-white shadow-md shadow-primary/25"
              : "border-border-strong bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => updateParam("categorie", categorie === c ? null : c)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              categorie === c
                ? "border-transparent bg-gradient-to-r from-primary to-primary-end text-white shadow-md shadow-primary/25"
                : "border-border-strong bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={budget ?? "all"} onValueChange={(v) => updateParam("budget", v === "all" ? null : v)}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Toutes marges" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes marges</SelectItem>
            {BUDGETS.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("categorie");
              params.delete("budget");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
