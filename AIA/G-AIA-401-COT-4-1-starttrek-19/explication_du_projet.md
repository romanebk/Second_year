Voilà une explication complète, de fond en comble, structurée pour ta défense.

---

## VUE D'ENSEMBLE DU PROJET

Le projet s'appelle **Start Trek**. L'objectif est d'entraîner un module lunaire à atterrir tout seul sur la Lune, sans pilote humain. On utilise le **Reinforcement Learning** (apprentissage par renforcement), une branche de l'IA où un agent apprend par essais et erreurs.

L'environnement de simulation s'appelle **LunarLander-v3**, fourni par la bibliothèque **Gymnasium**. C'est un moteur physique 2D réaliste (Box2D) qui simule la gravité, les propulseurs, et les collisions.

---

## LE REINFORCEMENT LEARNING EN 30 SECONDES

Le principe est simple : à chaque instant, l'agent observe l'état du monde, choisit une action, reçoit une récompense, et met à jour sa stratégie. C'est la boucle fondamentale :

```
état (s) --> agent --> action (a) --> environnement --> reward (r) --> nouvel état (s')
```

L'agent apprend à maximiser la somme des rewards sur le long terme, pas juste le reward immédiat.

---

## MDP (Markov Decision Process)

C'est le cadre mathématique du Reinforcement Learning.
Il dit que pour prendre une décision, on a besoin seulement de l'état actuel, pas de tout l'historique.

---

## Équation de Bellman

C'est la formule qui permet à l'agent d'apprendre.

En **simple** :

```
Valeur d'une action = récompense immédiate + valeur future espérée
```

En **formule** :

```
Q(état, action) = récompense + gamma × max(Q(état suivant))
```

- **gamma** (0.99 dans la config) → importance du futur
- Plus gamma est proche de 1, plus l'agent pense à long terme

---

## L'ENVIRONNEMENT LUNARLANDER-V3

**Ce que l'agent observe (état = vecteur de 8 valeurs) :**

| Index | Variable | Ce que ça représente |
|---|---|---|
| 0 | x | Position horizontale par rapport au pad |
| 1 | y | Altitude |
| 2 | vx | Vitesse horizontale |
| 3 | vy | Vitesse verticale |
| 4 | theta | Angle d'inclinaison |
| 5 | theta_dot | Vitesse angulaire |
| 6 | left_leg | 1 si la patte gauche touche le sol |
| 7 | right_leg | 1 si la patte droite touche le sol |

**Les 4 actions possibles :**
- 0 : ne rien faire
- 1 : propulseur gauche
- 2 : moteur principal (vers le haut)
- 3 : propulseur droit

**Le système de récompenses :**
- Bonus si proche du pad d'atterrissage
- Bonus si vitesse lente
- Bonus si l'engin est horizontal
- Bonus si les deux pattes touchent le sol
- Pénalité à chaque step si les moteurs brûlent
- **+100** pour un atterrissage réussi
- **-100** pour un crash

**Critère de succès : mean score >= 200 sur 100 épisodes consécutifs.**

---

## LA RÉPARTITION DES TÂCHES

Le projet est divisé en 3 personnes avec des dépendances claires : A fournit à B, B fournit à C (toi).

---

## PERSONNE A — Setup, Baseline, ReplayBuffer

### Ce qu'elle a fait

**1. Mise en place du projet**

Elle a installé les dépendances, créé la structure du repo, et écrit le fichier `configs/base.yaml` qui centralise tous les hyperparamètres. Tous les scripts lisent ce fichier, ce qui garantit la cohérence.

**2. Random Policy (`random_policy.py`)**

L'agent choisit une action au hasard à chaque step :
```python
action = env.action_space.sample()
```
C'est la baseline la plus simple. Elle sert de point de comparaison : si notre agent DQN ne fait pas mieux que ça, il y a un problème. En pratique, la random policy obtient des scores très négatifs (autour de -100 à -200) parce qu'elle crashe souvent.

**3. Heuristic Policy (`heuristic_policy.py`)**

