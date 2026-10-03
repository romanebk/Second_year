"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, TriangleAlert } from "@/components/shared/icons";

import { GlowButton } from "@/components/shared/glow-button";

/** Nombre de vérifications avant d'abandonner (5 s × 12 = 1 min). */
const MAX_TENTATIVES = 12;
const INTERVALLE_MS = 5000;

/**
 * Attend l'activation de l'abonnement après un retour de paiement.
 *
 * Le paiement et le webhook du prestataire sont asynchrones : au retour de
 * l'utilisateur, l'abonnement n'est pas toujours encore activé. On interroge
 * donc périodiquement l'état réel côté serveur plutôt que de supposer un
 * succès — c'est le webhook signé qui fait autorité, pas cette page.
 */
export function PaiementStatut({
  actifInitial,
  echecAnnonce,
}: {
  actifInitial: boolean;
  echecAnnonce: boolean;
}) {
  const router = useRouter();
  const [actif, setActif] = useState(actifInitial);
  const [tentatives, setTentatives] = useState(0);

  const enAttente = !actif && !echecAnnonce && tentatives < MAX_TENTATIVES;

  useEffect(() => {
    if (!enAttente) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/abonnement/statut", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as { actif?: boolean };
        if (data.actif) {
          setActif(true);
          router.refresh();
          return;
        }
      } catch {
        // Silencieux : on retentera au prochain tour.
      }
      setTentatives((n) => n + 1);
    }, INTERVALLE_MS);

    return () => clearTimeout(timer);
  }, [enAttente, tentatives, router]);

  if (actif) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">Abonnement activé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Merci ! Vous avez désormais accès au tableau de bord, aux prévisions et à
            l&apos;assistant pendant 30 jours.
          </p>
        </div>
        <GlowButton href="/dashboard">Accéder au tableau de bord</GlowButton>
      </div>
    );
  }

  if (echecAnnonce) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">Paiement non abouti</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Le paiement a été refusé ou annulé. Aucun montant n&apos;a été débité. Vous pouvez
            réessayer depuis la page d&apos;abonnement.
          </p>
        </div>
      </div>
    );
  }

  if (enAttente) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div>
          <h1 className="font-heading text-2xl font-bold">Confirmation en cours…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nous attendons la confirmation de votre paiement. Cela prend généralement quelques
            secondes — ne fermez pas cette page.
          </p>
        </div>
      </div>
    );
  }

  // Délai dépassé : ni activation ni échec annoncé.
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
        <TriangleAlert className="h-7 w-7" />
      </div>
      <div>
        <h1 className="font-heading text-2xl font-bold">Confirmation plus longue que prévu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre paiement est peut-être encore en cours de traitement. Si le montant a été
          débité, votre accès s&apos;activera automatiquement — rechargez la page dans quelques
          minutes. Sans activation, contactez-nous en indiquant votre adresse email.
        </p>
      </div>
    </div>
  );
}
