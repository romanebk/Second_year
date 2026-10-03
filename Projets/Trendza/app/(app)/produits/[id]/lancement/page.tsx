import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Rocket } from "@/components/shared/icons";

import { Badge } from "@/components/ui/badge";
import { CopyBlock } from "@/components/product/copy-block";
import { PlatformGuideTabs } from "@/components/product/platform-guide-tabs";
import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/data/products";
import { getProfile } from "@/lib/data/profiles";
import { generateProductSheet } from "@/lib/launch-kit";

export default async function LaunchKitPage({
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

  const profile = await getProfile(supabase, user.id);
  const defaultPlatform = profile?.plateforme === "mychariow" ? "mychariow" : "woocommerce";

  const sheet = generateProductSheet(product);

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/produits/${product.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la fiche produit
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-end text-white shadow-lg shadow-primary/30">
            <Rocket className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">Kit de lancement</h1>
            <p className="text-sm text-muted-foreground">{product.nom}</p>
          </div>
          <Badge variant="gradient" className="ml-auto">
            {product.categorie}
          </Badge>
        </div>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
            <FileText className="h-5 w-5 text-accent" />
            Fiche produit prête à copier-coller
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <CopyBlock label="Titre optimisé" content={sheet.titre} />
            <CopyBlock label="Description" content={sheet.description} />
            <CopyBlock
              label="Points clés (bullet points)"
              content={sheet.bulletPoints.map((point) => `• ${point}`).join("\n")}
            />
            <CopyBlock label="Tags SEO" content={sheet.tags.join(", ")} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold">Publier sur votre plateforme</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez le guide correspondant à votre plateforme pour mettre votre fiche en ligne.
          </p>
          <div className="mt-4">
            <PlatformGuideTabs defaultPlatform={defaultPlatform} />
          </div>
        </section>
      </div>
    </div>
  );
}
