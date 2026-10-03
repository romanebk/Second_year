# Explication complète — eval.py (version finale)

## Rôle du fichier

`eval.py` est le script de validation formelle du projet. Il prend les modèles
entraînés par la Personne B (fichiers `.pt`) et mesure leurs performances réelles
sur 100 épisodes consécutifs en mode déterministe (sans exploration).

C'est ce fichier qui répond à la question centrale du projet :

> L'agent a-t-il atteint un mean score >= 200 sur 100 épisodes consécutifs ?

---

## Ligne par ligne

### Bloc 1 — Imports (lignes 1 à 10)

```python
import torch
import numpy as np
import gymnasium as gym
import yaml
import csv
import os
import argparse
import matplotlib.pyplot as plt
from collections import Counter
from model import Qnetwork
```

- `torch` : framework de deep learning, utilisé pour charger et faire tourner le réseau
  de neurones.
- `numpy` : calculs numériques (moyenne, écart-type, intervalle de confiance).
- `gymnasium` : bibliothèque qui fournit l'environnement LunarLander-v3.
- `yaml` : lecture du fichier de configuration `base.yaml`.
- `csv` : écriture des résultats dans des fichiers CSV.
- `os` : manipulation des chemins de fichiers et création de dossiers.
- `argparse` : gestion des arguments passés en ligne de commande.
- `matplotlib.pyplot` : génération des graphiques.
- `Counter` : comptage des raisons de fin d'épisode (crash, landing, etc.).
- `Qnetwork` : la classe du réseau de neurones définie dans `model.py`.

---

### Bloc 2 — Arguments en ligne de commande (lignes 12 à 22)

```python
parser = argparse.ArgumentParser(description="Évaluation formelle de l'agent DQN")
parser.add_argument("--seed",       type=int, default=0)
parser.add_argument("--n_episodes", type=int, default=100)
parser.add_argument("--config",     type=str, default="configs/base.yaml")
parser.add_argument("--all_seeds",  action="store_true")
args = parser.parse_args()
```

`argparse` permet de passer des options au script sans modifier le code.

- `--seed` : quelle seed de modèle évaluer (0 à 4). Défaut : 0.
- `--n_episodes` : combien d'épisodes lancer. Défaut : 100 (exigé par le sujet).
- `--config` : chemin vers le YAML de configuration. Défaut : `configs/base.yaml`.
- `--all_seeds` : drapeau booléen. S'il est présent dans la commande, il vaut `True`
  et le script évalue les 5 seeds d'un coup. `action="store_true"` signifie qu'on
  n'a pas besoin d'écrire `--all_seeds True`, juste `--all_seeds`.

Exemples d'usage :
```bash
python eval.py --seed 2
python eval.py --all_seeds
python eval.py --seed 0 --n_episodes 100
```

---

### Bloc 3 — Configuration et device (lignes 24 à 30)

```python
with open(args.config, "r") as f:
    config = yaml.safe_load(f)

DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
N_EPISODES = args.n_episodes
os.makedirs(config['paths']['results'], exist_ok=True)
```

- On lit `base.yaml` pour récupérer les chemins (`models/`, `results/`) et le nom
  de l'environnement (`LunarLander-v3`). Tous les scripts du projet partagent ce
  même fichier de config pour rester cohérents.
- `DEVICE` détecte automatiquement si un GPU est disponible. Si oui, les calculs
  PyTorch se font sur GPU (plus rapide). Sinon, sur CPU.
- `os.makedirs(..., exist_ok=True)` crée le dossier `results/` s'il n'existe pas
  encore, sans planter si il existe déjà.

---

### Bloc 4 — Fonction `load_model(seed)` (lignes 33 à 43)

```python
def load_model(seed):
    path = os.path.join(config['paths']['models'], f"dqn_seed{seed}.pt")
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Modèle introuvable : {path}\n"
            f"Lance d'abord : python train.py --seed {seed}"
        )
    q_net = Qnetwork().to(DEVICE)
    q_net.load_state_dict(torch.load(path, map_location=DEVICE))
    q_net.eval()
    return q_net
```

