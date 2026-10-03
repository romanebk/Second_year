# Partie A — Setup, Baselines et Replay Buffer

## Role dans le projet

La Partie A constitue les **fondations du projet**. Elle fournit :
- La configuration partagée (`configs/base.yaml`)
- Les politiques de référence pour mesurer la progression (random, heuristic)
- La mémoire d'expériences de l'agent DQN (replay buffer)
- Les outils de visualisation des baselines

Tout le reste du projet dépend de ce travail.

---

## Fichiers concernés

| Fichier | Role |
|---|---|
| `configs/base.yaml` | Configuration centralisée de tout le projet |
| `random_policy.py` | Baseline 1 — actions purement aléatoires |
| `heuristic_policy.py` | Baseline 2 — règles codées à la main |
| `replay_buffer.py` | Mémoire circulaire des expériences de l'agent |
| `baseline_plot.py` | Génération des graphiques de comparaison |
| `baseline_videos.py` | Enregistrement vidéo des deux baselines |

---

## Configuration partagée — `configs/base.yaml`

### Ce que c'est

Tous les hyperparamètres du projet sont centralisés dans un seul fichier YAML.
Chaque script (`train.py`, `eval.py`, `random_policy.py`, etc.) lit ce fichier
au démarrage. Cela garantit la **cohérence** : si on change `gamma`, tous les
scripts voient la même valeur.

### Contenu et justification de chaque paramètre

```yaml
env:
  name: "LunarLander-v3"    # Environnement Gymnasium cible
  continuous: false          # Actions discrètes (4 choix)
  enable_wind: false         # Pas de vent pour simplifier l'apprentissage
  render_mode: "rgb_array"   # Nécessaire pour enregistrer des vidéos

seed: 0                      # Seed de base pour la reproductibilité

training:
  n_episodes: 1000           # Nombre d'épisodes d'entraînement par seed
  max_steps_per_episode: 1000
  lr: 0.001                  # Learning rate de l'optimiseur Adam
  epsilon_start: 1.0         # Exploration totale au début
  epsilon_end: 0.01          # Exploitation quasi-totale à la fin
  epsilon_decay: 0.995       # Facteur de décroissance par épisode
  batch_size: 64             # Taille du mini-batch tiré du replay buffer
  buffer_capacity: 50000     # Nombre max de transitions en mémoire
  gamma: 0.99                # Facteur d'actualisation des récompenses futures
  target_update_freq: 100    # Fréquence de mise à jour du target network (en steps)

paths:
  results: "results/"
  models: "models/"
  videos: "videos/"

logging:
  log_every: 10              # Afficher les métriques tous les 10 épisodes
  save_video_every: 50
```

### Pourquoi centraliser la configuration ?

Sans ce fichier, chaque script aurait ses propres constantes codées en dur.
Une modification de `gamma` nécessiterait d'éditer `train.py`, `eval.py`, et
tous les autres scripts séparément, avec le risque d'oublier un fichier et de
produire des résultats incohérents.

---

## Politique aléatoire — `random_policy.py`

### Principe

A chaque step, l'agent choisit une action parmi les 4 disponibles de manière
**uniformément aléatoire**, sans tenir compte de l'état observé :

```python
action = env.action_space.sample()
```

### Résultats observés

| Métrique | Valeur typique |
|---|---|
| Mean return | ~ -173 |
| Raison principale de fin | crash |

### Role dans le projet

La random policy est le **plancher absolu de performance**. Si le DQN ne fait
pas significativement mieux, l'apprentissage ne fonctionne pas. Elle sert de
point d'ancrage inférieur pour tous les graphiques comparatifs.

### Sorties produites

- `results/random_log.csv` — log ligne par ligne de chaque épisode
- Affichage console du résumé statistique

---

## Politique heuristique — `heuristic_policy.py`

### Principe

Une règle de décision codée à la main, sans aucun apprentissage, basée
uniquement sur deux dimensions de l'état (position X et vitesse verticale) :

```python
def choose_action(obs):
    x  = obs[0]   # position horizontale
    vy = obs[3]   # vitesse verticale

    if vy < -0.5:   return 2   # moteur principal — freiner la chute
    if x > 0.1:     return 1   # moteur gauche — revenir au centre
    if x < -0.1:    return 3   # moteur droit — revenir au centre
    return 0                   # rien
```

### Résultats observés

| Métrique | Valeur typique |
|---|---|
| Mean return | ~ -413 |
| Raison principale de fin | crash |

### Pourquoi l'heuristique fait pire que le random ?

La règle ignore l'angle (`theta`) et la vitesse angulaire (`theta_dot`). Elle
allume le moteur principal dès que la vitesse de chute dépasse 0.5, sans tenir
compte de l'orientation du module. Si le module est incliné, le moteur le
pousse dans la mauvaise direction, accumulant une rotation incontrôlée. Le
module finit par s'écraser de côté avec une vitesse angulaire élevée.

