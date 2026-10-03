#!/bin/bash

# Activer le venv
source venv/bin/activate

echo "========================================="
echo "  Evaluation de l'agent DQN — Start Trek"
echo "========================================="

# Evaluer chaque seed individuellement
echo ""
echo "--- Evaluation par seed ---"
for seed in 0 1 2 3 4
do
    echo ""
    echo "Seed $seed..."
    python eval.py --all_seeds --n_episodes 100  # Affiche les résultats globaux pour ce seed
done

# Comparaison globale tous les seeds
echo ""
echo "--- Comparaison tous les seeds ---"
python3 eval.py --all_seeds --n_episodes 100

echo ""
echo "========================================="
echo "  Evaluation terminee."
echo "  Resultats dans : results/"
echo "========================================="