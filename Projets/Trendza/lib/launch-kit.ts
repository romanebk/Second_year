import type { Product } from "@/types/database";

export type ProductSheet = {
  titre: string;
  description: string;
  bulletPoints: string[];
  tags: string[];
};

/** Builds a copy-paste-ready product sheet from a product row. Pure template logic — no AI/API call. */
export function generateProductSheet(product: Product): ProductSheet {
  const titre = `${product.nom} – Qualité premium, livraison rapide`;

  const intro = product.description;
  const argumentsLine =
    product.arguments_vente.length > 0
      ? `Pourquoi le choisir : ${product.arguments_vente.join(", ").toLowerCase()}.`
      : "";
  const publicLine = product.public_cible ? `Idéal pour : ${product.public_cible}.` : "";

  const description = [intro, argumentsLine, publicLine].filter(Boolean).join("\n\n");

  const bulletPoints =
    product.arguments_vente.length > 0
      ? product.arguments_vente
      : ["Produit de qualité", "Livraison rapide", "Satisfaction garantie"];

  const baseTags = [
    product.categorie.toLowerCase(),
    ...product.nom
      .toLowerCase()
      .replace(/[^a-zà-ÿ0-9\s]/gi, "")
      .split(" ")
      .filter((w) => w.length > 3),
    "tendance",
    "meilleur prix",
    "livraison rapide",
  ];
  const tags = Array.from(new Set(baseTags)).slice(0, 8);

  return { titre, description, bulletPoints, tags };
}

export type GuideStep = { titre: string; description: string };

const WOOCOMMERCE_STEPS: GuideStep[] = [
  {
    titre: "Connectez-vous à votre tableau de bord WordPress",
    description:
      "Rendez-vous sur votre-site.com/wp-admin puis identifiez-vous avec vos accès administrateur.",
  },
  {
    titre: "Ouvrez WooCommerce → Produits → Ajouter",
    description: "Dans le menu latéral, cliquez sur WooCommerce puis sur \"Ajouter un produit\".",
  },
  {
    titre: "Collez le titre et la description",
    description:
      "Copiez le titre optimisé dans le champ \"Titre\" et la description générée dans l'éditeur de description.",
  },
  {
    titre: "Ajoutez l'image du produit",
    description:
      "Dans \"Image mise en avant\", importez une photo nette de votre produit (idéalement plusieurs angles).",
  },
  {
    titre: "Renseignez le prix",
    description: "Dans l'onglet \"Général\", indiquez le prix conseillé dans le champ \"Tarif régulier\".",
  },
  {
    titre: "Ajoutez les tags SEO",
    description:
      "Dans le module \"Étiquettes du produit\" (colonne de droite), collez les tags générés pour améliorer votre référencement.",
  },
  {
    titre: "Publiez",
    description: "Cliquez sur \"Publier\" en haut à droite. Votre fiche produit est en ligne.",
  },
];

const MYCHARIOW_STEPS: GuideStep[] = [
  {
    titre: "Connectez-vous à votre espace MyChariow",
    description: "Accédez à votre tableau de bord vendeur MyChariow avec vos identifiants.",
  },
  {
    titre: "Créez un nouveau produit",
    description: "Cliquez sur \"Mes produits\" puis sur le bouton \"Ajouter un produit\".",
  },
  {
    titre: "Renseignez le nom et la description",
    description: "Collez le titre optimisé et la description générée dans les champs correspondants.",
  },
  {
    titre: "Importez le visuel principal",
    description: "Ajoutez une photo de qualité dans la section \"Image du produit\".",
  },
  {
    titre: "Fixez votre prix de vente",
    description: "Indiquez le prix conseillé (ajustez-le selon votre marge et vos frais de livraison).",
  },
  {
    titre: "Configurez la livraison et le paiement",
    description: "Activez le paiement à la livraison ou en ligne selon votre marché, puis définissez vos zones de livraison.",
  },
  {
    titre: "Publiez votre page produit",
    description: "Cliquez sur \"Publier\" pour rendre votre page de commande accessible et partageable.",
  },
];

export function getPlatformGuide(platform: "woocommerce" | "mychariow"): GuideStep[] {
  return platform === "woocommerce" ? WOOCOMMERCE_STEPS : MYCHARIOW_STEPS;
}
