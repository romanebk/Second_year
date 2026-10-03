import { redirect } from "next/navigation";
import { Package } from "@/components/shared/icons";

import { PageHeader } from "@/components/shared/page-header";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { CatalogueGrid } from "@/components/catalogue/catalogue-grid";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profiles";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { getCatalogueProducts } from "@/lib/data/products";

export default async function CataloguePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const profile = await getProfile(supabase, user.id);
  const [products, favoriteIds] = await Promise.all([
    getCatalogueProducts(supabase),
    getFavoriteProductIds(supabase, user.id),
  ]);

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
      <PageHeader
        eyebrow="Catalogue"
        title="Produits les plus vendus"
        description="Parcourez les produits tendance du e-commerce, repérez les meilleures ventes et rejoignez votre tableau de bord pour vos analyses."
      >
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="gradient" className="gap-1.5 py-1">
            <Package className="h-3.5 w-3.5" />
            {products.length} produit{products.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </PageHeader>

      <ScrollReveal delay={0.1} className="mt-8">
        <CatalogueGrid
          products={products}
          favoriteIds={favoriteIds}
          userId={user.id}
          isAdmin={profile?.role === "admin"}
        />
      </ScrollReveal>
    </div>
  );
}
