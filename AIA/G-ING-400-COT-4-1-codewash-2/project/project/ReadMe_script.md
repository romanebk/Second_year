# CodeWash — Scripts de lancement

Ce document explique comment lancer le projet CodeWash sur Windows et Linux/Mac,
et décrit le fonctionnement des scripts fournis.

---

## Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version recommandée : LTS)
- [npm](https://www.npmjs.com/) (inclus avec Node.js)

---

## Lancer le projet

### Sur Linux / Mac

```sh
chmod +x start.sh
./start.sh
```

### Sur Windows

Double-cliquez sur `start.bat`, ou depuis un terminal (cmd / PowerShell) :

```bat
start.bat
```

---

## Fonctionnement des scripts

Les deux scripts font exactement la même chose, adaptés à leur système d'exploitation respectif.

### Étape 1 — Vérification des dépendances

Le script vérifie si le dossier `node_modules` existe et n'est pas vide.

- **Si les dépendances sont absentes** → `npm install` est exécuté automatiquement.
- **Si les dépendances sont déjà présentes** → l'installation est ignorée pour gagner du temps.

### Étape 2 — Lancement du projet

Une fois les dépendances vérifiées, le script exécute `npm run dev` pour démarrer le jeu.

---

## Pourquoi deux fichiers ?

| Fichier | Système cible | Raison |
|---|---|---|
| `start.sh` | Linux / Mac / Git Bash | Format shell standard Unix |
| `start.bat` | Windows natif (cmd / PowerShell) | Les fichiers `.sh` ne s'exécutent pas nativement sur Windows |

> **Note :** Sur Windows, les fichiers `.bat` sont exécutables par défaut — aucun droit particulier à accorder.
> Sur Linux/Mac, il faut donner le droit d'exécution au `.sh` avec `chmod +x start.sh`.

---

## Problèmes fréquents

**`npm : command not found`**
→ Node.js n'est pas installé ou pas dans le PATH. Téléchargez-le sur [nodejs.org](https://nodejs.org/).

**Permission denied sur Linux**
→ Exécutez `chmod +x start.sh` avant de lancer le script.

**Le jeu ne démarre pas après l'installation**
→ Vérifiez que `npm run dev` est bien défini dans le `package.json` du projet.

---

## Structure des scripts

```
codewash/
├── start.sh       # Script de lancement Linux / Mac
├── start.bat      # Script de lancement Windows
└── package.json   # Dépendances et scripts npm
```