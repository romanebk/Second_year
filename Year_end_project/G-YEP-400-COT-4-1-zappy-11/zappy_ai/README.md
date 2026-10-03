# Zappy — Client IA

> Projet G-YEP-400 — Intelligence Artificielle pour le serveur Zappy  
> Epitech PGE2 — 2025

---

## Présentation

Ce dépôt contient le client IA du jeu **Zappy**.  
Chaque joueur (drone Trantorien) est un processus Python autonome qui se connecte au serveur, perçoit son environnement, prend des décisions stratégiques et tente de monter son équipe au niveau 8 en incantant.

---

## Équipe IA

| Nom | Rôle |
|-----|------|
| **Helena** | Logique décisionnelle — Machine à états, stratégies de survie / collecte / élévation (`cerveau.py`, `player.py`) |
| **Fresnel** | Couche réseau & navigation — Socket, protocole, parsing, coordination (`reseau.py`, `navigation.py`, `adaptateur.py`) |

---

## Lancement rapide

```bash
# Prérequis : Python 3.10+
python3 zappy_ai.py -p <PORT> -n <TEAM> -h <HOST>
```

**Arguments :**

| Argument | Défaut | Description |
|----------|--------|-------------|
| `-p PORT` | obligatoire | Port du serveur |
| `-n TEAM` | obligatoire | Nom de l'équipe |
| `-h HOST` | `localhost` | Adresse du serveur |

**Exemple :**
```bash
python3 zappy_ai.py -p 4242 -n team1 -h 127.0.0.1
```

---

## Structure du projet

```
zappy_ai/
├── zappy_ai.py          # Point d'entrée : parse les args, connecte, lance le cerveau
├── cerveau.py           # Machine à états — toute la logique de décision
├── player.py            # Modèle de données du drone (inventaire, niveau, vision)
├── reseau.py            # Couche socket TCP, protocole, file de commandes
├── navigation.py        # Géométrie de la grille, parsing du Look, déplacements
├── adaptateur.py        # Pont entre l'interface Cerveau et l'API Réseau
│
├── docs/                # Documentation technique (design patterns)
│   └── design_patterns.md
│
├── README.md            # Ce fichier
├── README_RESEAU.md     # Doc complète de la couche réseau (Fresnel)
├── README_CERVEAU.md    # Doc complète du cerveau (Helena)
├── README_PLAYER.md     # Doc complète du modèle Player (Helena)
│
├── test_navigation.py   # Tests unitaires navigation (35 tests)
├── test_reseau.py       # Tests unitaires réseau
└── test_integration.py  # Tests d'intégration avec serveur réel
```

---

## Architecture globale

```
zappy_ai.py
    │
    ├── Reseau (reseau.py)       ← socket TCP, gestion file 10 cmd, parsing brut
    │       │
    │       └── Adaptateur      ← traduit l'API Reseau vers l'interface du Cerveau
    │
    └── Brain / Cerveau (cerveau.py)
            │
            ├── Player (player.py)   ← état interne : inventaire, vision, niveau
            └── navigation.py        ← pathfinding, parsing Look enrichi
```

---

## Stratégie de l'IA

### Machine à états

| État | Description | Priorité |
|------|-------------|----------|
| `SURVIVE` | Chercher et manger de la nourriture | 1 (vitale) |
| `COLLECT` | Ramasser les gemmes manquantes | 3 |
| `ELEVATE` | Incantation solo (niveau 1→2) | 2 |
| `RALLY` | Leader : appeler du renfort et incanter | 2 |
| `JOIN` | Helper : rejoindre le leader | 2 |
| `REPRODUCE` | Pondre un œuf (Fork) | 4 |
| `EXPLORE` | Déplacement aléatoire pondéré | 5 |

### Coordination multi-joueurs
Pour les élévations nécessitant plusieurs joueurs (niveau ≥ 2), un système de **broadcast élection** détermine un leader. Chaque drone entendant `"rally <niveau> <rang>"` peut devenir helper et converger vers la source du signal.

---

## Tests

```bash
# Tests unitaires navigation
python3 test_navigation.py

# Tests unitaires réseau
python3 test_reseau.py

# Tests d'intégration (serveur requis)
./zappy_server -p 4242 -x 10 -y 10 -n team1 -c 10 -f 100
python3 test_integration.py
```

---

## Protocole Zappy (référence rapide)

| Commande | Coût (unités) | Réponse |
|----------|--------------|---------|
| `Forward`, `Left`, `Right` | 7 | `ok` / `ko` |
| `Look` | 7 | `[cases...]` |
| `Inventory` | 1 | `[ressources...]` |
| `Take <obj>` / `Set <obj>` | 7 | `ok` / `ko` |
| `Broadcast <msg>` | 7 | `ok` |
| `Fork` | 42 | `ok` |
| `Incantation` | 300 | `Elevation underway` → `Current level: K` |

> 1 unité de temps = `1/f` secondes (f = fréquence du serveur)  
> 1 nourriture = 126 unités de temps de vie

---

## Ressources par niveau

| Niveau | Joueurs | linemate | deraumere | sibur | mendiane | phiras | thystame |
|--------|---------|----------|-----------|-------|----------|--------|----------|
| 1→2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 2→3 | 2 | 1 | 1 | 1 | 0 | 0 | 0 |
| 3→4 | 2 | 2 | 0 | 1 | 0 | 2 | 0 |
| 4→5 | 4 | 1 | 1 | 2 | 0 | 1 | 0 |
| 5→6 | 4 | 1 | 2 | 1 | 3 | 0 | 0 |
| 6→7 | 6 | 1 | 2 | 3 | 0 | 1 | 0 |
| 7→8 | 6 | 2 | 2 | 2 | 2 | 2 | 1 |