Une règle simple codée à la main, sans apprentissage :
```python
if vy < -0.5  --> moteur principal (freiner la chute)
if x > 0.1   --> propulseur gauche (revenir au centre)
if x < -0.1  --> propulseur droit (revenir au centre)
sinon        --> ne rien faire
```
Elle obtient de meilleurs résultats que le random mais reste loin de 200, parce qu'elle ne gère pas l'angle ni la vitesse angulaire. Elle sert à montrer qu'une règle humaine simple ne suffit pas.

**4. ReplayBuffer (`replay_buffer.py`)**

C'est une mémoire circulaire qui stocke les expériences passées de l'agent sous forme de tuples `(state, action, reward, next_state, done)`. La capacité est de 50 000 transitions.

Pourquoi en a-t-on besoin ? Sans replay buffer, l'agent apprendrait uniquement de la dernière transition, ce qui crée deux problèmes : les données sont très corrélées (un état suit l'autre), et l'agent oublie les expériences passées. Le replay buffer casse cette corrélation en tirant des mini-batches aléatoires.

```python
def sample_batch(self, batch_size):
    batch = random.sample(self.buffer, batch_size)
    # retourne 5 tenseurs PyTorch prêts à l'emploi
```

**5. Plots et vidéos baseline**

Elle a produit `results/baseline_returns.png` comparant random vs heuristic, et des vidéos `.mp4` pour visualiser les comportements.

---

## PERSONNE B — Agent DQN, train.py, Multi-seeds

### Ce qu'elle a fait

C'est le coeur du projet. Elle a implémenté l'algorithme **DQN (Deep Q-Network)**.

**1. Le réseau de neurones (`model.py`)**

```python
class Qnetwork(nn.Module):
    Linear(8, 128) -> ReLU -> Linear(128, 128) -> ReLU -> Linear(128, 4)
```

Entrée : les 8 valeurs de l'état. Sortie : les 4 Q-values, une par action. La Q-value d'une action représente le gain total attendu si on choisit cette action dans cet état et qu'on suit ensuite la meilleure politique possible.

**2. Epsilon-greedy (exploration vs exploitation)**

Au début, l'agent explore beaucoup (epsilon = 1.0, donc 100% aléatoire). Au fil du temps, epsilon décroît (multiplié par 0.995 à chaque épisode) jusqu'à 0.01. L'agent exploite de plus en plus ce qu'il a appris.

C'est le compromis fondamental en RL : explorer pour découvrir de nouvelles stratégies, ou exploiter ce qu'on sait déjà.

**3. La boucle d'entraînement (`train.py`)**

À chaque step :
1. L'agent observe l'état
2. Choisit une action (epsilon-greedy)
3. Exécute l'action dans l'environnement
4. Reçoit le reward et le nouvel état
5. Stocke la transition dans le ReplayBuffer
6. Tire un mini-batch de 64 transitions au hasard
7. Calcule la loss et met à jour le réseau

**4. La loss DQN**

C'est l'erreur temporelle (TD error) :
```
loss = MSE(Q(s, a),  r + gamma * max(target_net(s')) * (1 - done))
```

On veut que la Q-value prédite pour l'action choisie soit proche de la Q-value cible, qui est le reward immédiat plus la meilleure Q-value future possible (actualisée par gamma = 0.99).

Le `(1 - done)` masque les états terminaux : si l'épisode est fini, il n'y a pas de futur, donc la cible est simplement le reward.

**5. Le target network**

Il y a deux réseaux identiques : `q_net` (online, mis à jour à chaque step) et `target_net` (figé, copié depuis q_net toutes les 100 steps). Pourquoi ? Si on utilisait le même réseau pour calculer la cible et pour s'entraîner, la cible bougerait en permanence et l'entraînement serait instable, comme viser une cible mouvante. Le target network fige la cible pendant 100 steps.

**6. Multi-seeds**

