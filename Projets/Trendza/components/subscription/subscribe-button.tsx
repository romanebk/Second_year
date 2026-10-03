"use client";

import { useState } from "react";
import { CreditCard, Loader2, Smartphone } from "@/components/shared/icons";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { GlowButton } from "@/components/shared/glow-button";
import {
  ABONNEMENT_MONTANT_XOF,
  ABONNEMENT_PRIX_EUR,
  formaterMontantEUR,
  formaterMontantXOF,
} from "@/lib/subscription";
import type { PaymentProvider } from "@/types/database";

type ConfigPaddle = { token: string; environment: "sandbox" | "production" };

const MOYENS: {
  provider: PaymentProvider;
  titre: string;
  detail: string;
  montant: string;
  icone: typeof CreditCard;
}[] = [
  {
    provider: "paddle",
    titre: "Carte bancaire",
    detail: "Visa, Mastercard, PayPal, Apple Pay",
    montant: formaterMontantEUR(ABONNEMENT_PRIX_EUR),
    icone: CreditCard,
  },
  {
    provider: "fedapay",
    titre: "Mobile Money",
    detail: "MTN, Moov, Orange, Wave",
    montant: formaterMontantXOF(ABONNEMENT_MONTANT_XOF),
    icone: Smartphone,
  },
];

/**
 * Choix du moyen de paiement puis lancement du checkout.
 *
 * Seul le *moyen* part d'ici : le montant est fixé côté serveur, pour qu'on
 * ne puisse pas le modifier depuis le navigateur.
 */
export function SubscribeButton({
  libelle = "M'abonner maintenant",
  defautProvider = "paddle",
  configPaddle,
}: {
  libelle?: string;
  /** Moyen présélectionné, déduit du pays du profil. */
  defautProvider?: PaymentProvider;
  /** Absent si Paddle n'est pas configuré : seul le Mobile Money est proposé. */
  configPaddle?: ConfigPaddle | null;
}) {
  const moyens = configPaddle ? MOYENS : MOYENS.filter((m) => m.provider !== "paddle");
  const [provider, setProvider] = useState<PaymentProvider>(
    configPaddle ? defautProvider : "fedapay",
  );
  const [loading, setLoading] = useState(false);

  async function ouvrirCheckoutPaddle(transactionId: string) {
    if (!configPaddle) return;

    // Import dynamique : le script Paddle ne doit peser sur aucune autre page.
    const { initializePaddle } = await import("@paddle/paddle-js");

    const paddle = await initializePaddle({
      token: configPaddle.token,
      environment: configPaddle.environment,
    });

    if (!paddle) {
      toast.error("Le module de paiement n'a pas pu se charger.");
      setLoading(false);
      return;
    }

    paddle.Checkout.open({
      transactionId,
      settings: {
        theme: "dark",
        locale: "fr",
        successUrl: `${window.location.origin}/abonnement/retour`,
      },
    });

    // Le checkout s'ouvre par-dessus la page : on rend la main pour que
    // l'utilisateur puisse réessayer s'il ferme la fenêtre.
    setLoading(false);
  }

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/abonnement/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        provider?: PaymentProvider;
        paymentUrl?: string;
        transactionId?: string;
        error?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "Impossible d'initier le paiement.");
        setLoading(false);
        return;
      }

      if (data.provider === "paddle" && data.transactionId) {
        await ouvrirCheckoutPaddle(data.transactionId);
        return;
      }

      if (data.paymentUrl) {
        // Page de paiement hébergée par FedaPay.
        window.location.href = data.paymentUrl;
        return;
      }

      toast.error("Réponse inattendue du serveur de paiement.");
      setLoading(false);
    } catch {
      toast.error("Connexion interrompue. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {moyens.length > 1 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Moyen de paiement
          </legend>
          {moyens.map((moyen) => {
            const Icone = moyen.icone;
            const actif = provider === moyen.provider;
            return (
              <label
                key={moyen.provider}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                  actif
                    ? "border-primary/50 bg-primary/10"
                    : "border-border bg-surface/40 hover:bg-surface-hover",
                )}
              >
                <input
                  type="radio"
                  name="moyen-paiement"
                  value={moyen.provider}
                  checked={actif}
                  onChange={() => setProvider(moyen.provider)}
                  disabled={loading}
                  className="sr-only"
                />
                <Icone
                  className={cn("h-4 w-4 shrink-0", actif ? "text-primary" : "text-muted-foreground")}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{moyen.titre}</span>
                  <span className="block text-xs text-muted-foreground">{moyen.detail}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-sm font-medium",
                    actif ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {moyen.montant}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      <GlowButton onClick={handleClick} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Ouverture du paiement…" : libelle}
      </GlowButton>
    </div>
  );
}
