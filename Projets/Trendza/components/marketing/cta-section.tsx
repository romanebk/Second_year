import Image from "next/image";
import { ArrowRight } from "@/components/shared/icons";

import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { AnimatedGradientBackground } from "@/components/shared/animated-gradient-background";
import { GlowButton } from "@/components/shared/glow-button";

const MONOGRAM_LETTERS = ["t", "r", "e", "n", "d", "z", "a"] as const;

export function CtaSection() {
  return (
    <section className="section-padding relative">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-16 text-center sm:px-16 sm:py-20">
          <AnimatedGradientBackground className="opacity-80" />
          <div className="relative">
            <div className="mx-auto inline-flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface/95 px-5 py-4 shadow-xl shadow-primary/10 backdrop-blur-sm sm:px-7">
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {MONOGRAM_LETTERS.map((letter) => (
                  <Image
                    key={letter}
                    src={`/logos/letters/letter-${letter}.png`}
                    alt={`Lettre ${letter.toUpperCase()}`}
                    width={164}
                    height={155}
                    className="h-10 w-auto transition-transform duration-300 hover:scale-110 sm:h-12"
                  />
                ))}
              </div>
              <Image
                src="/logos/band.png"
                alt=""
                width={414}
                height={17}
                className="h-1 w-32 opacity-80 sm:w-40"
              />
            </div>

            <h2 className="mt-8 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Prêt à trouver votre{" "}
              <span className="text-gradient">prochain produit gagnant</span>&nbsp;?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Rejoignez Trendza gratuitement et lancez votre boutique avec un produit
              pensé pour votre marché, dès aujourd&apos;hui.
            </p>
            <div className="mt-8 flex justify-center">
              <GlowButton href="/inscription">
                Créer mon compte gratuit
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