Elle a lancé l'entraînement 5 fois avec des seeds différentes (0, 1, 2, 3, 4) via `run_seeds.sh`. Cela permet de calculer mean ± 95% CI et de vérifier que les résultats sont reproductibles, pas juste de la chance sur une seed.

**7. Q-Learning tabulaire (`q_learning_agent.py`, `train_q_learning.py`)**

En bonus, elle a aussi implémenté un Q-Learning classique sans réseau de neurones, en discrétisant l'espace d'états. C'est utile pour comparer avec le DQN et montrer que les espaces continus nécessitent une approche neuronale.

---

## TA PARTIE — Personne C, eval.py

C'est la partie la plus critique pour la soutenance parce que c'est toi qui valides que tout le projet fonctionne.

### Ton rôle en une phrase

Tu reçois les modèles entraînés par B et tu prouves qu'ils atteignent le critère de succès du projet, de manière rigoureuse et reproductible.

### Ce que fait eval.py en détail

**Pourquoi évaluer séparément de l'entraînement ?**

Pendant l'entraînement, l'agent explore (epsilon > 0), donc ses performances sont artificiellement dégradées par les actions aléatoires. L'évaluation se fait en mode déterministe (epsilon = 0) : l'agent choisit toujours la meilleure action connue. C'est la vraie mesure de ce qu'il a appris.

**La politique déterministe**

```python
def select_action(q_net, obs):
    state_t = torch.FloatTensor(obs).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        return q_net(state_t).argmax().item()
```

`torch.no_grad()` est important : en évaluation on ne calcule pas les gradients, ce qui est plus rapide et économe en mémoire.

**Les 100 épisodes consécutifs**

Le sujet exige explicitement 100 épisodes **consécutifs**, pas 100 épisodes choisis parmi d'autres. Chaque épisode part d'une seed différente (`seed + episode`) pour tester l'agent sur des configurations variées tout en restant reproductible.

**Les statistiques produites**

- **Mean** : critère principal, doit être >= 200
- **Std** : variabilité, un bon agent a un std faible
- **95% CI** `[mean - 1.96*std/sqrt(n), mean + 1.96*std/sqrt(n)]` : intervalle de confiance statistique
- **% épisodes >= 200** : proportion de succès individuels
- **Raisons de fin** : crash / landing / timeout — permet de comprendre comment l'agent échoue

**La distinction terminated vs truncated**

C'est une exigence explicite du sujet. `terminated=True` signifie que l'épisode s'est terminé naturellement (crash ou landing). `truncated=True` signifie qu'on a atteint le nombre maximum de steps (1000) sans fin naturelle, c'est un timeout. On regarde le dernier reward pour distinguer crash (~-100) et landing (~+100).

**Les deux modes d'utilisation**

```bash
python eval.py --seed 0          # un seul modèle
python eval.py --all_seeds       # compare les 5 seeds, tableau récapitulatif
```

Le mode `--all_seeds` est ce qu'on utilise pour le rapport : il génère le tableau mean ± 95% CI pour chaque seed et les graphiques de comparaison.

**Les fichiers produits**

- `results/eval_seed{N}_log.csv` : chaque épisode loggé ligne par ligne
- `results/eval_seed{N}_plot.png` : courbe des returns + histogramme de distribution
- `results/eval_all_seeds_plot.png` : bar chart comparatif multi-seeds

---

## CE QU'IL FAUT SAVOIR DIRE EN DÉFENSE

**Sur le projet en général :**

"On a implémenté un agent DQN sur LunarLander-v3. L'agent apprend par trial and error : il reçoit des rewards positifs quand il s'approche du pad et atterrit doucement, et des pénalités quand il crashe ou brûle trop de carburant. On mesure le succès par un mean score >= 200 sur 100 épisodes consécutifs."

**Sur le DQN :**

"On utilise un réseau de neurones MLP à 2 couches cachées de 128 neurones pour approximer la fonction Q, qui associe à chaque paire (état, action) le gain total attendu. On stabilise l'entraînement avec un replay buffer qui casse la corrélation entre transitions, et un target network qui fige la cible pendant 100 steps pour éviter l'instabilité."

