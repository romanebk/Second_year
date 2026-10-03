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

# ── Arguments ─────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="Évaluation formelle de l'agent DQN")
parser.add_argument("--seed",       type=int, default=0,
                    help="Seed du modèle à évaluer (0..4)")
parser.add_argument("--n_episodes", type=int, default=100,
                    help="Nombre d'épisodes consécutifs (défaut: 100)")
parser.add_argument("--config",     type=str, default="configs/base.yaml",
                    help="Chemin vers le fichier de config YAML")
parser.add_argument("--all_seeds",  action="store_true",
                    help="Évaluer tous les seeds 0..4 et comparer")
args = parser.parse_args()

# ── Config ────────────────────────────────────────────────────────────────────
with open(args.config, "r") as f:
    config = yaml.safe_load(f)

DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
N_EPISODES = args.n_episodes
os.makedirs(config['paths']['results'], exist_ok=True)

# ── Helpers ───────────────────────────────────────────────────────────────────
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

def select_action(q_net, obs):
    """Politique déterministe — epsilon = 0."""
    state_t = torch.FloatTensor(obs).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        return q_net(state_t).argmax().item()

def get_termination_reason(terminated, truncated, reward, obs):
    if terminated:
        return "crash" if reward < 0 else "landing"
    if truncated:
        # out-of-view si le lander sort des limites visibles de l'environnement
        # x est relatif au pad : > 1.0 = hors cadre horizontal
        # y > 1.5 = hors cadre vertical (trop haut)
        if abs(obs[0]) > 1.0 or obs[1] > 1.5:
            return "out-of-view"
        return "timeout"
    return "unknown"

# ── Évaluation d'un seul modèle ───────────────────────────────────────────────
def evaluate(seed, n_episodes, verbose=True):
    q_net = load_model(seed)
    env   = gym.make(config['env']['name'])

    if verbose:
        print(f"\nÉvaluation seed={seed} — {n_episodes} épisodes consécutifs "
              f"(epsilon=0)...\n")

    returns = []
    lengths = []
    reasons = []
    rows    = []

    for episode in range(n_episodes):
        obs, _             = env.reset(seed=seed + episode)
        episode_return     = 0.0
        episode_length     = 0
        termination_reason = "unknown"
        last_reward        = 0.0

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

        returns.append(episode_return)
        lengths.append(episode_length)
        reasons.append(termination_reason)
        rows.append({
            "episode":            episode,
            "total_return":       round(episode_return, 3),
            "length":             episode_length,
            "termination_reason": termination_reason
        })

        if verbose and (episode + 1) % 10 == 0:
            print(f"  [{episode+1:3d}/{n_episodes}] "
                  f"Return: {episode_return:8.1f}  "
                  f"Length: {episode_length:4d}  "
                  f"End: {termination_reason}")

    env.close()

    # Sauvegarde CSV
    csv_path = os.path.join(
        config['paths']['results'], f"eval_seed{seed}_log.csv"
    )
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(
            f, fieldnames=["episode", "total_return", "length", "termination_reason"]
        )
        writer.writeheader()
        writer.writerows(rows)

    return np.array(returns), np.array(lengths), reasons, csv_path

# ── Stats & affichage ─────────────────────────────────────────────────────────
def print_stats(seed, returns, lengths, reasons):
    mean   = np.mean(returns)
    std    = np.std(returns)
    ci95   = 1.96 * std / np.sqrt(len(returns))
    p200   = np.mean(returns >= 200) * 100
    counts = Counter(reasons)

    print(f"\n{'='*52}")
    print(f"  RÉSULTATS — Seed {seed} — {len(returns)} épisodes")
    print(f"{'='*52}")
    print(f"  Mean return    : {mean:.2f}")
    print(f"  Std            : {std:.2f}")
    print(f"  95% CI         : [{mean - ci95:.2f},  {mean + ci95:.2f}]")
    print(f"  Min / Max      : {np.min(returns):.2f} / {np.max(returns):.2f}")
    print(f"  Épisodes ≥ 200 : {p200:.1f}%")
    print(f"  Longueur moy.  : {np.mean(lengths):.1f} steps")
    print(f"{'─'*52}")
    print(f"  Raisons de fin :")
    for r, c in sorted(counts.items()):
        print(f"    {r:12s} : {c:3d}  ({c/len(reasons)*100:.1f}%)")
    print(f"{'='*52}")

    status = "SUCCES" if mean >= 200 else "ECHEC — signaler à la Personne B"
    print(f"\n  {status}  (mean={mean:.2f})\n")

    return mean, std, ci95

