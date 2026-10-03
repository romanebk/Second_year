# Architecture du Système

Ce document décrit l'architecture technique du projet Lunar Lander Reinforcement Learning, incluant les composants, les flux de données et les décisions de conception.

## Vue d'ensemble de l'Architecture

### Diagramme de Haut Niveau

```
┌─────────────────────────────────────────────────────────────┐
│                     Configuration Layer                     │
│                    (configs/base.yaml)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Training Pipeline                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   train.py   │──│   model.py   │──│replay_buffer │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            ▼                                 │
│                    ┌──────────────┐                          │
│                    │  Q-Network   │                          │
│                    └──────────────┘                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Evaluation Pipeline                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   eval.py    │──│  video.py    │──│plot_seeds.py │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Baseline Pipeline                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │random_policy │──│heuristic_pol │──│baseline_plot │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Composants Principaux

### 1. Couche de Configuration

#### Fichier : `configs/base.yaml`

**Responsabilité** : Centraliser tous les paramètres configurables du projet.

**Structure** :
```yaml
env:              # Configuration de l'environnement
  name: "LunarLander-v3"
  continuous: false
  enable_wind: false
  wind_power: 15.0
  turbulence_power: 1.5
  render_mode: "rgb_array"

seed: 0           # Graine pour la reproductibilité

training:         # Hyperparamètres d'entraînement
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

paths:            # Chemins des répertoires
  results: "results/"
  models: "models/"
  videos: "videos/"

logging:          # Configuration du logging
  log_every: 10
  save_video_every: 50
```

**Avantages** :
- Séparation des paramètres du code
- Facilite l'expérimentation
- Reproductibilité garantie
- Partage facile entre développeurs

### 2. Pipeline d'Entraînement

#### Fichier : `train.py`

**Responsabilité** : Orchestrateur principal de l'entraînement DQN.

**Flux d'exécution** :
1. Chargement de la configuration YAML
2. Initialisation de l'environnement Gymnasium
3. Création des réseaux Q-Network et Target Network
4. Initialisation du Replay Buffer
5. Boucle d'entraînement sur les épisodes
6. Sauvegarde du modèle et des logs

**Fonctions clés** :
- `select_action(state, epsilon)` : Sélection d'action avec epsilon-greedy
- `get_termination_reason(terminated, truncated, reward)` : Classification de fin d'épisode
- `train()` : Boucle principale d'entraînement

**Architecture de la boucle d'entraînement** :
```
Pour chaque épisode:
  Reset environnement
  Pour chaque step:
    Sélectionner action (epsilon-greedy)
    Exécuter action
    Stocker transition dans replay buffer
    Si buffer prêt:
      Échantillonner batch
      Calculer loss
      Backpropagation
    Mettre à jour target network (périodique)
  Décroître epsilon
  Logger métriques
Sauvegarder modèle
```

#### Fichier : `model.py`

**Responsabilité** : Définition de l'architecture du réseau neuronal.

**Architecture Q-Network** :
```python
Qnetwork(nn.Module):
  Input: state_dim = 8
  ↓
  Linear(8 → 128) + ReLU
  ↓
  Linear(128 → 128) + ReLU
  ↓
  Linear(128 → 4)
  ↓
  Output: action_dim = 4 (Q-values)
```

**Choix de conception** :
- **2 couches cachées** : Équilibre entre capacité et complexité
- **128 neurones par couche** : Suffisant pour LunarLander
- **ReLU** : Fonction d'activation standard, efficace
- **Architecture simple** : Évite l'overfitting

#### Fichier : `replay_buffer.py`

**Responsabilité** : Stockage et échantillonnage des transitions.

**Structure de données** :
```python
ReplayBuffer:
  buffer: deque(maxlen=capacity)
  device: "cpu" ou "cuda"
  
  Méthodes:
    - add_transition(state, action, reward, next_state, done)
    - sample_batch(batch_size)
    - is_ready(batch_size)
