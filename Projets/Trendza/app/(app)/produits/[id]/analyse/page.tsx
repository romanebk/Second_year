import { notFound } from "next/navigation";

import { AnalysisPage } from "@/components/analysis/analysis-page";
import { requireSubscription } from "@/lib/auth-guard";
import { getProductById } from "@/lib/data/products";
import { runAnalysis } from "@/lib/engine/pipeline";
import { TrendzaError } from "@/lib/engine/errors";

export const dynamic = "force-dynamic";

export default async function ProductAnalysisPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  // Fonctionnalité premium (prévisions, score détaillé) : contrôle serveur
  // avant tout rendu, sinon l'analyse partirait déjà dans le HTML.
  const { supabase } = await requireSubscription(`/produits/${id}/analyse`);

  const product = await getProductById(supabase, id);
  if (!product) notFound();

  const pays = query.pays ?? product.pays_cible[0] ?? "US";
  const mois = query.mois ? Number(query.mois) : new Date().getMonth() + 1;
  const budget = query.budget ? Number(query.budget) : undefined;

  let analysis: Awaited<ReturnType<typeof runAnalysis>> | null = null;
  let errorMessage: string | null = null;

  try {
    analysis = await runAnalysis({ product, pays, mois, budget });
  } catch (err) {
    if (err instanceof TrendzaError) {
      errorMessage = err.message;
    } else {
      throw err;
    }
  }

  if (errorMessage) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="font-heading text-lg font-semibold">Analyse indisponible</p>
        <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  return <AnalysisPage analysis={analysis!} />;
}