**Sur ton eval.py :**

"Mon rôle est de valider que l'agent entraîné atteint effectivement le critère de succès. J'évalue en mode déterministe, epsilon = 0, sur 100 épisodes consécutifs avec des conditions initiales variées. Je mesure le mean return, l'écart-type, l'intervalle de confiance à 95%, et les raisons de fin d'épisode pour distinguer crash, landing réussi et timeout. Je fais ça sur les 5 seeds pour montrer que les résultats sont reproductibles et pas juste liés à une seed favorable."

**Questions pièges possibles :**

- *Pourquoi epsilon = 0 en évaluation ?* Pour mesurer ce que l'agent a vraiment appris, sans bruit d'exploration. En training on explore pour découvrir, en eval on exploite ce qu'on sait.
- *Pourquoi 100 épisodes consécutifs ?* C'est le standard du benchmark LunarLander. Ça évite de cherry-picker les bons épisodes.
- *Pourquoi seed + episode ?* Pour tester sur des configurations différentes tout en restant reproductible. Si on utilisait toujours la même seed, tous les épisodes seraient identiques.
- *Que fait le 95% CI ?* Il dit : "si on répétait l'expérience, la vraie moyenne serait dans cet intervalle 95% du temps". Plus on a d'épisodes, plus l'intervalle est serré.
- *C'est quoi terminated vs truncated ?* Terminated = fin naturelle (crash ou landing). Truncated = timeout, on a dépassé les 1000 steps sans conclusion.

---

Bonne défense demain ! Tu as une bonne compréhension de l'ensemble, et ta partie eval.py est claire et bien motivée.

---

## QUESTIONS ET RÉPONSES DÉTAILLÉES POUR LA SOUTENANCE

### Sur le Reinforcement Learning

#### C'est quoi le principe du RL ?
Le **Reinforcement Learning** (apprentissage par renforcement) est un paradigme d'apprentissage automatique où un agent apprend à prendre des décisions en interagissant avec un environnement dynamique. Par un processus d'essais et d'erreurs, l'agent cherche à maximiser la somme cumulée des récompenses (returns) obtenues au fil du temps.

#### Explique la boucle état → action → récompense
À chaque pas de temps $t$ :
1. L'agent observe l'**état** actuel $s_t$ de l'environnement.
2. L'agent choisit et exécute une **action** $a_t$ selon sa politique.
3. L'environnement applique l'action et passe à l'**état suivant** $s_{t+1}$ tout en renvoyant une **récompense** $r_t$ (positive ou négative).
Cette boucle se réagit jusqu'à ce que l'épisode se termine (état terminal ou limite de temps).

#### C'est quoi l'exploration vs exploitation ?
C'est le compromis fondamental en RL :
* **Exploration** : L'agent choisit des actions aléatoires ou non optimales pour découvrir de nouveaux états et identifier de meilleures stratégies à long terme.
* **Exploitation** : L'agent prend la meilleure action estimée à ce jour pour maximiser sa récompense immédiate et cumulée à court terme en exploitant ses connaissances actuelles.

#### Pourquoi epsilon diminue au fil du temps ?
Au début de l'entraînement, l'agent ne connaît rien de l'environnement, il doit donc explorer massivement ($\epsilon = 1.0$, comportement $100\%$ aléatoire). Au fil des épisodes, on réduit graduellement epsilon (multiplié par `epsilon_decay` = 0.995) pour passer progressivement à de l'exploitation. À la fin, l'agent n'explore que très peu ($\epsilon = 0.01$) et applique presque exclusivement la politique optimale qu'il a apprise.

#### C'est quoi le reward shaping ?
Le **reward shaping** consiste à concevoir et à ajouter des récompenses intermédiaires ou heuristiques (en plus du signal brut succès/échec) pour guider l'agent lors de son apprentissage. Dans LunarLander, le reward shaping est déjà intégré par l'environnement (Gymnasium) : il donne des points si l'agent s'approche du pad, s'il ralentit, s'il reste droit ou s'il pose ses jambes, ce qui évite le problème des récompenses trop rares (sparse rewards) et accélère la convergence.

