# Lunar Lander Reinforcement Learning

Projet de reinforcement learning pour entraîner un module lunaire à atterrir de manière autonome en utilisant l'algorithme DQN (Deep Q-Network).

## Objectif

Atteindre un **score moyen ≥ 200** sur 100 épisodes consécutifs dans l'environnement Lunar Lander-v3.

### Contexte
- **Destination finale** : Mars
- **Étape intermédiaire** : Base de relais sur la Lune
- **Défi** : Atterrissage autonome sans pilote humain
- **Solution** : Agent IA entraîné par reinforcement learning

## Environnement

### Lunar Lander-v3
- **Simulateur 2D** avec physique Box2D réaliste
- **État** : 8 dimensions (position, vitesse, angle, contacts)
- **Actions** : 4 choix discrets (rien, moteur gauche, principal, droit)
- **Récompenses** : +100 pour atterrissage réussi, -100 pour crash

## Structure du Projet

```
.
├── train.py                 # Script d'entraînement principal
├── eval.py                  # Script d'évaluation des performances
├── src/
│   ├── dqn_agent.py         # Implémentation de l'agent DQN
│   ├── utils.py             # Fonctions utilitaires
│   └── visualization.py     # Outils de visualisation
├── configs/
│   ├── dqn.yaml             # Configuration DQN de base
│   ├── dqn_ablation.yaml    # Configuration pour ablation study
│   └── baseline.yaml        # Configuration baseline
├── models/                  # Modèles sauvegardés (.pth)
├── results/                 # Résultats, graphiques, vidéos
│   ├── plots/               # Graphiques des performances
│   ├── videos/              # Vidéos d'atterrissages
│   └── logs/                # Logs d'entraînement
├── documentation/           # Documentation technique
│   ├── projet_explication.md
│   ├── glossaire_technique.md
│   └── eval_py_explication.md
└── README.md                # Ce fichier
```

## Installation

### Prérequis
- Python 3.8+
- PyTorch
- Gymnasium

### Installation des dépendances
```bash
pip install gymnasium torch numpy matplotlib pandas seaborn pyyaml
```

### Installation optionnelle pour vidéos
```bash
pip install gymnasium[box2d] imageio ffmpeg
```

## 🎮 Utilisation

### Entraînement
```bash
# Entraînement avec configuration par défaut
python train.py --config configs/dqn.yaml

# Entraînement avec graine spécifique
python train.py --config configs/dqn.yaml --seed 42

# Entraînement avec enregistrement vidéo
python train.py --config configs/dqn.yaml --record
```

### Évaluation
```bash
# Évaluation du meilleur modèle
python eval.py --model models/best_model.pth --config configs/dqn.yaml

# Évaluation avec visualisation
python eval.py --model models/best_model.pth --config configs/dqn.yaml --render

# Évaluation sur 100 épisodes
python eval.py --model models/best_model.pth --config configs/dqn.yaml --episodes 100
```


### Fichiers YAML
Les paramètres sont configurés dans les fichiers YAML du dossier `configs/` :

```yaml
environment:
  name: "LunarLander-v3"
  render_mode: null

algorithm:
  type: "DQN"

hyperparameters:
  learning_rate: 0.001
  batch_size: 64
  buffer_size: 100000
  gamma: 0.99
  epsilon_start: 1.0
  epsilon_end: 0.01
  epsilon_decay: 0.995
  target_update_frequency: 1000
  hidden_layers: [64, 64]

training:
  num_episodes: 2000
  max_steps_per_episode: 1000

seed: 0
```

## Résultats Attendus

### Critères de Succès
✅ **Score moyen ≥ 200** sur 100 épisodes consécutifs  
✅ **Reproductibilité** avec ≥5 graines différentes  
✅ **Analyse statistique** avec intervalles de confiance 95%

### Métriques Suivies
- **Return** : Score par épisode
- **Episode Length** : Durée des épisodes
- **Success Rate** : Taux d'atterrissages réussis
- **Termination Reasons** : Distribution crash/atterrissage/timeout
- **Loss & Epsilon** : Métriques d'entraînement

### Visualisations
- Courbes d'apprentissage (return vs épisodes)
- Histogramme des scores finaux
- Distribution des raisons de terminaison
- Évolution de epsilon et loss

## Analyse Scientifique

### Ablation Study
Tests systématiques de l'impact de chaque composant :
- Taille du replay buffer (50k vs 100k vs 200k)
- Type de mises à jour (hard vs soft)
- Architecture réseau (32x32 vs 64x64 vs 128x64)
- Stratégie d'exploration (epsilon-greedy vs autres)

### Reproductibilité
- Tests avec graines 0, 1, 2, 3, 4
- Moyennes ± intervalles de confiance 95%
- Script de reproduction automatique
- Résultats reproductibles à ±5%

## Performance

### Baselines
- **Politique aléatoire** : Score ~ -100
- **Politique simple** : Score ~ 50-100
- **DQN entraîné** : Score ≥ 200 (objectif)

### Temps d'entraînement
- **GPU** : ~15-30 minutes pour 2000 épisodes
- **CPU** : ~45-90 minutes pour 2000 épisodes

## Débogage

### Problèmes Communs
1. **ModuleNotFoundError: No module named 'torch'**
   ```bash
   pip install torch
   ```

2. **externally-managed-environment**
   ```bash
   # Créer un environnement virtuel
   python3 -m venv venv
   source venv/bin/activate
   pip install torch gymnasium
   ```

3. **Performance faible**
   - Vérifier les hyperparamètres
   - Augmenter le nombre d'épisodes
   - Ajuster epsilon decay

### Logs et Monitoring
- Logs d'entraînement dans `results/logs/`
- Graphiques dans `results/plots/`
- Modèles dans `models/`

## Documentation Technique

Pour comprendre en détail le projet et les concepts techniques :

- [`documentation/projet_explication.md`](documentation/projet_explication.md) - Explication complète du projet
- [`documentation/glossaire_technique.md`](documentation/glossaire_technique.md) - Glossaire des termes techniques
- [`documentation/eval_py_explication.md`](documentation/eval_py_explication.md) - Explication détaillée du fichier eval.py

## Livrables du Projet

### Code
- [x] `train.py` - Entraînement avec logging complet
- [x] `eval.py` - Évaluation avec visualisations
- [x] Configuration YAML modulaire
- [x] Code propre et documenté

### Résultats
- [ ] Graphiques des performances
- [ ] Vidéos d'atterrissages réussis
- [ ] Statistiques détaillées (mean ± 95% CI)
- [ ] Ablation study complète

### Rapport
- [ ] Rapport scientifique 4-6 pages
- [ ] Analyse des résultats
- [ ] Justification des choix techniques
- [ ] Limites et perspectives

## Contribution

### Pour développer
1. Cloner le repository
2. Créer un environnement virtuel
3. Installer les dépendances
4. Lancer `python train.py` pour commencer

### Structure du code
- **Modulaire** : Séparation claire agent/entraînement/évaluation
- **Configurable** : Paramètres dans fichiers YAML
- **Reproductible** : Graines et logging systématique
- **Documenté** : Comments et documentation complète

## Support

Pour toute question sur le projet :
- Consulter la documentation technique dans `documentation/`
- Vérifier les logs d'entraînement pour diagnostics
- Utiliser `--help` sur les scripts pour options complètes

---

**Shoot for the moon, and hopefully you'll land on the moon!**
