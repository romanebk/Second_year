# 🧪 Guide Complet : Évaluations des Modèles et Explication du Code

Ce document détaille comment les évaluations sont effectuées dans ce projet, tant d'un point de vue théorique (comment on évalue les baselines et les agents RL) que d'un point de vue pratique (comment le code fonctionne).

---

## 1. La Philosophie de l'Évaluation

Dans ce projet, nous avons 3 types de "pilotes" (modèles) à évaluer sur l'environnement LunarLander-v3 :
1.  **L'Agent Aléatoire (Random)** : Fait n'importe quoi. Sert à prouver que le jeu est difficile.
2.  **L'Agent Heuristique** : Un algorithme humain basé sur des règles (`if` penche à gauche, `alors` pousse à droite). Sert de point de repère d'une "intelligence artificielle basique".
3.  **L'Agent RL (DQN / PPO)** : L'agent autonome qui a appris par la pratique.

**La règle d'or de l'évaluation :** L'évaluation doit toujours se faire dans des conditions **déterministes** (sans exploration) et sur un nombre d'épisodes statistiquement significatif (ex: 100 épisodes).

---

## 2. Les Baselines : `baseline.py`

Le script `baseline.py` sert à évaluer l'agent Aléatoire et l'agent Heuristique.

### A. L'Agent Aléatoire (`RandomPolicy`)
```python
class RandomPolicy:
    def act(self, obs):
        return self.action_space.sample()
```
*   **Explication du code :** À chaque pas (step), l'agent appelle `sample()` sur l'espace d'action. Il choisit uniformément entre ne rien faire (0), moteur gauche (1), principal (2) ou droit (3).
*   **Évaluation :** Finit à 99% du temps par un crash violent. Score moyen attendu : entre **-150 et -300**.

### B. L'Agent Heuristique (`HeuristicPolicy`)
```python
class HeuristicPolicy:
    def act(self, obs):
        # ... extraction de x, y, vitesses, angle ...
        if vy < -0.3: return 2  # Freine si on tombe trop vite
        if theta < -0.05: return 3  # Corrige l'inclinaison
        # ...
```
*   **Explication du code :** C'est un arbre de décision "hardcodé" par un humain. Il regarde les observations (vitesses, angles) et réagit avec une logique mathématique simple.
*   **Évaluation :** Il évite souvent le crash mortel, mais gaspille beaucoup de carburant en surcompensant, ou atterrit parfois à côté des drapeaux. Score moyen attendu : autour de **0 à +50** (parfois plus si bien ajusté, mais rarement optimal).

**Comment le script sauvegarde les données :** 
À la fin de l'évaluation, `baseline.py` crée un fichier `.csv` (ex: `results_heuristic_seed0.csv`) contenant pour chaque épisode le score final, le nombre d'étapes et la raison de fin d'épisode (crash, success, timeout). C'est avec ces CSV que tu pourras tracer tes graphiques.

---

## 3. L'Agent RL : Le script `eval.py`

Le script `eval.py` est dédié à l'évaluation de ton agent entraîné (DQN, PPO...).

### A. Le mode Inférence (Très important)
Lors de l'évaluation d'un réseau de neurones, on le fait passer en mode "Inférence" ou "Test". 
1.  **Désactivation de l'exploration :** Contrairement à l'entraînement (`train.py`), on force $\epsilon = 0$. L'agent ne fait plus *aucun* choix aléatoire.
2.  **Mode évaluation (PyTorch) :** Si tu utilises PyTorch, on appelle `model.eval()`.
3.  **Choix de l'action :** `action = argmax(Q_values)`

### B. Boucle d'évaluation
Le code ressemble à ceci :
```python
for ep in range(episodes_test):
    obs, _ = env.reset(seed=seed_test)
    done = False
    score = 0
    while not done:
        # 1. Prédiction pure (sans exploration)
        action = agent.predict(obs, deterministic=True) 
        # 2. Interaction
        obs, reward, terminated, truncated, _ = env.step(action)
        score += reward
        done = terminated or truncated
```

### C. L'enregistrement Vidéo
Pour prouver visuellement que l'agent fonctionne, `eval.py` utilise souvent un Wrapper de Gymnasium : `gym.wrappers.RecordVideo`.
*   **Comment ça marche ?** Ce wrapper capture les *frames* (images rgb) rendues par l'environnement et les compile dans un fichier `.mp4` ou `.gif` à la fin de l'épisode.
*   *Note :* L'enregistrement vidéo ralentit beaucoup le code. On ne l'active que pour les quelques épisodes de démonstration.

---

## 4. Multi-Seeds et Reproductibilité (`scripts/reproduce.py`)

Une seule évaluation n'a aucune valeur statistique en RL. Pour prouver que le modèle est solide, nous utilisons un script de reproduction.

*   **Le Rôle du script :** Il va lancer l'entraînement (`train.py`) et l'évaluation (`eval.py`) **5 fois de suite**, mais en changeant la graine aléatoire (ex: `seeds = [0, 10, 20, 30, 40]`).
*   **Pourquoi fixer la `seed` ?** 
    1. Cela force l'environnement à générer le terrain et les bourrasques de vent exactement de la même manière.
    2. Cela force PyTorch à initialiser les poids des réseaux de neurones exactement pareil.
    *   *Résultat :* Si le professeur lance ton code, il obtiendra au chiffre près les mêmes scores que dans ton rapport.
*   **L'Intervalle de Confiance :** À partir des données CSV générées par ces 5 runs, le script `plot.py` va faire la moyenne des 5 courbes et tracer une zone ombrée (l'Intervalle de Confiance). Si cette zone est étroite, ton code est parfait et stable !

---

## 5. Résumé : Comment comparer tout ça pour le rapport ?

Lorsque tu auras généré les données des 3 modèles, tu devras afficher un graphique unique de comparaison (souvent généré par `plot.py`) :

1.  **Ligne rouge horizontale (Aléatoire) :** Tout en bas du graphique (-200).
2.  **Ligne orange horizontale (Heuristique) :** Au milieu du graphique (vers 0).
3.  **Courbe bleue ascendante (DQN) :** Elle commence près du rouge (car l'agent est bête au début), croise la ligne orange au bout de 200 épisodes d'entraînement, et finit par atteindre le plafond des **+200** (objectif résolu).

> 💡 **Conseil pour la soutenance :** Assure-toi de savoir lancer l'évaluation d'un modèle devant le jury (`python eval.py --checkpoint models/ton_modele.pt`) pour leur montrer l'atterrissage en direct.
