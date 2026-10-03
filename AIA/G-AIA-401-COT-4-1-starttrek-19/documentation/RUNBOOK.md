# Runbook Opérationnel

Ce runbook fournit des guides étape par étape pour les opérations courantes du projet Lunar Lander Reinforcement Learning.

## Table des Matières

- [Première Installation](#première-installation)
- [Workflow de Développement](#workflow-de-développement)
- [Entraînement](#entraînement)
- [Évaluation](#évaluation)
- [Baselines](#baselines)
- [Visualisation](#visualisation)
- [Dépannage](#dépannage)
- [Maintenance](#maintenance)
- [Reproduction des Résultats](#reproduction-des-résultats)

---

## Première Installation

### Étape 1 : Cloner le Repository

```bash
git clone <url-du-repo>
cd G-AIA-401-COT-4-1-starttrek-19
```

### Étape 2 : Créer l'Environnement Virtuel

```bash
python3 -m venv venv --copies
source venv/bin/activate
```

### Étape 3 : Installer les Dépendances

```bash
pip install gymnasium[box2d] torch matplotlib pyyaml numpy moviepy imageio ffmpeg pandas seaborn
```

### Étape 4 : Vérifier l'Installation

```bash
python -c "import torch; import gymnasium; print('Installation réussie!')"
```

### Étape 5 : Tester avec une Baseline

```bash
python random_policy.py
```

**Attendu** : Exécution de 100 épisodes avec affichage de progression et génération de `results/random_log.csv`.

---

## Workflow de Développement

### Workflow Standard

```
1. Configuration → Modifier configs/base.yaml
2. Baselines → Exécuter random_policy.py et heuristic_policy.py
3. Entraînement → Exécuter train.py
4. Évaluation → Exécuter eval.py
5. Visualisation → Générer vidéos et graphiques
6. Analyse → Examiner les résultats
```

### Workflow Rapide (Développement)

```
1. Modifier configs/base.yaml
2. python train.py --seed 0
3. python eval.py --seed 0 --n_episodes 10
```

### Workflow Complet (Production)

```
1. Modifier configs/base.yaml
2. python random_policy.py
3. python heuristic_policy.py
4. python baseline_plot.py
5. for seed in 0 1 2 3 4; do python train.py --seed $seed; done
6. python eval.py --all_seeds --n_episodes 100
7. python video.py
8. python plot_seeds.py
```

---

## Entraînement

### Entraînement Simple

```bash
python train.py --seed 0
```

**Sortie attendue** :
- Affichage de la progression tous les 10 épisodes
- Sauvegarde de `models/dqn_seed0.pt`
- Sauvegarde de `results/dqn_seed0_log.csv`

### Entraînement Multi-Seeds

```bash
for seed in 0 1 2 3 4; do
    python train.py --seed $seed
done
```

**Utilisation** : Pour la reproductibilité et l'analyse statistique.

### Entraînement avec Configuration Personnalisée

1. Modifier `configs/base.yaml` :
```yaml
training:
  n_episodes: 2000
  lr: 0.0005
  epsilon_decay: 0.999
```

2. Lancer l'entraînement :
```bash
python train.py --seed 0
```

### Monitoring de l'Entraînement

#### Pendant l'entraînement

Surveillez les métriques affichées :
- **Return** : Doit augmenter progressivement
- **Epsilon** : Doit décroître de 1.0 vers 0.01
- **End** : Distribution crash/landing/timeout

#### Après l'entraînement

Examiner le fichier CSV :
```bash
head results/dqn_seed0_log.csv
```

Visualiser rapidement :
```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('results/dqn_seed0_log.csv')
plt.plot(df['episode'], df['total_return'])
plt.xlabel('Episode')
plt.ylabel('Total Return')
plt.show()
```

### Arrêter et Reprendre

Le script ne supporte pas la reprise. Pour reprendre :
1. Notez le numéro du dernier épisode
2. Modifiez `n_episodes` dans `configs/base.yaml`
3. Relancez avec un nouveau seed ou sauvegardez manuellement

---

## Évaluation

### Évaluation d'un Seul Modèle

```bash
python eval.py --seed 0 --n_episodes 100
```

**Sortie** :
- Statistiques détaillées (mean, std, CI, etc.)
- Graphique : `results/eval_seed0_plot.png`
- CSV : `results/eval_seed0_log.csv`

### Évaluation Multi-Seeds

```bash
python eval.py --all_seeds --n_episodes 100
```

**Sortie** :
- Statistiques pour chaque seed
- Graphique comparatif : `results/eval_all_seeds_plot.png`
- Tableau récapitulatif

### Critères de Succès

Le modèle est considéré réussi si :
- **Mean return ≥ 200**
- **95% CI** ne contient pas 200 (significativement au-dessus)
- **Épisodes ≥ 200** ≥ 80%

### Évaluation Rapide (Développement)

```bash
python eval.py --seed 0 --n_episodes 10
```

**Utilisation** : Pour des tests rapides pendant le développement.

### Comparaison avec Baselines

```bash
# Générer les baselines
python random_policy.py
python heuristic_policy.py
python baseline_plot.py

# Évaluer le modèle DQN
python eval.py --seed 0 --n_episodes 100

# Comparer visuellement
# Les graphiques sont dans results/
```

---

## Baselines

### Exécuter la Baseline Aléatoire

```bash
python random_policy.py
```

**Sortie** :
- Exécution de 100 épisodes
- `results/random_log.csv`
- Affichage du résumé statistique

**Résultats typiques** :
- Mean return : ~-173
- Principalement des crashes

### Exécuter la Baseline Heuristique

```bash
python heuristic_policy.py
```

**Sortie** :
- Exécution de 100 épisodes
- `results/heuristic_log.csv`
- Affichage du résumé statistique

**Résultats typiques** :
- Mean return : ~-413
- Pire que random (sur-activation moteur)

### Générer les Graphiques de Baseline

```bash
python baseline_plot.py
```

**Sortie** :
- `results/baseline_returns.png` : Courbes comparatives
- `results/baseline_reasons.png` : Distribution des raisons de fin

### Générer les Vidéos de Baseline

```bash
python baseline_videos.py
```

**Sortie** :
- `videos/random/` : 3 vidéos de la politique aléatoire
- `videos/heuristic/` : 3 vidéos de la politique heuristique

**Utilisation** : Pour visualiser le comportement des baselines.

---

## Visualisation

### Générer des Vidéos de Modèles Entraînés

```bash
python video.py
```

**Comportement** :
- Charge les modèles seeds 0-4
- Génère 5 vidéos par seed
- Sauvegarde dans `videos/seed{seed}/`

**Sortie** :
- `videos/seed0/rl-video-episode-0.mp4`
- `videos/seed0/rl-video-episode-1.mp4`
- ...

### Générer des Graphiques Multi-Seeds

```bash
python plot_seeds.py
```

**Sortie** :
- `results/seeds_comparison.png` : Comparaison des courbes d'apprentissage

### Visualiser les Résultats d'Entraînement

#### Avec Python

```python
import pandas as pd
import matplotlib.pyplot as plt

# Charger les logs
df = pd.read_csv('results/dqn_seed0_log.csv')

# Créer les graphiques
fig, axes = plt.subplots(2, 2, figsize=(12, 8))

# Return par épisode
axes[0, 0].plot(df['episode'], df['total_return'])
axes[0, 0].set_xlabel('Episode')
axes[0, 0].set_ylabel('Total Return')
axes[0, 0].set_title('Learning Curve')

# Epsilon
axes[0, 1].plot(df['episode'], df['epsilon'])
axes[0, 1].set_xlabel('Episode')
axes[0, 1].set_ylabel('Epsilon')
axes[0, 1].set_title('Exploration Rate')

# Loss
axes[1, 0].plot(df['episode'], df['mean_loss'])
axes[1, 0].set_xlabel('Episode')
axes[1, 0].set_ylabel('Mean Loss')
axes[1, 0].set_title('Training Loss')

# Longueur d'épisode
axes[1, 1].plot(df['episode'], df['length'])
axes[1, 1].set_xlabel('Episode')
axes[1, 1].set_ylabel('Episode Length')
axes[1, 1].set_title('Episode Length')

plt.tight_layout()
plt.savefig('results/training_overview.png')
plt.show()
```

#### Avec Jupyter Notebook

```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('results/dqn_seed0_log.csv')
df.head()
```

---

## Dépannage

### Problème : ModuleNotFoundError

**Symptôme** :
```
ModuleNotFoundError: No module named 'torch'
```

**Solution** :
```bash
pip install torch
```

### Problème : Externally-Managed-Environment

**Symptôme** :
```
error: externally-managed-environment
```

**Solution** : Utiliser un environnement virtuel
```bash
python3 -m venv venv --copies
source venv/bin/activate
pip install ...
```

### Problème : Performance Faible

**Symptômes** :
- Return ne dépasse pas 0 après 500 épisodes
- Taux de crashes très élevé

**Solutions** :
1. **Augmenter le nombre d'épisodes** :
   ```yaml
   training:
     n_episodes: 2000
   ```

2. **Ajuster epsilon decay** :
   ```yaml
   training:
     epsilon_decay: 0.999  # Décroissance plus lente
   ```

3. **Augmenter la capacité du buffer** :
   ```yaml
   training:
     buffer_capacity: 100000
   ```

4. **Ajuster le learning rate** :
   ```yaml
   training:
     lr: 0.0005  # Plus petit pour plus de stabilité
   ```

### Problème : GPU Non Utilisé

**Symptôme** : Entraînement très lent

**Vérification** :
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

**Si False** :
- Vérifier l'installation CUDA de PyTorch
- Installer la version CUDA de PyTorch depuis [pytorch.org](https://pytorch.org/get-started/locally/)

### Problème : Modèle Introuvable

**Symptôme** :
```
FileNotFoundError: Modèle introuvable : models/dqn_seed0.pt
```

**Solution** :
```bash
# Vérifier si le modèle existe
ls models/

# Si non, entraîner d'abord
python train.py --seed 0
```

### Problème : Vidéos Non Générées

**Symptôme** : Aucun fichier vidéo dans `videos/`

**Solutions** :
1. Vérifier l'installation de ffmpeg :
   ```bash
   ffmpeg -version
   ```

2. Installer ffmpeg si nécessaire :
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # macOS
   brew install ffmpeg
   ```

3. Vérifier le render_mode dans la config :
   ```yaml
   env:
     render_mode: "rgb_array"
   ```

### Problème : Mémoire Insuffisante

**Symptôme** : OutOfMemoryError

**Solutions** :
1. Réduire la capacité du buffer :
   ```yaml
   training:
     buffer_capacity: 25000
   ```

2. Réduire le batch size :
   ```yaml
   training:
     batch_size: 32
   ```

3. Utiliser CPU au lieu de GPU :
   ```python
   DEVICE = torch.device("cpu")
   ```

### Problème : Résultats Non Reproductibles

**Symptôme** : Résultats différents entre deux exécutions

**Solutions** :
1. Vérifier que le seed est fixé :
   ```bash
   python train.py --seed 42
   ```

2. Vérifier la configuration :
   ```yaml
   seed: 42
   ```

3. S'assurer que PyTorch et NumPy utilisent les mêmes seeds

---

## Maintenance

### Nettoyer les Résultats Anciens

```bash
# Supprimer les anciens modèles
rm models/*.pt

# Supprimer les anciens logs
rm results/*.csv

# Supprimer les anciens graphiques
rm results/*.png

# Supprimer les anciennes vidéos
rm -rf videos/*
```

### Sauvegarder les Résultats Importants

```bash
# Créer une archive
tar -czf results_backup_$(date +%Y%m%d).tar.gz results/ models/

# Ou copier vers un autre emplacement
cp -r results/ results_backup/
cp -r models/ models_backup/
```

### Mettre à Jour les Dépendances

```bash
# Mettre à jour toutes les dépendances
pip install --upgrade gymnasium torch matplotlib pyyaml numpy

# Vérifier les versions
pip list
```

### Vérifier l'Intégrité du Code

```bash
# Exécuter les tests unitaires
python test_agent.py

# Attendu : Tous les tests passent
```

### Migrer vers une Nouvelle Version

1. Sauvegarder les résultats actuels
2. Mettre à jour le code (git pull)
3. Mettre à jour les dépendances
4. Tester avec un entraînement court
5. Relancer l'entraînement complet si OK

---

## Reproduction des Résultats

### Reproduction Complète

```bash
# 1. Nettoyer
rm -rf results/ models/ videos/

# 2. Entraîner sur 5 seeds
for seed in 0 1 2 3 4; do
    python train.py --seed $seed
done

# 3. Évaluer tous les seeds
python eval.py --all_seeds --n_episodes 100

# 4. Générer les visualisations
python video.py
python plot_seeds.py
```

### Vérification de Reproductibilité

```bash
# Entraîner deux fois avec le même seed
python train.py --seed 42
mv results/dqn_seed42_log.csv results/dqn_seed42_log_run1.csv
python train.py --seed 42
mv results/dqn_seed42_log.csv results/dqn_seed42_log_run2.csv

# Comparer les fichiers
diff results/dqn_seed42_log_run1.csv results/dqn_seed42_log_run2.csv
```

**Attendu** : Les fichiers doivent être identiques.

### Documentation des Résultats

Pour chaque expérience, documentez :
1. Configuration utilisée (copie de `configs/base.yaml`)
2. Seeds utilisés
3. Résultats obtenus (mean ± std)
4. Temps d'entraînement
5. Observations particulières

**Template** :
```markdown
## Expérience YYYY-MM-DD

### Configuration
[Coller le contenu de configs/base.yaml]

### Seeds
0, 1, 2, 3, 4

### Résultats
- Mean return : 234.56 ± 45.67
- 95% CI : [189.23, 279.89]
- Épisodes ≥ 200 : 85%
- Temps d'entraînement : 25 minutes

### Observations
- [Notes]
```

---

## Checklist de Lancement

### Avant de Lancer un Entraînement

- [ ] Environnement virtuel activé
- [ ] Dépendances installées
- [ ] Configuration vérifiée dans `configs/base.yaml`
- [ ] Seed fixé
- [ ] Espace disque suffisant (> 2 Go)
- [ ] GPU disponible (optionnel mais recommandé)

### Pendant l'Entraînement

- [ ] Monitoring des métriques (return, epsilon, loss)
- [ ] Vérification que le return augmente
- [ ] Vérification que epsilon décroît
- [ ] Surveillance de l'utilisation mémoire

### Après l'Entraînement

- [ ] Vérification que le modèle est sauvegardé
- [ ] Vérification que le CSV est généré
- [ ] Examen rapide des logs
- [ ] Évaluation sur 10 épisodes
- [ ] Si OK, évaluation complète sur 100 épisodes

### Avant de Soumettre les Résultats

- [ ] Entraînement sur ≥ 5 seeds
- [ ] Évaluation sur 100 épisodes par seed
- [ ] Mean return ≥ 200
- [ ] Intervalle de confiance calculé
- [ ] Graphiques générés
- [ ] Vidéos d'exemple
- [ ] Documentation complète

---

## Scripts Utiles

### Script d'Entraînement Automatisé

```bash
#!/bin/bash
# train_all_seeds.sh

for seed in 0 1 2 3 4; do
    echo "Training seed $seed..."
    python train.py --seed $seed
done

echo "All seeds trained. Starting evaluation..."
python eval.py --all_seeds --n_episodes 100

echo "Generating visualizations..."
python video.py
python plot_seeds.py

echo "Done!"
```

Utilisation :
```bash
chmod +x train_all_seeds.sh
./train_all_seeds.sh
```

### Script de Nettoyage

```bash
#!/bin/bash
# clean.sh

echo "Cleaning results..."
rm -rf results/*.csv results/*.png
rm -rf models/*.pt
rm -rf videos/*

echo "Done!"
```

### Script de Vérification

```bash
#!/bin/bash
# check.sh

echo "Checking installation..."
python -c "import torch; import gymnasium; print('OK')"

echo "Running tests..."
python test_agent.py

echo "Running baseline..."
python random_policy.py

echo "Check complete!"
```

---

## Contact et Support

### En Cas de Problème

1. Consulter la documentation technique :
   - `INSTALLATION.md`
   - `PROJECT_OVERVIEW.md`
   - `ARCHITECTURE.md`
   - `API_DOCUMENTATION.md`

2. Vérifier les logs d'erreur pour des indices spécifiques

3. Consulter la section Dépannage de ce runbook

### Ressources Externes

- [PyTorch Documentation](https://pytorch.org/docs/)
- [Gymnasium Documentation](https://gymnasium.farama.org/)
- [Deep Q-Learning Papers](https://arxiv.org/abs/1312.5602)

---

## Glossaire des Commandes

### Commandes d'Entraînement
| Commande | Description |
|----------|-------------|
| `python train.py --seed 0` | Entraîner avec seed 0 |
| `python train.py --seed 42` | Entraîner avec seed 42 |

### Commandes d'Évaluation
| Commande | Description |
|----------|-------------|
| `python eval.py --seed 0` | Évaluer seed 0 (100 épisodes) |
| `python eval.py --seed 0 --n_episodes 50` | Évaluer seed 0 (50 épisodes) |
| `python eval.py --all_seeds` | Évaluer tous les seeds |

### Commandes de Baseline
| Commande | Description |
|----------|-------------|
| `python random_policy.py` | Exécuter baseline aléatoire |
| `python heuristic_policy.py` | Exécuter baseline heuristique |
| `python baseline_plot.py` | Générer graphiques baseline |
| `python baseline_videos.py` | Générer vidéos baseline |

### Commandes de Visualisation
| Commande | Description |
|----------|-------------|
| `python video.py` | Générer vidéos modèles |
| `python plot_seeds.py` | Générer graphiques multi-seeds |

---

**Document lié** : `INSTALLATION.md` pour la configuration initiale.
