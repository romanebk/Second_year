# AANID — Documentation Frontend : Authentification & Profil

**Partie 8 — Responsable : Will-David**
**Package :** `@aanid/w-d-frontend`
**Technologie :** React Native 0.76 / React 18

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Dépendances](#3-dépendances)
4. [Configuration de l'URL de l'API](#4-configuration-de-lurl-de-lapi)
5. [Intégration dans l'application principale](#5-intégration-dans-lapplication-principale)
6. [Composants exposés](#6-composants-exposés)
7. [Contexte d'authentification](#7-contexte-dauthentification)
8. [Service authService](#8-service-authservice)
9. [Système de thème](#9-système-de-thème)
10. [Gestion des tokens côté client](#10-gestion-des-tokens-côté-client)
11. [Comportements de sécurité](#11-comportements-de-sécurité)
12. [Charte graphique appliquée](#12-charte-graphique-appliquée)
13. [Police de caractères](#13-police-de-caractères)

---

## 1. Vue d'ensemble

Ce module fournit l'ensemble de la couche interface utilisateur liée à l'authentification et au profil. Il est conçu pour être intégré dans l'application principale AANID comme une boîte noire : l'application principale monte les écrans, passe les callbacks, et n'a pas besoin de gérer l'état des tokens ou les appels API directement.

Le module expose :

- **`Auth`** : écran complet de connexion et d'inscription avec gestion de la vérification email
- **`Profil`** : écran complet de gestion du profil, du mot de passe et de l'abonnement
- **`AuthProvider`** : contexte React pour propager l'état d'authentification dans l'arbre de composants
- **`useAuth`** : hook pour lire et modifier l'état d'authentification depuis n'importe quel écran

---

## 2. Structure des fichiers

```
w-d/frontend/
├── index.js                          Export public du module
└── src/
    ├── theme.js                      Palette de couleurs, espacements, typographie
    ├── context/
    │   └── AuthContext.js            AuthProvider + useAuth
    ├── services/
    │   └── authService.js            Couche API + gestion des tokens AsyncStorage
    └── screens/
        ├── Auth.js                   Écran connexion / inscription
        └── Profil.js                 Écran profil utilisateur
```

---

## 3. Dépendances

```json
{
  "react": "18.3.1",
  "react-native": "0.76.3",
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

Aucune bibliothèque de navigation ou de formulaire externe n'est requise. La navigation entre connexion et inscription est gérée en interne par l'écran `Auth`.

---

## 4. Configuration de l'URL de l'API

L'URL de base de l'API est lue depuis la variable d'environnement `EXPO_PUBLIC_API_URL`. Si cette variable est absente, la valeur par défaut `http://localhost:3000` est utilisée.

**Pour Expo :**

```
# .env
EXPO_PUBLIC_API_URL=https://api.aanid.com
```

**Pour React Native CLI :**

La variable doit être injectée via `react-native-config` ou un mécanisme équivalent, et le fichier `authService.js` doit être adapté pour lire la variable correctement.

---

## 5. Intégration dans l'application principale

### 5.1 Enveloppement avec AuthProvider

L'`AuthProvider` doit envelopper le composant racine de l'application, en dehors de tout navigateur ou écran, afin que `useAuth` soit disponible partout.

```jsx
import { AuthProvider } from '@aanid/w-d-frontend';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
```

### 5.2 Navigation conditionnelle selon l'état d'authentification

Le navigateur racine lit l'état depuis `useAuth` pour afficher soit l'écran d'authentification, soit l'application principale. L'état `loading` permet d'afficher un écran de chargement pendant la restauration de session depuis AsyncStorage.

```jsx
import { useAuth, Auth, Profil } from '@aanid/w-d-frontend';

function RootNavigator() {
  const { isAuthenticated, loading, onLogin, onLogout } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <Auth onAuthenticated={onLogin} />;
  }

  return (
    <Tab.Navigator>
      <Tab.Screen name="Profil">
        {() => <Profil onLogout={onLogout} />}
      </Tab.Screen>
      {/* autres onglets */}
    </Tab.Navigator>
  );
}
```

### 5.3 Protection de routes dans d'autres modules

Les autres modules peuvent vérifier l'authentification ou le rôle avec `useAuth` :

```jsx
import { useAuth } from '@aanid/w-d-frontend';

function FormationsPremiumScreen() {
  const { user } = useAuth();

  if (!['PREMIUM', 'PROFESSIONAL', 'ENTERPRISE'].includes(user?.subscription)) {
    return <UpgradePrompt />;
  }

  return <FormationsListe />;
}
```

---

## 6. Composants exposés

### 6.1 Auth

Écran d'authentification complet. Il gère en interne les modes connexion, inscription, attente de vérification email et mot de passe oublié.

**Props :**

| Prop | Type | Obligatoire | Description |
|---|---|---|---|
| `onAuthenticated` | `(user: object) => void` | Oui | Appelée après une connexion réussie, avec l'objet utilisateur retourné par le serveur |

**Modes internes de l'écran :**

| Mode | Déclencheur | Description |
|---|---|---|
| `login` | État initial | Formulaire email + mot de passe |
| `register` | Clic sur "S'inscrire" | Formulaire complet avec sélection de rôle |
| `pending` | Après inscription réussie | Message de confirmation + option de renvoi d'email |
| `forgot` | Clic sur "Mot de passe oublié ?" | Formulaire de demande de réinitialisation |

**Fonctionnalités de l'écran connexion :**

- Validation email et mot de passe avant envoi
- Détection automatique de l'erreur `EMAIL_NOT_VERIFIED` : affiche un bouton de renvoi d'email directement dans le message d'erreur
- Checkbox **"Se souvenir de moi"** (cochée par défaut) : si décochée, la session est marquée comme temporaire et effacée automatiquement au prochain lancement de l'app
- État de chargement sur le bouton pendant la requête

**Fonctionnalités de l'écran inscription :**

- Champs : nom complet, email, téléphone, ville de résidence, rôle, mot de passe, confirmation
- Validation de tous les champs avant envoi (téléphone : 7 à 15 chiffres ; ville : 2 à 100 caractères)
- Sélection du rôle via un modal natif (les 5 rôles disponibles à l'inscription, `ADMIN` exclu)
- Indicateur de force du mot de passe en temps réel (4 niveaux : Faible, Moyen, Bon, Fort)
- Confirmation du mot de passe
- **Checkbox CGU obligatoire** : l'utilisateur doit cocher explicitement son accord avec les Conditions d'utilisation et la Politique de confidentialité avant de soumettre

---

### 6.2 Profil

Écran de profil complet pour l'utilisateur connecté.

**Props :**

| Prop | Type | Obligatoire | Description |
|---|---|---|---|
| `onLogout` | `() => Promise<void>` | Non | Appelée lors de la confirmation de déconnexion. Doit gérer l'appel API logout ET la mise à jour de l'état global. Typiquement `AuthProvider.handleLogout`. |

**Important :** `Profil` délègue entièrement la déconnexion au callback `onLogout`. Il n'appelle pas `authService.logout()` directement. Cela évite un double appel si `onLogout` provient de `AuthProvider` (qui appelle déjà le service).

**Sections de l'écran :**

1. **En-tête** : avatar avec initiales générés depuis le nom complet, nom, email, badges rôle et abonnement, bouton de modification du profil
2. **Informations personnelles** : nom complet, email, téléphone, ville, date d'inscription, statut de vérification email (Vérifié / Non vérifié)
3. **Abonnement** : niveau actuel, liste des fonctionnalités incluses, bouton de mise à niveau si abonnement FREE
4. **Sécurité** : accès au modal de changement de mot de passe, date de dernière modification
5. **Déconnexion** : bouton avec confirmation native (`Alert.alert`)

**Modal de modification du profil :**

- Champs pré-remplis : nom complet, téléphone, ville de résidence
- Validation locale avant envoi (téléphone et ville optionnels à l'édition mais validés si renseignés)
- Mise à jour immédiate de l'affichage après réponse serveur

**Modal de changement de mot de passe :**

- Champ mot de passe actuel
- Champ nouveau mot de passe avec indicateur de force
- Confirmation du nouveau mot de passe
- Écran de succès avec rappel que les autres sessions sont invalidées

---

## 7. Contexte d'authentification

### AuthProvider

```jsx
import { AuthProvider } from '@aanid/w-d-frontend';

<AuthProvider>
  {/* enfants */}
</AuthProvider>
```

Au montage, `AuthProvider` lit le dernier utilisateur stocké dans AsyncStorage et hydrate l'état. La propriété `loading` est `true` pendant cette opération initiale.

**Déconnexion automatique après inactivité :** quand l'utilisateur est connecté, `AuthProvider` écoute les transitions `AppState`. Si l'app passe en arrière-plan puis revient au premier plan après **30 minutes ou plus**, `onLogout` est déclenché automatiquement. Ce délai est configurable via la constante `INACTIVITY_TIMEOUT_MS` dans `AuthContext.js`.

### useAuth

```js
import { useAuth } from '@aanid/w-d-frontend';

const {
  user,             // object | null — objet utilisateur sans passwordHash
  loading,          // boolean — true pendant la restauration de session initiale
  isAuthenticated,  // boolean — raccourci pour !!user
  onLogin,          // (user: object) => void — à appeler après connexion réussie
  onLogout,         // () => Promise<void> — déclenche authService.logout() et vide l'état
  onProfileUpdate,  // (user: object) => void — met à jour user dans le contexte
} = useAuth();
```

**Comportement de `onLogout` :**

`onLogout` exécute `authService.logout()` (qui invalide le refresh token côté serveur et efface AsyncStorage), puis met `user` à `null` dans le contexte. L'opération est sûre même en cas d'absence de réseau — le stockage local est toujours effacé via le bloc `finally` de `authService.logout()`.

**Structure de l'objet `user` :**

```js
{
  id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  fullName: "Kofi Mensah",
  email: "kofi@exemple.com",
  phone: "+22996000000",
  city: "Cotonou",
  role: "CITOYEN",
  subscription: "FREE",
  emailVerified: true,
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:35:00.000Z"
}
```

**Note :** `useAuth` lance une erreur si appelé en dehors d'un `AuthProvider`.

---

## 8. Service authService

Le fichier `src/services/authService.js` est la couche d'abstraction entre les composants et l'API. Il gère le stockage des tokens et le renouvellement automatique.

### Fonctions exportées

| Fonction | Description |
|---|---|
| `register({ fullName, email, phone, city, password, role })` | Inscrit un nouvel utilisateur |
| `login({ email, password, rememberMe? })` | Connecte et stocke les tokens. Si `rememberMe` est `false`, un flag `SESSION_ONLY` est posé : la session est effacée au prochain lancement de l'app. Défaut : `true`. |
| `logout()` | Invalide le refresh token côté serveur et vide AsyncStorage (y compris `SESSION_ONLY`) |
| `refreshTokens()` | Renouvelle le couple de tokens |
| `verifyEmail(token)` | Vérifie l'email via le token de l'URL |
| `resendVerification({ email })` | Demande le renvoi du lien de vérification |
| `forgotPassword({ email })` | Initie la réinitialisation de mot de passe |
| `resetPassword({ token, newPassword })` | Finalise la réinitialisation |
| `getProfile()` | Récupère le profil et met à jour AsyncStorage |
| `updateProfile({ fullName?, phone?, city? })` | Met à jour le profil (champs optionnels) et synchronise AsyncStorage |
| `changePassword({ currentPassword, newPassword })` | Change le mot de passe |
| `getSubscription()` | Récupère les détails de l'abonnement |
| `getStoredUser()` | Lit l'utilisateur depuis AsyncStorage. Si le flag `SESSION_ONLY` est présent, efface tout et retourne `null` (app relancée sans "Se souvenir de moi"). |
| `isAuthenticated()` | Vérifie la présence d'un access token en stockage |

### Renouvellement automatique des tokens

La fonction interne `authRequest` (utilisée par `getProfile`, `updateProfile`, `changePassword`, `getSubscription`) intercepte les erreurs HTTP 401 et tente automatiquement un `refreshTokens()` avant de rejouer la requête originale. L'appelant ne voit jamais cette mécanique.

Si le refresh token est lui aussi expiré ou invalide, l'erreur est propagée normalement et l'appelant doit rediriger l'utilisateur vers la connexion.

---

## 9. Système de thème

Le fichier `src/theme.js` centralise tous les tokens visuels de la charte graphique AANID.

### Couleurs

```js
import { colors } from '../theme';

colors.primary        // #1E73BE — Bleu AANID, couleur principale Auth & Profil
colors.primaryDark    // #155a94 — État pressé des boutons primaires
colors.green          // #3BB273 — Succès, formations, indicateur fort
colors.orange         // #F5A623 — Relais, indicateur moyen
colors.red            // #E94E3C — Erreurs, signalements, indicateur faible
colors.textPrimary    // #212121 — Titres et textes principaux
colors.textSecondary  // #6B6B6B — Labels et textes secondaires
colors.placeholder    // #BDBDBD — Placeholders et séparateurs
colors.surface        // #F5F5F5 — Fond des cartes et arrière-plans
colors.white          // #FFFFFF
colors.background     // #FFFFFF

// Couleurs par abonnement (pour badges et accents)
colors.subscription.FREE         // #BDBDBD
colors.subscription.PREMIUM      // #1E73BE
colors.subscription.PROFESSIONAL // #F5A623
colors.subscription.ENTERPRISE   // #212121

// Couleurs par rôle (pour badges)
colors.role.CITOYEN      // #1E73BE
colors.role.PROFESSIONNEL // #3BB273
colors.role.REGIE        // #F5A623
colors.role.FORMATEUR    // #3BB273
colors.role.AUTORITE     // #E94E3C
colors.role.ADMIN        // #212121
```

### Espacements

```js
import { spacing } from '../theme';

spacing.xs   // 4
spacing.sm   // 8
spacing.md   // 16
spacing.lg   // 24
spacing.xl   // 32
```

### Rayons de bordure

```js
import { radius } from '../theme';

radius.button  // 8 — boutons et champs de saisie
radius.card    // 12 — cartes et panneaux
radius.input   // 8 — bordures des champs
radius.badge   // 20 — badges rôle et abonnement
```

### Typographie

```js
import { typography } from '../theme';

typography.h1      // fontSize: 32, fontWeight: '700', CenturyGothic
typography.h2      // fontSize: 28, fontWeight: '700', CenturyGothic
typography.h3      // fontSize: 22, fontWeight: '700', CenturyGothic
typography.body    // fontSize: 15, fontWeight: '400', CenturyGothic
typography.caption // fontSize: 13, fontWeight: '400', CenturyGothic
typography.label   // fontSize: 14, fontWeight: '600', CenturyGothic
```

### Ombres

```js
import { shadows } from '../theme';

shadows.card    // ombre légère pour les cartes (elevation: 3)
shadows.button  // ombre très légère pour les boutons (elevation: 2)
```

---

## 10. Gestion des tokens côté client

Les tokens sont stockés dans `AsyncStorage` sous les clés suivantes :

| Clé AsyncStorage | Contenu |
|---|---|
| `@aanid/v1/access_token` | JWT access token (string) |
| `@aanid/v1/refresh_token` | JWT refresh token (string) |
| `@aanid/v1/user` | Objet utilisateur sérialisé en JSON |
| `@aanid/v1/session_only` | `"true"` si l'utilisateur s'est connecté sans "Se souvenir de moi". Effacé au prochain `getStoredUser()` ou `logout()`. |

Le préfixe `@aanid/v1/` isole les clés AANID de celles d'autres packages. Le suffixe `/v1/` permet de migrer proprement le schéma de stockage en incrémentant la version si la structure change.

**Limitation connue :** `AsyncStorage` ne chiffre pas les données. Sur un appareil root ou compromis, les tokens peuvent être extraits. Pour une application à hautes exigences de sécurité, remplacer `AsyncStorage` par `react-native-encrypted-storage` en changeant uniquement les appels dans `authService.js`, sans impact sur les composants.

---

## 11. Comportements de sécurité

### Validation locale avant envoi

Les écrans `Auth` et les modals de `Profil` valident tous les champs localement avant d'envoyer la moindre requête au serveur. Le serveur valide de nouveau à la réception. La validation côté client est un confort, jamais une garantie.

Règles appliquées localement :

- Email : expression régulière `RFC 5321` simplifiée
- Mot de passe : même regex que le backend (8-128 caractères, majuscule, minuscule, chiffre, spécial) — `PASSWORD_RE` exporté depuis `theme.js`
- Confirmation mot de passe : égalité stricte avec le nouveau mot de passe
- Nom complet : longueur 2 à 100 caractères
- Téléphone : 7 à 15 chiffres après suppression des séparateurs (validé à l'inscription et en édition de profil)
- Ville de résidence : longueur 2 à 100 caractères
- CGU : la checkbox doit être cochée pour valider l'inscription

### Affichage des erreurs

Les messages d'erreur affichés à l'utilisateur proviennent directement du serveur (champ `error` de la réponse JSON). Aucune information technique n'est ajoutée. Les erreurs HTTP 5xx affichent un message générique.

### Déconnexion robuste

La fonction `logout` dans `authService.js` efface le stockage local dans le bloc `finally`, que l'appel serveur réussisse ou échoue. Un utilisateur qui perd sa connexion réseau lors d'une déconnexion est quand même déconnecté localement.

L'écran `Profil` délègue la déconnexion entièrement à `onLogout` (fourni par `AuthProvider`) pour éviter tout double appel au service.

### Déconnexion automatique après inactivité

`AuthProvider` écoute `AppState` (React Native) quand un utilisateur est connecté. Si l'app passe en arrière-plan puis revient au premier plan après **30 minutes ou plus**, `handleLogout` est appelé automatiquement. L'utilisateur est redirigé vers l'écran de connexion sans action de sa part.

Ce comportement répond à l'exigence spec §8 *"Déconnexion automatique après inactivité"*.

### Champ mot de passe

Les champs de mot de passe utilisent `textContentType="password"` (iOS) pour éviter la mise en cache par le gestionnaire de mots de passe système lors de la saisie du mot de passe actuel dans la vérification. Les nouveaux mots de passe utilisent `textContentType="newPassword"` pour permettre les suggestions du gestionnaire de mots de passe.

---

## 12. Charte graphique appliquée

La partie 8 utilise le **bleu AANID `#1E73BE`** comme couleur principale, conformément à l'attribution `Hub Villes & Profils` de la charte graphique.

| Élément | Valeur |
|---|---|
| Couleur principale | `#1E73BE` |
| Boutons primaires | Fond `#1E73BE`, texte blanc, coins 8 px, hauteur 44 px |
| Boutons secondaires | Bordure `#1E73BE`, texte `#1E73BE`, fond transparent |
| Bouton destructif (déconnexion) | Bordure `#E94E3C`, texte `#E94E3C` |
| Champs de saisie | Fond `#F5F5F5`, bordure `#E0E0E0` au repos, `#E94E3C` en erreur, hauteur 44 px |
| Cartes | Fond `#FFFFFF`, rayon 12 px, ombre 10 % opacité |
| Séparateurs | `#F5F5F5` (1 px) |
| Grille mobile | Marges 16 px, espacement vertical base 8 px |
| Badges | Rayon 20 px, couleur de fond à 12 % d'opacité de la couleur du rôle/abonnement |

---

## 13. Police de caractères

La charte graphique AANID prescrit **Century Gothic** comme police unique. Cette police n'est pas disponible nativement sur Android ou iOS.

### Chargement de la police

La police doit être bundlée dans le projet React Native principal (pas dans ce module).

**Pour Expo :**

```bash
# Installer expo-font
npx expo install expo-font

# Placer les fichiers police dans assets/fonts/
# CenturyGothic.ttf
# CenturyGothic-Bold.ttf
```

```js
// App.js ou _layout.js (Expo Router)
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  CenturyGothic: require('./assets/fonts/CenturyGothic.ttf'),
  'CenturyGothic-Bold': require('./assets/fonts/CenturyGothic-Bold.ttf'),
});
```

**Pour React Native CLI :**

Ajouter dans `react-native.config.js` :

```js
module.exports = {
  assets: ['./assets/fonts'],
};
```

Puis exécuter : `npx react-native-asset`

### Comportement sans la police

Si `CenturyGothic` n'est pas chargé, React Native tombe automatiquement sur la police système (`San Francisco` sur iOS, `Roboto` sur Android). L'interface reste fonctionnelle mais ne respecte pas la charte graphique. Le chargement de la police est une obligation pour la version de production.
