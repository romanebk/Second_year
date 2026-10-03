# LunarLander — Reinforcement Learning

Projet de reinforcement learning pour entraîner un agent à atterrir une capsule lunaire de manière autonome en utilisant l'algorithme **DQN (Deep Q-Network)**.

## Objectif

Atteindre un **score moyen ≥ 200** sur 100 épisodes consécutifs dans l'environnement `LunarLander-v3`.

---

## Environnement

### LunarLander-v3
- Simulateur 2D avec physique Box2D réaliste
- **État** : 8 dimensions (position x/y, vitesse x/y, angle, vitesse angulaire, contacts gauche/droit)
- **Actions** : 4 actions discrètes — rien, moteur gauche, moteur principal, moteur droit
- **Récompenses** : +100 atterrissage réussi, -100 crash, -0.3 par frame moteur allumé

---

## Structure du projet

```
.
├── configs/
│   └── base.yaml             # Config globale partagée (env, seed, hyperparamètres)
├── results/                  # CSV de logs et plots générés automatiquement
├── videos/
│   ├── random/               # 3 vidéos politique aléatoire
│   └── heuristic/            # 3 vidéos politique heuristique
├── replay_buffer.py          # Mémoire de l'agent — stocke et échantillonne les transitions
├── random_policy.py          # Baseline random — 100 épisodes actions aléatoires
├── heuristic_policy.py       # Baseline heuristique — logique simple position/vitesse
├── baseline_plot.py          # Génère les courbes de comparaison des baselines
├── baseline_videos.py        # Enregistre les vidéos des deux baselines
└── README.md
```

---

## Installation

### 1. Cloner le repo

```bash
git clone <url-du-repo>
cd G-AIA-401-COT-4-1-starttrek-19
```

### 2. Créer et activer le venv

```bash
python3 -m venv venv --copies
source venv/bin/activate
```

### 3. Installer les dépendances

```bash
pip install moviepy gymnasium[box2d] torch matplotlib pyyaml
```

---

## Utilisation

### Baselines

Les baselines servent de référence pour mesurer les performances avant tout entraînement DQN.

```bash
# Politique aléatoire — génère results/random_log.csv
python3 random_policy.py

# Politique heuristique — génère results/heuristic_log.csv
python3 heuristic_policy.py

# Plots de comparaison — génère results/baseline_returns.png et baseline_reasons.png
python3 baseline_plot.py

# Vidéos — génère videos/random/ et videos/heuristic/
python3 baseline_videos.py
```

---

## Configuration — configs/base.yaml

Tous les paramètres sont centralisés ici et partagés entre tous les membres du projet.

| Paramètre | Valeur | Rôle |
|---|---|---|
| `env.name` | LunarLander-v3 | Environnement Gymnasium |
| `seed` | 0 | Reproductibilité des résultats |
| `training.n_episodes` | 1000 | Nombre d'épisodes d'entraînement |
| `training.lr` | 0.001 | Vitesse d'apprentissage du réseau |
| `training.gamma` | 0.99 | Importance des récompenses futures |
| `training.epsilon_start` | 1.0 | Exploration totale au début |
| `training.epsilon_end` | 0.01 | Exploitation quasi-totale à la fin |
| `training.epsilon_decay` | 0.995 | Vitesse de transition exploration → exploitation |
| `training.batch_size` | 64 | Taille du batch tiré du replay buffer |
| `training.buffer_capacity` | 50000 | Nombre max de transitions mémorisées |
| `training.target_update_freq` | 100 | Fréquence de mise à jour du target network |

---

## Résultats baseline

| Politique | Mean Return |
|---|---|
| Aléatoire | ~-173 |
| Heuristique | ~-413 |
| **DQN (objectif)** | **≥ 200** |

L'heuristique fait moins bien que le random car elle active trop souvent le moteur principal, ce qui fait tournoyer la capsule. C'est ce qui justifie l'utilisation du DQN.

---

## Problèmes communs

**ModuleNotFoundError**
```bash
pip install gymnasium[box2d] torch matplotlib pyyaml moviepy
```

**externally-managed-environment**
```bash
python3 -m venv venv --copies
source venv/bin/activate
pip install ...
```

**pip: cannot execute: required file not found**
```bash
deactivate
rm -rf venv
python3 -m venv venv --copies
source venv/bin/activate
```

---

*Shoot for the moon — and land on it.*