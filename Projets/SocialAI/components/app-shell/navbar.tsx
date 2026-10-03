"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Plus } from "lucide-react";

import { Logo } from "@/components/logo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_ITEMS } from "./nav";
import { cn, initials } from "@/lib/utils";

type UserInfo = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function Navbar({ user }: { user: UserInfo }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Ferme le menu utilisateur à chaque changement de route.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Ferme le menu utilisateur au clic extérieur.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const fallback = initials(user.name, user.email);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        {/* Logo (à gauche) */}
        <Link href="/dashboard" className="focus-ring shrink-0 rounded-md">
          <span className="hidden sm:block">
            <Logo />
          </span>
          <span className="sm:hidden">
            <Logo showWordmark={false} />
          </span>
        </Link>

        {/* Liens de navigation — toujours visibles.
            Mobile : icône seule (l'onglet actif reste surligné).
            ≥ md : icône + libellé. */}
        <nav className="ml-1 flex flex-1 items-center gap-0.5 sm:ml-3 sm:gap-1.5 lg:gap-2">
          {NAV_ITEMS.map((item) => {
            const active = item.match?.(pathname) ?? pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors md:px-3",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions (à droite) */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link href="/posts/new" className="hidden sm:block">
            <Button size="sm" variant="accent">
              <Plus className="h-4 w-4" />
              Créer
            </Button>
          </Link>

          {/* Version compacte du bouton créer sur téléphone */}
          <Link
            href="/posts/new"
            className="sm:hidden"
            aria-label="Nouveau post"
          >
            <Button size="icon" variant="accent">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>

          <ThemeToggle />

          {/* Menu utilisateur */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="focus-ring flex items-center gap-2 rounded-full"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <Avatar
                src={user.image}
                name={user.name}
                fallback={fallback}
                size={36}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 origin-top-right rounded-lg border border-border bg-popover p-1.5 shadow-pop animate-scale-in"
              >
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold">
                    {user.name ?? "Créateur"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <div className="my-1 h-px bg-border" />
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  role="menuitem"
                >
                  Paramètres du compte
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
