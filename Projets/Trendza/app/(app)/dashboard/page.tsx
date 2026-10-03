import Image from "next/image";
import { ArrowRight, Flame, Gauge, Package, Tag } from "@/components/shared/icons";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { GlowButton } from "@/components/shared/glow-button";
import { SuggestionDisclaimer } from "@/components/shared/suggestion-disclaimer";
import { CountryMonthSelector } from "@/components/dashboard/country-month-selector";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { ProductGrid } from "@/components/dashboard/product-grid";
import { Badge } from "@/components/ui/badge";
import { TrendScoreBadge } from "@/components/dashboard/trend-score-badge";
import { FavoriteButton } from "@/components/product/favorite-button";
import { requireSubscription } from "@/lib/auth-guard";
import { getProducts } from "@/lib/data/products";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { COUNTRIES, MONTHS } from "@/lib/constants";
import { buildDashboardInsights } from "@/lib/engine/dashboard";
import { InsightsGrid } from "@/components/dashboard/insights-grid";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  // Fonctionnalité premium : redirige vers /abonnement si l'accès n'est pas
  // actif, avant tout rendu et tout calcul.
  const { supabase, user, profile } = await requireSubscription("/dashboard");

  const pays = params.pays ?? profile?.pays ?? "US";
  const mois = params.mois ? Number(params.mois) : new Date().getMonth() + 1;
  const categorie = params.categorie;
  const budget = params.budget as "faible" | "moyenne" | "elevee" | undefined;

  const products = await getProducts(supabase, { pays, mois, categorie, budget });
  const [favoriteIds, insights] = await Promise.all([
    user ? getFavoriteProductIds(supabase, user.id) : Promise.resolve([]),
    buildDashboardInsights(products, pays, mois),
  ]);

  const avgScore = products.length
    ? Math.round(products.reduce((sum, p) => sum + p.score, 0) / products.length)
    : 0;
  const topScore = products.length ? Math.max(...products.map((p) => p.score)) : 0;
  const categoriesCount = new Set(products.map((p) => p.categorie)).size;
  const featured = products[0] ?? null;
  const paysLabel = COUNTRIES.find((c) => c.code === pays)?.label ?? pays;
  const moisLabel = MONTHS.find((m) => m.value === mois)?.label ?? String(mois);

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
      <PageHeader
        eyebrow="Tableau de bord"
        title="Produit phare"
        description="Les produits les plus prometteurs pour votre marché et votre période."
      />

      <ScrollReveal className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Produits trouvés" value={products.length} hint="Selon vos filtres" />
        <StatCard icon={Gauge} label="Score moyen" value={avgScore} hint="Tendance globale" accent="accent" />
        <StatCard icon={Flame} label="Meilleur score" value={topScore} hint="Le plus prometteur" />
        <StatCard icon={Tag} label="Catégories" value={categoriesCount} hint={`${paysLabel} · ${moisLabel}`} accent="success" />
      </ScrollReveal>

      {featured && (
        <ScrollReveal delay={0.1} className="mt-6">
          <div className="group relative overflow-hidden rounded-3xl border border-border bg-surface/50">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary-end/20 blur-3xl" />

            <div className="relative grid gap-0 lg:grid-cols-2">
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[280px]">
                <Image
                  src={featured.image_url}
                  alt={featured.nom}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-background" />
                <TrendScoreBadge score={featured.score} className="absolute right-4 top-4 rounded-full bg-background/80 backdrop-blur-sm" />
              </div>

              <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
                <div className="flex items-center gap-2">
                  <Badge variant="gradient">{featured.categorie}</Badge>
                  <Badge variant="outline">Produit phare du moment</Badge>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold sm:text-3xl">{featured.nom}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground sm:text-base">
                    {featured.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Prix conseillé</p>
                    <p className="font-heading text-lg font-semibold">
                      {featured.prix_conseille.toLocaleString("fr-FR")} XOF
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Marge estimée</p>
                    <p className="font-heading text-lg font-semibold text-success">
                      {featured.marge_estimee}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <GlowButton href={`/produits/${featured.id}`}>
                    Voir la fiche produit
                    <ArrowRight className="h-4 w-4" />
                  </GlowButton>
                  {user && (
                    <FavoriteButton
                      productId={featured.id}
                      userId={user.id}
                      initialFavorite={favoriteIds.includes(featured.id)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal delay={0.15} className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface/40 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-base font-semibold">Toutes les tendances</h3>
            <p className="text-xs text-muted-foreground">
              Affinez la recherche pour affiner vos recommandations.
            </p>
          </div>
          <CountryMonthSelector pays={pays} mois={mois} />
        </div>
        <FilterBar categorie={categorie} budget={budget} />
      </ScrollReveal>

      <div className="mt-8">
        {user && (
          <ProductGrid
            products={products}
            favoriteIds={favoriteIds}
            userId={user.id}
            pays={pays}
            mois={mois}
          />
        )}
      </div>

      {user && <InsightsGrid insights={insights} pays={pays} mois={mois} />}

      <SuggestionDisclaimer className="mt-10" />
    </div>
  );
}
