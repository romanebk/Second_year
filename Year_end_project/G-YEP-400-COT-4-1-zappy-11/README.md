# Zappy

Projet EPITECH G-YEP-400 — simulation multi-joueurs sur une map torique.  
Trois composants indépendants communiquent via TCP :

| Composant | Langage | Rôle |
|-----------|---------|------|
| **zappy_server** | C++17 | Moteur de jeu, protocoles AI + GUI |
| **zappy_gui** | C++17 (SFML + OpenGL) | Interface spectateur 3D |
| **zappy_ai** | Python 3 | Client IA autonome par drone |

---

## Structure du dépôt

```
.
├── bin/                    # Binaires compilés (zappy_server, zappy_gui, zappy_ai)
├── assets/                 # Ressources partagées (modèles 3D, shaders, textures, musique)
│   ├── islands/            # Modèles d'îlots (Yavin, Tatooine, Jedha)
│   ├── models/             # GLB (aliens, œufs, ressources)
│   ├── planets/            # Planètes de fond
│   ├── decor/              # Arbres, ruines, astéroïdes
│   ├── minerals/           # Replis .obj des ressources
│   ├── shaders/            # Shaders GLSL
│   ├── scenery/            # Textures menu / cartes de thème
│   └── music/              # Piste de fond (optionnelle)
│
├── docs/                   # Documentation transverse
│   ├── design/
│   └── support/
│
│
├── zappy_server/           # Serveur de jeu
│   ├── include/            # game/, network/, protocol/, interfaces/
│   ├── src/
│   ├── docs/               # Spécifications protocole (sujet)
│   ├── documentation/      # Architecture, ADR
│   └── tests/              # Tests unitaires C++
│
├── zappy_gui/              # Interface graphique 3D
│   ├── include/            # core/, hud/, menu/, network/, parser/, renderer/, state/
│   ├── src/
│   └── docs/
│
├── zappy_ai/               # Client IA Python
│   ├── zappy_ai.py         # Point d'entrée
│   ├── cerveau.py          # Machine à états / stratégie
│   ├── reseau.py           # Socket, protocole, parsing
│   ├── navigation.py       # Géométrie, Look, déplacements
│   ├── comm.py             # Chiffrement XOR des broadcasts d'équipe
│   └── docs/               # Design patterns, protocole
│
└── Makefile                # Build global
```

---

## Prérequis

### Serveur & GUI (C++)

- `g++` (C++17)
- SFML 2 (`libsfml-dev`) — graphics, window, system, **audio**
- OpenGL + GLEW (`libglew-dev`)
- GLM (`libglm-dev`) — header-only
- `make`, `pthread`

```bash
# Debian / Ubuntu
sudo apt install build-essential libsfml-dev libglew-dev libglm-dev
```

### Client IA (Python)

- Python **3.10+**
- Aucune dépendance externe (stdlib uniquement)

---

## Compilation

Depuis la racine du projet :

```bash
make          # Compile server + gui + lanceur AI → bin/
make re       # Rebuild complet
make clean    # Nettoie les objets
make fclean   # Nettoie objets + bin/
make test     # Lance les tests du serveur
```

Binaires produits dans `bin/` :

```bash
./bin/zappy_server
./bin/zappy_gui
./bin/zappy_ai -p 4242 -n team1 -h localhost
```

Les binaires C++ remontent automatiquement jusqu'au dossier contenant `assets/` pour résoudre shaders et modèles, qu'ils soient lancés depuis `bin/` ou la racine.

---

## Démarrage rapide

Ouvrir **3 terminaux** (serveur, GUI, IA). Le GUI est gourmand en RAM/VRAM — évitez de tout lancer dans un seul script sur une machine limitée.

### 1. Lancer le serveur

```bash
./bin/zappy_server -p 4242 -x 10 -y 10 -n team1 team2 -c 6 -f 100
```

En arrière-plan (le serveur ignore stdin hors terminal interactif) :

```bash
./bin/zappy_server -p 4242 -x 10 -y 10 -n team1 team2 -c 6 -f 100 </dev/null &
```

