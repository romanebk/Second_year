export type Niveau = "debutant" | "pro";
export type Plateforme = "woocommerce" | "mychariow" | "autre";
export type Role = "user" | "admin";

export type Profile = {
  id: string;
  nom: string | null;
  prenoms: string | null;
  telephone: string | null;
  pays: string | null;
  niveau: Niveau | null;
  plateforme: Plateforme | null;
  role: Role;
  onboarded: boolean;
  /** Horodatage de l'acceptation des CGU (null pour les comptes antérieurs). */
  cgu_accepted_at: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  image_url: string;
  prix_conseille: number;
  marge_estimee: string;
  score: number;
  pays_cible: string[];
  mois_pertinents: number[];
  public_cible: string;
  arguments_vente: string[];
  angles_marketing: string[];
  source: string;
  updated_at: string;
  created_at: string;
};

export type AdminUser = {
  id: string;
  email: string | null;
  nom: string | null;
  prenoms: string | null;
  telephone: string | null;
  pays: string | null;
  niveau: Niveau | null;
  plateforme: Plateforme | null;
  role: Role;
  onboarded: boolean;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type Store = {
  id: string;
  user_id: string;
  nom: string;
  plateforme: Plateforme;
  pays: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      products: {
        Row: Product;
        Insert: Partial<Product>;
        Update: Partial<Product>;
      };
      favorites: {
        Row: Favorite;
        Insert: Partial<Favorite> & { user_id: string; product_id: string };
        Update: Partial<Favorite>;
      };
      stores: {
        Row: Store;
        Insert: Partial<Store> & { user_id: string; nom: string; plateforme: Plateforme; pays: string };
        Update: Partial<Store>;
      };
    };
  };
};

export type SubscriptionStatut = "pending" | "active" | "expired" | "canceled";

/** Agrégateur ayant encaissé : Paddle pour l'Europe, FedaPay pour l'Afrique. */
export type PaymentProvider = "paddle" | "fedapay";

export type Subscription = {
  id: string;
  user_id: string;
  statut: SubscriptionStatut;
  current_period_start: string | null;
  current_period_end: string | null;
  provider: PaymentProvider | null;
  /** Identifiant Paddle de l'abonnement (sub_…). Null côté FedaPay. */
  provider_subscription_id: string | null;
  /** Identifiant Paddle du client (ctm_…). Null côté FedaPay. */
  provider_customer_id: string | null;
  /** Résilié : l'accès court jusqu'à `current_period_end`, sans reprélèvement. */
  annule_a_la_fin: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentStatut = "pending" | "approved" | "declined" | "canceled";

export type Payment = {
  id: string;
  user_id: string;
  provider: PaymentProvider;
  provider_transaction_id: string;
  /** Unité mineure : centimes pour EUR, francs pour XOF (sans subdivision). */
  montant: number;
  devise: string;
  statut: PaymentStatut;
  created_at: string;
  updated_at: string;
};
