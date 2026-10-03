import { FaIcon } from "@/components/shared/fa-icon";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { MobileSlider } from "@/components/shared/mobile-slider";

const STATS = [
  {
    icon: "faChartLine",
    value: "50 000+",
    label: "Tendances analysées",
    description: "Produits suivis en temps réel sur les marchés francophones",
  },
  {
    icon: "faGlobe",
    value: "12",
    label: "Pays couverts",
    description: "Côte d'Ivoire, Sénégal, France, Cameroun, et bien d'autres",
  },
  {
    icon: "faClock",
    value: "3 min",
    label: "Fiche produit prête",
    description: "De l'idée à la fiche optimisée pour votre boutique",
  },
  {
    icon: "faRobot",
    value: "24/7",
    label: "Assistant IA",
    description: "Un conseiller intelligent disponible à tout moment",
  },
];

function StatCard({ stat }: { stat: (typeof STATS)[number] }) {
  return (
    <div className="group relative flex h-full flex-col items-center rounded-2xl border border-border bg-surface p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_16px_40px_-16px_rgba(124,58,237,0.2)]">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-muted text-primary transition-transform duration-300 group-hover:scale-110">
        <FaIcon name={stat.icon} className="h-6 w-6" />
      </div>
      <p className="font-heading text-4xl font-bold tracking-tight text-foreground">
        {stat.value}
      </p>
      <p className="mt-2 font-heading text-sm font-semibold text-foreground">
        {stat.label}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {stat.description}
      </p>
    </div>
  );
}

export function Stats() {
  return (
    <section id="chiffres-cles" className="section-padding relative">
      <div>
        <ScrollReveal>
          <div className="mb-14 text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3.5 py-1 font-sans text-xs font-semibold uppercase tracking-wider text-primary">
              En chiffres
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Trendza en quelques{" "}
              <span className="text-gradient">numéros</span>
            </h2>
            <p className="mt-4 font-sans text-base leading-relaxed text-muted-foreground sm:text-lg lg:mt-5">
              Une plateforme conçue pour les vendeurs francophones qui veulent
              vendre smarter, pas harder.
            </p>
          </div>
        </ScrollReveal>

        {/* Mobile: carousel */}
        <MobileSlider>
          {STATS.map((stat) => (
            <div key={stat.label} className="w-[260px]">
              <StatCard stat={stat} />
            </div>
          ))}
        </MobileSlider>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <StatCard stat={stat} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
