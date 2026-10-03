Bonne question, c'est important à maîtriser pour la défense.

---

## Comment fonctionne l'évaluation

L'évaluation se base sur **les poids du réseau de neurones** sauvegardés dans les fichiers `.pt` après l'entraînement.

Concrètement, voici ce qui se passe étape par étape :

---

**Étape 1 — On charge le modèle entraîné**

```python
q_net.load_state_dict(torch.load("models/dqn_seed0.pt"))
q_net.eval()
```

Le fichier `.pt` contient tous les poids du réseau appris pendant l'entraînement. C'est la "mémoire" de l'agent — tout ce qu'il a appris en 1000 épisodes est encodé là-dedans.

---

**Étape 2 — On lance l'agent dans l'environnement**

À chaque step, l'environnement donne un état (vecteur de 8 valeurs). On passe cet état dans le réseau :

```python
q_values = q_net(state)   # retourne 4 valeurs
action = q_values.argmax()  # on prend la plus haute
```

Le réseau calcule les 4 Q-values (une par action) et l'agent choisit **toujours l'action avec la Q-value la plus haute**. C'est ça le mode déterministe — epsilon = 0, zéro aléatoire.

---

**Étape 3 — On mesure le résultat**

On accumule tous les rewards pendant l'épisode. La somme totale c'est le **return**. On fait ça 100 fois et on calcule la moyenne.

---

**En résumé**

L'évaluation répond à cette question : **"Est-ce que ce que le réseau a appris est suffisamment bon pour atterrir de manière fiable ?"**

La base c'est les Q-values. Si pendant l'entraînement le réseau a bien appris que "quand je suis trop à gauche, propulseur droit vaut plus que rien faire", alors en évaluation il reproduit ce comportement systématiquement, sans hasard.

La différence avec l'entraînement c'est juste ça : pendant l'entraînement epsilon > 0 donc l'agent fait parfois des actions aléatoires pour explorer. En évaluation epsilon = 0, l'agent fait toujours ce qu'il pense être le mieux.

---

Tu as une autre question sur ce mécanisme ?