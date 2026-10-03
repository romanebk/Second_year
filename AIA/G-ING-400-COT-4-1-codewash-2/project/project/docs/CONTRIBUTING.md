# Guide de Contribution & Passation (Handover)

Ce document est destiné à la prochaine équipe de développeurs qui reprendra "CodeWash RPG". Il explique comment étendre les fonctionnalités du jeu sans casser l'architecture existante.

---

## 1. Ajouter une nouvelle Langue (i18n)

Notre système de traduction a été entièrement refactorisé pour être prédictible.
1. Ouvre `src/constants/translations.js`.
2. Ajoute ton code de langue dans l'objet global `TRANSLATIONS` (ex: `es: { ... }`).
3. Remplis les clés obligatoires (utilise la section `en` comme modèle).
4. Ouvre `src/components/ui/LanguageSwitcher.jsx` et ajoute ton drapeau/bouton pour la nouvelle langue.

---

## 2. Ajouter un nouveau Monstre (Mob) ou Boss

La donnée brute est séparée de la logique. Pour ajouter un mob :
1. Ouvre `src/constants/gameData.jsx`.
2. Va dans la constante `HOSTILE_MOBS` (ou `BOSS_MOBS`).
3. Ajoute ton monstre sous ce format :
  ```javascript
  'NomDuMonstre': '/chemin/vers/image.png',
  ```
4. Va dans `src/constants/translations.js` et ajoute sa traduction pour chaque langue (généralement la clé est `NomDuMonstre` en minuscules avec des underscores à la place des espaces).
5. **C'est tout !** Le système `getMobForSkill()` dans `gameUtils.js` piochera automatiquement ce nouveau monstre.

---

## 3. Comprendre le système de Sauvegarde (localStorage)

Dans l'ancienne version, le composant React lisait et écrivait directement dans le navigateur, ce qui causait des bugs de synchronisation.
Désormais, tout passe par le wrapper `src/utils/storageUtils.js`. 
- **Pour lire** : Utilise `loadGlobalSettings()`, `loadSkills()`, etc. au démarrage de l'application.
- **Pour écrire** : N'utilise **jamais** `localStorage.setItem` directement dans un composant. Appelle toujours `saveGameState()` ou `saveCosmetics()`.

---

## 4. Architecture Audio

Pour jouer un son, ne crée pas d'objet `Audio` dans les composants (ça crée des fuites de mémoire).
- Côté composant : Appelle `startBGM()` via le hook `const { startBGM } = useAudio()`.
- Côté logique événementielle : Importe `playClick()`, `playLevelUp()` depuis `src/utils/soundManager.js`.

---

## 5. Definition of Ready (DOR)
Before a task is considered "Ready" to be worked on:
*  [ ] The task is clearly defined in the roadmap/issue.
*  [ ] Impact on existing systems (i18n, themes) is identified.
*  [ ] Mockups or design specs are provided if it's a UI change.

## 6. Definition of Done (DOD)
A feature/fix is only "Done" when:
*  [ ] The code follows the style guide (ESLint passes).
*  [ ] **100% of new lines** are covered by unit tests.
*  [ ] **80% of modified legacy lines** are covered by tests.
*  [ ] Documentation is updated (README, ADR if needed).
*  [ ] The PR is reviewed and the CI pipeline is **Green**.

## 7. Pull Request Protocol
Every PR must use the [Standard Template](file:///mnt/c/Users/WILL-DAVID/Desktop/G-ING-400-COT-4-1-codewash-2/.github/PULL_REQUEST_TEMPLATE.md) and include:
*  A "What/Why" description.
*  Proof of local CI success (`npm run ci:local`).
*  Screenshot/Recording if UI-related.

---

## 8. Règle d'or (Scout Rule)

L'architecture actuelle a été nettoyée avec de la sueur et du sang. Si vous touchez à `App.jsx`, posez-vous la question : *"Est-ce que cette logique métier ne devrait pas être extraite dans un Hook ou un Utils ?"*