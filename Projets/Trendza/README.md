# Trendza

Trendza aide les vendeurs e-commerce francophones (débutants comme confirmés) à
identifier le produit phare à vendre selon la saisonnalité, la période actuelle et le
pays ciblé — puis les accompagne dans la préparation de leur lancement (fiche produit
prête à l'emploi, guide de publication WooCommerce / MyChariow).

**Stack** : Next.js (App Router) · TypeScript · Supabase (Postgres, Auth, RLS) ·
Tailwind CSS v4 · déployé sur Vercel. **Freemium** : catalogue gratuit, analyse
réservée aux abonnés (25 €/mois).

## Fonctionnalités

- **Catalogue produits** (`/catalogue`) — accès libre : liste complète triée par score
  de tendance, fiches détaillées, kit de lancement, favoris et boutiques.
- **Espace d'analyse** (réservé aux abonnés) — tableau de bord "Produit phare"
  (sélection pays/mois, filtres), analyses par produit (score sur 11 critères, marché,
  concurrence, saisonnalité, prévisions de rentabilité 1–12 mois, sources estimées) et
  assistant IA en chat (NLU tolérante aux fautes, budgets, alias pays).
- **Espace administrateur** (`/admin`) — gestion des utilisateurs, du catalogue
  (saisie manuelle, import CSV, ingestion Google Trends) et suivi des paiements.
- **Authentification** email/mot de passe + Google OAuth (Supabase Auth), onboarding
  (pays, niveau, plateforme préférée), consentement CGU horodaté.
- **Abonnement** (`/abonnement`) — paiement par carte (Paddle) ou Mobile Money
  (FedaPay), accès protégé côté serveur (voir section 7).

Les données produits viennent de trois sources distinguées par le champ `source` :
données de démonstration (`seed`, migration `0003_seed_data.sql`), saisie/import
admin (`manual_admin`, `csv_import`) et ingestion Google Trends (`pytrends`, via le
service Python).

## Structure du projet

```
app/
  (marketing)/        landing page publique, documents légaux
  (auth)/              connexion, inscription, onboarding
  (app)/                catalogue, dashboard, produits, assistant, boutiques, favoris,
                        abonnement (protégé par session)
  api/                 route handlers : assistant, abonnement (checkout, webhooks),
                        admin (ingestion trends)
  auth/callback/        échange du code OAuth Supabase
components/
  ui/                   primitives shadcn/ui (button, card, select, dialog, tabs...)
  marketing/, auth/, shell/, shared/   présentation et coquille de l'app
  dashboard/, product/, catalogue/, analysis/, chat/, stores/, favorites/
  admin/                pilotage admin (utilisateurs, produits, charts)
  subscription/         abonnement et paiement (boutons, statut, résiliation)
  legal/                pages légales et sommaire sticky
lib/
  supabase/             clients Supabase (browser, server, middleware, admin/service_role)
  data/                 requêtes typées (products, favorites, stores, profiles)
  engine/               moteur d'analyse TypeScript pur (sources, scoring, prédictions)
  subscription.ts       logique d'abonnement (prix, accès premium, périodes)
  paddle.ts / fedapay.ts  clients de paiement serveur (server-only)
  auth-guard.ts         garde d'accès (session + abonnement) côté serveur
  launch-kit.ts         génération de la fiche produit + guides de publication
  constants.ts          pays, mois, catégories, plateformes, provenance produit
types/                  types TypeScript partagés (Product, Profile, Subscription, Payment)
supabase/migrations/    schéma SQL, policies RLS, données de démonstration
proxy.ts                rafraîchissement de session Supabase (middleware Next.js)

services/
  trends-ingestion/     service Python autonome (Google Trends → Supabase),
                        déployé séparément — voir son propre README
```

## Prérequis

- Node.js 20+
- Un projet [Supabase](https://supabase.com) (gratuit pour démarrer)

## 1. Installation

```bash
npm install
```

## 2. Configuration Supabase

### a. Créer le projet et récupérer les clés

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans **Project Settings → API**, notez l'**URL** et la clé **anon public**.
3. Copiez `.env.local.example` vers `.env.local` et renseignez ces valeurs :

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### b. Appliquer les migrations (schéma + RLS + données de démo)

Dans le **SQL Editor** du dashboard Supabase, exécutez **dans l'ordre** le contenu des
fichiers de `supabase/migrations/` :

1. `0001_schema.sql` — tables `profiles`, `products`, `favorites`, `stores`
2. `0002_rls_policies.sql` — activation de la Row Level Security et policies
3. `0003_seed_data.sql` — ~20 produits de démonstration
4. `0004_profile_fields.sql` — champs nom/prénoms/téléphone sur `profiles`
5. `0005_admin_role.sql` — champ `role` (`user`/`admin`) sur `profiles`
6. `0006_admin_policies.sql` — policies RLS et fonctions (`is_admin`, `admin_users`)
   nécessaires à l'espace `/admin` (gestion des utilisateurs et du catalogue)
7. `0007_cgu_consent.sql` — colonne `cgu_accepted_at` sur `profiles` (preuve
   horodatée de l'acceptation des conditions d'utilisation à l'inscription)
8. `0008_subscriptions.sql` — tables `subscriptions` et `payments` (lecture seule
   pour l'utilisateur), fonction `has_active_subscription` (abonnement FedaPay)
9. `0009_paddle_multi_provider.sql` — ajout de Paddle (2e agrégateur) : colonnes
   `provider`, `provider_transaction_id`, `provider_subscription_id`, `annule_a_la_fin`

Vous pouvez aussi utiliser la [Supabase CLI](https://supabase.com/docs/guides/cli) si
vous préférez :

```bash
supabase link --project-ref <votre-ref-projet>
supabase db push
```

**Compte admin** : la migration `0005` fait en sorte que **le tout premier compte
créé** sur le projet devienne automatiquement `admin` — inscrivez-vous en premier
pour obtenir ce rôle. Si vous avez déjà créé des comptes de test avant d'appliquer
cette migration, promouvez-vous manuellement :

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'vous@exemple.com');
```

### c. Activer la connexion Google (optionnel mais recommandé)

1. Dans le dashboard Supabase : **Authentication → Providers → Google**, activez le
   provider.
2. Créez un identifiant OAuth 2.0 côté
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (type
   "Application Web").
3. Ajoutez comme **URI de redirection autorisée** l'URL de callback fournie par
   Supabase (visible sur la même page du dashboard, du type
   `https://xxxxxxxxxxxx.supabase.co/auth/v1/callback`).
4. Reportez le **Client ID** et le **Client Secret** Google dans la configuration du
   provider côté Supabase.
5. Dans **Authentication → URL Configuration**, ajoutez
   `http://localhost:3000/auth/callback` (dev) et votre domaine Vercel
   `https://votre-domaine.vercel.app/auth/callback` (prod) aux **Redirect URLs**.

### d. Emails de confirmation (optionnel)

Par défaut, Supabase envoie un email de confirmation à l'inscription. Pour un
développement local plus rapide, vous pouvez désactiver la confirmation email dans
**Authentication → Providers → Email** (décochez "Confirm email").

## 3. Lancer le projet en local

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

Autres commandes utiles :

```bash
npm run build   # build de production
npm run start   # démarre le build de production
npm run lint    # ESLint
```

## 4. Déployer sur Vercel

1. Poussez le projet sur GitHub.
2. Sur [vercel.com](https://vercel.com), importez le repository.
3. Dans **Settings → Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` — votre domaine final (ex. `https://trendza.vercel.app`),
     utilisé pour générer l'URL absolue de l'image de partage (`og:image`)
4. Déployez.
5. Une fois le domaine Vercel connu, retournez dans Supabase
   (**Authentication → URL Configuration**) pour y ajouter
   `https://votre-domaine.vercel.app/auth/callback` comme Redirect URL, et mettez à
   jour l'URI de redirection autorisée côté Google Cloud Console si vous utilisez le
   login Google.

## 5. Compléter les documents légaux (avant mise en ligne publique)

Les pages `/mentions-legales`, `/confidentialite` et `/conditions-utilisation` sont
rédigées, mais certaines informations propres à l'éditeur restent à renseigner.

**Tout se modifie dans un seul fichier : `lib/legal.ts`.** Les champs encore vides y
valent `À COMPLÉTER` et s'affichent en surbrillance orange sur les pages, afin qu'un
oubli se remarque immédiatement :

- forme juridique, capital social, numéro d'immatriculation, siège social de
  **GZP Holding** ;
- directeur de la publication ;
- email de contact général, email dédié aux données personnelles, téléphone.

Pensez également à mettre à jour `LEGAL_UPDATED_AT` à chaque révision des documents.

> ⚠️ Ces documents sont une base de travail rédigée pour couvrir le fonctionnement
> réel de l'application. Ils ne remplacent pas la relecture d'un professionnel du
> droit, notamment sur les juridictions visées (UE et Afrique de l'Ouest) et sur le
> régime applicable à l'activité de GZP Holding.

## 6. Alimenter le catalogue produits

Quatre façons d'ajouter des produits, toutes réservées aux administrateurs et
distinguées en base par le champ `source`.

| Provenance | `source` | Où |
|---|---|---|
| Saisie manuelle | `manual_admin` | `/admin` → onglet Produits → « Ajouter un produit » |
| Import CSV en masse | `csv_import` | `/admin` → onglet Produits → « Importer un CSV » |
| Google Trends (automatisé) | `pytrends` | `/admin` → bouton « Google Trends », ou tâche planifiée |
| Données de démonstration | `seed` | migration `0003_seed_data.sql` |

### a. Import CSV

Le modèle est téléchargeable depuis la fenêtre d'import. Colonnes obligatoires :
`nom`, `description`, `categorie`, `image_url`, `score`. Optionnelles :
`pays_cible`, `mois_pertinents`, `prix_conseille`, `marge_estimee`,
`public_cible`, `arguments_vente`, `angles_marketing`.

Les listes se séparent par `|` (ex. `CI|SN|FR`). Le fichier est validé avant
insertion : les lignes fautives sont listées avec leur numéro et la raison du
rejet, **sans bloquer les lignes valides**. Un aperçu s'affiche avant
confirmation.

### b. Ingestion Google Trends

Un service **Python séparé** vit dans [`services/trends-ingestion/`](./services/trends-ingestion/)
et dispose de sa propre documentation d'installation et de déploiement.

Il se déclenche de deux façons :

- **manuellement**, via le bouton « Google Trends » de la page `/admin` ;
- **automatiquement**, via une tâche planifiée (`python ingest.py`).

Il n'est jamais appelé pendant une visite utilisateur : Google limite fortement
le débit et une ingestion prend plusieurs minutes.

Pour activer le bouton, ajoutez côté application (local et Vercel) :

| Variable | Rôle |
|---|---|
| `TRENDS_SERVICE_URL` | URL publique du service Python |
| `TRENDS_SERVICE_SECRET` | Secret partagé avec le service |

> ⚠️ La clé `service_role` Supabase n'est utilisée **que** par le service
> Python. Elle ne doit jamais être ajoutée aux variables de l'application
> Next.js : elle contourne la Row Level Security.

Deux limites à connaître avant de vous appuyer dessus :

1. **pytrends n'est plus maintenu** (dépôt archivé en avril 2025). Le service
   isole cette dépendance dans un seul fichier (`trends_source.py`) pour
   pouvoir en changer sans réécrire le reste.
2. **Google Trends mesure un intérêt de recherche, pas un produit.** Les fiches
   ingérées arrivent sans prix, sans visuel et sans arguments de vente : elles
   portent un badge « À compléter » dans `/admin` jusqu'à enrichissement.

## 7. Abonnement et paiement (Paddle + FedaPay)

Trendza fonctionne en freemium : le catalogue est libre d'accès, les outils
d'analyse sont réservés aux abonnés (**25 € / mois**, soit 16 400 FCFA).

| Gratuit | Trendza Pro (25 € / mois) |
|---|---|
| `/catalogue` — tous les produits | `/dashboard` — meilleurs produits, opportunités |
| `/produits/[id]` — fiche produit | `/produits/[id]/analyse` — prévisions, score détaillé |
| `/produits/[id]/lancement` — kit de lancement | `/assistant` — recommandations IA |
| `/favoris`, `/boutiques` | |

Les comptes **administrateurs** ont l'accès complet sans abonnement.

### Pourquoi deux agrégateurs

Les deux marchés visés ne paient pas de la même façon : l'Europe par carte en
euros, l'Afrique de l'Ouest par Mobile Money en francs CFA. Aucun prestataire
ne couvre correctement les deux, d'où deux canaux pour un même abonnement.

| | **Paddle** | **FedaPay** |
|---|---|---|
| Cible | Europe et reste du monde | Afrique de l'Ouest |
| Moyens | Carte, PayPal, Apple/Google Pay | MTN, Moov, Orange, Wave |
| Devise | EUR (25 €) | XOF (16 400 F) |
| Récurrence | **Automatique** (vrai abonnement) | Aucune : 30 jours par paiement |
| TVA | Collectée et reversée par Paddle | À votre charge |

Paddle est *Merchant of Record* : il vend en son nom et gère donc la TVA du
pays de l'acheteur — l'obligation la plus lourde quand on vend un service
numérique à des particuliers européens.

Le moyen proposé par défaut découle du pays du profil
(`providerParDefaut` dans `lib/subscription.ts`), mais les deux restent
offerts à tout le monde.

**Le franc CFA est arrimé à l'euro à taux fixe** (1 € = 655,957 XOF). Le prix
en francs est donc dérivé du prix en euros au build, sans jamais interroger de
service de change. Pour changer le tarif, modifiez `ABONNEMENT_PRIX_EUR`
**et** le prix correspondant dans le catalogue Paddle : c'est ce dernier qui
fixe le montant réellement débité.

### Modèle d'accès

`subscriptions.current_period_end` est la **seule** source de vérité, quel que
soit le canal — le reste de l'application n'a pas à savoir qui a encaissé.

- **Paddle** : la fin de période annoncée par Paddle y est recopiée à chaque
  évènement d'abonnement. Le renouvellement est automatique ; l'utilisateur
  résilie depuis `/abonnement` (`effectiveFrom: next_billing_period`, donc
  l'accès court jusqu'au terme déjà payé).
- **FedaPay** : chaque paiement accepté ouvre 30 jours. Un paiement effectué
  alors que l'accès est encore actif **prolonge** la période au lieu de la
  remplacer, sans perte des jours restants.

### Configuration Paddle

1. Créez un compte sur [paddle.com](https://www.paddle.com), puis dans le bac
   à sable ([sandbox-vendors.paddle.com](https://sandbox-vendors.paddle.com)) :
2. **Catalog → Products** : créez le produit « Trendza Pro », puis un **prix
   récurrent mensuel de 25 €**. Notez son identifiant `pri_…`.
3. **Developer tools → Authentication** : créez une clé d'API serveur
   (`pdl_…`) et un **jeton client** (`test_…` / `live_…`).
4. **Developer tools → Notifications** : créez une destination pointant vers
   `https://votre-domaine.com/api/abonnement/webhook/paddle`, abonnée aux
   évènements ci-dessous, puis copiez le **secret** (`pdl_ntfset_…`).

| Évènement | Effet |
|---|---|
| `subscription.created` / `.activated` / `.updated` / `.resumed` | Ouvre ou prolonge l'accès |
| `subscription.canceled` / `.paused` / `.past_due` | Met à jour le statut |
| `transaction.completed` | Journalise le paiement (dont les renouvellements) |
| `transaction.payment_failed` / `.canceled` | Journalise l'échec |

5. **Checkout → Website approval** : déclarez votre domaine, sinon le checkout
   refuse de s'ouvrir.

### Configuration FedaPay

1. Créez un compte sur [fedapay.com](https://fedapay.com) et récupérez votre
   clé secrète (Dashboard → API).
2. Créez un webhook (Dashboard → Webhooks) pointant vers
   `https://votre-domaine.com/api/abonnement/webhook`, abonné à
   `transaction.approved`, `transaction.declined` et `transaction.canceled`,
   puis copiez le « Secret du point de terminaison ».

### Variables d'environnement

| Variable | Rôle |
|---|---|
| `PADDLE_API_KEY` | Clé d'API serveur |
| `PADDLE_CLIENT_TOKEN` | Jeton passé au navigateur pour ouvrir le checkout |
| `PADDLE_PRICE_ID` | Prix récurrent — **fixe le montant réellement débité** |
| `PADDLE_WEBHOOK_SECRET` | Vérifie l'entête `Paddle-Signature` |
| `PADDLE_ENVIRONMENT` | `production`, ou bac à sable par défaut |
| `FEDAPAY_SECRET_KEY` | Clé secrète FedaPay |
| `FEDAPAY_ENVIRONMENT` | `live`, ou bac à sable par défaut |
| `FEDAPAY_WEBHOOK_SECRET` | Vérifie l'entête `X-FEDAPAY-SIGNATURE` |
| `SUPABASE_SERVICE_ROLE_KEY` | Requise : seuls les webhooks activent un abonnement |

Appliquez ensuite les migrations `0008_subscriptions.sql` puis
`0009_paddle_multi_provider.sql`.

> ⚠️ **Les deux environnements sont en bac à sable par défaut.** Toute valeur
> autre que `production` (Paddle) ou `live` (FedaPay) y reste : un oubli de
> configuration n'encaissera jamais de vrai argent. Pensez à basculer
> explicitement le jour du lancement.

Les deux canaux sont indépendants : si un seul est configuré, seul son moyen
de paiement apparaît sur `/abonnement`. Rien ne casse.

### Comment l'accès est protégé

Le contrôle est fait **côté serveur, avant tout rendu** (`requireSubscription`
dans `lib/auth-guard.ts`) : masquer un bloc dans l'interface ne protégerait
rien, puisque les données partiraient déjà dans le HTML.

Quatre garde-fous complètent le dispositif :

- **L'API de l'assistant est protégée séparément** de sa page. Sans cela, un
  utilisateur gratuit appellerait `/api/assistant` directement et contournerait
  entièrement le paywall.
- **Aucune policy RLS d'écriture** n'existe sur `subscriptions` et `payments` :
  seuls les webhooks, via la clé `service_role`, peuvent y écrire. Un
  utilisateur ne peut pas s'octroyer un abonnement depuis son navigateur.
- **Le montant est fixé côté serveur** — par `PADDLE_PRICE_ID` d'un côté, par
  `ABONNEMENT_MONTANT_XOF` de l'autre — jamais lu depuis la requête. Le client
  ne choisit que le *moyen* de paiement.
- **L'identité de l'abonné aussi.** `custom_data.user_id` est écrit par le
  serveur au moment de créer la transaction Paddle, jamais par le navigateur :
  le webhook peut donc s'y fier pour désigner qui devient abonné.

Les deux webhooks vérifient leur signature sur le **corps brut** de la requête
(le re-sérialiser invaliderait la signature), ignorent les transactions
inconnues, et sont idempotents — les deux prestataires peuvent livrer
plusieurs fois le même évènement.

### Tester en local

Les webhooks doivent être joignables depuis Internet. Exposez votre serveur :

```bash
npx untun@latest tunnel http://localhost:3000
# ou : ngrok http 3000
```

Renseignez l'URL publique obtenue dans les deux tableaux de bord, et utilisez
leurs moyens de paiement de test. Paddle fournit en plus un simulateur
d'évènements (**Developer tools → Simulations**) pour rejouer un
renouvellement ou une résiliation sans attendre un mois.

## Notes de conception

- **Sources de tendances estimées** : les 12 connecteurs de `lib/engine/sources/`
  n'ont pas encore d'implémentation temps réel ; leurs valeurs sont des
  estimations déterministes, signalées comme telles dans l'interface (pastille
  « estimation »). Le service `trends-ingestion` est la première brique réelle.
- **Guides WooCommerce/MyChariow** : instructions textuelles statiques, aucun
  appel API vers ces plateformes.
- **Row Level Security** : `products` est en lecture publique ; `favorites` et
  `stores` ne sont visibles/modifiables que par leur propriétaire (`auth.uid()`) ;
  `profiles` n'est visible/modifiable que par l'utilisateur concerné.
- **Design** : dark mode uniquement (pas de bascule clair/sombre), palette
  violet→fuchsia / orange / émeraude, composants shadcn/ui personnalisés, animations
  via `motion` (scroll-reveal, hover, transitions).
