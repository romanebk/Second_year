import { Gauge, MapPin } from "@/components/shared/icons";

import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeader } from "@/components/marketing/section-header";
import { ProductCard } from "@/components/dashboard/product-card";
import { Badge } from "@/components/ui/badge";
import { MobileSlider } from "@/components/shared/mobile-slider";
import { MOCK_PREVIEW_PRODUCTS } from "@/lib/marketing-mock";

export function DashboardPreview() {
  return (
    <section id="demo" className="section-padding relative">
      <div>
        <ScrollReveal>
          <SectionHeader
            badge="Aperçu"
            title="Votre tableau de bord, en un coup d'œil"
            description="Filtrez par pays, par mois et par catégorie pour ne voir que les produits vraiment pertinents pour votre marché."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-14">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-24px_rgba(124,58,237,0.2)]">
            {/* Browser chrome mockup */}
            <div className="flex items-center gap-2 border-b border-border bg-surface-hover/80 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="mx-auto hidden h-7 w-full max-w-sm items-center rounded-lg bg-surface px-3 text-xs text-muted-foreground sm:flex">
                trendza.app/catalogue
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="gap-1.5 py-1.5">
                  <MapPin className="h-3.5 w-3.5" /> États-Unis
                </Badge>
                <Badge variant="outline" className="gap-1.5 py-1.5">
                  <Gauge className="h-3.5 w-3.5" /> Décembre
                </Badge>
                <Badge variant="gradient" className="py-1.5">
                  Tendances du moment
                </Badge>
              </div>

              {/* Mobile: carousel */}
              <MobileSlider>
                {MOCK_PREVIEW_PRODUCTS.map((product) => (
                  <div key={product.id} className="w-[280px]">
                    <ProductCard
                      product={product}
                      whyRelevant="Forte demande saisonnière détectée pour ce pays et cette période."
                    />
                  </div>
                ))}
              </MobileSlider>

              {/* Desktop: grid */}
              <div className="hidden md:grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_PREVIEW_PRODUCTS.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    whyRelevant="Forte demande saisonnière détectée pour ce pays et cette période."
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
