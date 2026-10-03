import Link from "next/link";
import { Check, Lock, ShieldCheck } from "@/components/shared/icons";

import { PageHeader } from "@/components/shared/page-header";
import { GradientText } from "@/components/shared/gradient-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubscribeButton } from "@/components/subscription/subscribe-button";
import { CancelButton } from "@/components/subscription/cancel-button";
import { requireUser } from "@/lib/auth-guard";
import { configPaddleClient } from "@/lib/paddle";
import {
  ABONNEMENT_MONTANT_XOF,
  ABONNEMENT_PRIX_EUR,
  FONCTIONNALITES_PREMIUM,
  formaterDate,
  formaterMontantEUR,
  formaterMontantXOF,
  getAccesPremium,
  providerParDefaut,
} from "@/lib/subscription";

export const dynamic = "force-dynamic";

const GRATUIT = [
  "Catalogue complet des produits",
  "Fiche détaillée de chaque produit",
  "Kit de lancement (fiche prête à copier)",
  "Favoris et gestion de vos boutiques",
];

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [params, { supabase, user, profile }] = await Promise.all([
    searchParams,
    requireUser(),
  ]);

  const acces = await getAccesPremium(supabase, user.id, profile?.role);
  const depuis = params.depuis;

  // Le jeton client Paddle est transmis en prop plutôt que par une variable
  // NEXT_PUBLIC_ : une seule variable d'environnement à renseigner, et rien
  // n'est embarqué dans les pages qui ne proposent pas de paiement.
  const configPaddle = configPaddleClient();

  const abonnement = acces.abonnement;
  const reconductible =
    abonnement?.provider === "paddle" && acces.actif && !abonnement.annule_a_la_fin;
  const resilie = abonnement?.provider === "paddle" && abonnement.annule_a_la_fin;

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
      <PageHeader
        eyebrow="Abonnement"
        title="Passez à Trendza Pro"
        description="Accédez aux meilleurs produits à vendre et aux prévisions de rentabilité."
      />

      {/* Message contextuel quand l'utilisateur a été redirigé depuis une page verrouillée */}
      {depuis && !acces.actif && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-sm text-foreground/90">
            Cette page fait partie de Trendza Pro. Activez votre abonnement pour y accéder —
            vous y serez redirigé automatiquement après le paiement.
          </p>
        </div>
      )}

      {acces.actif && (
        <div className="mt-6 rounded-2xl border border-success/30 bg-success/10 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
            <p className="flex-1 text-sm text-foreground/90">
              {acces.viaAdmin
                ? "Votre compte administrateur dispose d'un accès complet, sans abonnement."
                : resilie
                  ? `Résiliation enregistrée. Votre accès reste ouvert jusqu'au ${
                      abonnement?.current_period_end
                        ? formaterDate(abonnement.current_period_end)
                        : "terme de la période payée"
                    }, sans nouveau prélèvement.`
                  : reconductible
                    ? `Votre abonnement est actif et se renouvellera automatiquement le ${
                        abonnement?.current_period_end
                          ? formaterDate(abonnement.current_period_end)
                          : "terme de la période"
                      }.`
                    : `Votre abonnement est actif. Il reste ${acces.joursRestants} jour${
                        (acces.joursRestants ?? 0) > 1 ? "s" : ""
                      } d'accès.`}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Aller au tableau de bord</Link>
            </Button>
          </div>

          {reconductible && (
            <div className="mt-3">
              <CancelButton finAcces={abonnement?.current_period_end ?? null} />
            </div>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {/* Offre gratuite */}
        <div className="flex flex-col rounded-3xl border border-border bg-surface/40 p-6 sm:p-8">
          <Badge variant="outline" className="w-fit">
            Gratuit
          </Badge>
          <p className="mt-4 font-heading text-3xl font-bold">0 €</p>
          <p className="mt-1 text-sm text-muted-foreground">Sans engagement</p>

          <ul className="mt-6 flex flex-col gap-3">
            {GRATUIT.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/catalogue">Parcourir le catalogue</Link>
            </Button>
          </div>
        </div>

        {/* Offre Pro */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl border border-primary/40 bg-surface/60 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative">
            <Badge variant="gradient" className="w-fit">
              Trendza Pro
            </Badge>
            <p className="mt-4 font-heading text-3xl font-bold">
              <GradientText>{formaterMontantEUR(ABONNEMENT_PRIX_EUR)}</GradientText>
              <span className="text-base font-normal text-muted-foreground"> / mois</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Soit {formaterMontantXOF(ABONNEMENT_MONTANT_XOF)} en Mobile Money — tout le
              gratuit, plus les fonctionnalités d&apos;analyse.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {FONCTIONNALITES_PREMIUM.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {acces.viaAdmin ? (
                <p className="text-sm text-muted-foreground">
                  Accès administrateur — aucun paiement requis.
                </p>
              ) : reconductible ? (
                <p className="text-sm text-muted-foreground">
                  Abonnement en cours — rien à faire, le renouvellement est automatique.
                </p>
              ) : (
                <SubscribeButton
                  libelle={acces.actif ? "Prolonger mon accès" : "M'abonner maintenant"}
                  defautProvider={providerParDefaut(profile?.pays)}
                  configPaddle={configPaddle}
                />
              )}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">Par carte bancaire</strong> :
              paiement traité par Paddle, taxes locales incluses, renouvellement automatique
              chaque mois — résiliable à tout moment depuis cette page.
              <br />
              <strong className="font-medium text-foreground">Par Mobile Money</strong> :
              paiement traité par FedaPay. Chaque paiement ouvre 30 jours d&apos;accès, sans
              prélèvement automatique : vous restez maître du renouvellement.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Trendza fournit des suggestions et des analyses à titre indicatif. L&apos;abonnement
        donne accès à ces outils, mais ne garantit aucune vente ni aucun résultat commercial —
        voir les{" "}
        <Link href="/conditions-utilisation" className="text-primary hover:underline">
          conditions d&apos;utilisation
        </Link>
        .
      </p>
    </div>
  );
}
