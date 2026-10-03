# AANID

Application de gestion de la panneautique urbaine.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + React Native 0.76 |
| Web (dev) | Vite + react-native-web |
| Natif (prod) | Metro + React Native CLI |
| Navigation | @react-navigation v7 |
| Backend | Node.js + Express |

**⚠️ Pas d'Expo.** Tout le monde utilise React Native bare.

## Structure

```
AANID/
├── backend/              # API Gateway central (port 4000)
├── frontend/             # Shell React Native (Vite pour le web)
├── shared/               # Types et utils partagés
├── beni-momo-adnan/      # Module Villes
│   ├── backend/          #   API Gateway → /api/v1/villes
│   └── frontend/         #   Écrans React Native
├── bryan-fanou/          # Module États des lieux
│   ├── backend/
│   └── frontend/
├── rayan/                # Module Carte Interactive
│   ├── backend/
│   └── frontend/
├── w-d/                  # Module Auth & Profil
│   ├── backend/
│   └── frontend/
└── undef/                # Module Posts & Consultation
    ├── backend/
    └── frontend/
```

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev        # Backend (port 4000) + Frontend (port 8080)
npm run dev:backend   # Backend uniquement
npm run dev:frontend  # Frontend web uniquement (Vite)
```

## Consignes par membre

### Béni & Momo Adnan — Villes, Relais Pub, Formations

- **Frontend** : React Native bare (`react-native`, pas `expo`)
- **Fichiers** : `.jsx` si JSX, `.js` si logique pure
- **Backend** : Express, route montée sur `backend/src/server.js`
- **Route API** : `/api/v1/villes`, `/api/v1/relais`, `/api/v1/formations`
- **Imports** : privilégier `@aanid/beni-momo-adnan-frontend` (package workspace)

### Bryan Fanou — États des lieux

- **Frontend** : React Native bare
- **Backend** : Express
- **Route API** : `/api/v1/etats`
- **Imports** : `@aanid/bryan-fanou-frontend`

### Rayann — Carte Interactive

- **Frontend** : React Native bare + `react-native-maps` / Leaflet (web)
- **Backend** : Express
- **Route API** : `/api/v1/carte/*`
- **Mocks web** : `frontend/src/mocks/maps-mock.tsx` (Leaflet)
- **Imports** : `@aanid/rayan-frontend`

### W-D — Authentification & Profil

- **Frontend** : React Native bare + `@react-native-async-storage/async-storage`
- **Backend** : Express + JWT
- **Route API** : `/api/v1/auth/*`, `/api/v1/users/*`
- **Imports** : `@aanid/w-d-frontend`

### undef (chef de projet) — Posts/Réseaux, Consultation

- **Frontend** : React Native bare
- **Backend** : Express
- **Route API** : `/api/v1/posts`, `/api/v1/consultation`
- **Imports** : `@aanid/undef-frontend`

## Règles communes

1. **Pas d'Expo** — React Native bare uniquement
2. **Extensions** : `.jsx` pour les fichiers avec JSX, `.js` pour la logique pure
3. **Navigation** : utiliser `@react-navigation` (déjà configuré dans `App.jsx`)
4. **Backend** : chaque module exporte un `express.Router()` ; le gateway les monte
5. **Workspaces** : les packages sont liés via npm workspaces — importer avec `@aanid/<module>`
6. **API proxy** : en dev, Vite proxy `/api/*` vers `http://localhost:4000`
7. **BDD** : chaque backend peut utiliser Redis (via `@aanid/shared`) ou sa propre base

## Membres

| Membre | Fonctionnalités |
|--------|----------------|
| Béni & Momo Adnan | Villes, Relais Publicitaire, Formations |
| Bryan Fanou | États des lieux |
| Rayann | Carte Interactive |
| W-D | Authentification & Profil |
| undef (chef) | Posts/Réseaux, Consultation |
