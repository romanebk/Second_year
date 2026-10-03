#!/bin/bash

for seed in 0 1 2 3 4
do
echo "Lancement du seed"

echo "Seed: $seed"

python3.12 train.py --seed $seed
done

echo "Tous les seeds sont terminés."