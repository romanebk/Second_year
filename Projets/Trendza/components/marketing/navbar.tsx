"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { GlowButton } from "@/components/shared/glow-button";
import { Logo } from "@/components/shared/logo";
import { Menu, X } from "@/components/shared/icons";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#demo", label: "Démo" },
  { href: "#chiffres-cles", label: "Chiffres clés" },
];

export function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-6 pt-4 sm:px-12 lg:px-24 xl:px-32 2xl:px-40">
        <div
          className={cn(
            "pointer-events-auto flex h-16 w-full items-center justify-between rounded-full px-4 transition-all duration-300 sm:px-6",
            scrolled
              ? "border border-border bg-surface/95 shadow-[0_8px_32px_-12px_rgba(124,58,237,0.18)] backdrop-blur-xl"
              : "border border-transparent bg-surface/70 backdrop-blur-md",
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <Image
              src="/logos/wordmark.png"
              alt="Trendza"
              width={408}
              height={61}
              className="h-5 w-auto"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 font-sans text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <GlowButton href="/catalogue" className="hidden sm:inline-block" scrolled={scrolled}>
                Accéder au catalogue
              </GlowButton>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/connexion">Connexion</Link>
                </Button>
                <GlowButton href="/inscription" className="hidden sm:inline-block" scrolled={scrolled}>
                  Commencer gratuitement
                </GlowButton>
                <Button variant="gradient" size="sm" asChild className="sm:hidden">
                  <Link href="/inscription">S&apos;inscrire</Link>
                </Button>
              </>
            )}

            <button
              type="button"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-hover md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.nav
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mx-6 mt-18 rounded-2xl border border-border bg-surface p-4 shadow-xl sm:mx-12"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center rounded-xl px-4 py-3 font-sans text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {!isLoggedIn && (
                  <li className="mt-2 border-t border-border pt-2">
                    <Link
                      href="/connexion"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center rounded-xl px-4 py-3 font-sans text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                      Connexion
                    </Link>
                  </li>
                )}
              </ul>
              <div className="mt-4">
                {isLoggedIn ? (
                  <GlowButton href="/catalogue" className="w-full justify-center" scrolled={scrolled}>
                    Accéder au catalogue
                  </GlowButton>
                ) : (
                  <GlowButton href="/inscription" className="w-full justify-center" scrolled={scrolled}>
                    Commencer gratuitement
                  </GlowButton>
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