```

**Transition stockée** :
```
(state, action, reward, next_state, done)
├─ state: np.array(8) - État actuel
├─ action: int (0-3) - Action exécutée
├─ reward: float - Récompense reçue
├─ next_state: np.array(8) - État suivant
└─ done: bool - Épisode terminé
```

**Avantages du Replay Buffer** :
- Brise les corrélations temporelles
- Réutilise les expériences
- Stabilise l'entraînement
- Efficacité mémoire avec deque

### 3. Pipeline d'Évaluation

#### Fichier : `eval.py`

**Responsabilité** : Évaluation formelle des modèles entraînés.

**Modes d'évaluation** :
1. **Single seed** : Évaluation d'un modèle spécifique
2. **All seeds** : Évaluation comparative de tous les modèles

**Fonctions clés** :
- `load_model(seed)` : Chargement d'un modèle sauvegardé
- `select_action(q_net, obs)` : Politique déterministe (epsilon=0)
- `evaluate(seed, n_episodes)` : Boucle d'évaluation
- `print_stats(seed, returns, lengths, reasons)` : Affichage statistique
- `plot_single(seed, returns)` : Visualisation pour un seed
- `plot_all_seeds(all_returns)` : Comparaison multi-seeds

**Métriques calculées** :
- Mean return ± Std
- Intervalle de confiance 95%
- Pourcentage d'épisodes ≥ 200
- Distribution des raisons de terminaison
- Longueur moyenne des épisodes

#### Fichier : `video.py`

**Responsabilité** : Génération de vidéos d'atterrissage.

**Fonctionnement** :
1. Chargement du modèle entraîné
2. Création de l'environnement avec wrapper RecordVideo
3. Exécution de 5 épisodes en mode exploitation
4. Sauvegarde automatique des vidéos

**Format de sortie** :
- Répertoire : `videos/seed{seed}/`
- Format : MP4
- Nom : `rl-video-episode-{n}.mp4`

#### Fichier : `plot_seeds.py`

**Responsabilité** : Visualisation des résultats multi-seeds.

**Graphiques générés** :
- Courbes d'apprentissage par seed
- Moyennes ± intervalles de confiance
- Comparaison des performances

### 4. Pipeline de Baseline

#### Fichier : `random_policy.py`

**Responsabilité** : Implémentation de la baseline aléatoire.

**Stratégie** :
- Action = `env.action_space.sample()`
- Aucune intelligence
- Sert de référence négative

**Résultats typiques** :
- Mean return : ~-173
- Principalement des crashes
- Temps d'exécution rapide

#### Fichier : `heuristic_policy.py`

**Responsabilité** : Implémentation de la baseline heuristique.

**Logique de décision** :
```python
Si vitesse_y < -0.5:
  Action = 2 (moteur principal)
Si position_x > 0.1:
  Action = 1 (moteur gauche)
Si position_x < -0.1:
  Action = 3 (moteur droit)
Sinon:
  Action = 0 (rien)
```

**Problème identifié** :
- Sur-activation du moteur principal
- Fait tournoyer la capsule
- Performances pires que random (~-413)

**Leçon apprise** :
- Les heuristiques simples échouent sur des problèmes complexes
- Justifie l'utilisation du DQN

#### Fichier : `baseline_plot.py`

**Responsabilité** : Génération des graphiques de comparaison baseline.

**Graphiques** :
1. **Returns par épisode** : Courbes random vs heuristic
2. **Raisons de fin** : Bar chart comparatif

## Flux de Données

### Flux d'Entraînement

```
Configuration YAML
    ↓
Environnement Gymnasium
    ↓
État actuel (8 dimensions)
    ↓
Q-Network → Q-values (4 actions)
    ↓
Epsilon-greedy → Action sélectionnée
    ↓
Environnement → Nouvel état + Récompense
    ↓
Replay Buffer → Stockage transition
    ↓
Batch sampling
    ↓
Q-Network + Target Network → Loss calculation
    ↓
Optimizer → Mise à jour poids
    ↓
Target Network update (périodique)
    ↓
Logging CSV + Sauvegarde modèle
```

### Flux d'Évaluation

```
Modèle sauvegardé (.pt)
    ↓
Chargement dans Q-Network
    ↓
Environnement Gymnasium
    ↓
État actuel
    ↓
Q-Network → Q-values
    ↓
Argmax → Action déterministe
    ↓
Environnement → Nouvel état + Récompense
    ↓
Accumulation return
    ↓
Fin épisode → Logging
    ↓