Ce résultat est intentionnellement affiché pour **justifier l'utilisation du
DQN** : même une règle humaine réfléchie est insuffisante face à la complexité
des 8 dimensions de l'état.

### Sorties produites

- `results/heuristic_log.csv` — log de chaque épisode
- Affichage console du résumé statistique

---

## Replay Buffer — `replay_buffer.py`

### Architecture

```
ReplayBuffer
  |-- buffer : deque(maxlen=50000)
  |-- add_transition(state, action, reward, next_state, done)
  |-- sample_batch(batch_size) -> 5 tenseurs PyTorch
  |-- is_ready(batch_size) -> bool
  |-- __len__() -> int
```

### Structure d'une transition stockée

Chaque expérience est stockée sous forme d'un tuple de 5 éléments :

```
(state, action, reward, next_state, done)
   |       |       |        |         |
  [8]    int    float      [8]       bool
```

### Implémentation détaillée

Le buffer utilise un `deque` Python avec une capacité maximale. Quand le buffer
est plein, les transitions les plus anciennes sont automatiquement écrasées
(mémoire circulaire FIFO).

```python
self.buffer = deque(maxlen=capacity)  # 50 000 transitions max
```

L'échantillonnage retourne directement des tenseurs PyTorch prêts pour le
calcul du gradient, convertis vers le bon device (CPU ou GPU) :

```python
def sample_batch(self, batch_size):
    batch = random.sample(self.buffer, batch_size)  # tirage sans remise
    states, actions, rewards, next_states, dones = zip(*batch)
    return (
        torch.FloatTensor(np.array(states)).to(self.device),
        torch.LongTensor(np.array(actions)).to(self.device),
        torch.FloatTensor(np.array(rewards)).to(self.device),
        torch.FloatTensor(np.array(next_states)).to(self.device),
        torch.FloatTensor(np.array(dones)).to(self.device),
    )
```

### Pourquoi ce composant est indispensable au DQN

Sans replay buffer, l'apprentissage souffre de deux problèmes majeurs :

**1. Corrélation temporelle**
Les transitions consécutives d'un épisode sont très fortement corrélées
(l'état $s_{t+1}$ découle directement de $s_t$ et $a_t$). En apprenant sur ces
séquences dans l'ordre, le réseau de neurones overfitte sur les patterns locaux
de la trajectoire courante et "oublie" les états passés.

**2. Efficacité d'échantillonnage**
Chaque transition vécue peut être réutilisée plusieurs fois pour mettre à jour
les poids du réseau, au lieu d'être utilisée une seule fois et jetée. Avec 50 000
transitions en mémoire et un batch de 64, une expérience peut être tirée en
moyenne des dizaines de fois.

---

## Visualisation des baselines — `baseline_plot.py`

### Ce que le script produit

Le script lit les deux fichiers CSV générés par les politiques baseline et
produit deux graphiques :

**`results/baseline_returns.png`**
Courbe des returns par épisode pour Random (rouge) et Heuristic (bleu),
avec une ligne horizontale verte à y=200 (l'objectif DQN).

**`results/baseline_reasons.png`**
Bar chart comparatif des raisons de fin d'épisode (crash / landing / timeout)
pour chacune des deux politiques.

---

## Enregistrement vidéo — `baseline_videos.py`

### Ce que le script fait

Il utilise le wrapper `gym.wrappers.RecordVideo` pour capturer des épisodes
en MP4. Il enregistre 3 épisodes pour chaque politique :

- `videos/random/` — comportement de la politique aléatoire
- `videos/heuristic/` — comportement de la politique heuristique

Ces vidéos servent de matériel visuel pour la soutenance et permettent de
comprendre intuitivement pourquoi ces politiques échouent.

---

## Tableau de synthese

| Composant | Technologie | Role | Sortie |
|---|---|---|---|
| Configuration | YAML + PyYAML | Centralisation hyperparamètres | `configs/base.yaml` |
| Random Policy | Gymnasium | Baseline inférieure | CSV + stats |
| Heuristic Policy | Gymnasium | Baseline intermédiaire | CSV + stats |
| Replay Buffer | Python `deque` + PyTorch | Mémoire circulaire agent | Tenseurs pour train.py |
| Baseline Plots | Matplotlib | Visualisation comparative | 2 fichiers PNG |
| Baseline Videos | Gymnasium RecordVideo | Visualisation comportementale | MP4 |

---

## Dependances

```
gymnasium[box2d]  — environnement LunarLander-v3
torch             — tenseurs dans le replay buffer
numpy             — conversions tableaux
matplotlib        — graphiques
pyyaml            — lecture configs/base.yaml
moviepy           — encodage MP4 (baseline_videos.py)
```
