import Image from "next/image";
import Link from "next/link";

import { COMPANY } from "@/lib/legal";
import { Logo } from "@/components/shared/logo";

const NAV_LINKS = [
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#demo", label: "Démo" },
  { href: "#chiffres-cles", label: "Chiffres clés" },
];

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/conditions-utilisation", label: "CGU" },
];

export function Footer() {
  return (
    <footer className="px-4 pb-6 pt-4 sm:px-8 lg:px-12 xl:px-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#6d28d9] to-primary-end px-6 py-10 sm:px-10">
        <div className="bg-dot pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <Image
                src="/logos/wordmark-white.png"
                alt="Trendza"
                width={408}
                height={61}
                className="h-6 w-auto"
              />
            </Link>

            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <p className="mt-8 border-t border-white/15 pt-6 text-xs leading-relaxed text-white/60">
            Trendza fournit des suggestions de produits et des analyses à titre indicatif.
            Les scores, marges et prévisions ne constituent pas un conseil commercial et
            ne garantissent aucune vente sur votre boutique.
          </p>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 text-xs text-white/55 sm:flex-row">
            <p>
              © {new Date().getFullYear()} Trendza — un service {COMPANY.legalName}.
            </p>
            <div className="flex gap-5">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition-colors duration-200 hover:text-white/90"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