Statistiques + Visualisations
```

## Décisions de Conception

### 1. Séparation des Préoccupations

**Principe** : Chaque fichier a une responsabilité unique.

**Avantages** :
- Code maintenable
- Tests facilités
- Réutilisation possible
- Collaboration facile

### 2. Configuration Centralisée

**Choix** : Tous les paramètres dans `configs/base.yaml`.

**Justification** :
- Facilite l'expérimentation
- Garantit la reproductibilité
- Évite la duplication de code
- Documentation intégrée

### 3. Replay Buffer avec Deque

**Choix** : Utilisation de `collections.deque` avec maxlen.

**Avantages** :
- Gestion automatique de la capacité
- Performance O(1) pour append/pop
- Évite le débordement mémoire
- Implémentation standard Python

### 4. Target Network avec Hard Update

**Choix** : Mise à jour périodique (tous les 100 steps).

**Justification** :
- Stabilise l'apprentissage
- Plus simple que le soft update (τ)
- Performance suffisante pour LunarLander
- Réduit les oscillations

### 5. Epsilon-Greedy Decay

**Choix** : Décroissance exponentielle (epsilon *= 0.995).

**Avantages** :
- Transition progressive exploration→exploitation
- Paramètre unique à régler
- Comportement prévisible
- Standard en DQN

### 6. Logging CSV

**Choix** : Sauvegarde des métriques en CSV.

**Avantages** :
- Format lisible par humains
- Compatible avec pandas/matplotlib
- Facile à partager
- Analyse post-hoc possible

## Patterns de Conception

### 1. Strategy Pattern

**Implémentation** : Différentes politiques (random, heuristic, DQN).

**Avantages** :
- Interchangeabilité facile
- Extension simple
- Tests comparatifs facilités

### 2. Factory Pattern

**Implémentation** : Création de l'environnement et des réseaux.

**Avantages** :
- Centralisation de la création
- Configuration cohérente
- Facilite les tests

### 3. Observer Pattern

**Implémentation** : Logging des métriques pendant l'entraînement.

**Avantages** :
- Découplage entraînement/logging
- Extensibilité des métriques
- Monitoring en temps réel

## Performance et Optimisation

### 1. Utilisation du GPU

**Activation automatique** :
```python
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
```

**Gain de performance** : 3-5x plus rapide qu'CPU

### 2. Batch Processing

**Traitement par batch** : 64 transitions par batch.

**Avantages** :
- Utilisation efficace du GPU
- Stabilise le gradient
- Réduit la variance

### 3. Replay Buffer Efficace

**Échantillonnage aléatoire** : O(batch_size) avec sampling uniforme.

**Avantages** :
- Évite les biais temporels
- Performance constante
- Implémentation simple

## Sécurité et Robustesse

### 1. Gestion des Erreurs

**Try-except** : Gestion des erreurs de chargement de modèle.

**Validation** : Vérification de l'existence des fichiers.

### 2. Reproductibilité

**Graines fixes** : Utilisation de seeds pour numpy, torch, gymnasium.

**Logging systématique** : Sauvegarde de tous les hyperparamètres.

### 3. Tests Unitaires

**Fichier** : `test_agent.py`

**Tests** :
- Forward pass du réseau
- Sélection d'action
- Replay buffer
- Target network update

## Extensibilité

### Points d'Extension

1. **Nouveaux environnements** : Modifier `configs/base.yaml`
2. **Nouvelles architectures** : Modifier `model.py`
3. **Nouvelles politiques** : Créer nouveau fichier de policy
4. **Nouvelles métriques** : Ajouter dans logging
5. **Nouvelles visualisations** : Créer nouveau fichier de plot

## Limitations Actuelles

1. **Architecture fixe** : Réseau à 2 couches cachées
2. **Hard update uniquement** : Pas de soft update
3. **Epsilon-greedy uniquement** : Pas d'autres stratégies d'exploration
4. **Single environnement** : LunarLander uniquement
5. **Pas de distributed training** : Entraînement single-GPU

## Améliorations Possibles

1. **Double DQN** : Réduire le overestimation
2. **Dueling DQN** : Séparer value et advantage
3. **Prioritized Replay** : Échantillonnage intelligent
4. **Multi-step learning** : N-step returns
5. **Distributed training** : Accélération avec multiple GPUs

---

**Document lié** : `API_DOCUMENTATION.md` pour les détails d'implémentation.
