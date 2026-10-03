import Image from "next/image";

import { Compass, PackageSearch, Rocket } from "@/components/shared/icons";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeader } from "@/components/marketing/section-header";
import { MobileSlider } from "@/components/shared/mobile-slider";

const STEPS = [
  {
    icon: Compass,
    step: "01",
    title: "Choisissez votre marché",
    description:
      "Indiquez votre pays cible et la période — le mois en cours est sélectionné par défaut.",
    image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop",
    imageAlt: "Carte du monde et marchés internationaux",
  },
  {
    icon: PackageSearch,
    step: "02",
    title: "Découvrez le produit phare",
    description:
      "Trendza propose les produits les plus pertinents avec un score de tendance et une explication claire.",
    image:
      "https://images.unsplash.com/photo-1664455340023-214c33a9d0bd?w=600&q=80&auto=format&fit=crop",
    imageAlt: "Panier et produits tendance en ligne",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Lancez votre boutique",
    description:
      "Générez une fiche produit prête à copier-coller et suivez le guide pas à pas pour publier.",
    image:
      "https://images.unsplash.com/photo-1688561808434-886a6dd97b8c?w=600&q=80&auto=format&fit=crop",
    imageAlt: "Lancement de boutique en ligne depuis un ordinateur",
  },
];

function StepCard({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-20px_rgba(124,58,237,0.25)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={step.image}
          alt={step.imageAlt}
          fill
          sizes="(max-width: 768px) 260px, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
          {step.step}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted text-primary">
          <step.icon className="h-5 w-5" />
        </div>
        <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {step.description}
        </p>
      </div>
    </article>
  );
}

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="section-padding relative">
      <div>
        <ScrollReveal>
          <SectionHeader
            badge="Simple et rapide"
            title="Comment ça marche"
            description="Trois étapes simples entre l'idée et la mise en ligne de votre boutique."
          />
        </ScrollReveal>

        {/* Mobile: auto-scroll carousel */}
        <MobileSlider className="mt-14">
          {STEPS.map((step) => (
            <div key={step.title} className="w-[280px]">
              <StepCard step={step} />
            </div>
          ))}
        </MobileSlider>

        {/* Desktop: grid */}
        <div className="relative mt-16 hidden gap-8 md:grid md:grid-cols-3">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-[4.5rem] hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />

          {STEPS.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 0.1}>
              <StepCard step={step} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
