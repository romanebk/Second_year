# SocialAI

SaaS de gestion de réseaux sociaux pour créateurs de contenu — planifie et
publie sur **Instagram, Facebook et TikTok** depuis un seul tableau de bord.

> **MVP (v1)** : authentification, tableau de bord, planificateur de
> publications (composer + calendrier + liste) et paramètres. Les intégrations
> réelles Meta/TikTok, l'analytics, le générateur de hashtags IA et les
> paiements ne sont **pas** inclus dans cette version.

---

## Stack technique

| Couche | Techno |
|--------|--------|
| Frontend | Next.js 14 (App Router) · React 18 · TypeScript |
| Styles | Tailwind CSS (design system maison, light/dark) |
| Backend | Next.js API Routes (Route Handlers) |
| Base de données | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (email/mot de passe + Google OAuth optionnel) |
| File d'attente | Abstraction prête pour Redis/BullMQ (mockée pour le MVP) |
| Icônes | lucide-react + glyphes SVG de marque |

---

## Démarrage rapide

### 1. Prérequis
- Node.js 18.18+
- PostgreSQL 14+ (ou Docker)

### 2. Installation
```bash
npm install
```

### 3. Variables d'environnement
Copie `.env.example` vers `.env` et ajuste si besoin :
```bash
cp .env.example .env
```
Génère un secret NextAuth :
```bash
openssl rand -base64 32   # colle le résultat dans NEXTAUTH_SECRET
```

### 4. Base de données
Avec Docker (recommandé) :
```bash
docker run -d --name socialai-pg \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=socialai \
  -p 5432:5432 postgres:16-alpine
```
Puis synchronise le schéma et charge les données de démo :
```bash
npm run db:push     # applique prisma/schema.prisma
npm run db:seed     # crée un compte démo + posts d'exemple
```

### 5. Lancer l'app
```bash
npm run dev
```
Ouvre http://localhost:3000

### Compte de démonstration
Après `npm run db:seed` :
- **Email** : `demo@socialai.app`
- **Mot de passe** : `password123`

---

## Scripts

| Script | Rôle |
|--------|------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (génère aussi le client Prisma) |
| `npm run start` | Serveur de production |
| `npm run db:push` | Applique le schéma Prisma à la base |
| `npm run db:seed` | Remplit la base avec des données de démo |
| `npm run db:studio` | Ouvre Prisma Studio |
| `npm run lint` | Lint ESLint |

---

## Structure du projet

```
app/
├── (auth)/            # login + register (layout split-screen)
├── (dashboard)/       # espace protégé (sidebar + topbar)
│   ├── dashboard/     # vue d'ensemble + comptes connectés
│   ├── posts/         # liste, calendrier, composer (new), édition [id]
│   └── settings/      # profil + placeholders "Connecter …"
├── api/
│   ├── auth/[...nextauth]/   # handler NextAuth
│   ├── register/            # inscription
│   ├── profile/             # mise à jour profil
│   ├── posts/               # CRUD posts (+ [id]/publish)
│   ├── upload/              # upload média (local /public/uploads)
│   └── cron/publish/        # traite les posts programmés dus
├── page.tsx           # landing publique
└── layout.tsx         # fonts, thèmes, providers

components/            # UI primitives + composants métier
lib/
├── prisma.ts          # client Prisma (singleton)
├── auth.ts            # config NextAuth + helpers session
├── constants.ts       # métadonnées plateformes & statuts
├── queries.ts         # accès lecture (dashboard, posts…)
├── posts-service.ts   # logique métier posts (create/update/delete)
├── validations/       # schémas Zod (auth, post)
└── queue/             # abstraction file d'attente (voir ci-dessous)
prisma/
├── schema.prisma      # modèles de données
└── seed.ts            # données de démo
```

---

## Architecture de la file d'attente (publication programmée)

La publication programmée est construite derrière une interface `PublishQueue`
(`lib/queue/types.ts`) pour que le passage à Redis/BullMQ soit trivial :

- **`mock-queue.ts`** — implémentation par défaut du MVP : `setTimeout`
  en mémoire + un poller de secours. Aucune dépendance externe.
- **`bullmq-queue.ts`** — stub documenté montrant exactement comment brancher
  BullMQ + ioredis. Sélectionné via `QUEUE_DRIVER=bullmq`.
- **`publish-worker.ts`** — la logique de publication (mock) : elle fait
  transiter les statuts `PostTarget` puis `Post`. Quand les vraies API Meta/
  TikTok arriveront, seul `publishToPlatform()` change.
- **`/api/cron/publish`** — endpoint appelable par un cron externe (Vercel
  Cron, etc.) pour traiter les posts dus.

Basculer de driver = changer une variable d'env, **sans toucher au code appelant**.

---

## Modèle de données (Prisma)

- **User** — compte (email/mot de passe ou OAuth), fuseau horaire.
- **Account / Session / VerificationToken** — modèles adaptateur NextAuth.
- **SocialAccount** — compte social connecté (mock pour le MVP ; champs de token
  prêts pour la vraie intégration OAuth).
- **Post** — publication (contenu, statut, date programmée/publiée).
- **MediaAsset** — média attaché à un post (image/vidéo, plusieurs possibles).
- **PostTarget** — jointure `post × plateforme` : chaque plateforme a son propre
  statut, ce qui permet « publié sur Instagram, échoué sur TikTok ».

Statuts d'un post : `DRAFT` → `SCHEDULED` → `PUBLISHING` → `PUBLISHED` / `FAILED`.

---

## Design system

Identité **Ink & Tangerine** : canevas *warm stone* (papier chaud), couleur de
marque **tangerine** `#C2410C` et accent signal **teal** `#0F766E` — une
direction éditoriale chaleureuse, à l'écart des dégradés violet/rose génériques.
Typographie géométrique **Outfit** (titres) + **Inter** (corps). Support complet
clair/sombre via tokens CSS sémantiques (paires vérifiées WCAG AA), rythme
d'espacement 8px, rayons de 0.7rem, micro-interactions 150–300ms (retour tactile
au press, barre d'onglet active).

> Le design est entièrement piloté par des variables CSS
> (`app/globals.css`) : changer d'identité = éditer les tokens, sans toucher aux
> composants.

---

## Hors périmètre du MVP (volontairement)
- Intégrations réelles Meta / TikTok (OAuth + publication)
- Module analytics
- Générateur de hashtags IA
- Système de paiement