# ── Plots ─────────────────────────────────────────────────────────────────────
def plot_single(seed, returns):
    """Histogramme de distribution + courbe des returns."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    # Courbe des returns par épisode
    ax1.plot(returns, color="steelblue", alpha=0.7, linewidth=0.8, label="Return")
    ax1.axhline(np.mean(returns), color="orange", linestyle="--",
                linewidth=1.5, label=f"Mean={np.mean(returns):.1f}")
    ax1.axhline(200, color="green", linestyle="--",
                linewidth=1.5, label="Objectif (200)")
    ax1.set_xlabel("Épisode")
    ax1.set_ylabel("Total Return")
    ax1.set_title(f"Returns par épisode — Seed {seed}")
    ax1.legend()
    ax1.grid(alpha=0.3)

    # Histogramme de distribution
    ax2.hist(returns, bins=20, color="steelblue", edgecolor="white", alpha=0.8)
    ax2.axvline(np.mean(returns), color="orange", linestyle="--",
                linewidth=1.5, label=f"Mean={np.mean(returns):.1f}")
    ax2.axvline(200, color="green", linestyle="--",
                linewidth=1.5, label="Objectif (200)")
    ax2.set_xlabel("Total Return")
    ax2.set_ylabel("Fréquence")
    ax2.set_title(f"Distribution des returns — Seed {seed}")
    ax2.legend()
    ax2.grid(alpha=0.3)

    plt.tight_layout()
    path = os.path.join(config['paths']['results'], f"eval_seed{seed}_plot.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  Plot sauvegardé : {path}")

def plot_all_seeds(all_returns):
    """Comparaison mean ± 95% CI sur tous les seeds."""
    seeds = sorted(all_returns.keys())
    means = [np.mean(all_returns[s]) for s in seeds]
    ci95s = [1.96 * np.std(all_returns[s]) / np.sqrt(len(all_returns[s])) for s in seeds]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Bar chart mean ± CI par seed
    ax1.bar(seeds, means, color="steelblue", alpha=0.8,
            yerr=ci95s, capsize=5, label="Mean ± 95% CI")
    ax1.axhline(200, color="green", linestyle="--", linewidth=1.5, label="Objectif (200)")
    ax1.set_xlabel("Seed")
    ax1.set_ylabel("Mean Return")
    ax1.set_title("Mean Return par seed (100 épisodes)")
    ax1.legend()
    ax1.grid(axis="y", alpha=0.3)

    # Toutes les courbes superposées
    colors = ["steelblue", "tomato", "seagreen", "darkorange", "mediumpurple"]
    for i, s in enumerate(seeds):
        ax2.plot(all_returns[s], alpha=0.6, linewidth=0.8,
                 color=colors[i], label=f"Seed {s}")
    ax2.axhline(200, color="green", linestyle="--", linewidth=1.5, label="Objectif (200)")
    ax2.set_xlabel("Épisode")
    ax2.set_ylabel("Total Return")
    ax2.set_title("Returns — tous les seeds")
    ax2.legend()
    ax2.grid(alpha=0.3)

    plt.tight_layout()
    path = os.path.join(config['paths']['results'], "eval_all_seeds_plot.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"\n  Plot multi-seeds sauvegardé : {path}")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":

    if args.all_seeds:
        # ── Mode : évaluer les 5 seeds et comparer ────────────────────────────
        print("\n=== Évaluation de tous les seeds (0..4) ===")
        all_returns = {}
        summary     = []

        for s in range(5):
            try:
                rets, lens, reas, csv_path = evaluate(s, N_EPISODES, verbose=False)
                mean, std, ci95 = print_stats(s, rets, lens, reas)
                plot_single(s, rets)
                all_returns[s] = rets
                summary.append({
                    "seed": s, "mean": mean, "std": std, "ci95": ci95,
                    "pct_200": np.mean(rets >= 200) * 100,
                    "csv": csv_path
                })
            except FileNotFoundError as e:
                print(f"\n   Seed {s} ignoré : {e}")

        if all_returns:
            plot_all_seeds(all_returns)

            # Tableau récapitulatif
            print(f"\n{'='*60}")
            print(f"  RÉCAPITULATIF — tous les seeds")
            print(f"{'='*60}")
            print(f"  {'Seed':>4}  {'Mean':>8}  {'Std':>7}  {'95% CI':>18}  {'≥200':>6}")
            print(f"  {'─'*4}  {'─'*8}  {'─'*7}  {'─'*18}  {'─'*6}")
            for r in summary:
                status = "" if r['mean'] >= 200 else ""
                print(f"  {r['seed']:>4}  {r['mean']:>8.2f}  {r['std']:>7.2f}  "
                      f"[{r['mean']-r['ci95']:>7.2f}, {r['mean']+r['ci95']:>7.2f}]  "
                      f"{r['pct_200']:>5.1f}% {status}")
            print(f"{'='*60}\n")

    else:
        # ── Mode : évaluer un seul seed ───────────────────────────────────────
        returns, lengths, reasons, csv_path = evaluate(
            args.seed, N_EPISODES, verbose=True
        )
        print_stats(args.seed, returns, lengths, reasons)
        plot_single(args.seed, returns)
        print(f"  CSV sauvegardé : {csv_path}\n")