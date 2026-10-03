import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalCallout,
  LegalContactCta,
  LegalList,
  LegalPage,
  LegalSection,
  LegalValue,
} from "@/components/legal/legal-page";
import { COMPANY, NO_GUARANTEE_NOTICE } from "@/lib/legal";
import {
  ABONNEMENT_MONTANT_XOF,
  ABONNEMENT_PRIX_EUR,
  formaterMontantEUR,
  formaterMontantXOF,
} from "@/lib/subscription";

const SECTIONS = [
  "1. Objet",
  "2. Nature du service — suggestions et absence de garantie",
  "3. Accès au service et compte utilisateur",
  "4. Obligations de l'Utilisateur",
  "5. Contenus générés et usage commercial",
  "6. Disponibilité et évolutions",
  "7. Abonnement, prix et résiliation",
  "8. Limitation de responsabilité",
  "9. Données personnelles",
  "10. Résiliation du compte",
  "11. Modification des CGU",
  "12. Droit applicable et litiges",
];

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Trendza",
  description:
    "Règles d'utilisation du service Trendza : accès, compte, obligations de l'utilisateur, limites de responsabilité et absence de garantie de résultat commercial.",
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      intro="Les présentes conditions régissent l'accès et l'utilisation du service Trendza. En créant un compte, vous les acceptez sans réserve. Si vous n'en acceptez pas les termes, vous ne devez pas utiliser le service."
      sections={SECTIONS}
    >
      <LegalSection title="1. Objet">
        <p>
          Trendza est un outil d&apos;aide à la décision destiné aux vendeurs
          e-commerce. Il propose, en fonction d&apos;un pays et d&apos;une période, une
          sélection de produits accompagnée d&apos;analyses (score de tendance, niveau de
          concurrence estimé, saisonnalité, marges indicatives, prévisions) et
          d&apos;éléments prêts à l&apos;emploi pour préparer une fiche produit.
        </p>
        <p>
          Les présentes conditions générales d&apos;utilisation (les « CGU ») définissent
          les modalités de cet accès entre {COMPANY.legalName} (l&apos;« Éditeur ») et
          toute personne utilisant le service (l&apos;« Utilisateur »).
        </p>
      </LegalSection>

      <LegalSection title="2. Nature du service — suggestions et absence de garantie">
        <LegalCallout>{NO_GUARANTEE_NOTICE}</LegalCallout>
        <p>L&apos;Utilisateur reconnaît expressément que :</p>
        <LegalList
          items={[
            "les produits présentés sont des suggestions issues d'un traitement automatisé, et non une sélection validée individuellement pour sa situation ;",
            "les scores, taux de marge, prix conseillés, estimations de concurrence et prévisions sont des ordres de grandeur indicatifs, susceptibles d'être inexacts ou de devenir obsolètes ;",
            "une partie des signaux de tendance peut provenir de sources simulées ou partielles tant que les intégrations avec les fournisseurs de données réels ne sont pas activées ;",
            "aucun volume de ventes, chiffre d'affaires, marge, retour sur investissement publicitaire ou rentabilité n'est garanti, promis ou contractuellement dû ;",
            "le succès commercial d'une boutique dépend de facteurs extérieurs au service (qualité d'exécution, prix, logistique, service client, publicité, concurrence, conjoncture) que l'Éditeur ne maîtrise pas.",
          ]}
        />
        <p>
          Le service ne constitue pas un conseil en investissement, un conseil juridique,
          comptable ou fiscal. Il appartient à l&apos;Utilisateur de procéder à ses
          propres vérifications avant tout engagement financier, notamment sur la
          légalité de la commercialisation d&apos;un produit dans son pays, les normes
          applicables et les obligations douanières.
        </p>
      </LegalSection>

      <LegalSection title="3. Accès au service et compte utilisateur">
        <p>
          L&apos;accès aux fonctionnalités principales nécessite la création d&apos;un
          compte. L&apos;Utilisateur s&apos;engage à fournir des informations exactes et à
          les maintenir à jour.
        </p>
        <LegalList
          items={[
            "Le compte est strictement personnel : l'Utilisateur est responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis son compte.",
            "L'Utilisateur doit informer sans délai l'Éditeur de tout usage non autorisé de son compte.",
            "Un compte ne peut être créé que par une personne majeure, ou par une personne agissant pour le compte d'une entreprise qu'elle est habilitée à engager.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Obligations de l'Utilisateur">
        <p>L&apos;Utilisateur s&apos;interdit notamment de :</p>
        <LegalList
          items={[
            "utiliser le service à des fins illicites, frauduleuses ou contraires à l'ordre public ;",
            "commercialiser, sur la base des suggestions du service, des produits interdits, contrefaisants, dangereux ou soumis à une réglementation qu'il ne respecterait pas ;",
            "tenter d'accéder à des données ou à des comptes qui ne lui appartiennent pas ;",
            "extraire, copier ou réutiliser de manière systématique le catalogue, les analyses ou les bases de données du service, notamment par des moyens automatisés (robots, aspirateurs de contenu) ;",
            "perturber le fonctionnement du service, notamment par une charge anormale ou une tentative de contournement des mesures de sécurité ;",
            "revendre, sous-licencier ou mettre à disposition de tiers l'accès à son compte.",
          ]}
        />
        <p>
          En cas de manquement, l&apos;Éditeur pourra suspendre ou résilier le compte
          concerné, sans préavis en cas de manquement grave, et sans préjudice de toute
          action en réparation.
        </p>
      </LegalSection>

      <LegalSection title="5. Contenus générés et usage commercial">
        <p>
          Les fiches produits, descriptions, arguments de vente et tags générés par le
          service peuvent être librement utilisés, modifiés et publiés par
          l&apos;Utilisateur pour les besoins de sa propre activité. L&apos;Éditeur ne
          revendique aucun droit sur les boutiques ni sur le chiffre d&apos;affaires de
          l&apos;Utilisateur.
        </p>
        <p>
          L&apos;Utilisateur demeure seul responsable des contenus qu&apos;il publie sur
          ses propres canaux, y compris lorsqu&apos;ils sont dérivés des suggestions du
          service : il lui appartient de les vérifier, de les adapter et de s&apos;assurer
          de leur conformité (allégations commerciales, mentions obligatoires, droits de
          tiers sur les visuels).
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilité et évolutions">
        <p>
          Le service est fourni « en l&apos;état ». L&apos;Éditeur met en œuvre les
          moyens raisonnables pour en assurer la disponibilité et l&apos;exactitude, sans
          garantir l&apos;absence d&apos;interruption, d&apos;erreur ou de perte de
          données.
        </p>
        <p>
          L&apos;Éditeur peut faire évoluer, suspendre ou supprimer tout ou partie des
          fonctionnalités. En cas de suppression significative d&apos;une fonctionnalité,
          l&apos;Utilisateur en sera informé par un moyen raisonnable.
        </p>
      </LegalSection>

      <LegalSection title="7. Abonnement, prix et résiliation">
        <p>
          Une partie des fonctionnalités (tableau de bord, analyses approfondies,
          prévisions et assistant) est réservée aux abonnés. Le catalogue produits, les
          fiches, le kit de lancement, les favoris et les boutiques restent accessibles
          sans abonnement.
        </p>

        <p className="font-medium text-foreground">a. Prix</p>
        <p>
          L&apos;abonnement Trendza Pro est facturé{" "}
          <strong className="font-medium text-foreground">
            {formaterMontantEUR(ABONNEMENT_PRIX_EUR)} par mois, toutes taxes comprises
          </strong>
          . Pour les paiements par Mobile Money, le montant équivalent en francs CFA est
          appliqué ({formaterMontantXOF(ABONNEMENT_MONTANT_XOF)}), le franc CFA étant
          arrimé à l&apos;euro à taux fixe. Le prix applicable est celui affiché sur la
          page d&apos;abonnement au moment du paiement.
        </p>

        <p className="font-medium text-foreground">b. Modalités de paiement</p>
        <LegalList
          items={[
            "Par carte bancaire : le paiement est traité par Paddle.com Market Ltd, qui intervient en qualité de revendeur (« Merchant of Record ») et émet la facture. L'abonnement est alors reconduit automatiquement chaque mois jusqu'à résiliation.",
            "Par Mobile Money : le paiement est traité par FedaPay. Chaque paiement ouvre une période d'accès de 30 jours et ne fait l'objet d'aucune reconduction automatique : le renouvellement suppose un nouveau paiement volontaire.",
            "Un paiement effectué alors qu'une période est encore en cours prolonge celle-ci, sans perte des jours restants.",
          ]}
        />

        <p className="font-medium text-foreground">c. Résiliation</p>
        <p>
          L&apos;Utilisateur peut résilier son abonnement à tout moment, sans motif ni
          frais, depuis la page « Abonnement » de son espace. La résiliation prend effet
          au terme de la période déjà réglée : l&apos;accès reste ouvert jusqu&apos;à
          cette date, et aucun nouveau prélèvement n&apos;est effectué. Les périodes
          entamées ne donnent pas lieu à remboursement au prorata.
        </p>

        <p className="font-medium text-foreground">d. Droit de rétractation</p>
        <p>
          Le consommateur résidant dans l&apos;Union européenne dispose en principe
          d&apos;un délai de rétractation de quatorze jours. L&apos;accès aux
          fonctionnalités étant ouvert immédiatement après le paiement, l&apos;Utilisateur
          demande expressément cette exécution immédiate et reconnaît perdre son droit de
          rétractation une fois le service pleinement exécuté, conformément à la
          réglementation applicable aux contenus numériques.
        </p>

        <p className="font-medium text-foreground">e. Défaut de paiement et évolution du prix</p>
        <p>
          En cas d&apos;échec du prélèvement, l&apos;accès aux fonctionnalités réservées
          peut être suspendu à l&apos;expiration de la période payée. L&apos;Éditeur peut
          faire évoluer ses tarifs ; toute modification est notifiée à l&apos;avance et ne
          s&apos;applique qu&apos;aux périodes postérieures à cette notification,
          l&apos;Utilisateur restant libre de résilier avant sa prise d&apos;effet.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation de responsabilité">
        <p>
          Dans les limites autorisées par la loi applicable, la responsabilité de
          l&apos;Éditeur ne saurait être engagée à raison :
        </p>
        <LegalList
          items={[
            "des décisions commerciales prises par l'Utilisateur sur la base des suggestions et analyses du service ;",
            "des pertes d'exploitation, pertes de chiffre d'affaires, invendus, coûts publicitaires engagés, ou de tout préjudice indirect ;",
            "de l'inexactitude, de l'obsolescence ou de l'indisponibilité temporaire des données de tendance ;",
            "des faits imputables à l'Utilisateur, à un tiers ou à un cas de force majeure ;",
            "du comportement des plateformes e-commerce, fournisseurs ou prestataires tiers avec lesquels l'Utilisateur choisit de traiter.",
          ]}
        />
        <p>
          Aucune stipulation des présentes ne vise à exclure une responsabilité qui ne
          pourrait légalement l&apos;être, notamment en cas de faute lourde ou dolosive.
        </p>
      </LegalSection>

      <LegalSection title="9. Données personnelles">
        <p>
          Le traitement des données personnelles est décrit dans la{" "}
          <Link href="/confidentialite" className="text-primary hover:underline">
            politique de confidentialité
          </Link>
          , qui fait partie intégrante des présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="10. Résiliation du compte">
        <p>
          L&apos;Utilisateur peut cesser d&apos;utiliser le service à tout moment et
          demander la suppression de son compte selon les modalités prévues dans la
          politique de confidentialité. L&apos;Éditeur peut résilier l&apos;accès en cas
          de manquement aux présentes CGU, ou en cas d&apos;arrêt du service, moyennant
          une information préalable raisonnable sauf urgence.
        </p>
      </LegalSection>

      <LegalSection title="11. Modification des CGU">
        <p>
          Les présentes CGU peuvent être modifiées. La version applicable est celle en
          ligne au moment de l&apos;utilisation du service. En cas de modification
          substantielle, l&apos;Utilisateur sera informé et la poursuite de
          l&apos;utilisation vaudra acceptation de la nouvelle version.
        </p>
      </LegalSection>

      <LegalSection title="12. Droit applicable et litiges">
        <p>
          Les présentes CGU sont soumises au droit applicable au siège social de
          l&apos;Éditeur. En cas de différend, les parties rechercheront prioritairement
          une solution amiable. À défaut d&apos;accord, le litige sera porté devant les
          juridictions compétentes, sous réserve des règles protectrices d&apos;ordre
          public applicables aux consommateurs.
        </p>
        <p>
          Pour toute question relative aux présentes conditions :{" "}
          <LegalValue value={COMPANY.email} />.
        </p>
      </LegalSection>

      <LegalContactCta email={COMPANY.email}>
        <p>
          Une question sur vos droits ou l&apos;utilisation du service ?
          Notre équipe vous répond sous 48 h ouvrées.
        </p>
      </LegalContactCta>
    </LegalPage>
  );
}
