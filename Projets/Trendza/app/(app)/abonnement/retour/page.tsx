import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PaiementStatut } from "@/components/subscription/paiement-statut";
import { requireUser } from "@/lib/auth-guard";
import { getAccesPremium } from "@/lib/subscription";

export const dynamic = "force-dynamic";

/**
 * Page d'atterrissage après un paiement, quel que soit l'agrégateur
 * (redirection depuis FedaPay, ou `successUrl` du checkout Paddle).
 *
 * L'accès n'est **jamais** accordé ici : seuls les webhooks signés l'accordent.
 * Cette page ne fait que constater l'état réel en base. Le paiement et le
 * webhook étant asynchrones, l'activation peut prendre quelques secondes —
 * d'où la vérification périodique côté client.
 */
export default async function RetourPaiementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [params, { supabase, user, profile }] = await Promise.all([
    searchParams,
    requireUser(),
  ]);

  const acces = await getAccesPremium(supabase, user.id, profile?.role);

  // FedaPay renvoie un statut dans l'URL (Paddle n'en renvoie pas). Purement
  // indicatif : on ne s'en sert que pour l'affichage, jamais pour l'accès.
  const statutUrl = params.status ?? null;
  const echecAnnonce = statutUrl === "declined" || statutUrl === "canceled";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-8">
      <PaiementStatut actifInitial={acces.actif} echecAnnonce={echecAnnonce} />

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="outline" asChild>
          <Link href="/abonnement">Retour à l&apos;abonnement</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/catalogue">Voir le catalogue</Link>
        </Button>
      </div>
    </div>
  );
}
