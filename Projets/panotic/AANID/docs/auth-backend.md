# AANID — Documentation Backend : Authentification & Profil

**Partie 8 — Responsable : Will-David**
**Fichiers sources :** `w-d/backend/src/server.js` (routeur) · `w-d/backend/src/index.js` (serveur autonome)
**Package :** `@aanid/w-d-backend`

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture des fichiers](#2-architecture-des-fichiers)
3. [Dépendances](#3-dépendances)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Démarrage en développement](#5-démarrage-en-développement)
6. [Intégration à l'application principale](#6-intégration-à-lapplication-principale)
7. [Structure de données utilisateur](#7-structure-de-données-utilisateur)
8. [Rôles et abonnements](#8-rôles-et-abonnements)
9. [Référence des routes API](#9-référence-des-routes-api)
10. [Système de sécurité](#10-système-de-sécurité)
11. [Middlewares exportés](#11-middlewares-exportés)
12. [Feuille de route production](#12-feuille-de-route-production)

---

## 1. Vue d'ensemble

Ce module expose un **routeur Express** qui gère l'intégralité des opérations d'authentification et de gestion de profil de l'application AANID. Il est conçu pour être monté dans l'application principale sans aucune modification de son code interne.

Le module fournit :

- L'inscription avec vérification d'email obligatoire
- La connexion avec émission d'un couple access token / refresh token
- Le renouvellement silencieux des tokens (rotation)
- La déconnexion avec invalidation du refresh token côté serveur
- La vérification d'email et le renvoi du lien
- La réinitialisation de mot de passe par lien email
- La lecture et la mise à jour du profil
- Le changement de mot de passe authentifié
- La gestion des abonnements (lecture publique, mise à jour admin uniquement)
- Deux middlewares réutilisables par les autres modules : `authenticateToken` et `authorizeRoles`

---

## 2. Architecture des fichiers

```
w-d/backend/
├── package.json          Package @aanid/w-d-backend
└── src/
    ├── index.js          Serveur Express autonome (dev/prod standalone)
    └── server.js         Routeur Express exportable (intégration monorepo)
```

**`src/server.js`** — le cœur du module. Contient toutes les routes, la validation, la sécurité et les exports. Ne démarre pas de serveur HTTP : peut être monté dans n'importe quelle application Express.

**`src/index.js`** — point d'entrée pour lancer le serveur de façon autonome. Configure `cors`, `express.json()`, monte le routeur de `server.js`, expose `/health` et démarre l'écoute sur le port configuré.

---

## 3. Dépendances

```json
{
  "express": "^4.18.2",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5"
}
```

`helmet` (`^8.2.0`) est installé à la racine du monorepo (workspace npm) et disponible à tous les packages — il n'apparaît pas dans le `package.json` du workspace `w-d/backend` mais est résolu automatiquement depuis `node_modules/`.

Le module utilise également `crypto` de la bibliothèque standard Node.js (aucune installation requise) pour la génération des tokens opaques.

---

## 4. Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `AANID_ACCESS_SECRET` | **Oui en production** | Clé secrète pour la signature des access tokens JWT. Minimum 64 caractères aléatoires. |
| `AANID_REFRESH_SECRET` | **Oui en production** | Clé secrète pour la signature des refresh tokens JWT. Doit être différente de la précédente. |
| `PORT` | Non | Port d'écoute du serveur autonome. Défaut : `3000`. |
| `CORS_ORIGIN` | Non | Origine autorisée pour CORS en mode autonome. Défaut : `*` (dev uniquement). |
| `NODE_ENV` | Non | En mode `production`, l'absence des secrets arrête le processus. En dehors, des valeurs de développement sont utilisées et les tokens sont affichés dans les logs. |

**Génération des secrets (bash) :**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Exécuter cette commande deux fois pour obtenir deux secrets distincts.

**Exemple de fichier `.env` :**

```
AANID_ACCESS_SECRET=a3f8e1...64_caracteres_minimum...
AANID_REFRESH_SECRET=b7c2d0...64_caracteres_minimum...
PORT=3000
NODE_ENV=development
```

---

## 5. Démarrage en développement

```bash
cd w-d/backend
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:3000`. Un endpoint de santé est disponible :

```
GET /health
→ { "status": "ok", "service": "aanid-auth" }
```

En mode développement, les tokens de vérification d'email et de réinitialisation de mot de passe sont affichés dans les logs du serveur sous la forme :

```
[AANID:DEV] Verification token for kofi@exemple.com: a3f8e1...
[AANID:DEV] Password reset token for kofi@exemple.com: b7c2d0...
```

Utilisez ces valeurs dans les requêtes de test Postman (voir `docs/aanid-auth.postman_collection.json`).

---

## 6. Intégration à l'application principale

### 6.1 Montage du routeur

Dans le fichier serveur principal de l'application AANID, importer et monter le routeur de ce module. Le middleware `cors` et `express.json()` **doivent être configurés par l'application principale** — le routeur ne les ajoute pas lui-même.

```js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: ['https://app.aanid.com'] }));
app.use(express.json({ limit: '10kb' }));

// Montage du module authentification & profil
const authRouter = require('@aanid/w-d-backend');
app.use('/api', authRouter);
```

Toutes les routes du module seront disponibles sous le préfixe `/api`. Par exemple :

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile`

### 6.2 Protection des routes des autres modules

Les autres responsables de module peuvent protéger leurs propres routes en important les middlewares exportés :

```js
const { authenticateToken, authorizeRoles, ROLES } = require('@aanid/w-d-backend');

// Route accessible à tout utilisateur connecté
router.get('/villes', authenticateToken, (req, res) => {
  // req.user contient : { sub, email, role, subscription, iat, exp }
  res.json({ message: `Bonjour ${req.user.email}` });
});

// Route accessible uniquement aux administrateurs
router.patch('/admin/action', authenticateToken, authorizeRoles(ROLES.ADMIN), (req, res) => {
  res.json({ ok: true });
});

// Route accessible à plusieurs rôles
router.post('/signalement',
  authenticateToken,
  authorizeRoles(ROLES.CITOYEN, ROLES.PROFESSIONNEL, ROLES.AUTORITE),
  (req, res) => { res.json({ ok: true }); }
);
```

### 6.3 Lire les informations de l'utilisateur dans une route protégée

Après le passage par `authenticateToken`, l'objet `req.user` est disponible avec la structure suivante :

```js
{
  sub: "uuid-de-l-utilisateur",   // identifiant unique
  email: "utilisateur@exemple.com",
  role: "CITOYEN",                // voir section 8
  subscription: "FREE",           // voir section 8
  iat: 1700000000,               // timestamp d'émission
  exp: 1700000900                // timestamp d'expiration (15 minutes après émission)
}
```

---

## 7. Structure de données utilisateur

L'objet utilisateur stocké en mémoire (et qui sera migré en base de données) a la forme suivante :

```js
{
  id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", // UUID v4 généré par crypto.randomUUID()
  fullName: "Kofi Mensah",
  email: "kofi@exemple.com",                   // normalisé en minuscules
  phone: "+22996000000",                        // chiffres uniquement après normalisation
  city: "Cotonou",
  passwordHash: "$2b$12$...",                  // jamais exposé dans les réponses
  role: "CITOYEN",
  subscription: "FREE",
  emailVerified: false,
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

**Note importante :** le champ `passwordHash` est toujours retiré avant tout envoi au client via la fonction interne `safeUser()`. Aucune route n'expose ce champ.

---

## 8. Rôles et abonnements

### Rôles

| Constante | Valeur | Description |
|---|---|---|
| `ROLES.CITOYEN` | `"CITOYEN"` | Rôle par défaut à l'inscription |
| `ROLES.PROFESSIONNEL` | `"PROFESSIONNEL"` | Professionnel de la signalétique |
| `ROLES.REGIE` | `"REGIE"` | Régie publicitaire |
| `ROLES.FORMATEUR` | `"FORMATEUR"` | Formateur certifié |
| `ROLES.AUTORITE` | `"AUTORITE"` | Autorité publique ou municipale |
| `ROLES.ADMIN` | `"ADMIN"` | Administrateur plateforme — non assignable à l'inscription |

Le rôle `ADMIN` ne peut pas être choisi lors de l'inscription. Il doit être attribué manuellement en base de données.

### Abonnements

| Constante | Valeur | Accès |
|---|---|---|
| `SUBSCRIPTIONS.FREE` | `"FREE"` | Attribué par défaut à l'inscription |
| `SUBSCRIPTIONS.PREMIUM` | `"PREMIUM"` | Toutes les villes, formations gratuites, signalements illimités |
| `SUBSCRIPTIONS.PROFESSIONAL` | `"PROFESSIONAL"` | Relais publicitaires, statistiques avancées |
| `SUBSCRIPTIONS.ENTERPRISE` | `"ENTERPRISE"` | Accès complet, API dédiée, support prioritaire |

La mise à jour d'abonnement est réservée au rôle `ADMIN` via `PATCH /profile/subscription`.

---

## 9. Référence des routes API

Toutes les routes retournent du JSON. Les corps de requête sont en JSON (`Content-Type: application/json`).

Les routes protégées requièrent le header :
```
Authorization: Bearer <access_token>
```

---

### 9.1 Authentification

#### GET /health

Vérifie que le service est opérationnel (disponible uniquement en mode serveur autonome via `src/index.js`).

**Réponse 200 OK :**

```json
{ "status": "ok", "service": "aanid-auth" }
```

---

#### POST /auth/register

Crée un nouveau compte. Le rôle `ADMIN` ne peut pas être demandé via cette route.

**Corps de la requête :**

```json
{
  "fullName": "Kofi Mensah",
  "email": "kofi@exemple.com",
  "phone": "+22996000000",
  "city": "Cotonou",
  "password": "MonMotDePasse1!",
  "role": "CITOYEN"
}
```

| Champ | Type | Obligatoire | Contraintes |
|---|---|---|---|
| `fullName` | string | Oui | 2 à 100 caractères |
| `email` | string | Oui | Format email valide, normalisé en minuscules |
| `phone` | string | Oui | 7 à 15 chiffres (espaces, tirets, `+`, parenthèses tolérés et normalisés) |
| `city` | string | Oui | 2 à 100 caractères |
| `password` | string | Oui | 8 à 128 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial parmi `@$!%*?&-_#` |
| `role` | string | Non | Valeur parmi les rôles (sauf `ADMIN`). Défaut : `CITOYEN` |

**Réponse 201 Created :**

```json
{
  "message": "Compte créé. Vérifiez votre email pour activer votre compte.",
  "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

**Réponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "..." }` | Champ manquant ou validation échouée |
| 409 | `{ "error": "Cet email est déjà utilisé" }` | Email déjà enregistré |
| 500 | `{ "error": "Erreur serveur" }` | Erreur interne |

**Comportement de sécurité :** si l'email existe déjà, un hachage bcrypt est quand même exécuté avant de répondre 409, afin d'éliminer toute différence de temps observable par un attaquant.

---

#### POST /auth/login

Authentifie un utilisateur. Retourne un couple access token / refresh token.

**Corps de la requête :**

```json
{
  "email": "kofi@exemple.com",
  "password": "MonMotDePasse1!"
}
```

**Réponse 200 OK :**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "fullName": "Kofi Mensah",
    "email": "kofi@exemple.com",
    "role": "CITOYEN",
    "subscription": "FREE",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Réponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "Email et mot de passe requis" }` | Champ manquant |
| 401 | `{ "error": "Identifiants incorrects" }` | Email inconnu ou mot de passe erroné |
| 403 | `{ "error": "...", "code": "EMAIL_NOT_VERIFIED" }` | Email non encore vérifié |
| 429 | `{ "error": "Trop de tentatives..." }` | Rate limit dépassé (5 tentatives / 15 min par IP) |

**Tokens émis :**

- Access token : JWT HS256, expire dans **15 minutes**, contient `sub`, `email`, `role`, `subscription`
- Refresh token : JWT HS256, expire dans **7 jours**, contient uniquement `sub`

---

#### POST /auth/refresh

Renouvelle le couple de tokens. L'ancien refresh token est immédiatement invalidé (rotation).

**Corps de la requête :**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Réponse 200 OK :**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Réponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "Refresh token requis" }` | Corps vide ou type incorrect |
| 401 | `{ "error": "Refresh token invalide ou révoqué" }` | Token inconnu du serveur |
| 401 | `{ "error": "Refresh token expiré ou invalide" }` | Signature invalide ou expiration dépassée |

---

#### POST /auth/logout

Invalide le refresh token côté serveur. Nécessite un access token valide.

**Header requis :** `Authorization: Bearer <access_token>`

**Corps de la requête :**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Réponse 200 OK :**

```json
{
  "message": "Déconnexion réussie"
}
```

---

#### GET /auth/verify-email/:token

Active le compte en vérifiant le token envoyé par email. Le token est à usage unique et expire au bout de 24 heures.

**Paramètre d'URL :** `:token` — chaîne hexadécimale de 64 caractères

**Réponse 200 OK :**

```json
{
  "message": "Email vérifié avec succès. Vous pouvez vous connecter."
}
```

**Réponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "Lien de vérification invalide ou expiré" }` | Token inconnu ou TTL dépassé |
| 404 | `{ "error": "Compte introuvable" }` | Utilisateur supprimé entre temps |

---

#### POST /auth/resend-verification

Génère et envoie un nouveau token de vérification. Rate limité à 3 envois par heure par IP.

**Corps de la requête :**

```json
{
  "email": "kofi@exemple.com"
}
```

**Réponse 200 OK (toujours le même message, même si l'email n'existe pas) :**

```json
{
  "message": "Si un compte non vérifié existe, un email a été envoyé."
}
```

---

#### POST /auth/forgot-password

Initie la réinitialisation de mot de passe. Rate limité à 3 demandes par heure par IP.

**Corps de la requête :**

```json
{
  "email": "kofi@exemple.com"
}
```

**Réponse 200 OK (toujours le même message) :**

```json
{
  "message": "Si un compte existe, un email de réinitialisation a été envoyé."
}
```

---

#### POST /auth/reset-password

Réinitialise le mot de passe avec le token reçu par email. Invalide toutes les sessions actives de l'utilisateur.

**Corps de la requête :**

```json
{
  "token": "a3f8e1...64_caracteres...",
  "newPassword": "NouveauMotDePasse1!"
}
```

**Réponse 200 OK :**

```json
{
  "message": "Mot de passe réinitialisé avec succès."
}
```

**Réponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "..." }` | Token manquant, expiré ou mot de passe invalide |
| 404 | `{ "error": "Compte introuvable" }` | Utilisateur supprimé entre temps |

---

### 9.2 Profil

Toutes les routes profil nécessitent `Authorization: Bearer <access_token>`.

---

#### GET /profile

Retourne le profil de l'utilisateur connecté.

**Réponse 200 OK :**

```json
{
  "user": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "fullName": "Kofi Mensah",
    "email": "kofi@exemple.com",
    "phone": "+22996000000",
    "city": "Cotonou",
    "role": "CITOYEN",
    "subscription": "FREE",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

#### PATCH /profile

Met à jour le profil de l'utilisateur connecté. Seuls les champs envoyés sont modifiés.

**Corps de la requête :**

```json
{
  "fullName": "Kofi Yaw Mensah",
  "phone": "+22997000000",
  "city": "Porto-Novo"
}
```

Tous les champs sont optionnels — seuls les champs présents dans le corps sont modifiés.

| Champ | Type | Contraintes |
|---|---|---|
| `fullName` | string | 2 à 100 caractères |
| `phone` | string | 7 à 15 chiffres (séparateurs tolérés et normalisés) |
| `city` | string | 2 à 100 caractères |

**Réponse 200 OK :** même structure que `GET /profile`.

---

#### PATCH /profile/password

Change le mot de passe de l'utilisateur connecté. Rate limité à 3 tentatives par 30 minutes (clé composée de l'ID utilisateur et de l'IP). Invalide tous les refresh tokens actifs de l'utilisateur sur tous ses appareils.

**Corps de la requête :**

```json
{
  "currentPassword": "AncienMotDePasse1!",
  "newPassword": "NouveauMotDePasse2@"
}
```

**Réponse 200 OK :**

```json
{
  "message": "Mot de passe modifié. Reconnectez-vous sur vos autres appareils."
}
```

**Réponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "..." }` | Champ manquant, mot de passe invalide, ou identique à l'actuel |
| 401 | `{ "error": "Mot de passe actuel incorrect" }` | Mauvais mot de passe actuel |
| 429 | `{ "error": "..." }` | Rate limit dépassé |

---

#### GET /profile/subscription

Retourne le niveau d'abonnement actuel de l'utilisateur avec ses fonctionnalités.

**Réponse 200 OK :**

```json
{
  "subscription": "FREE",
  "details": {
    "label": "Gratuit",
    "color": "#BDBDBD",
    "features": [
      "Accès aux villes publiques",
      "Consultation de base",
      "Signalement limité"
    ]
  }
}
```

---

#### PATCH /profile/subscription

Met à jour l'abonnement d'un utilisateur. **Réservé au rôle `ADMIN` uniquement.**

**Corps de la requête :**

```json
{
  "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "subscription": "PREMIUM"
}
```

**Réponse 200 OK :**

```json
{
  "message": "Abonnement mis à jour vers PREMIUM",
  "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "subscription": "PREMIUM"
}
```

**Réponse 403 si le rôle n'est pas ADMIN :**

```json
{
  "error": "Accès refusé : droits insuffisants"
}
```

---

## 10. Système de sécurité

### 10.1 Hachage des mots de passe

bcrypt est utilisé avec un facteur de coût de **12 rounds**. Ce niveau offre un bon équilibre entre résistance aux attaques par force brute (chaque hash prend environ 300-400 ms) et performance serveur.

### 10.2 Tokens JWT

Les tokens sont signés avec l'algorithme **HS256** et incluent les claims `issuer: 'aanid'` et `audience: 'aanid-app'` pour empêcher la réutilisation de tokens d'une autre application.

- **Access token** : durée de vie 15 minutes. Contient le rôle et l'abonnement pour éviter des requêtes base de données supplémentaires sur chaque appel protégé.
- **Refresh token** : durée de vie 7 jours. Contient uniquement l'identifiant utilisateur. Stocké côté serveur dans un `Set` pour permettre l'invalidation.
- **Rotation des refresh tokens** : à chaque appel de `/auth/refresh`, l'ancien token est supprimé et un nouveau couple est émis. Un refresh token ne peut donc être utilisé qu'une seule fois.

### 10.3 Protection contre les attaques temporelles

Sur `/auth/login`, si l'email n'existe pas, un `bcrypt.hash()` complet est quand même exécuté avant de répondre. Cela garantit que le temps de réponse est identique qu'un email existe ou non, rendant l'énumération d'emails impossible par mesure de temps.

### 10.4 Masquage des informations sensibles

Les routes `/auth/resend-verification`, `/auth/forgot-password` retournent toujours le même message de succès générique, que l'email existe ou non. Cela empêche un attaquant de détecter si une adresse email est enregistrée.

### 10.5 Rate limiting

Le rate limiting est implémenté en mémoire par clé de partition. En production, il doit être remplacé par `express-rate-limit` avec un store Redis pour fonctionner en environnement multi-instances.

| Route | Clé | Limite | Fenêtre |
|---|---|---|---|
| `POST /auth/login` | `login:<ip>` | 5 tentatives | 15 minutes |
| `POST /auth/resend-verification` | `resend:<ip>` | 3 envois | 60 minutes |
| `POST /auth/forgot-password` | `pwd-reset:<ip>` | 3 demandes | 60 minutes |
| `PATCH /profile/password` | `pwd-change:<userId>:<ip>` | 3 tentatives | 30 minutes |

Les entrées expirées sont nettoyées automatiquement toutes les heures via `setInterval`.

### 10.6 Tokens opaques

Les tokens de vérification d'email et de réinitialisation de mot de passe sont générés avec `crypto.randomBytes(32)` (256 bits d'entropie). Ils ne sont pas des JWT : ils n'encodent aucune information et sont valides uniquement par leur présence dans le `Map` interne associé à une entrée non expirée.

### 10.7 Validation des entrées

| Champ | Règle |
|---|---|
| Email | Regex stricte, longueur locale max 64, domaine max 253 |
| Mot de passe | 8-128 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial parmi `@$!%*?&-_#` |
| Nom complet | 2 à 100 caractères, espaces autorisés |
| Téléphone | 7 à 15 chiffres après suppression des séparateurs (`+`, espaces, tirets, parenthèses) |
| Ville | 2 à 100 caractères |
| Email normalisé | `toLowerCase()` + `trim()` avant toute vérification ou stockage |

### 10.8 Invalidation de session sur changement de mot de passe

Lors d'un changement de mot de passe (via `PATCH /profile/password` ou `POST /auth/reset-password`), **tous les refresh tokens actifs** de l'utilisateur concerné sont révoqués. Tout appareil ou session ouverte avec ce compte sera forcé à se reconnecter.

---

## 11. Middlewares exportés

Le module exporte les éléments suivants en plus du routeur principal :

```js
const authRouter = require('@aanid/w-d-backend');

// Routeur principal (usage : app.use('/api', authRouter))
authRouter

// Objet des rôles (freeze, en lecture seule)
authRouter.ROLES
// => { CITOYEN, PROFESSIONNEL, REGIE, FORMATEUR, AUTORITE, ADMIN }

// Objet des abonnements (freeze, en lecture seule)
authRouter.SUBSCRIPTIONS
// => { FREE, PREMIUM, PROFESSIONAL, ENTERPRISE }

// Middleware : vérifie le Bearer token et injecte req.user
authRouter.authenticateToken

// Factory de middleware : vérifie que req.user.role est dans la liste
authRouter.authorizeRoles(...roles)
```

**Exemple d'utilisation combiné :**

```js
const {
  authenticateToken,
  authorizeRoles,
  ROLES,
  SUBSCRIPTIONS
} = require('@aanid/w-d-backend');

// Accessible à tout abonné PREMIUM ou supérieur
router.get('/formations/premium',
  authenticateToken,
  (req, res, next) => {
    const allowed = [SUBSCRIPTIONS.PREMIUM, SUBSCRIPTIONS.PROFESSIONAL, SUBSCRIPTIONS.ENTERPRISE];
    if (!allowed.includes(req.user.subscription)) {
      return res.status(403).json({ error: 'Abonnement Premium requis' });
    }
    next();
  },
  formationsController.getPremium
);
```

---

## 12. Feuille de route production

Les éléments suivants sont marqués comme à implémenter avant mise en production.

### 12.1 Remplacement des stores en mémoire par Prisma

Les quatre `Map` et le `Set` internes doivent être remplacés par des modèles Prisma. Les modèles suggérés sont :

**Schéma Prisma :**

```prisma
model User {
  id            String   @id @default(uuid())
  fullName      String
  email         String   @unique
  passwordHash  String
  role          Role     @default(CITOYEN)
  subscription  Subscription @default(FREE)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  refreshTokens       RefreshToken[]
  verificationTokens  EmailVerificationToken[]
  passwordResetTokens PasswordResetToken[]
}

model RefreshToken {
  token     String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model EmailVerificationToken {
  token     String   @id
  email     String
  expiresAt DateTime
}

model PasswordResetToken {
  token     String   @id
  email     String
  expiresAt DateTime
}

enum Role {
  CITOYEN
  PROFESSIONNEL
  REGIE
  FORMATEUR
  AUTORITE
  ADMIN
}

enum Subscription {
  FREE
  PREMIUM
  PROFESSIONAL
  ENTERPRISE
}
```

### 12.2 Service d'envoi d'emails

Les deux endroits marqués `TODO` dans le code doivent appeler un service transactionnel (SendGrid, Resend, Mailgun) :

- Après inscription : envoi du lien `https://app.aanid.com/verify-email/<token>`
- Après demande de réinitialisation : envoi du lien `https://app.aanid.com/reset-password/<token>`

### 12.3 Rate limiting distribué

Remplacer le rate limiter en mémoire par `express-rate-limit` + `rate-limit-redis` pour fonctionner sur plusieurs instances du serveur :

```bash
npm install express-rate-limit rate-limit-redis ioredis
```

### 12.4 CORS en production

En production, remplacer l'origine `*` par une liste blanche explicite dans `src/index.js` (ou l'application principale) :

```js
app.use(cors({
  origin: ['https://app.aanid.com'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
```

La variable d'environnement `CORS_ORIGIN` permet de configurer cela sans modifier le code.
