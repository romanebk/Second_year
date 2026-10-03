"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SettingsDrawer } from "@/components/ui/SettingsDrawer";

export function AppHeader({
  showBack = false,
  title,
}: {
  showBack?: boolean;
  title?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b-2 border-ink/10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              className="text-2xl leading-none"
              aria-label="Retour"
            >
              ←
            </button>
          )}
          <Link href="/" className="font-fat text-lg text-accent leading-none truncate">
            dice<span className="text-accent2">désir</span>°
          </Link>
          {title && (
            <span className="hidden md:inline text-sm font-mono text-muted truncate">
              / {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {pathname !== "/" && (
            <Link href="/modes" className="hidden sm:inline text-xs font-mono text-muted hover:text-ink mr-2">
              Modes
            </Link>
          )}
          <ThemeToggle />
          <SettingsDrawer />
        </div>
      </div>
    </header>
  );
}
