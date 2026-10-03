# Vue d'ensemble du Projet

## Description du Projet

Ce projet est une implémentation d'un système d'apprentissage par renforcement (Reinforcement Learning) pour résoudre le problème de l'atterrissage lunaire autonome. L'objectif est d'entraîner un agent IA à atterrir un module lunaire de manière sécurisée et autonome sur la Lune, en utilisant l'algorithme DQN (Deep Q-Network).

## Contexte et Motivation

### Scénario
- **Destination finale** : Mars
- **Étape intermédiaire** : Base de relais sur la Lune
- **Défi** : Atterrissage autonome sans pilote humain
- **Solution** : Agent IA entraîné par reinforcement learning

### Pourquoi le Reinforcement Learning ?
Le problème de l'atterrissage lunaire présente des caractéristiques idéales pour le reinforcement learning :
- **Espace d'état continu** : Position, vitesse, angle, contacts
- **Actions discrètes** : Moteurs gauche, principal, droit, ou rien
- **Récompenses claires** : +100 pour atterrissage réussi, -100 pour crash
- **Physique complexe** : Gravité, inertie, consommation de carburant

## Objectif Principal

Atteindre un **score moyen ≥ 200** sur 100 épisodes consécutifs dans l'environnement LunarLander-v3.

### Critères de Succès
- Score moyen ≥ 200 sur 100 épisodes
- Reproductibilité avec ≥5 graines différentes
- Analyse statistique avec intervalles de confiance 95%
- Comparaison avec des baselines (random, heuristique)

## Environnement : LunarLander-v3

### Caractéristiques
- **Simulateur 2D** avec physique Box2D réaliste
- **Espace d'état** : 8 dimensions continues
  - Position X, Y
  - Vitesse X, Y
  - Angle
  - Vitesse angulaire
  - Contact gauche (0 ou 1)
  - Contact droit (0 ou 1)

- **Espace d'action** : 4 actions discrètes
  - 0 : Ne rien faire
  - 1 : Moteur gauche (rotate)
  - 2 : Moteur principal (thrust)
  - 3 : Moteur droit (rotate)

- **Récompenses** :
  - +100 : Atterrissage réussi
  - -100 : Crash
  - -0.3 : Par frame avec moteur allumé
  - +10 : Chaque jambe en contact avec le sol
  - Récompenses intermédiaires pour le mouvement vers le centre

## Algorithme : DQN (Deep Q-Network)

### Principes Fondamentaux
Le DQN combine les concepts de Q-Learning avec les réseaux de neurones profonds :
- **Q-Learning** : Apprentissage de la valeur des actions dans chaque état
- **Deep Learning** : Approximation de la fonction Q-value par un réseau neuronal
- **Experience Replay** : Stockage et réutilisation des expériences passées
- **Target Network** : Stabilisation de l'apprentissage

### Composants Clés
1. **Q-Network** : Réseau neuronal qui prédit les Q-values pour chaque action
2. **Target Network** : Copie du Q-Network mise à jour périodiquement
3. **Replay Buffer** : Mémoire tampon des transitions (state, action, reward, next_state, done)
4. **Epsilon-Greedy** : Stratégie d'exploration vs exploitation

## Structure du Projet

### Fichiers Principaux

```
├── train.py                 # Script d'entraînement DQN principal
├── eval.py                  # Script d'évaluation des performances
├── model.py                 # Architecture du réseau Q-Network
├── replay_buffer.py         # Implémentation du replay buffer
├── random_policy.py         # Baseline : politique aléatoire
├── heuristic_policy.py      # Baseline : politique heuristique
├── baseline_plot.py         # Génération des graphiques de baseline
├── baseline_videos.py       # Génération des vidéos de baseline
├── video.py                 # Génération de vidéos pour modèles entraînés
├── test_agent.py            # Tests unitaires de l'agent
├── train_q_learning.py      # Implémentation Q-Learning tabulaire
├── q_learning_agent.py      # Agent Q-Learning
├── plot_seeds.py            # Visualisation des résultats multi-seeds
├── configs/
│   └── base.yaml           # Configuration globale du projet
├── models/                  # Modèles sauvegardés (.pt)
├── results/                 # Résultats CSV et graphiques
└── videos/                  # Vidéos d'atterrissage
```

### Flux de Travail Typique

1. **Configuration** : Modifier `configs/base.yaml` selon les besoins
2. **Baselines** : Exécuter les politiques de référence
   ```bash
   python random_policy.py
   python heuristic_policy.py
   python baseline_plot.py
   ```
3. **Entraînement** : Entraîner le modèle DQN
   ```bash
   python train.py --seed 0
   ```
