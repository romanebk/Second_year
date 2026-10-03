import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, MapPin, Rocket, Target } from "@/components/shared/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlowButton } from "@/components/shared/glow-button";
import { FaIcon } from "@/components/shared/fa-icon";
import { TrendScoreBadge } from "@/components/dashboard/trend-score-badge";
import { FavoriteButton } from "@/components/product/favorite-button";
import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/data/products";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { COUNTRIES, MONTHS } from "@/lib/constants";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const product = await getProductById(supabase, id);
  if (!product || !user) notFound();

  const favoriteIds = await getFavoriteProductIds(supabase, user.id);

  const paysLabels = product.pays_cible
    .map((code) => COUNTRIES.find((c) => c.code === code)?.label ?? code)
    .join(" · ");
  const moisLabels = product.mois_pertinents
    .map((m) => MONTHS.find((mo) => mo.value === m)?.label ?? String(m))
    .join(" · ");

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
      <Link
        href="/catalogue"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au catalogue
      </Link>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-surface/50">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary-end/15 blur-3xl" />

        <div className="relative grid gap-0 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[320px]">
            <Image src={product.image_url} alt={product.nom} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-background" />
            <TrendScoreBadge
              score={product.score}
              className="absolute right-4 top-4 rounded-full bg-background/80 backdrop-blur-sm"
            />
          </div>

          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gradient">{product.categorie}</Badge>
              <Badge variant="outline">{product.score} / 100 tendance</Badge>
            </div>

            <div>
              <h1 className="font-heading text-2xl font-bold sm:text-3xl">{product.nom}</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {product.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Prix conseillé</p>
                <p className="font-heading text-xl font-semibold">
                  {product.prix_conseille.toLocaleString("fr-FR")} XOF
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Marge estimée</p>
                <p className="font-heading text-xl font-semibold text-success">
                  {product.marge_estimee}
                </p>
              </div>
            </div>

            {(paysLabels || moisLabels) && (
              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                {paysLabels && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    Marchés : {paysLabels}
                  </p>
                )}
                {moisLabels && (
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    Périodes : {moisLabels}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <GlowButton href={`/produits/${product.id}/lancement`}>
                Préparer mon lancement
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
              <Button variant="outline" asChild>
                <Link href={`/produits/${product.id}/analyse`}>
                  <FaIcon name="faWandMagicSparkles" className="h-4 w-4" />
                  Analyse approfondie
                </Link>
              </Button>
              <FavoriteButton
                productId={product.id}
                userId={user.id}
                initialFavorite={favoriteIds.includes(product.id)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface/50 p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Arguments de vente
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {product.arguments_vente.map((arg) => (
              <li key={arg} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {arg}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface/50 p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
            <Target className="h-5 w-5 text-accent" />
            Public cible
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">{product.public_cible}</p>

          <h2 className="mt-8 flex items-center gap-2 font-heading text-lg font-semibold">
            <Rocket className="h-5 w-5 text-primary" />
            Idées d&apos;angle marketing
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {product.angles_marketing.map((angle) => (
              <li key={angle} className="text-sm text-muted-foreground">
                • {angle}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Button variant="gradient" size="lg" asChild>
          <Link href={`/produits/${product.id}/lancement`}>
            <Rocket className="h-4 w-4" />
            Préparer mon lancement
          </Link>
        </Button>
      </div>
    </div>
  );
}
