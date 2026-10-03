# Documentation API

Ce document fournit une référence complète de l'API du projet Lunar Lander Reinforcement Learning, incluant les classes, fonctions et modules disponibles.

## Table des Matières

- [Modules Principaux](#modules-principaux)
  - [model.py](#modelpy)
  - [replay_buffer.py](#replay_bufferpy)
  - [train.py](#trainpy)
  - [eval.py](#evalpy)
  - [random_policy.py](#random_policypy)
  - [heuristic_policy.py](#heuristic_policypy)
- [Modules Utilitaires](#modules-utilitaires)
  - [video.py](#videopy)
  - [baseline_plot.py](#baseline_plotpy)
  - [baseline_videos.py](#baseline_videospy)
  - [plot_seeds.py](#plot_seedspy)
- [Modules de Test](#modules-de-test)
  - [test_agent.py](#test_agentpy)

---

## Modules Principaux

### model.py

Définit l'architecture du réseau de neurones Q-Network utilisé par l'agent DQN.

#### Classe : Qnetwork

```python
class Qnetwork(nn.Module)
```

**Description** : Réseau neuronal profond pour approximer la fonction Q-value.

**Paramètres du constructeur** :
- `state_dim` (int, défaut=8) : Dimension de l'espace d'état
- `action_dim` (int, défaut=4) : Dimension de l'espace d'action
- `hidden_dim` (int, défaut=128) : Nombre de neurones dans les couches cachées

**Architecture** :
```
Input (state_dim)
  ↓
Linear(state_dim → hidden_dim) + ReLU
  ↓
Linear(hidden_dim → hidden_dim) + ReLU
  ↓
Linear(hidden_dim → action_dim)
  ↓
Output (action_dim) - Q-values
```

**Méthodes** :

##### `forward(self, x)`
```python
def forward(self, x) -> torch.Tensor
```

**Description** : Passe avant du réseau.

**Paramètres** :
- `x` (torch.Tensor) : Tensor d'état de shape (batch_size, state_dim)

**Retourne** :
- `torch.Tensor` : Q-values de shape (batch_size, action_dim)

**Exemple** :
```python
from model import Qnetwork
import torch

q_net = Qnetwork(state_dim=8, action_dim=4, hidden_dim=128)
state = torch.randn(1, 8)  # Batch de 1 état
q_values = q_net(state)    # Shape: (1, 4)
```

---

### replay_buffer.py

Implémente le buffer de replay pour stocker et échantillonner les transitions.

#### Classe : ReplayBuffer

```python
class ReplayBuffer
```

**Description** : Buffer circulaire pour stocker les transitions d'expérience.

**Paramètres du constructeur** :
- `capacity` (int) : Capacité maximale du buffer
- `device` (str, défaut="cpu") : Device pour stocker les tensors ("cpu" ou "cuda")

**Méthodes** :

##### `add_transition(self, state, action, reward, next_state, done)`
```python
def add_transition(self, state, action, reward, next_state, done) -> None
```

**Description** : Ajoute une transition au buffer.

**Paramètres** :
- `state` (np.ndarray) : État actuel, shape (state_dim,)
- `action` (int) : Action exécutée (0-3)
- `reward` (float) : Récompense reçue
- `next_state` (np.ndarray) : État suivant, shape (state_dim,)
- `done` (bool ou float) : Flag de fin d'épisode

**Exemple** :
```python
from replay_buffer import ReplayBuffer
import numpy as np

buffer = ReplayBuffer(capacity=50000, device="cpu")
buffer.add_transition(
    state=np.array([0.1, 0.2, 0.0, 0.0, 0.0, 0.0, 0, 0]),
    action=2,
    reward=1.0,
    next_state=np.array([0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0, 0]),
    done=False
)
```

##### `sample_batch(self, batch_size)`
```python
def sample_batch(self, batch_size) -> tuple
```

**Description** : Échantillonne un batch de transitions aléatoires.

**Paramètres** :
- `batch_size` (int) : Taille du batch à échantillonner

**Retourne** :
- `tuple` : (states, actions, rewards, next_states, dones)
  - `states` (torch.Tensor) : Shape (batch_size, state_dim)
  - `actions` (torch.LongTensor) : Shape (batch_size,)
  - `rewards` (torch.FloatTensor) : Shape (batch_size,)
  - `next_states` (torch.Tensor) : Shape (batch_size, state_dim)
  - `dones` (torch.FloatTensor) : Shape (batch_size,)

**Exemple** :
```python
states, actions, rewards, next_states, dones = buffer.sample_batch(64)
print(states.shape)  # torch.Size([64, 8])
print(actions.shape) # torch.Size([64])
```

##### `is_ready(self, batch_size)`
```python
def is_ready(self, batch_size) -> bool
```

**Description** : Vérifie si le buffer contient suffisamment de transitions.

**Paramètres** :
- `batch_size` (int) : Taille minimale requise

**Retourne** :
- `bool` : True si len(buffer) >= batch_size

##### `__len__(self)`
```python
def __len__(self) -> int
```

**Description** : Retourne le nombre actuel de transitions dans le buffer.

**Retourne** :
- `int` : Nombre de transitions stockées

---

### train.py

Script principal d'entraînement de l'agent DQN.

#### Fonctions

##### `select_action(state, epsilon)`
```python
def select_action(state, epsilon) -> int
```

**Description** : Sélectionne une action selon la stratégie epsilon-greedy.

**Paramètres** :
- `state` (np.ndarray) : État actuel, shape (state_dim,)
- `epsilon` (float) : Taux d'exploration (0-1)

**Retourne** :
- `int` : Action sélectionnée (0-3)

**Comportement** :
- Avec probabilité epsilon : action aléatoire
- Avec probabilité (1-epsilon) : action avec Q-value maximale

##### `get_termination_reason(terminated, truncated, reward)`
```python
def get_termination_reason(terminated, truncated, reward) -> str
```

**Description** : Détermine la raison de fin d'épisode.

**Paramètres** :
- `terminated` (bool) : Épisode terminé par l'environnement
- `truncated` (bool) : Épisode tronqué (timeout)
- `reward` (float) : Dernière récompense reçue

**Retourne** :
- `str` : "crash", "landing", "timeout", ou "unknown"

##### `train()`
```python
def train() -> None
```

**Description** : Boucle principale d'entraînement DQN.

**Comportement** :
1. Crée les répertoires de résultats
2. Initialise le logging CSV
3. Boucle sur les épisodes configurés
4. Pour chaque épisode :
   - Reset l'environnement
   - Boucle sur les steps
   - Sélectionne et exécute les actions
   - Stocke les transitions
   - Entraîne le réseau si buffer prêt
   - Met à jour le target network périodiquement
5. Décroît epsilon
6. Log les métriques
7. Sauvegarde le modèle final

**Fichiers générés** :
- `results/dqn_seed{SEED}_log.csv` : Logs d'entraînement
- `models/dqn_seed{SEED}.pt` : Modèle sauvegardé

**Arguments de ligne de commande** :
- `--seed` (int, optionnel) : Graine pour la reproductibilité

**Exemple** :
```bash
python train.py --seed 42
```

---

### eval.py

Script d'évaluation des modèles entraînés.

#### Fonctions

##### `load_model(seed)`
```python
def load_model(seed) -> Qnetwork
```

**Description** : Charge un modèle entraîné depuis le disque.

**Paramètres** :
- `seed` (int) : Seed du modèle à charger

**Retourne** :
- `Qnetwork` : Modèle chargé en mode évaluation

**Lève** :
- `FileNotFoundError` : Si le modèle n'existe pas

##### `select_action(q_net, obs)`
```python
def select_action(q_net, obs) -> int
```

**Description** : Sélectionne une action de manière déterministe (epsilon=0).

**Paramètres** :
- `q_net` (Qnetwork) : Réseau Q entraîné
- `obs` (np.ndarray) : Observation actuelle

**Retourne** :
- `int` : Action avec Q-value maximale

##### `evaluate(seed, n_episodes, verbose=True)`
```python
def evaluate(seed, n_episodes, verbose=True) -> tuple
```

**Description** : Évalue un modèle sur n épisodes.

**Paramètres** :
- `seed` (int) : Seed du modèle à évaluer
- `n_episodes` (int) : Nombre d'épisodes d'évaluation
- `verbose` (bool, défaut=True) : Afficher la progression

**Retourne** :
- `tuple` : (returns, lengths, reasons, csv_path)
  - `returns` (np.ndarray) : Returns par épisode
  - `lengths` (np.ndarray) : Longueurs par épisode
  - `reasons` (list) : Raisons de terminaison
  - `csv_path` (str) : Chemin du CSV sauvegardé

**Fichiers générés** :
- `results/eval_seed{seed}_log.csv` : Logs d'évaluation

##### `print_stats(seed, returns, lengths, reasons)`
```python
def print_stats(seed, returns, lengths, reasons) -> tuple
```

**Description** : Affiche et retourne les statistiques d'évaluation.

**Paramètres** :
- `seed` (int) : Seed évalué
- `returns` (np.ndarray) : Returns par épisode
- `lengths` (np.ndarray) : Longueurs par épisode
- `reasons` (list) : Raisons de terminaison

**Retourne** :
- `tuple` : (mean, std, ci95)

**Statistiques affichées** :
- Mean return
- Standard deviation
- Intervalle de confiance 95%
- Min / Max
- Pourcentage d'épisodes ≥ 200
- Longueur moyenne
- Distribution des raisons de fin

##### `plot_single(seed, returns)`
```python
def plot_single(seed, returns) -> None
```

**Description** : Génère les graphiques pour un seed.

**Paramètres** :
- `seed` (int) : Seed à visualiser
- `returns` (np.ndarray) : Returns par épisode

**Graphiques générés** :
- Courbe des returns par épisode
- Histogramme de distribution
- `results/eval_seed{seed}_plot.png`

##### `plot_all_seeds(all_returns)`
```python
def plot_all_seeds(all_returns) -> None
```

**Description** : Génère les graphiques comparatifs multi-seeds.

**Paramètres** :
- `all_returns` (dict) : Dictionnaire {seed: returns}

**Graphiques générés** :
- Bar chart mean ± 95% CI par seed
- Toutes les courbes superposées
- `results/eval_all_seeds_plot.png`

**Arguments de ligne de commande** :
- `--seed` (int, défaut=0) : Seed du modèle à évaluer
- `--n_episodes` (int, défaut=100) : Nombre d'épisodes
- `--config` (str, défaut="configs/base.yaml") : Chemin de la config
- `--all_seeds` (flag) : Évaluer tous les seeds 0-4

**Exemples** :
```bash
# Évaluer un seul seed
python eval.py --seed 0 --n_episodes 100

# Évaluer tous les seeds
python eval.py --all_seeds --n_episodes 100
```

---

### random_policy.py

Implémente la baseline de politique aléatoire.

#### Fonctions

##### `load_config(path="configs/base.yaml")`
```python
def load_config(path="configs/base.yaml") -> dict
```

**Description** : Charge la configuration depuis un fichier YAML.

**Paramètres** :
- `path` (str) : Chemin du fichier de configuration

**Retourne** :
- `dict` : Dictionnaire de configuration

##### `make_env(config)`
```python
def make_env(config) -> gym.Env
```

**Description** : Crée l'environnement Gymnasium.

**Paramètres** :
- `config` (dict) : Configuration du projet

**Retourne** :
- `gym.Env` : Environnement créé

##### `get_termination_reason(terminated, truncated, reward)`
```python
def get_termination_reason(terminated, truncated, reward) -> str
```

**Description** : Détermine la raison de fin d'épisode.

**Paramètres** :
- `terminated` (bool) : Épisode terminé
- `truncated` (bool) : Épisode tronqué
- `reward` (float) : Dernière récompense

**Retourne** :
- `str` : "crash", "landing", "timeout", ou "unknown"

##### `run_episode(env, seed)`
```python
def run_episode(env, seed) -> tuple
```

**Description** : Exécute un épisode avec politique aléatoire.

**Paramètres** :
- `env` (gym.Env) : Environnement
- `seed` (int) : Graine pour la reproductibilité

**Retourne** :
- `tuple` : (total_return, length, termination_reason)

##### `save_csv(results, path)`
```python
def save_csv(results, path) -> None
```

**Description** : Sauvegarde les résultats en CSV.

**Paramètres** :
- `results` (list) : Liste de dictionnaires de résultats
- `path` (str) : Chemin du fichier CSV

##### `run_random_policy(n_episodes, base_seed, env)`
```python
def run_random_policy(n_episodes, base_seed, env) -> list
```

**Description** : Exécute n épisodes avec politique aléatoire.

**Paramètres** :
- `n_episodes` (int) : Nombre d'épisodes
- `base_seed` (int) : Graine de base
- `env` (gym.Env) : Environnement

**Retourne** :
- `list` : Liste de résultats par épisode

##### `main()`
```python
def main() -> None
```

**Description** : Point d'entrée principal.

**Comportement** :
- Charge la configuration
- Exécute 100 épisodes
- Sauvegarde les résultats
- Affiche le résumé statistique

**Fichiers générés** :
- `results/random_log.csv` : Logs de la baseline aléatoire

**Exemple** :
```bash
python random_policy.py
```

---

### heuristic_policy.py

Implémente la baseline de politique heuristique.

#### Fonctions

##### `choose_action(obs)`
```python
def choose_action(obs) -> int
```

**Description** : Sélectionne une action selon une heuristique simple.

**Paramètres** :
- `obs` (np.ndarray) : Observation actuelle (8 dimensions)

**Retourne** :
- `int` : Action sélectionnée (0-3)

**Logique** :
```
Si vitesse_y < -0.5:
  Action = 2 (moteur principal)
Si position_x > 0.1:
  Action = 1 (moteur gauche)
Si position_x < -0.1:
  Action = 3 (moteur droit)
Sinon:
  Action = 0 (rien)
```

##### `run_episode(env, seed)`
```python
def run_episode(env, seed) -> tuple
```

**Description** : Exécute un épisode avec politique heuristique.

**Paramètres** :
- `env` (gym.Env) : Environnement
- `seed` (int) : Graine pour la reproductibilité

**Retourne** :
- `tuple` : (total_return, length, termination_reason)

##### `run_heuristic_policy(n_episodes, base_seed, env)`
```python
def run_heuristic_policy(n_episodes, base_seed, env) -> list
```

**Description** : Exécute n épisodes avec politique heuristique.

**Paramètres** :
- `n_episodes` (int) : Nombre d'épisodes
- `base_seed` (int) : Graine de base
- `env` (gym.Env) : Environnement

**Retourne** :
- `list` : Liste de résultats par épisode

##### `print_summary(results, n_episodes)`
```python
def print_summary(results, n_episodes) -> None
```

**Description** : Affiche le résumé statistique.

**Paramètres** :
- `results` (list) : Liste de résultats
- `n_episodes` (int) : Nombre d'épisodes

##### `main()`
```python
def main() -> None
```

**Description** : Point d'entrée principal.

**Fichiers générés** :
- `results/heuristic_log.csv` : Logs de la baseline heuristique

**Exemple** :
```bash
python heuristic_policy.py
```

---

## Modules Utilitaires

### video.py

Génération de vidéos pour les modèles entraînés.

#### Fonctions

##### `record_video(model_path, seed=0, video_folder="videos")`
```python
def record_video(model_path, seed=0, video_folder="videos") -> None
```

**Description** : Enregistre des vidéos d'atterrissage.

**Paramètres** :
- `model_path` (str) : Chemin du modèle entraîné
- `seed` (int, défaut=0) : Seed pour la reproductibilité
- `video_folder` (str, défaut="videos") : Dossier de sauvegarde

**Comportement** :
- Charge le modèle
- Crée l'environnement avec wrapper RecordVideo
- Exécute 5 épisodes en mode exploitation
- Sauvegarde automatiquement les vidéos

**Fichiers générés** :
- `videos/seed{seed}/rl-video-episode-{n}.mp4`

**Exemple** :
```bash
python video.py
```

---

### baseline_plot.py

Génération des graphiques de comparaison baseline.

#### Fonctions

##### `load_config(path="configs/base.yaml")`
```python
def load_config(path="configs/base.yaml") -> dict
```

**Description** : Charge la configuration YAML.

##### `load_csv(path)`
```python
def load_csv(path) -> tuple
```

**Description** : Charge un fichier CSV de résultats.

**Paramètres** :
- `path` (str) : Chemin du fichier CSV

**Retourne** :
- `tuple` : (returns, reasons)

##### `count_reasons(reasons)`
```python
def count_reasons(reasons) -> dict
```

**Description** : Compte les occurrences de chaque raison.

**Paramètres** :
- `reasons` (list) : Liste de raisons

**Retourne** :
- `dict` : Dictionnaire {raison: compte}

##### `plot_returns(random_returns, heuristic_returns, save_path)`
```python
def plot_returns(random_returns, heuristic_returns, save_path) -> None
```

**Description** : Génère le graphique des returns.

**Paramètres** :
- `random_returns` (list) : Returns de la politique aléatoire
- `heuristic_returns` (list) : Returns de la politique heuristique
- `save_path` (str) : Chemin de sauvegarde

**Graphique** :
- Courbes random vs heuristic
- Ligne d'objectif à 200
- `results/baseline_returns.png`

##### `plot_reasons(random_reasons, heuristic_reasons, save_path)`
```python
def plot_reasons(random_reasons, heuristic_reasons, save_path) -> None
```

**Description** : Génère le graphique des raisons de fin.

**Paramètres** :
- `random_reasons` (list) : Raisons de la politique aléatoire
- `heuristic_reasons` (list) : Raisons de la politique heuristique
- `save_path` (str) : Chemin de sauvegarde

**Graphique** :
- Bar chart comparatif
- `results/baseline_reasons.png`

##### `main()`
```python
def main() -> None
```

**Description** : Point d'entrée principal.

**Exemple** :
```bash
python baseline_plot.py
```

---

### baseline_videos.py

Génération des vidéos de baseline.

#### Fonctions

##### `make_env_with_video(env_name, video_folder)`
```python
def make_env_with_video(env_name, video_folder) -> gym.Env
```

**Description** : Crée l'environnement avec enregistrement vidéo.

**Paramètres** :
- `env_name` (str) : Nom de l'environnement
- `video_folder` (str) : Dossier de sauvegarde

**Retourne** :
- `gym.Env` : Environnement avec wrapper RecordVideo

##### `random_action(env, obs)`
```python
def random_action(env, obs) -> int
```

**Description** : Retourne une action aléatoire.

##### `heuristic_action(obs)`
```python
def heuristic_action(obs) -> int
```

**Description** : Retourne une action heuristique.

##### `run_episode(env, seed, action_fn)`
```python
def run_episode(env, seed, action_fn) -> float
```

**Description** : Exécute un épisode avec une fonction d'action.

**Paramètres** :
- `env` (gym.Env) : Environnement
- `seed` (int) : Graine
- `action_fn` (callable) : Fonction de sélection d'action

**Retourne** :
- `float` : Return total de l'épisode

##### `record_episodes(env_name, video_folder, n_episodes, base_seed, action_fn, label)`
```python
def record_episodes(env_name, video_folder, n_episodes, base_seed, action_fn, label) -> None
```

**Description** : Enregistre n épisodes avec une politique donnée.

**Paramètres** :
- `env_name` (str) : Nom de l'environnement
- `video_folder` (str) : Dossier de sauvegarde
- `n_episodes` (int) : Nombre d'épisodes
- `base_seed` (int) : Graine de base
- `action_fn` (callable) : Fonction de sélection d'action
- `label` (str) : Label pour l'affichage

##### `main()`
```python
def main() -> None
```

**Description** : Point d'entrée principal.

**Fichiers générés** :
- `videos/random/` : Vidéos de la politique aléatoire
- `videos/heuristic/` : Vidéos de la politique heuristique

**Exemple** :
```bash
python baseline_videos.py
```

---

### plot_seeds.py

Visualisation des résultats multi-seeds.

#### Fonctions

##### `plot_seeds()`
```python
def plot_seeds() -> None
```

**Description** : Génère les graphiques multi-seeds.

**Comportement** :
- Charge tous les fichiers CSV d'entraînement
- Génère les courbes d'apprentissage
- Calcule les moyennes et intervalles de confiance
- Sauvegarde les graphiques

**Fichiers générés** :
- `results/seeds_comparison.png` : Comparaison des seeds

**Exemple** :
```bash
python plot_seeds.py
```

---

## Modules de Test

### test_agent.py

Tests unitaires pour l'agent DQN.

#### Classe : TestDQNAgent

```python
class TestDQNAgent(unittest.TestCase)
```

**Description** : Suite de tests pour les composants de l'agent.

#### Méthodes de Test

##### `test_q_network_forward(self)`
```python
def test_q_network_forward(self) -> None
```

**Description** : Teste le passage avant du réseau.

**Vérifie** :
- Shape de sortie correcte (1, 4)

##### `test_select_action(self)`
```python
def test_select_action(self) -> None
```

**Description** : Teste la sélection d'action.

**Vérifie** :
- Action dans [0, 1, 2, 3]

##### `test_replay_buffer(self)`
```python
def test_replay_buffer(self) -> None
```

**Description** : Teste le replay buffer.

**Vérifie** :
- Stockage correct des transitions
- Échantillonnage correct des batches
- Shapes des tensors corrects

##### `test_target_network_update(self)`
```python
def test_target_network_update(self) -> None
```

**Description** : Teste la mise à jour du target network.

**Vérifie** :
- Calcul correct des target Q-values
- Shape correcte

**Exécution** :
```bash
python test_agent.py
```

---

## Configuration YAML

### Structure de `configs/base.yaml`

```yaml
env:
  name: "LunarLander-v3"        # Nom de l'environnement
  continuous: false              # Actions discrètes ou continues
  enable_wind: false             # Activer le vent
  wind_power: 15.0              # Force du vent
  turbulence_power: 1.5         # Force de la turbulence
  render_mode: "rgb_array"      # Mode de rendu

seed: 0                          # Graine pour la reproductibilité

training:
  n_episodes: 1000              # Nombre d'épisodes d'entraînement
  max_steps_per_episode: 1000   # Steps maximum par épisode
  lr: 0.001                     # Learning rate
  epsilon_start: 1.0             # Epsilon initial
  epsilon_end: 0.01             # Epsilon final
  epsilon_decay: 0.995          # Facteur de décroissance epsilon
  batch_size: 64                 # Taille du batch
  buffer_capacity: 50000         # Capacité du replay buffer
  gamma: 0.99                    # Facteur d'actualisation
  target_update_freq: 100        # Fréquence de mise à jour target network

paths:
  results: "results/"            # Dossier des résultats
  models: "models/"              # Dossier des modèles
  videos: "videos/"              # Dossier des vidéos

logging:
  log_every: 10                 # Fréquence d'affichage
  save_video_every: 50           # Fréquence de sauvegarde vidéo
```

---

## Formats de Fichiers

### CSV de Logs

#### Format d'entraînement (`dqn_seed{N}_log.csv`)
```csv
episode,total_return,length,epsilon,mean_loss,termination_reason
0,123.456,234,0.995,0.01234,crash
1,234.567,345,0.990,0.02345,landing
...
```

#### Format d'évaluation (`eval_seed{N}_log.csv`)
```csv
episode,total_return,length,termination_reason
0,234.567,345,landing
1,123.456,234,crash
...
```

#### Format de baseline (`random_log.csv`, `heuristic_log.csv`)
```csv
episode,total_return,length,termination_reason
0,-123.456,123,crash
1,-234.567,234,timeout
...
```

### Modèles Sauvegardés

#### Format (`dqn_seed{N}.pt`)
- Format PyTorch standard
- Contient les state_dict du réseau
- Sauvegardé avec `torch.save()`

---

## Conventions de Code

### Nommage
- **Classes** : PascalCase (ex: `Qnetwork`, `ReplayBuffer`)
- **Fonctions** : snake_case (ex: `select_action`, `add_transition`)
- **Variables** : snake_case (ex: `episode_return`, `termination_reason`)
- **Constantes** : UPPER_CASE (ex: `DEVICE`, `SEED`)

### Documentation
- **Docstrings** : Format Google Style
- **Comments** : Pour la logique complexe uniquement
- **Type hints** : Utilisés quand pertinent

### Erreurs
- **Exceptions** : Messages descriptifs
- **Logging** : CSV pour les métriques, console pour la progression

---

## Exemples d'Utilisation

### Entraînement Simple
```python
from train import train
train()
```

### Évaluation Personnalisée
```python
from eval import load_model, select_action
import gymnasium as gym

# Charger le modèle
q_net = load_model(seed=0)

# Créer l'environnement
env = gym.make("LunarLander-v3")

# Exécuter un épisode
obs, _ = env.reset(seed=0)
total_return = 0
while True:
    action = select_action(q_net, obs)
    obs, reward, terminated, truncated, _ = env.step(action)
    total_return += reward
    if terminated or truncated:
        break

print(f"Return: {total_return}")
```

### Utilisation du Replay Buffer
```python
from replay_buffer import ReplayBuffer
import numpy as np

# Créer le buffer
buffer = ReplayBuffer(capacity=1000, device="cpu")

# Ajouter des transitions
for i in range(100):
    state = np.random.rand(8)
    action = np.random.randint(4)
    reward = np.random.randn()
    next_state = np.random.rand(8)
    done = i % 10 == 0
    buffer.add_transition(state, action, reward, next_state, done)

# Échantillonner
if buffer.is_ready(32):
    states, actions, rewards, next_states, dones = buffer.sample_batch(32)
```

---

**Document lié** : `RUNBOOK.md` pour les guides opérationnels.
