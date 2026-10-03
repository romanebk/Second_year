import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalContactCta,
  LegalDefinitions,
  LegalList,
  LegalPage,
  LegalSection,
  LegalValue,
} from "@/components/legal/legal-page";
import { COMPANY, HOSTING } from "@/lib/legal";

const SECTIONS = [
  "1. Responsable du traitement",
  "2. Données collectées",
  "3. Finalités et bases légales",
  "4. Destinataires et sous-traitants",
  "5. Durée de conservation",
  "6. Stockage local dans votre navigateur",
  "7. Sécurité",
  "8. Vos droits",
  "9. Mineurs",
  "10. Modification de la présente politique",
];

export const metadata: Metadata = {
  title: "Politique de confidentialité — Trendza",
  description:
    "Quelles données personnelles Trendza collecte, pourquoi, combien de temps elles sont conservées et comment exercer vos droits.",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro="Cette politique explique quelles données personnelles nous collectons lorsque vous utilisez Trendza, pourquoi nous les collectons, avec qui elles sont partagées, combien de temps nous les conservons et comment exercer vos droits."
      sections={SECTIONS}
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données collectées via Trendza est{" "}
          {COMPANY.legalName}, dont les coordonnées figurent dans les{" "}
          <Link href="/mentions-legales" className="text-primary hover:underline">
            mentions légales
          </Link>
          .
        </p>
        <p>
          Pour toute question relative à vos données personnelles, vous pouvez écrire à{" "}
          <LegalValue value={COMPANY.privacyEmail} />.
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <p>Nous collectons uniquement les données nécessaires au fonctionnement du service.</p>

        <p className="font-medium text-foreground">
          a. Données que vous nous fournissez directement
        </p>
        <LegalDefinitions
          rows={[
            {
              term: "À la création du compte",
              value: "Nom, prénoms, numéro de téléphone, adresse email, mot de passe.",
            },
            {
              term: "Lors de l'onboarding",
              value:
                "Pays cible, niveau d'expérience (débutant ou confirmé), plateforme e-commerce utilisée.",
            },
            {
              term: "Dans l'espace « Mes boutiques »",
              value: "Nom de la boutique, plateforme et pays associés.",
            },
            {
              term: "Via l'assistant",
              value:
                "Le contenu des questions que vous posez à l'assistant conversationnel, traité pour produire la réponse.",
            },
          ]}
        />

        <p className="font-medium text-foreground">b. Données générées par votre usage</p>
        <LegalList
          items={[
            "Les produits que vous ajoutez à vos favoris.",
            "La date de création de votre compte.",
            "Les données techniques strictement nécessaires à la sécurité et au bon fonctionnement du service (journaux de connexion, adresse IP, type de navigateur), conservées par nos hébergeurs.",
          ]}
        />

        <p className="font-medium text-foreground">
          c. Connexion via Google (facultative)
        </p>
        <p>
          Si vous choisissez de vous connecter avec Google, nous recevons votre adresse
          email et l&apos;identifiant de compte transmis par Google. Nous ne recevons ni
          votre mot de passe Google, ni le contenu de votre compte Google.
        </p>
        <p>
          Nous ne collectons aucune donnée sensible au sens de la réglementation
          (origine, opinions politiques ou religieuses, santé, données biométriques) et
          nous vous demandons de ne pas en communiquer via l&apos;assistant.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalités et bases légales">
        <LegalDefinitions
          rows={[
            {
              term: "Créer et gérer votre compte",
              value:
                "Exécution du contrat qui nous lie (fourniture du service que vous avez demandé).",
            },
            {
              term: "Personnaliser les recommandations produits",
              value:
                "Exécution du contrat : votre pays, votre niveau et votre plateforme servent à filtrer et adapter les suggestions.",
            },
            {
              term: "Enregistrer vos favoris et vos boutiques",
              value: "Exécution du contrat : ces fonctionnalités supposent une sauvegarde.",
            },
            {
              term: "Assurer la sécurité du service",
              value:
                "Intérêt légitime : prévention des accès frauduleux, des abus et des incidents.",
            },
            {
              term: "Répondre à vos demandes",
              value: "Intérêt légitime : traitement de vos questions et réclamations.",
            },
          ]}
        />
        <p>
          Nous n&apos;utilisons pas vos données à des fins de publicité ciblée et nous ne
          les vendons ni ne les louons à des tiers.
        </p>
      </LegalSection>

      <LegalSection title="4. Destinataires et sous-traitants">
        <p>
          Vos données sont accessibles aux personnes habilitées de {COMPANY.legalName} et
          aux prestataires techniques suivants, qui agissent en qualité de
          sous-traitants pour notre compte :
        </p>
        <LegalDefinitions
          rows={[
            {
              term: HOSTING.data.name,
              value: `Base de données et authentification — ${HOSTING.data.detail}`,
            },
            {
              term: HOSTING.app.name,
              value: `Hébergement et diffusion de l'application — ${HOSTING.app.detail}`,
            },
            {
              term: "Google LLC",
              value:
                "Uniquement si vous utilisez la connexion Google, pour authentifier votre identité.",
            },
            {
              term: "Paddle.com Market Ltd",
              value:
                "Uniquement si vous vous abonnez par carte bancaire. Paddle intervient en qualité de revendeur (« Merchant of Record ») et non de simple sous-traitant : il est responsable du traitement pour les données de facturation qu'il collecte (nom, adresse, coordonnées de paiement). Nous ne recevons jamais votre numéro de carte.",
            },
            {
              term: "FedaPay",
              value:
                "Uniquement si vous vous abonnez par Mobile Money, pour traiter le paiement (nom, adresse email, numéro de téléphone du portefeuille).",
            },
          ]}
        />
        <p>
          Nous conservons de notre côté la seule trace nécessaire au suivi de votre
          abonnement : l&apos;identifiant de la transaction, le montant, la devise et
          l&apos;état du paiement. Aucune donnée bancaire n&apos;est stockée par Trendza.
        </p>
        <p>
          Ces prestataires pouvant être établis hors de votre pays de résidence, des
          transferts de données hors de l&apos;espace économique concerné peuvent avoir
          lieu. Ils sont encadrés par les garanties contractuelles proposées par ces
          prestataires (clauses contractuelles types ou mécanisme équivalent).
        </p>
        <p>
          Nous pouvons également être amenés à communiquer des données sur réquisition
          d&apos;une autorité judiciaire ou administrative compétente.
        </p>
      </LegalSection>

      <LegalSection title="5. Durée de conservation">
        <LegalList
          items={[
            "Données de compte et de profil : conservées tant que votre compte est actif, puis supprimées dans un délai de 30 jours après votre demande de suppression.",
            "Favoris et boutiques enregistrées : supprimés en même temps que le compte auquel ils sont rattachés.",
            "Journaux techniques et de sécurité : conservés par nos hébergeurs pour une durée limitée, conformément à leurs propres politiques et aux obligations légales applicables.",
            "Traces de paiement et d'abonnement : conservées au-delà de la suppression du compte, pour la durée imposée par les obligations comptables et fiscales applicables.",
            "Échanges avec le support : conservés le temps du traitement de votre demande, puis archivés si nécessaire pour la gestion d'un éventuel litige.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Stockage local dans votre navigateur">
        <p>
          Trendza n&apos;utilise pas de cookies publicitaires ni de traceurs à des fins
          de mesure d&apos;audience tierce. Le service dépose uniquement :
        </p>
        <LegalDefinitions
          rows={[
            {
              term: "Cookies d'authentification",
              value:
                "Déposés par Supabase, strictement nécessaires pour vous maintenir connecté d'une page à l'autre.",
            },
            {
              term: "trendza_pending_profile",
              value:
                "Stockage local temporaire de vos nom, prénoms et téléphone entre l'inscription et l'onboarding. Il est effacé automatiquement dès la fin de l'onboarding.",
            },
            {
              term: "trendza.cache.v1",
              value:
                "Stockage local d'un cache d'analyses, destiné à éviter de recalculer les mêmes résultats. Il ne contient pas de donnée d'identification.",
            },
          ]}
        />
        <p>
          Vous pouvez à tout moment effacer ces éléments depuis les paramètres de votre
          navigateur. La suppression des cookies d&apos;authentification entraînera votre
          déconnexion.
        </p>
      </LegalSection>

      <LegalSection title="7. Sécurité">
        <p>
          Les mots de passe ne sont jamais stockés en clair : ils sont conservés sous
          forme de condensat chiffré par notre prestataire d&apos;authentification. Les
          échanges entre votre navigateur et le service sont chiffrés (HTTPS). L&apos;accès
          aux données est cloisonné par utilisateur au niveau de la base de données :
          chaque compte ne peut lire et modifier que ses propres favoris, boutiques et
          informations de profil.
        </p>
        <p>
          Malgré ces mesures, aucun système n&apos;étant infaillible, nous vous
          recommandons d&apos;utiliser un mot de passe unique et robuste.
        </p>
      </LegalSection>

      <LegalSection title="8. Vos droits">
        <p>
          Conformément à la réglementation applicable en matière de protection des
          données personnelles, vous disposez des droits suivants :
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-foreground">Droit d&apos;accès</strong> : obtenir une
              copie des données que nous détenons sur vous.
            </>,
            <>
              <strong className="text-foreground">Droit de rectification</strong> :
              corriger des données inexactes ou incomplètes.
            </>,
            <>
              <strong className="text-foreground">Droit à l&apos;effacement</strong> :
              demander la suppression de votre compte et des données associées.
            </>,
            <>
              <strong className="text-foreground">Droit à la portabilité</strong> :
              recevoir vos données dans un format structuré et lisible par machine.
            </>,
            <>
              <strong className="text-foreground">Droit d&apos;opposition et de limitation</strong>{" "}
              : vous opposer à certains traitements ou en demander la limitation.
            </>,
            <>
              <strong className="text-foreground">Droit de retirer votre consentement</strong>{" "}
              à tout moment, lorsque le traitement repose sur celui-ci.
            </>,
          ]}
        />
        <p>
          Pour exercer ces droits, écrivez à <LegalValue value={COMPANY.privacyEmail} />.
          Nous répondons dans un délai maximum d&apos;un mois. Une preuve d&apos;identité
          pourra vous être demandée en cas de doute raisonnable sur l&apos;identité du
          demandeur.
        </p>
        <p>
          Si vous estimez, après nous avoir contactés, que vos droits ne sont pas
          respectés, vous pouvez introduire une réclamation auprès de l&apos;autorité de
          protection des données compétente dans votre pays de résidence.
        </p>
      </LegalSection>

      <LegalSection title="9. Mineurs">
        <p>
          Le service s&apos;adresse à des personnes exerçant ou souhaitant exercer une
          activité commerciale. Il n&apos;est pas destiné aux mineurs de moins de 16 ans.
          Si vous constatez qu&apos;un compte a été créé par un mineur sans autorisation
          parentale, contactez-nous afin que nous procédions à sa suppression.
        </p>
      </LegalSection>

      <LegalSection title="10. Modification de la présente politique">
        <p>
          Cette politique peut être mise à jour pour refléter une évolution du service ou
          de la réglementation. En cas de modification substantielle, vous en serez
          informé par email ou via une notification dans l&apos;application. La date de
          dernière mise à jour figure en tête de ce document.
        </p>
      </LegalSection>

      <LegalContactCta email={COMPANY.privacyEmail}>
        <p>
          Pour exercer vos droits (accès, rectification, effacement…) ou poser une
          question sur le traitement de vos données, écrivez-nous à l&apos;adresse ci-dessous.
        </p>
      </LegalContactCta>
    </LegalPage>
  );
}