Cette fonction charge un modèle sauvegardé depuis le disque.

- `os.path.join(...)` construit le chemin complet, par exemple `models/dqn_seed0.pt`.
- Si le fichier n'existe pas, on lève une erreur claire avec le message exact à taper
  pour corriger le problème.
- `Qnetwork().to(DEVICE)` instancie le réseau et l'envoie sur le bon device.
- `load_state_dict(torch.load(...))` charge les poids du réseau depuis le fichier `.pt`.
  `map_location=DEVICE` est important : il permet de charger un modèle entraîné sur
  GPU sur une machine sans GPU, et inversement.
- `q_net.eval()` met le réseau en mode évaluation. Cela désactive le dropout et la
  batch normalization. Même si on n'en a pas ici, c'est une bonne pratique obligatoire
  avant toute inférence.

---

### Bloc 5 — Fonction `select_action(q_net, obs)` (lignes 45 à 49)

```python
def select_action(q_net, obs):
    state_t = torch.FloatTensor(obs).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        return q_net(state_t).argmax().item()
```

C'est la politique déterministe : epsilon = 0, aucune action aléatoire.
L'agent choisit toujours l'action avec la Q-value la plus élevée.

- `torch.FloatTensor(obs)` convertit le tableau numpy en tenseur PyTorch.
- `.unsqueeze(0)` ajoute une dimension batch : le réseau attend `[batch, state_dim]`,
  donc on passe de `[8]` à `[1, 8]`.
- `.to(DEVICE)` envoie le tenseur sur le bon device.
- `torch.no_grad()` désactive le calcul des gradients. En évaluation on ne
  rétropropage pas, donc c'est inutile et coûteux. Cela accélère l'inférence et
  réduit la consommation mémoire.
- `.argmax()` retourne l'index de la valeur maximale parmi les 4 Q-values.
- `.item()` convertit le tenseur en entier Python simple.

---

### Bloc 6 — Fonction `get_termination_reason(...)` (lignes 51 à 61)

```python
def get_termination_reason(terminated, truncated, reward, obs):
    if terminated:
        return "crash" if reward < 0 else "landing"
    if truncated:
        if abs(obs[0]) > 1.0 or obs[1] > 1.5:
            return "out-of-view"
        return "timeout"
    return "unknown"
```

Cette fonction est exigée explicitement par le sujet. Gymnasium distingue deux
types de fin d'épisode qu'il faut absolument différencier :

**`terminated=True`** : fin naturelle selon les règles du jeu.
On regarde le dernier reward pour distinguer :
- reward < 0 → `crash` (environ -100)
- reward >= 0 → `landing` réussi (environ +100)

**`truncated=True`** : l'épisode a été interrompu artificiellement.
On regarde la position du lander pour distinguer :
- `abs(obs[0]) > 1.0` : le lander est sorti du cadre horizontalement
- `obs[1] > 1.5` : le lander est sorti du cadre verticalement (trop haut)
- Dans ces cas → `out-of-view`
- Sinon → `timeout` (1000 steps atteints sans conclusion)

`obs[0]` est la position x relative au pad. `obs[1]` est l'altitude.

Le sujet cite explicitement crash, out-of-view et timeout comme raisons à logger.

---

### Bloc 7 — Fonction `evaluate(seed, n_episodes, verbose)` (lignes 64 à 126)

C'est la fonction principale. Elle orchestre toute l'évaluation.

```python
def evaluate(seed, n_episodes, verbose=True):
    q_net = load_model(seed)
    env   = gym.make(config['env']['name'])
```

On charge le modèle et on crée l'environnement.

```python
    for episode in range(n_episodes):
        obs, _ = env.reset(seed=seed + episode)
```

On lance `n_episodes` épisodes. La seed utilisée est `seed + episode` : cela
garantit que chaque épisode part d'une configuration différente (diversité), tout
en restant reproductible (si on relance avec la même seed, on obtient les mêmes
épisodes). Si on utilisait toujours la même seed, tous les épisodes seraient
identiques, ce qui ne mesurerait rien.