| Argument | Description |
|----------|-------------|
| `-p` | Port d'écoute |
| `-x` / `-y` | Dimensions de la map (torique) |
| `-n` | Noms des équipes (répéter pour chaque équipe) |
| `-c` | Nombre de slots par équipe (**minimum 6**) |
| `-f` | Fréquence (inverse de l'unité de temps) |

### 2. Lancer le GUI (spectateur)

```bash
./bin/zappy_gui -p 4242 -h localhost
```

Parcours au lancement :

1. **HomeScreen** — IP/port pré-remplis (`localhost:4242`)
2. **MenuScreen** — choix du thème (Yavin, Tatooine, Jedha)
3. **LoadingScreen** — attente map + joueurs
4. **Fenêtre 3D** — spectateur

> Le GUI se connecte au serveur **après** le choix du thème. Laissez le serveur tourner pendant les écrans d'accueil et de menu.

### 3. Lancer les IA

Un processus par drone (dans un 3ᵉ terminal) :

```bash
./bin/zappy_ai -p 4242 -n team1 -h localhost
./bin/zappy_ai -p 4242 -n team2 -h localhost
# … répéter pour chaque slot à remplir
```

---

## zappy_server

Serveur monothreadé basé sur `poll()` qui gère simultanément clients **AI** et **GUI**.

**Fonctionnalités principales :**

- Map torique, génération et régénération des ressources
- Équipes, joueurs, inventaires, niveaux (1–8)
- Incantations multi-joueurs, broadcast directionnel, expulsion
- Fork, œufs, éclosion, mort de nourriture
- Scheduler de commandes différées (actions coûtent N/f secondes)
- Condition de victoire : 6 joueurs niveau 8 dans une équipe
- Push d'événements vers le GUI (`pnw`, `ppo`, `pbc`, `bct`, `seg`, …)

**Documentation interne :**

- `zappy_server/documentation/ARCHITECTURE.md` — architecture détaillée
- `zappy_server/documentation/ADR.md` — décisions de conception
- `zappy_server/docs/` — spécifications protocole AI et GUI

**Tests :**

```bash
make test
# ou
make -C zappy_server test
```

---

## zappy_gui

Interface spectateur 3D en **OpenGL 3.3 Core** avec rendu multi-thread (réseau + rendu).

### Rendu 3D

- **IslandRenderer** — îlots instanciés par thème, arbres, ruines, astéroides
- **ResourceRenderer** — ressources en modèles GLB instanciés (7 types)
- **Aliens / œufs** — modèles GLTF (`nasa_alien.glb`, `alien_egg.glb`), animation de marche procédurale
- **StarfieldRenderer** + **PlanetRenderer** — fond spatial
- Frustum culling, wrap-around visuel (petites cartes), figurants décoratifs
- Incantations (glow), ondes de broadcast, couleurs par équipe

### HUD & spectateur

- Event feed, minimap, inspecteur de tuile, panel joueur/équipe
- Scoreboard, filtres (ressources, joueurs, œufs, broadcasts, incantations)
- Contrôle du temps (`P` pause, `[` / `]` vitesse x1/x2/x4/x8)
- Suivi joueur (`F`) ou équipe (`T`), debug panel (`H`)
- Déchiffrement des broadcasts IA (compatible `zappy_ai/comm.py`)
- Musique de fond (`M` pour mute/unmute)

### Réseau

- Handshake `WELCOME` → `GRAPHIC`
- Thread réseau dédié, parsing complet du protocole GUI
- Écran de chargement bloquant jusqu'à map complète + joueurs stables

### Contrôles (fenêtre de jeu)

| Action | Touche / Souris |
|--------|-----------------|
| Orbite caméra | Clic gauche + drag |
| Pan | Clic droit + drag |
| Zoom | Molette, `+` / `-` |
| Free-fly | ZQSD / flèches, Espace (monter), Shift (descendre/boost) |
| Reset caméra | `R` |
| Sélection joueur | Clic sur la map 3D |
| Suivre joueur | `F` |
| Suivre équipe | `T` |
| Pause | `P` |
| Vitesse simulation | `[` / `]` |
| Filtres / debug | Clic HUD, `H` |
| Mute musique | `M` |
| Quitter | `Esc`, Ctrl+D (terminal), fermer fenêtre |

---

## zappy_ai

Client IA autonome : chaque processus contrôle un drone Trantorien.

**Architecture :**

```
zappy_ai.py → Reseau → Adaptateur → Brain (cerveau.py) → Player
                  ↑                        ↓
            navigation.py            comm.py (broadcasts chiffrés)
```

**Stratégie (machine à états) :**

- Survie (nourriture), collecte, élévation de niveau
- Rôles dynamiques : scout, leader, helper (coordination par broadcast chiffré)
- Réaction aux broadcasts ennemis (contre-attaque / eject)
- Fork automatique pour remplir les slots d'équipe

**Documentation détaillée :**

| Fichier | Contenu |
|---------|---------|
| `zappy_ai/README.md` | Vue d'ensemble |
| `zappy_ai/README_CERVEAU.md` | Logique décisionnelle |
| `zappy_ai/README_RESEAU.md` | Couche réseau & protocole |
| `zappy_ai/README_ROLES.md` | Rôles scout / leader / helper |
| `zappy_ai/README_PLAYER.md` | Modèle de données du drone |
| `zappy_ai/docs/` | Design patterns, protocole |

**Tests :**

```bash
python3 -m unittest discover -s zappy_ai -p 'test_*.py'
```

---

## Assets

Le dossier `assets/` à la racine est la source unique pour le GUI.  
Il contient modèles 3D (`.glb`, `.obj`), textures, shaders GLSL et musique.

Pour ajouter une piste de fond, placer un fichier audio dans `assets/music/` (`.mp3`, `.ogg`, `.wav`, …).

---

## Protocoles

| Connexion | Handshake | Protocole |
|-----------|-----------|-----------|
| GUI | `WELCOME` → `GRAPHIC\n` | Push événements + pull requêtes (`msz`, `mct`, `sst`, …) |
| AI | `WELCOME` → `TEAM name\n` → `TEAM-OK slots x y\n` | Commandes texte + réponses (`ok`, `ko`, `message K, …`) |

Spécifications complètes : `zappy_server/docs/G-YEP-400_zappy.txt` et `G-YEP-400_zappy_GUI_protocol.txt`.

---

## Documentation

| Emplacement | Contenu |
|-------------|---------|
| [`docs/`](docs/) | Bugs, soutenance, design patterns |
| [`zappy_server/documentation/`](zappy_server/documentation/) | Architecture serveur, ADR |
| [`zappy_gui/docs/`](zappy_gui/docs/) | Notes GUI (ex. cycle jour/nuit) |
| [`zappy_ai/README.md`](zappy_ai/README.md) | Client IA — vue d'ensemble + liens |

---

## Équipe

Projet réalisé dans le cadre de l'EPITECH — promotion 2024/2025.
