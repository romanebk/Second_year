import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalCallout,
  LegalContactCta,
  LegalDefinitions,
  LegalList,
  LegalPage,
  LegalSection,
  LegalValue,
} from "@/components/legal/legal-page";
import { COMPANY, HOSTING, NO_GUARANTEE_NOTICE } from "@/lib/legal";

const SECTIONS = [
  "1. Éditeur du service",
  "2. Hébergement",
  "3. Nature du service et absence de garantie de résultat",
  "4. Propriété intellectuelle",
  "5. Données personnelles",
  "6. Liens hypertextes",
  "7. Disponibilité du service",
  "8. Droit applicable",
  "9. Contact",
];

export const metadata: Metadata = {
  title: "Mentions légales — Trendza",
  description:
    "Informations légales relatives à l'éditeur, à l'hébergement et aux conditions d'utilisation du service Trendza.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      intro="Les présentes mentions légales précisent l'identité de l'éditeur du service Trendza, les modalités d'hébergement, ainsi que les règles applicables au contenu publié sur le site."
      sections={SECTIONS}
    >
      <LegalSection title="1. Éditeur du service">
        <p>
          Le service Trendza est édité par la société {COMPANY.legalName}, ci-après
          « l&apos;Éditeur ».
        </p>
        <LegalDefinitions
          rows={[
            { term: "Dénomination sociale", value: COMPANY.legalName },
            { term: "Forme juridique", value: <LegalValue value={COMPANY.legalForm} /> },
            { term: "Capital social", value: <LegalValue value={COMPANY.capital} /> },
            {
              term: "Numéro d'immatriculation",
              value: <LegalValue value={COMPANY.registration} />,
            },
            { term: "Siège social", value: <LegalValue value={COMPANY.address} /> },
            {
              term: "Directeur de la publication",
              value: <LegalValue value={COMPANY.publisher} />,
            },
            { term: "Email de contact", value: <LegalValue value={COMPANY.email} /> },
            { term: "Téléphone", value: <LegalValue value={COMPANY.phone} /> },
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Hébergement">
        <p>
          L&apos;application est hébergée par {HOSTING.app.name} — {HOSTING.app.detail}.
        </p>
        <p>
          Les données de compte et de catalogue sont hébergées par {HOSTING.data.name} —{" "}
          {HOSTING.data.detail}.
        </p>
      </LegalSection>

      <LegalSection title="3. Nature du service et absence de garantie de résultat">
        <LegalCallout>{NO_GUARANTEE_NOTICE}</LegalCallout>
        <p>
          Trendza est un outil d&apos;aide à la décision destiné aux vendeurs
          e-commerce. Les analyses proposées (score de tendance, niveau de
          concurrence, saisonnalité, marges estimées, prévisions) reposent sur des
          modèles statistiques et des données de marché agrégées, dont une partie
          peut être issue de sources simulées ou incomplètes.
        </p>
        <p>
          L&apos;Éditeur ne saurait être tenu responsable des décisions commerciales
          prises par l&apos;utilisateur sur la base de ces informations, ni des
          pertes financières, ruptures de stock, invendus ou manques à gagner qui
          pourraient en résulter.
        </p>
      </LegalSection>

      <LegalSection title="4. Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments composant le service Trendza — marque, logo,
          charte graphique, interfaces, textes, algorithmes d&apos;analyse et bases
          de données — est protégé par le droit de la propriété intellectuelle et
          demeure la propriété exclusive de l&apos;Éditeur.
        </p>
        <p>
          Toute reproduction, représentation, extraction ou réutilisation, totale ou
          partielle, sans autorisation écrite préalable de l&apos;Éditeur est
          interdite. Les fiches produits et contenus générés par le service peuvent
          en revanche être librement utilisés par l&apos;utilisateur pour les besoins
          de sa propre activité commerciale.
        </p>
        <p>
          Les marques et logos des plateformes tierces mentionnées (WooCommerce,
          MyChariow, ou toute autre) appartiennent à leurs titulaires respectifs.
          Leur citation à des fins descriptives n&apos;implique aucun partenariat ni
          affiliation.
        </p>
      </LegalSection>

      <LegalSection title="5. Données personnelles">
        <p>
          Le traitement des données personnelles collectées par le service est décrit
          en détail dans notre{" "}
          <Link href="/confidentialite" className="text-primary hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Liens hypertextes">
        <p>
          Le service peut contenir des liens vers des sites tiers (plateformes
          e-commerce, fournisseurs, sources de tendances). L&apos;Éditeur
          n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité
          quant à leur contenu, leurs pratiques ou leur disponibilité.
        </p>
      </LegalSection>

      <LegalSection title="7. Disponibilité du service">
        <p>
          L&apos;Éditeur s&apos;efforce d&apos;assurer la disponibilité du service
          mais ne souscrit à aucune obligation de résultat sur ce point. Le service
          peut être interrompu, notamment pour des opérations de maintenance, de mise
          à jour, ou en raison d&apos;un incident affectant ses prestataires
          techniques.
        </p>
        <LegalList
          items={[
            "L'accès au service peut être suspendu sans préavis en cas d'urgence technique ou de sécurité.",
            "L'Éditeur se réserve le droit de faire évoluer les fonctionnalités du service à tout moment.",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Droit applicable">
        <p>
          Les présentes mentions légales sont régies par le droit applicable au siège
          social de l&apos;Éditeur. En cas de litige, et à défaut de résolution
          amiable, compétence est attribuée aux tribunaux compétents de ce ressort,
          sous réserve des dispositions protectrices d&apos;ordre public applicables
          aux consommateurs.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Pour toute question relative au service ou aux présentes mentions légales,
          vous pouvez écrire à <LegalValue value={COMPANY.email} />.
        </p>
      </LegalSection>

      <LegalContactCta email={COMPANY.email}>
        <p>
          Une question sur Trendza, son éditeur ou ses mentions légales ?
          Écrivez-nous, nous vous répondrons dans les meilleurs délais.
        </p>
      </LegalContactCta>
    </LegalPage>
  );
}
