import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlatformIcon } from "@/components/platform-icon";

import "./auth-background.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="brand-mesh relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 sm:px-8">
      {/* Décor de fond animé (orbes + grille + icônes flottantes) */}
      <div className="auth-bg" aria-hidden>
        <span className="auth-orb auth-orb-1" />
        <span className="auth-orb auth-orb-2" />
        <span className="auth-orb auth-orb-3" />

        <span className="auth-badge auth-badge--instagram auth-badge-1">
          <PlatformIcon platform="INSTAGRAM" />
        </span>
        <span className="auth-badge auth-badge--tiktok auth-badge-2">
          <PlatformIcon platform="TIKTOK" />
        </span>
        <span className="auth-badge auth-badge--facebook auth-badge-3">
          <PlatformIcon platform="FACEBOOK" />
        </span>
        <span className="auth-badge auth-badge--tiktok auth-badge-4">
          <PlatformIcon platform="TIKTOK" />
        </span>
        <span className="auth-badge auth-badge--facebook auth-badge-5">
          <PlatformIcon platform="FACEBOOK" />
        </span>
        <span className="auth-badge auth-badge--instagram auth-badge-6">
          <PlatformIcon platform="INSTAGRAM" />
        </span>
      </div>

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
        <Link href="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex w-full justify-center animate-fade-in">
        {children}
      </main>

      <p className="absolute bottom-4 z-10 text-sm text-muted-foreground">
        © {new Date().getFullYear()} SocialAI. Conçu pour les créateurs.
      </p>
    </div>
  );
}
