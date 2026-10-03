import { Heart } from "@/components/shared/icons";

import { PageHeader } from "@/components/shared/page-header";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { FavoritesGrid } from "@/components/favorites/favorites-grid";
import { createClient } from "@/lib/supabase/server";
import { getFavoriteProducts } from "@/lib/data/favorites";

export default async function FavorisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const products = await getFavoriteProducts(supabase, user.id);

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
      <PageHeader
        eyebrow="Ma sélection"
        title="Favoris"
        description="Les produits que vous avez sauvegardés pour plus tard."
      >
        <div className="flex items-center gap-2">
          <Badge variant="gradient" className="gap-1.5 py-1">
            <Heart className="h-3.5 w-3.5" />
            {products.length} produit{products.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </PageHeader>

      <ScrollReveal delay={0.1}>
        <FavoritesGrid initialProducts={products} userId={user.id} />
      </ScrollReveal>
    </div>
  );
}
