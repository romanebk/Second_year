# Guide d'Installation

Ce guide détaille les étapes pour installer et configurer l'environnement nécessaire au projet Lunar Lander Reinforcement Learning.

## Prérequis Système

- **Python** : 3.8 ou supérieur
- **Système d'exploitation** : Linux, macOS, ou Windows
- **GPU** (optionnel mais recommandé) : NVIDIA CUDA-compatible pour PyTorch
- **RAM** : Minimum 4 Go, 8 Go recommandé
- **Espace disque** : ~2 Go pour les dépendances et modèles

## Installation Étape par Étape

### 1. Cloner le Repository

```bash
git clone <url-du-repo>
cd G-AIA-401-COT-4-1-starttrek-19
```

### 2. Créer l'Environnement Virtuel

#### Linux/macOS:
```bash
python3 -m venv venv --copies
source venv/bin/activate
```

#### Windows:
```bash
python -m venv venv --copies
venv\Scripts\activate
```

**Note** : L'option `--copies` est recommandée pour éviter des problèmes de permissions sur certains systèmes.

### 3. Installer les Dépendances

#### Dépendances de Base:
```bash
pip install gymnasium[box2d] torch matplotlib pyyaml numpy
```

#### Dépendances pour les Vidéos:
```bash
pip install moviepy imageio ffmpeg
```

#### Version Complète (tout en une commande):
```bash
pip install gymnasium[box2d] torch matplotlib pyyaml numpy moviepy imageio ffmpeg pandas seaborn
```

### 4. Vérifier l'Installation

```bash
python -c "import torch; import gymnasium; print('Installation réussie!')"
```

Si aucune erreur n'apparaît, l'installation est correcte.

## Dépendances Détaillées

### Bibliothèques Principales

| Bibliothèque | Version Minimum | Utilisation |
|-------------|----------------|-------------|
| `torch` | 1.10+ | Réseaux de neurones et calcul tensoriel |
| `gymnasium` | 0.28+ | Environnement LunarLander-v3 |
| `numpy` | 1.20+ | Calcul numérique |
| `matplotlib` | 3.3+ | Visualisation des résultats |
| `pyyaml` | 5.4+ | Gestion des fichiers de configuration |

### Bibliothèques Optionnelles

| Bibliothèque | Utilisation |
|-------------|-------------|
| `moviepy` | Création de vidéos d'entraînement |
| `imageio` | Traitement d'images pour vidéos |
| `ffmpeg` | Encodage vidéo |
| `pandas` | Manipulation de données CSV |
| `seaborn` | Visualisations avancées |

## Configuration PyTorch avec GPU

### Vérifier la Disponibilité du GPU:
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

Si `True`, PyTorch utilisera le GPU automatiquement.

### Installation Spécifique CUDA (si nécessaire):
Visitez [pytorch.org](https://pytorch.org/get-started/locally/) pour obtenir la commande d'installation adaptée à votre configuration CUDA.

## Structure des Répertoires Après Installation

```
G-AIA-401-COT-4-1-starttrek-19/
├── configs/              # Fichiers de configuration YAML
├── documentation/        # Documentation technique
├── models/               # Modèles entraînés (créé automatiquement)
├── results/              # Résultats et graphiques (créé automatiquement)
├── videos/               # Vidéos d'atterrissage (créé automatiquement)
├── venv/                 # Environnement virtuel Python
├── train.py              # Script d'entraînement principal
├── eval.py               # Script d'évaluation
├── model.py              # Architecture du réseau Q
├── replay_buffer.py      # Buffer de replay
├── random_policy.py      # Baseline aléatoire
├── heuristic_policy.py   # Baseline heuristique
└── ...
```

## Problèmes Courants et Solutions

### Erreur : `ModuleNotFoundError: No module named 'torch'`
**Solution**:
```bash
pip install torch
```

### Erreur : `externally-managed-environment`
**Cause** : Certains systèmes Linux (notamment Debian/Ubuntu récents) bloquent l'installation directe.

**Solution** : Utiliser un environnement virtuel (voir étape 2).

### Erreur : `pip: cannot execute: required file not found`
**Cause** : Environnement virtuel corrompu.

**Solution**:
```bash
deactivate
rm -rf venv
python3 -m venv venv --copies
source venv/bin/activate
pip install ...
```

### Erreur : Box2D non installé
**Solution**:
```bash
pip install gymnasium[box2d]
```

Sur Linux, vous pourriez avoir besoin d'installer les dépendances système:
```bash
sudo apt-get install swig
```

### Erreur : Problèmes avec ffmpeg
**Solution**:
```bash
# Linux (Ubuntu/Debian)
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Télécharger depuis https://ffmpeg.org/download.html
```

## Test de l'Installation

### Test Basique:
```bash
python random_policy.py
```
Cela devrait exécuter 100 épisodes avec une politique aléatoire et générer un fichier CSV.

### Test Complet:
```bash
# Tester l'entraînement (court)
python train.py --seed 0

# Tester l'évaluation
python eval.py --seed 0 --n_episodes 10
```

## Mise à jour des Dépendances

Pour mettre à jour toutes les dépendances:
```bash
pip install --upgrade gymnasium torch matplotlib pyyaml numpy
```

Pour vérifier les versions installées:
```bash
pip list
```

## Désinstallation

Pour supprimer l'environnement virtuel:
```bash
deactivate
rm -rf venv
```

## Support

En cas de problème d'installation:
1. Vérifier que Python 3.8+ est installé: `python --version`
2. Vérifier que pip est à jour: `pip install --upgrade pip`
3. Consulter la documentation technique dans `documentation/`
4. Vérifier les logs d'erreur pour des indices spécifiques

---

**Prochaine étape** : Consultez `PROJECT_OVERVIEW.md` pour comprendre le projet et commencer à l'utiliser.
