"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "@/components/shared/icons";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Avatar } from "@/components/shared/avatar";
import { FaIcon } from "@/components/shared/fa-icon";
import { AssistantChat } from "@/components/chat/assistant-chat";
import { createClient } from "@/lib/supabase/client";

const NAV_SECTIONS: {
  label: string;
  items: {
    href: string;
    label: string;
    icon: string;
    adminOnly?: boolean;
    /** Nécessite un abonnement actif : affiché avec un cadenas si non abonné. */
    premium?: boolean;
  }[];
}[] = [
  {
    label: "Explorer",
    items: [
      { href: "/catalogue", label: "Catalogue", icon: "faBoxesStacked" },
      { href: "/dashboard", label: "Tableau de bord", icon: "faChartColumn", premium: true },
      { href: "/assistant", label: "Assistant IA", icon: "faRobot", premium: true },
      { href: "/favoris", label: "Favoris", icon: "faHeart" },
      { href: "/boutiques", label: "Mes boutiques", icon: "faStore" },
    ],
  },
  {
    label: "Compte",
    items: [{ href: "/abonnement", label: "Abonnement", icon: "faCrown" }],
  },
  {
    label: "Administration",
    items: [{ href: "/admin", label: "Pilotage", icon: "faShieldHalved", adminOnly: true }],
  },
];

export function AppShell({
  children,
  userEmail,
  isAdmin,
  abonnementActif = false,
}: {
  children: React.ReactNode;
  userEmail?: string;
  isAdmin?: boolean;
  /** Purement visuel (cadenas) : le vrai contrôle est fait côté serveur. */
  abonnementActif?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = NAV_SECTIONS.flatMap((section) => section.items).filter(
    (item) => !item.adminOnly || isAdmin,
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href) ?? false;
  }
  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#121218] text-zinc-300 lg:flex">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-6 py-6 font-heading text-lg font-bold text-white"
        >
          <Logo className="h-8 w-8" />
          <Image
            src="/logos/wordmark-white.png"
            alt="Trendza"
            width={408}
            height={61}
            className="h-5 w-auto"
          />
        </Link>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3">
          {NAV_SECTIONS.map((section) => {
            const visible = section.items.filter((i) => !i.adminOnly || isAdmin);
            if (visible.length === 0) return null;
            return (
              <div key={section.label}>
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {section.label}
                </p>
                <div className="flex flex-col gap-1">
                  {visible.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-gradient-to-r from-primary/25 to-primary-end/15 text-white"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-primary to-primary-end" />
                        )}
                        <FaIcon
                          name={item.icon}
                          className={cn("h-4 w-4", active && "text-primary")}
                        />
                        {item.label}
                        {item.href === "/admin" && (
                          <FaIcon name="faWandMagicSparkles" className="ml-auto h-3.5 w-3.5 text-primary" />
                        )}
                        {item.premium && !abonnementActif && (
                          <span className="ml-auto" title="Réservé aux abonnés">
                            <FaIcon name="faLock" className="h-3 w-3 text-zinc-500" />
                            <span className="sr-only">Réservé aux abonnés</span>
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={userEmail} className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {userEmail ?? "Utilisateur"}
              </p>
              <p className="text-xs text-zinc-400">
                {isAdmin ? "Administrateur" : "Membre"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Déconnexion"
              className="shrink-0 cursor-pointer rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#121218]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/" className="flex items-center gap-2 font-heading text-base font-bold text-white">
          <Logo className="h-7 w-7" />
          <Image
            src="/logos/wordmark-white.png"
            alt="Trendza"
            width={408}
            height={61}
            className="h-4 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Pilotage admin"
              className={cn(
                "rounded-full p-2 transition-colors",
                isActive("/admin")
                  ? "bg-primary/20 text-primary"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <FaIcon name="faShieldHalved" className="h-5 w-5" />
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Déconnexion"
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="pb-24 lg:ml-64 lg:pb-8">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around gap-1 border-t border-white/10 bg-[#121218] py-2 backdrop-blur-md lg:hidden">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-12 flex-1 flex-col items-center gap-1 rounded-lg px-1.5 py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-zinc-400",
              )}
            >
              <FaIcon name={item.icon} className={cn("h-5 w-5", active && "text-primary")} />
              {item.label === "Catalogue"
                ? "Accueil"
                : item.label === "Tableau de bord"
                  ? "Dashboard"
                  : item.label === "Assistant IA"
                    ? "Assistant"
                    : item.label === "Mes boutiques"
                      ? "Boutiques"
                      : item.label}
            </Link>
          );
        })}
      </nav>

      {/* Masqué pour les non-abonnés : un widget qui refuse systématiquement
          serait frustrant. L'API reste protégée indépendamment de cet affichage. */}
      {abonnementActif && <AssistantChat />}
    </div>
  );
}