```python
        while True:
            action = select_action(q_net, obs)
            obs, reward, terminated, truncated, _ = env.step(action)
            episode_return += reward
            episode_length += 1
            last_reward     = reward

            if terminated or truncated:
                termination_reason = get_termination_reason(
                    terminated, truncated, last_reward, obs
                )
                break
```

La boucle interne fait tourner un épisode complet :
- On choisit une action avec la politique déterministe
- On l'exécute dans l'environnement
- On accumule le reward et incrémente le compteur de steps
- On garde le dernier reward (`last_reward`) pour la détection de fin
- Quand l'épisode se termine, on détecte la raison et on sort de la boucle

```python
        rows.append({
            "episode":            episode,
            "total_return":       round(episode_return, 3),
            "length":             episode_length,
            "termination_reason": termination_reason
        })
```

On construit une ligne pour le CSV avec toutes les informations de l'épisode.

```python
        if verbose and (episode + 1) % 10 == 0:
            print(...)
```

En mode verbose (seed unique), on affiche un log tous les 10 épisodes pour suivre
la progression. En mode `--all_seeds`, verbose est `False` pour ne pas surcharger
la sortie.

```python
    csv_path = os.path.join(config['paths']['results'], f"eval_seed{seed}_log.csv")
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[...])
        writer.writeheader()
        writer.writerows(rows)
```

On sauvegarde tous les épisodes dans un CSV. `newline=""` évite les lignes vides
sur Windows. `DictWriter` écrit chaque ligne depuis un dictionnaire, ce qui est
plus lisible que des indices.

La fonction retourne 4 valeurs :
- `np.array(returns)` : les returns sous forme de tableau numpy pour les calculs
- `np.array(lengths)` : les longueurs d'épisodes
- `reasons` : liste des raisons de fin
- `csv_path` : le chemin du CSV sauvegardé

---

### Bloc 8 — Fonction `print_stats(...)` (lignes 129 à 154)

```python
def print_stats(seed, returns, lengths, reasons):
    mean = np.mean(returns)
    std  = np.std(returns)
    ci95 = 1.96 * std / np.sqrt(len(returns))
    p200 = np.mean(returns >= 200) * 100
```

Calcul des statistiques :

- **Mean** : moyenne arithmétique. C'est le critère de succès du projet (>= 200).
- **Std** : écart-type. Mesure la variabilité. Un agent robuste a un std faible.
  Un std élevé signifie que l'agent est instable (parfois très bon, parfois mauvais).
- **95% CI** : intervalle de confiance à 95%, calculé avec la formule de Student
  pour grands échantillons : `1.96 * std / sqrt(n)`. Cela signifie que si on
  répétait l'évaluation, la vraie moyenne serait dans cet intervalle 95% du temps.
  Plus n est grand, plus l'intervalle est serré.
- **p200** : proportion d'épisodes où le return individuel est >= 200. Un agent peut
  avoir mean >= 200 sans que chaque épisode individuel soit >= 200.

```python
    counts = Counter(reasons)
    for r, c in sorted(counts.items()):
        print(f"    {r:12s} : {c:3d}  ({c/len(reasons)*100:.1f}%)")
```

`Counter` compte les occurrences de chaque raison de fin. On affiche le nombre
et le pourcentage pour chaque raison (crash, landing, out-of-view, timeout).

```python
    status = "SUCCES" if mean >= 200 else "ECHEC — signaler à la Personne B"
```

Verdict final. Si mean < 200, cela signifie que l'entraînement n'a pas convergé
et qu'il faut ajuster les hyperparamètres dans `base.yaml` et relancer `train.py`.

---

### Bloc 9 — Fonction `plot_single(seed, returns)` (lignes 157 à 189)

Génère deux graphiques côte à côte sauvegardés dans `results/eval_seed{N}_plot.png`.

**Graphique gauche — courbe des returns par épisode :**
```python
ax1.plot(returns, ...)
ax1.axhline(np.mean(returns), color="orange", ...)  # ligne de la moyenne
ax1.axhline(200, color="green", ...)                 # ligne de l'objectif
```
Permet de voir la stabilité de l'agent au fil des épisodes. Si la courbe est
très irrégulière, l'agent est instable malgré une bonne moyenne.