---

### Sur le DQN

#### Pourquoi utiliser un replay buffer ?
Le replay buffer (mémoire d'expériences) stocke les transitions passées $(s, a, r, s', \text{done})$. Il a deux fonctions majeures :
1. **Casser la corrélation temporelle** : Les états successifs d'un épisode s'enchaînent de manière très corrélée. En échantillonnant des mini-batches aléatoires dans le buffer pour l'entraînement, on simule des données indépendantes et identiquement distribuées (i.i.d.), ce qui stabilise la descente de gradient.
2. **Améliorer l'efficacité d'échantillonnage (sample efficiency)** : Chaque transition vécue peut être utilisée plusieurs fois pour mettre à jour le réseau de neurones au lieu d'être jetée immédiatement.

#### C'est quoi un target network et pourquoi il est utile ?
C'est une copie conforme du réseau de neurones principal ($Q_{\text{online}}$) dont les poids sont gelés et mis à jour moins fréquemment (toutes les $C$ étapes ou par soft update). Il sert à calculer les valeurs cibles (les targets de l'équation de Bellman) :
$$Y = r + \gamma \max_{a'} Q_{\text{target}}(s', a')$$
Sans ce second réseau, nous utiliserions le même réseau pour prédire la valeur actuelle et la cible future. Celle-ci bougerait donc à chaque pas d'apprentissage, rendant l'entraînement instable (problème de la "cible mouvante").

#### Pourquoi utiliser un réseau de neurones plutôt qu'une Q-table ?
L'environnement LunarLander possède un **espace d'états continu** (les 8 dimensions sont des nombres réels). Une Q-table nécessite d'indexer chaque état possible individuellement, ce qui est mathématiquement infini ici. Le réseau de neurones agit comme un **approximateur universel de fonction**, capable de prendre un état continu en entrée et d'en prédire les Q-values associées, tout en généralisant à des états proches jamais visités.

#### C'est quoi la différence entre hard et soft update ?
* **Hard update** : Les poids du réseau cible sont mis à jour périodiquement en copiant directement les poids du réseau d'évaluation (ex: toutes les 100 étapes dans notre code) : $\theta_{\text{target}} \leftarrow \theta_{\text{online}}$.
* **Soft update** : Le réseau cible est mis à jour à chaque étape d'une infime fraction $\tau$ (lissage exponentiel) : $\theta_{\text{target}} \leftarrow \tau \theta_{\text{online}} + (1 - \tau) \theta_{\text{target}}$ (avec $\tau \ll 1$, ex: $0.005$). Cela élimine les sauts brutaux de performance.

#### Pourquoi ReLU comme fonction d'activation ?
La fonction **ReLU** ($f(x) = \max(0, x)$) est la fonction d'activation standard en Deep Learning car :
1. Elle **évite la disparition du gradient** (vanishing gradient) sur la partie positive, accélérant la convergence par rapport à Sigmoid ou Tanh.
2. Elle est **très peu coûteuse en calcul** (une simple opération de seuillage).
3. Elle introduit une **représentation parcimonieuse** (certains neurones sont désactivés à 0), ce qui améliore la généralisation du réseau.

---

### Sur le Q-Learning

#### C'est quoi la différence entre Q-Learning et DQN ?
Le **Q-Learning** est un algorithme tabulaire classique : il utilise une table mémoire (Q-table) pour stocker explicitement la valeur de chaque paire (état, action). Le **DQN (Deep Q-Network)** remplace cette table par un réseau de neurones profond pour estimer ces valeurs, ce qui lui permet de passer à l'échelle sur des environnements complexes à états continus ou de haute dimension.

#### Pourquoi discrétiser l'espace d'états ?
Pour appliquer le Q-Learning tabulaire sur LunarLander (espace continu), on doit diviser chaque dimension de l'état en intervalles fixes (par exemple, 6 "bins" de -1 à 1). Tout état réel tombant dans un intervalle donné est alors considéré comme un état discret identique. Sans cette discrétisation, la table serait infinie et impossible à instancier.

#### Pourquoi le Q-Learning est limité sur LunarLander ?
1. **La malédiction de la dimensionnalité** : L'état contient 8 dimensions. Si on utilise 6 bins par dimension, la table contient $6^8 = 1\,679\,616$ états possibles. Avec 4 actions, cela fait $6.7$ millions de valeurs à apprendre. L'agent ne peut pas visiter toutes ces cases en quelques milliers d'épisodes, rendant la table extrêmement creuse.
2. **Le manque de résolution (perte de précision)** : Une discrétisation grossière (ex: 6 bins) regroupe des états physiquement très différents sous un même état discret (par exemple, confondre un angle de $2^\circ$ et un angle de $12^\circ$), empêchant l'agent d'effectuer les micro-ajustements indispensables pour atterrir.
3. **L'absence de généralisation** : Ce qui est appris pour un bin d'état n'aide pas du tout à comprendre le bin voisin, contrairement à un réseau de neurones qui généralise de manière continue.

#### C'est quoi une Q-table ?
C'est une matrice ou un tableau associatif où chaque ligne représente un état discret du système, chaque colonne représente une action possible, et chaque case contient la valeur $Q(s, a)$, c'est-à-dire l'estimation du gain total actualisé à long terme si l'on prend l'action $a$ dans l'état $s$.

---

### Sur vos résultats

#### Pourquoi votre agent n'atteint pas encore 200 ?
Si sur certaines exécutions ou seeds, l'agent ne dépasse pas ou se stabilise en dessous de 200 après 1000 épisodes, cela s'explique par :
1. **La sensibilité aux graines aléatoires (seeds)** : Certaines graines peuvent initialiser le réseau dans une configuration de poids défavorable ou démarrer l'exploration sur des trajectoires stériles, ralentissant la convergence.
2. **Le nombre d'épisodes limité** : 1000 épisodes d'entraînement représentent une limite basse pour stabiliser 5 seeds distinctes de manière homogène sur LunarLander.
3. **L'instabilité du DQN de base** : Sans extensions régulatrices (ex. Double-DQN), le DQN de base a tendance à surestimer les Q-values et peut stagner sur des politiques sous-optimales.
*(Note : les seeds ayant complété leur entraînement complet, comme les seeds 0, 1 et 4, atteignent toutefois des scores de réussite très élevés, souvent supérieurs à 240 en fin de trajectoire).*

#### Pourquoi comparer avec random et heuristic ?
* **Random Policy** (score moyen ~ -173) représente le niveau zéro de l'intelligence. Elle sert à valider que notre agent DQN apprend bel et et bien quelque chose.
* **Heuristic Policy** (score moyen ~ -413) montre qu'une règle humaine programmée de façon rigide est inefficace. Sur LunarLander, l'heuristique simple sur-active les moteurs et engendre des crashs violents. Cette comparaison prouve l'intérêt de la flexibilité et de l'adaptation du Reinforcement Learning.

#### C'est quoi le 95% CI et pourquoi c'est important ?
Le **95% Confidence Interval** (intervalle de confiance à 95%) est une mesure statistique calculée lors de l'évaluation :
$$\text{CI} = \left[ \text{mean} - 1.96 \frac{\sigma}{\sqrt{n}}, \, \text{mean} + 1.96 \frac{\sigma}{\sqrt{n}} \right]$$
Il garantit que si on évaluait l'agent sur un nombre infini d'épisodes, la vraie moyenne de performance se situerait dans cette plage dans 95% des cas. Cela prouve scientifiquement que notre score moyen d'évaluation est robuste et non le résultat du hasard d'un petit échantillon.

#### Qu'est ce que vous changeriez pour améliorer les résultats ?
1. **Double DQN (DDQN)** : Pour éliminer le biais de surestimation des Q-values.
2. **Dueling DQN** : Pour séparer l'estimation de la valeur de l'état $V(s)$ et des avantages des actions $A(s,a)$, rendant l'apprentissage plus robuste dans les états où les actions ont peu d'impact.
3. **Prioritized Experience Replay (PER)** : Pour échantillonner plus souvent les transitions où l'agent s'est trompé (TD-error élevée) afin de corriger plus vite ses erreurs.
4. **Soft Target Update** : Remplacer la mise à jour par blocs (toutes les 100 steps) par une mise à jour lisse continue ($\tau = 0.005$).

---

### Sur votre code

#### Pourquoi séparer train.py et eval.py ?
1. **Séparation des responsabilités** : L'entraînement gère le replay buffer, le calcul des gradients, le bruit d'exploration ($\epsilon > 0$) et les optimisateurs. L'évaluation doit charger un modèle figé, couper le calcul des gradients (`torch.no_grad()`) pour gagner du temps et de la mémoire, et utiliser une politique purement déterministe ($\epsilon = 0$).
2. **Modularité** : On peut évaluer un modèle sauvegardé sous différentes conditions (ex: sur 100 ou 500 épisodes, avec ou sans rendu vidéo) sans avoir à ré-entraîner.

#### Pourquoi utiliser des seeds fixes ?
L'environnement LunarLander et le réseau de neurones possèdent une forte composante aléatoire (position initiale, forces de vent, poids initiaux, exploration). L'utilisation de seeds fixes assure la **reproductibilité scientifique** : elle garantit que n'importe qui exécutant le code obtiendra exactement les mêmes résultats et graphiques, permettant une comparaison rigoureuse.

#### C'est quoi l'ablation study et qu'avez vous testé ?
Une **étude d'ablation** consiste à enlever ou à modifier délibérément certaines parties d'un algorithme pour comprendre leur impact sur les performances. Dans ce projet, nous avons configuré les structures pour analyser :
* L'importance du Target Network (en variant sa fréquence de mise à jour).
* L'influence de la capacité du Replay Buffer (50k vs 100k).
* La structure du réseau (64x64 vs 128x128).

#### Pourquoi un requirements.txt ?
C'est un fichier standard répertoriant toutes les bibliothèques logicielles tierces nécessaires pour exécuter le projet, ainsi que leurs versions respectives. Il garantit la portabilité du code, permettant aux autres développeurs d'installer le bon environnement avec `pip install -r requirements.txt`.

---

### Sur l'environnement

#### C'est quoi les 8 dimensions du state ?
1. **Position X** : Position horizontale relative au centre du pad.
2. **Position Y** : Altitude du module.
3. **Vitesse X** : Vitesse horizontale.
4. **Vitesse Y** : Vitesse de descente (verticale).
5. **Angle** : Orientation angulaire du module.
6. **Vitesse angulaire** : Vitesse de rotation sur lui-même.
7. **Contact jambe gauche** : 1 si la patte gauche touche le sol, sinon 0.
8. **Contact jambe droite** : 1 si la patte droite touche le sol, sinon 0.

#### Pourquoi le score minimum est -100 pour un crash ?
La pénalité brute immédiate pour un crash est de -100 (alors qu'un atterrissage réussi rapporte +100). Néanmoins, le score final de l'épisode peut descendre sous les -100 (ex: -200 ou -300) car l'agent accumule d'autres pénalités en cours de route (consommation constante de carburant à chaque pas de temps, vitesse excessive, éloignement du pad).

#### C'est quoi terminated vs truncated ?
* **Terminated (Terminé)** : L'épisode a pris fin de manière naturelle (l'atterrisseur s'est posé de manière stable sur ses deux pattes ou s'est écrasé).
* **Truncated (Tronqué)** : L'épisode a été stoppé arbitrairement par la limite de temps de l'environnement (1000 étapes maximales de simulation atteintes sans crash ni atterrissage stable).

#### Quand est ce que l'environnement est considéré résolu ?
LunarLander-v3 est considéré comme résolu lorsque l'agent obtient un **score moyen ≥ 200 sur 100 épisodes consécutifs**.