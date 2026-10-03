# AANID — Déploiement Render + Neon + APK Android

Guide pour la **première release** : backend sur Render, base PostgreSQL sur **Neon**, app mobile `AANID/frontend` en APK.

---

## 1. Base de données — Neon (recommandé)

**Pourquoi Neon plutôt que Supabase (free) ?**
- Neon : scale-to-zero auto après 5 min, **réveil automatique** (~0,5 s)
- Supabase free : **pause après 7 jours** d'inactivité → réactivation **manuelle** dans le dashboard

### Créer la base
1. Aller sur [neon.tech](https://neon.tech) → créer un compte
2. **New Project** → région proche (ex. `eu-central-1`)
3. Copier la **connection string** (format `postgresql://...@.../neondb?sslmode=require`)

### Variables à conserver
```
DATABASE_URL=postgresql://...
```

---

## 2. Backend — Render (Blueprint)

### Option A — Blueprint (recommandé)
1. Pousser le repo sur GitHub
2. Render Dashboard → **New** → **Blueprint**
3. Pointer vers `AANID/render.yaml`
4. Renseigner les secrets :
   - `DATABASE_URL` → connection string Neon
   - `AANID_ACCESS_SECRET` → `openssl rand -hex 32`
   - `AANID_REFRESH_SECRET` → `openssl rand -hex 32`
   - `FEDAPAY_SECRET_KEY` → clé secrète FedaPay (`sk_sandbox_…` ou `sk_live_…`, dashboard [fedapay.com](https://fedapay.com))
   - `FEDAPAY_ENVIRONMENT` → `sandbox` (défaut) ou `live`

> **Paiements** : sans `FEDAPAY_SECRET_KEY`, les routes de paiement (formations payantes, abonnements) fonctionnent en **mode simulation** — le paiement est accepté immédiatement, pratique en dev/démo. Avec la clé, une transaction FedaPay réelle est créée (Mobile Money MTN/Moov + cartes) et l'app ouvre la page de paiement hébergée puis vérifie le statut.

### Option B — Web Service manuel
| Champ | Valeur |
|-------|--------|
| Root Directory | `AANID` |
| Build Command | `npm install && npm run prisma:generate -w backend && npm run prisma:push -w backend` |
| Start Command | `npm start -w backend` |
| Runtime | Node |

### Vérifier le déploiement
```bash
curl https://VOTRE-SERVICE.onrender.com/health
# → {"status":"ok","service":"aanid-api-gateway"}
```

> **Note Render free** : le service s'endort après ~15 min sans trafic. Le premier appel peut prendre 30–60 s (cold start).

### Connexion Google, Facebook et X

Créer une application OAuth dans chacun des tableaux de bord développeur, puis enregistrer exactement ces URL de callback :

```text
https://aanid-api.onrender.com/api/v1/auth/oauth/google/callback
https://aanid-api.onrender.com/api/v1/auth/oauth/facebook/callback
https://aanid-api.onrender.com/api/v1/auth/oauth/x/callback
```

Ajouter ensuite dans Render :

```text
API_PUBLIC_URL=https://aanid-api.onrender.com
OAUTH_APP_REDIRECT_URIS=aanid://oauth/callback
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
X_CLIENT_ID=...
X_CLIENT_SECRET=...
```

Pour X, activer OAuth 2.0 avec le flux « Authorization Code + PKCE » et les permissions `tweet.read users.read`. Pour Facebook, demander `email` et `public_profile`. Tant qu'une paire de clés est absente, le bouton correspondant reste indisponible.

---

## 3. Migrations & seed (local ou CI)

```bash
cd AANID
cp backend/.env.example backend/.env
# Éditer backend/.env avec DATABASE_URL Neon

npm install
npm run prisma:generate -w backend
npm run prisma:setup -w backend    # db push + seed (Neon)
npm run dev:backend
```

---

## 4. Frontend — URL API

### Web (dev)
Vite proxy : `/api` → `localhost:4000` (inchangé).

### Android (émulateur)
Par défaut : `http://10.0.2.2:4000/api/v1` (10.0.2.2 = localhost de la machine hôte).

### Production APK
Éditer `AANID/frontend/src/config/api.ts` :
```ts
export const PRODUCTION_API_ORIGIN = 'https://VOTRE-SERVICE.onrender.com';
```

Ou définir au build :
```bash
AANID_API_URL=https://VOTRE-SERVICE.onrender.com npm run android
```

---

## 5. APK Android — prérequis

Sur la machine de build :
- **JDK 17** (ou 21)
- **Android SDK** (API 34+)
- Variables :
  ```bash
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

### Générer le dossier `android/` (une seule fois)
```bash
cd AANID
chmod +x scripts/setup-android.sh
./scripts/setup-android.sh
```

### Build APK debug (test)
```bash
cd AANID/frontend
npm install
npm start   # terminal 1 — Metro

# terminal 2
cd android
./gradlew assembleDebug
# APK : android/app/build/outputs/apk/debug/app-debug.apk
```

### Installer sur appareil
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### APK release (Play Store / distribution)
1. Générer un keystore :
   ```bash
   keytool -genkey -v -keystore aanid-release.keystore -alias aanid -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Configurer `android/gradle.properties` :
   ```
   MYAPP_UPLOAD_STORE_FILE=aanid-release.keystore
   MYAPP_UPLOAD_KEY_ALIAS=aanid
   MYAPP_UPLOAD_STORE_PASSWORD=***
   MYAPP_UPLOAD_KEY_PASSWORD=***
   ```
3. `./gradlew assembleRelease`

---

## 6. Carte native (gratuite — OpenStreetMap / CARTO)

Aucun abonnement Google Maps n'est requis.

- **Web** : Leaflet + tuiles [CARTO](https://carto.com/) / OpenStreetMap (voir `frontend/src/mocks/maps-mock.tsx`)
- **Android / iOS** : même fond cartographique via **Leaflet dans une WebView** (`rayann/frontend/src/components/LeafletNativeMap.jsx`)
- Tuiles utilisées : `basemaps.cartocdn.com` (clair) et Esri World Imagery (satellite) — gratuites pour un usage modéré, avec attribution OSM/CARTO affichée sur la carte
- **Pas de clé API** dans `AndroidManifest.xml`

Pour reconstruire l'APK après modification de la carte :

```bash
cd AANID && npm run android:apk:debug --workspace=@aanid/frontend
```

### Écran blanc / « Unable to load script » après installation

L'APK **debug** doit embarquer le bundle JavaScript (config `debuggableVariants = []` dans `android/app/build.gradle`). Sans cela, l'app cherche Metro sur le PC et reste vide sur téléphone.

Vérifier que le bundle est dans l'APK :

```bash
unzip -l frontend/android/app/build/outputs/apk/debug/app-debug.apk | grep index.android.bundle
```

L'APK prêt à installer se trouve aussi à la racine du repo : `app-debug.apk` (~130 Mo).

---

## 7. Checklist avant release

- [ ] `DATABASE_URL` Neon configuré sur Render
- [ ] Secrets JWT générés (`AANID_ACCESS_SECRET`, `AANID_REFRESH_SECRET`)
- [ ] `PRODUCTION_API_ORIGIN` pointe vers l'URL Render
- [ ] Login appelle `/api/v1/auth/login` (plus de mock-token)
- [ ] Callbacks OAuth et clés Google/Meta/X configurés sur Render
- [ ] Health check OK
- [ ] APK testé sur émulateur + appareil physique
- [ ] Carte affiche les tuiles OSM/CARTO (connexion Internet requise)

---

## 8. Architecture actuelle

```
AANID/frontend (React Native 0.76 + Vite web)
    ↓  /api/v1
AANID/backend (gateway Express :4000)
    ├── @aanid/w-d-backend      → auth / profile
    ├── @aanid/beni-momo-adnan  → formations, villes, paiements
    ├── @aanid/rayann           → carte (signalements, panneaux, zones)
    ├── @aanid/bryan-fanou      → états des lieux
    └── @aanid/undef            → posts / consultation
    ↓  (migrations Prisma)
Neon PostgreSQL (persistance progressive)
```

Les routes métier utilisent encore les **stores en mémoire** des modules ; Prisma + seed préparent la **persistance Neon**. L'auth et les données catalogue seront branchées progressivement sur Postgres.

---

## Dépannage

| Problème | Solution |
|----------|----------|
| APK ne joint pas l'API | Vérifier `PRODUCTION_API_ORIGIN` ; sur appareil physique utiliser l'URL Render (pas 10.0.2.2) |
| Render build échoue (Prisma) | Vérifier `DATABASE_URL` et `sslmode=require` |
| Neon connexion refusée | Autoriser IP Render (Neon : Settings → IP Allow → allow all pour tests) |
| Metro bundler | `npm start -- --reset-cache` dans `AANID/frontend` |
| Gradle | `cd android && ./gradlew clean` |