**Graphique droit — histogramme de distribution :**
```python
ax2.hist(returns, bins=20, ...)
ax2.axvline(np.mean(returns), ...)  # ligne verticale de la moyenne
ax2.axvline(200, ...)               # ligne verticale de l'objectif
```
Montre comment les returns se distribuent. Un bon agent a une distribution
concentrée au-dessus de 200. `bins=20` divise l'axe en 20 intervalles.

`plt.tight_layout()` ajuste automatiquement les marges pour éviter que les
titres et labels se chevauchent.

---

### Bloc 10 — Fonction `plot_all_seeds(all_returns)` (lignes 191 à 225)

Activée uniquement en mode `--all_seeds`. Génère `results/eval_all_seeds_plot.png`.

**Graphique gauche — bar chart mean ± 95% CI par seed :**
```python
ax1.bar(seeds, means, yerr=ci95s, capsize=5, ...)
```
`yerr` ajoute les barres d'erreur. `capsize=5` ajoute les petites barres
horizontales aux extrémités. Permet de voir si certains seeds ont mieux
convergé que d'autres.

**Graphique droit — toutes les courbes superposées :**
```python
colors = ["steelblue", "tomato", "seagreen", "darkorange", "mediumpurple"]
for i, s in enumerate(seeds):
    ax2.plot(all_returns[s], color=colors[i], label=f"Seed {s}")
```
Chaque seed est une couleur différente. Permet de voir si les seeds
convergent vers des performances similaires (signe de robustesse du
modèle) ou si certains seeds ont échoué.

---

### Bloc 11 — Main (lignes 228 à 273)

```python
if __name__ == "__main__":
```

Ce bloc ne s'exécute que si on lance directement `python eval.py`.
Il ne s'exécute pas si on importe eval.py depuis un autre script.

**Mode `--all_seeds` (lignes 230 à 264) :**

```python
for s in range(5):
    try:
        rets, lens, reas, csv_path = evaluate(s, N_EPISODES, verbose=False)
        ...
    except FileNotFoundError as e:
        print(f"\n   Seed {s} ignoré : {e}")
```

On boucle sur les seeds 0 à 4. Le `try/except` permet de continuer même si
un modèle est manquant : le seed est ignoré avec un avertissement, le script
ne plante pas.

Ensuite on affiche le tableau récapitulatif :
```python
print(f"  {r['seed']:>4}  {r['mean']:>8.2f}  {r['std']:>7.2f}  ...")
```
`:>4` signifie "aligner à droite sur 4 caractères". Cela donne un tableau
proprement aligné dans le terminal.

**Mode seed unique (lignes 266 à 273) :**

```python
returns, lengths, reasons, csv_path = evaluate(args.seed, N_EPISODES, verbose=True)
print_stats(args.seed, returns, lengths, reasons)
plot_single(args.seed, returns)
```

Séquence simple : évaluer, afficher les stats, générer le plot.

---

## Fichiers produits

| Fichier | Quand | Contenu |
|---|---|---|
| `results/eval_seed{N}_log.csv` | Toujours | Un épisode par ligne : return, length, raison |
| `results/eval_seed{N}_plot.png` | Toujours | Courbe + histogramme de distribution |
| `results/eval_all_seeds_plot.png` | Seulement avec `--all_seeds` | Bar chart + courbes superposées |

---

## Résumé des raisons de fin

| Raison | Condition | Signification |
|---|---|---|
| `landing` | `terminated=True` et reward >= 0 | Atterrissage reussi |
| `crash` | `terminated=True` et reward < 0 | Le lander a crashe |
| `out-of-view` | `truncated=True` et position hors cadre | Le lander est sorti de l'ecran |
| `timeout` | `truncated=True` et position dans le cadre | 1000 steps sans conclusion |
| `unknown` | Aucune des conditions | Ne devrait pas arriver |

---

## Critere de succes

Le projet est valide si :

```
mean return >= 200 sur 100 episodes consecutifs
```

Le script affiche `SUCCES` ou `ECHEC` en fin d'execution.