4. **Évaluation** : Évaluer les performances
   ```bash
   python eval.py --seed 0 --n_episodes 100
   ```
5. **Visualisation** : Générer des vidéos et graphiques
   ```bash
   python video.py
   python plot_seeds.py
   ```

## Métriques et Évaluation

### Métriques Suivies
- **Total Return** : Score cumulé par épisode
- **Episode Length** : Nombre de steps par épisode
- **Success Rate** : Pourcentage d'atterrissages réussis
- **Termination Reasons** : Distribution crash/landing/timeout
- **Loss** : Fonction de perte du réseau
- **Epsilon** : Taux d'exploration

### Critères d'Évaluation
- **Performance** : Mean return ≥ 200
- **Stabilité** : Variance faible sur 100 épisodes
- **Reproductibilité** : Résultats similaires sur différentes graines
- **Efficacité** : Temps d'entraînement raisonnable

## Résultats Attendus

### Baselines de Référence
| Politique | Mean Return | Performance |
|-----------|-------------|-------------|
| Aléatoire | ~-173 | Baseline négative |
| Heuristique | ~-413 | Pire que random (sur-activation moteur) |
| DQN (objectif) | ≥ 200 | Objectif à atteindre |

### Performance Cible
- **Score moyen** : ≥ 200
- **Taux de réussite** : ≥ 80% d'atterrissages réussis
- **Stabilité** : Écart-type < 50
- **Reproductibilité** : ±5% entre graines

## Configuration

### Fichier de Configuration : `configs/base.yaml`

```yaml
env:
  name: "LunarLander-v3"
  continuous: false
  enable_wind: false
  wind_power: 15.0
  turbulence_power: 1.5
  render_mode: "rgb_array"

seed: 0

training:
  n_episodes: 1000
  max_steps_per_episode: 1000
  lr: 0.001
  epsilon_start: 1.0
  epsilon_end: 0.01
  epsilon_decay: 0.995
  batch_size: 64
  buffer_capacity: 50000
  gamma: 0.99
  target_update_freq: 100

paths:
  results: "results/"
  models: "models/"
  videos: "videos/"

logging:
  log_every: 10
  save_video_every: 50
```

### Hyperparamètres Clés
- **Learning Rate (lr)** : 0.001 - Vitesse d'apprentissage
- **Gamma** : 0.99 - Facteur d'actualisation des récompenses futures
- **Epsilon Decay** : 0.995 - Vitesse de transition exploration→exploitation
- **Batch Size** : 64 - Taille des batches d'entraînement
- **Buffer Capacity** : 50000 - Taille du replay buffer
- **Target Update Freq** : 100 - Fréquence de mise à jour du target network

## Ablation Study

Le projet inclut une étude d'ablation pour analyser l'impact de chaque composant :
- **Taille du replay buffer** : 50k vs 100k vs 200k
- **Type de mises à jour** : Hard vs Soft update
- **Architecture réseau** : 32x32 vs 64x64 vs 128x64
- **Stratégie d'exploration** : Epsilon-greedy vs autres

## Reproductibilité

### Mesures de Reproductibilité
- **Graines fixes** : Utilisation de seeds pour l'aléatoire
- **Tests multi-seeds** : Évaluation sur seeds 0, 1, 2, 3, 4
- **Logging systématique** : Sauvegarde de tous les hyperparamètres
- **Intervalle de confiance** : Calcul des IC à 95%

### Script de Reproduction
```bash
# Entraîner sur 5 graines
for seed in 0 1 2 3 4; do
    python train.py --seed $seed
done

# Évaluer tous les modèles
python eval.py --all_seeds --n_episodes 100
```

## Technologies Utilisées

### Bibliothèques Principales
- **PyTorch** : Framework de deep learning
- **Gymnasium** : Environnements de reinforcement learning
- **NumPy** : Calcul numérique
- **Matplotlib** : Visualisation
- **PyYAML** : Gestion de configuration

### Outils de Développement
- **Python 3.8+** : Langage de programmation
- **Git** : Gestion de version
- **Virtual Environment** : Isolation des dépendances

## Prochaines Étapes

Pour commencer à utiliser le projet :
1. Suivez le guide d'installation : `INSTALLATION.md`
2. Consultez l'architecture : `ARCHITECTURE.md`
3. Explorez l'API : `API_DOCUMENTATION.md`
4. Suivez le runbook : `RUNBOOK.md`

## Support et Documentation

Documentation technique détaillée disponible :
- `INSTALLATION.md` : Guide d'installation complet
- `ARCHITECTURE.md` : Architecture du système
- `API_DOCUMENTATION.md` : Référence API
- `RUNBOOK.md` : Guide opérationnel

---

**Shoot for the moon, and hopefully you'll land on the moon!**
