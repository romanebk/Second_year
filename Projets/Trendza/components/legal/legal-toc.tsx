"use client";

import { useEffect, useState } from "react";
import { List } from "@/components/shared/icons";

import { cn } from "@/lib/utils";
import { legalSectionId, splitSectionNumber } from "@/components/legal/legal-section-id";

/** Surligne la section légale actuellement visible (scroll spy). */
function useActiveSection(sections: string[]): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    );

    sections.forEach((title) => {
      const el = document.getElementById(legalSectionId(title));
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return active;
}

/** Sommaire latéral (desktop), sticky sous la navbar. */
export function LegalTocSidebar({ sections }: { sections: string[] }) {
  const active = useActiveSection(sections);

  return (
    <aside className="hidden lg:block" aria-label="Sommaire">
      <nav className="sticky top-24 flex flex-col gap-1">
        <p className="mb-1 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <List className="h-3.5 w-3.5" />
          Sommaire
        </p>
        {sections.map((title) => {
          const id = legalSectionId(title);
          const { number, label } = splitSectionNumber(title);
          return (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                "flex items-baseline gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                id === active
                  ? "bg-primary/10 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
              )}
            >
              {number && <span className="font-mono text-xs text-primary">{number}</span>}
              <span>{label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

/** Sommaire en bande horizontale (mobile / tablette), sticky sous la navbar. */
export function LegalTocChips({ sections }: { sections: string[] }) {
  const active = useActiveSection(sections);

  return (
    <div className="sticky top-[72px] z-30 -mx-4 mb-8 border-b border-border/50 bg-background/85 px-4 py-2 backdrop-blur-xl lg:hidden" aria-label="Sommaire">
      <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
        <div className="flex w-max gap-2">
          {sections.map((title) => {
            const id = legalSectionId(title);
            const { number, label } = splitSectionNumber(title);
            return (
              <a
                key={id}
                href={`#${id}`}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  id === active
                    ? "border-primary/40 bg-primary/15 text-foreground"
                    : "border-border bg-surface/50 text-muted-foreground hover:text-foreground",
                )}
              >
                {number && <span className="font-mono text-primary">{number}</span>}
                {label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
