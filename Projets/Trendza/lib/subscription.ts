import type { SupabaseClient } from "@supabase/supabase-js";

import type { PaymentProvider, Subscription } from "@/types/database";

/**
 * Tarif unique, exprimé en euros — source de vérité du prix.
 *
 * Le montant réellement débité côté Paddle vient du `price` configuré dans
 * leur tableau de bord ; la constante ci-dessous ne sert qu'à l'affichage et
 * à la trace en base. Les deux doivent rester alignés.
 */
export const ABONNEMENT_PRIX_EUR = 25;

/** Le même montant en centimes : unité attendue par Paddle et stockée en base. */
export const ABONNEMENT_PRIX_EUR_CENTIMES = ABONNEMENT_PRIX_EUR * 100;

/**
 * Parité fixe du franc CFA avec l'euro (1 € = 655,957 XOF).
 *
 * Ce taux est garanti par le Trésor français, il ne fluctue pas : l'équivalent
 * en francs peut donc être calculé une fois pour toutes, sans jamais appeler
 * de service de change.
 */
export const TAUX_FIXE_EUR_XOF = 655.957;

/**
 * Tarif facturé par FedaPay, en francs CFA.
 *
 * Arrondi aux 100 F supérieurs : le mobile money ouest-africain manipule mal
 * les montants à l'unité près, et un prix rond rassure à l'affichage.
 */
export const ABONNEMENT_MONTANT_XOF =
  Math.ceil((ABONNEMENT_PRIX_EUR * TAUX_FIXE_EUR_XOF) / 100) * 100;

/**
 * Durée d'accès ouverte par un paiement FedaPay accepté.
 *
 * Ne concerne pas Paddle, dont les périodes de facturation sont dictées par
 * Paddle lui-même et recopiées telles quelles dans `current_period_end`.
 */
export const ABONNEMENT_DUREE_JOURS = 30;

export const ABONNEMENT_LIBELLE = "Abonnement Trendza — 1 mois";

/**
 * Pays où le Mobile Money domine et où la carte bancaire est peu répandue.
 * Ils sont dirigés vers FedaPay ; partout ailleurs, Paddle.
 */
const PAYS_MOBILE_MONEY = new Set([
  "BJ", // Bénin
  "BF", // Burkina Faso
  "CI", // Côte d'Ivoire
  "CM", // Cameroun
  "GN", // Guinée
  "ML", // Mali
  "NE", // Niger
  "SN", // Sénégal
  "TG", // Togo
]);

/**
 * Moyen de paiement proposé par défaut, déduit du pays du profil.
 *
 * Purement ergonomique : les deux moyens restent proposés à tout le monde,
 * un Ivoirien détenteur d'une carte internationale pouvant préférer Paddle.
 */
export function providerParDefaut(pays?: string | null): PaymentProvider {
  return pays && PAYS_MOBILE_MONEY.has(pays.toUpperCase()) ? "fedapay" : "paddle";
}

/**
 * Fonctionnalités réservées aux abonnés.
 *
 * ⚠️ Cette liste est purement documentaire : le verrouillage réel se fait
 * page par page côté serveur (voir `requireSubscription`). Ne jamais s'y
 * fier seule pour protéger un accès.
 */
export const FONCTIONNALITES_PREMIUM = [
  "Tableau de bord : meilleurs produits du jour, de la semaine et du mois",
  "Opportunités détectées et niches en croissance",
  "Analyse approfondie : score détaillé, concurrence, saisonnalité",
  "Prévisions de rentabilité à 1, 3, 6 et 12 mois",
  "Assistant IA : recommandations personnalisées par marché",
] as const;

export type AccesPremium = {
  actif: boolean;
  /** Vrai si l'accès vient du rôle admin et non d'un paiement. */
  viaAdmin: boolean;
  abonnement: Subscription | null;
  /** Jours restants avant expiration, null si pas d'abonnement actif. */
  joursRestants: number | null;
};

/**
 * Détermine l'accès premium d'un utilisateur.
 *
 * La décision est prise à partir de `current_period_end` en base, jamais
 * d'un état client : un utilisateur ne peut pas se déclarer abonné.
 */
export async function getAccesPremium(
  supabase: SupabaseClient,
  userId: string,
  role?: string | null,
): Promise<AccesPremium> {
  if (role === "admin") {
    return { actif: true, viaAdmin: true, abonnement: null, joursRestants: null };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const abonnement = (data as Subscription | null) ?? null;

  if (!abonnement?.current_period_end) {
    return { actif: false, viaAdmin: false, abonnement, joursRestants: null };
  }

  const fin = new Date(abonnement.current_period_end);
  const actif = abonnement.statut === "active" && fin.getTime() > Date.now();

  return {
    actif,
    viaAdmin: false,
    abonnement,
    joursRestants: actif
      ? Math.max(0, Math.ceil((fin.getTime() - Date.now()) / 86_400_000))
      : null,
  };
}

/** Date de fin d'une période ouverte maintenant (ou prolongée si encore active). */
export function calculerFinDePeriode(finActuelle?: string | null): Date {
  const maintenant = Date.now();
  const base =
    finActuelle && new Date(finActuelle).getTime() > maintenant
      ? new Date(finActuelle).getTime() // prolonge sans perdre les jours restants
      : maintenant;

  return new Date(base + ABONNEMENT_DUREE_JOURS * 86_400_000);
}

export function formaterMontantXOF(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

export function formaterMontantEUR(euros: number): string {
  return euros.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    // Les prix sont ronds : « 25 € » se lit mieux que « 25,00 € ».
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
  });
}

/** Fin de période lisible, ex. « 9 septembre 2026 ». */
export function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
