# Runbook - CodeWash RPG

Guide opérationnel pour démarrer, arrêter et gérer les incidents sur le projet.

## 1. Démarrage (Startup)
*  **Environnement Web :** `npm run dev`
*  **Environnement Bureau (Electron) :** `npm run electron:dev`
*  **Vérification :** Le service est disponible sur `http://localhost:5173` par défaut.

## 2. Arrêt (Shutdown)
*  Utiliser `Ctrl + C` dans le terminal.
*  Sur Electron, fermer simplement la fenêtre de l'application.

## 3. Procédures en cas d'Incident (Troubleshooting)

### Écran Blanc au lancement
*  **Cause probable :** Erreur de compilation JS ou dépendance manquante.
*  **Action :** Lancer `npm run build` pour voir les erreurs détaillées que Vite pourrait masquer en mode dev.
*  **Action :** Supprimer `node_modules` et relancer `npm install`.

### Les tests échouent en CI
*  **Cause probable :** Incohérence de Linter ou regression.
*  **Action :** Lancer `npm run ci:local` sur votre machine pour reproduire l'erreur de la GitHub Action.

### Fuites de mémoire Audio
*  **Cause probable :** Création de multiples instances `new Audio()` dans React.
*  **Action :** S'assurer que tous les nouveaux sons passent par le hook `useAudio` ou le manager `soundManager.js`.

## 4. SLA & Maintenance
*  **Disponibilité :** 100% (Application client-side hors-ligne).
*  **Maintenance :** Toute modification de la structure de données dans `localStorage` doit s'accompagner d'un plan de migration (voir `storageUtils.js`).