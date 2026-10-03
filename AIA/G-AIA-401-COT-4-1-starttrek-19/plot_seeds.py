import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

dfs = []

for seed in [0, 1, 2, 3, 4]:
    path = f"results/dqn_seed{seed}_log.csv"
    df = pd.read_csv(path)
    df['seed'] = seed
    dfs.append(df)

all_returns = pd.concat(dfs)
grouped = all_returns.groupby('episode')['total_return']
mean = grouped.mean()
std = grouped.std()
n = grouped.count()
ci = 1.96 * std / np.sqrt(n)

window = 50
mean_smooth = mean.rolling(window).mean()
ci_smooth = ci.rolling(window).mean()
episode = mean.index

fig, ax = plt.subplots(figsize=(12, 6))

ax.plot(episode, mean_smooth, color='blue', label='Mean Return')

#dessine une bande colorée autour de la courbe pour représenter l'intervalle de confiance
ax.fill_between(
    episode,
    mean_smooth - ci_smooth, #pire cas
    mean_smooth + ci_smooth, #meilleur cas
    alpha=0.3, #transparence de la bande
    color='blue',
    label='95% Confidence Interval'
)

#pour dessiner une ligne horizontale à y=200, représentant l'objectif de performance
ax.axhline(200, color='green', linestyle='--', linewidth=1.5, label='Objectif (200)')

ax.set_xlabel('Episode')
ax.set_ylabel('Total Return')
ax.set_title('DQN Performance Across Seeds')
ax.legend()
ax.grid(alpha=0.3) #ajoute une grille légère pour améliorer la lisibilité du graphique

plt.tight_layout() #ajuste les marges pour éviter que les éléments du graphique ne soient coupés
plt.savefig('results/dqn_performance.png', dpi=150) #enregistre le graphique dans le dossier results avec une résolution de 150 dpi
plt.close()
print("Terminé!!!")