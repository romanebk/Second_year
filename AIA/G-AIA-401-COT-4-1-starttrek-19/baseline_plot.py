import csv
import os
import matplotlib.pyplot as plt
import yaml


def load_config(path="configs/base.yaml"):
    with open(path, "r") as f:
        return yaml.safe_load(f)


def load_csv(path):
    returns = []
    reasons = []
    with open(path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            returns.append(float(row["total_return"]))
            reasons.append(row["termination_reason"])
    return returns, reasons


def count_reasons(reasons):
    counts = {}
    for reason in reasons:
        counts[reason] = counts.get(reason, 0) + 1
    return counts


def plot_returns(random_returns, heuristic_returns, save_path):
    episodes = list(range(len(random_returns)))

    plt.figure(figsize=(10, 5))
    plt.plot(episodes, random_returns,    label="Random",     color="red",  alpha=0.7)
    plt.plot(episodes, heuristic_returns, label="Heuristic",  color="blue", alpha=0.7)
    plt.axhline(200, color="green", linestyle="--", linewidth=1.5, label="Objectif DQN (200)")
    plt.xlabel("Episode")
    plt.ylabel("Total Return")
    plt.title("Baseline Returns par épisode")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    print(f"Courbe sauvegardée : {save_path}")


def plot_reasons(random_reasons, heuristic_reasons, save_path):
    random_counts    = count_reasons(random_reasons)
    heuristic_counts = count_reasons(heuristic_reasons)

    all_reasons = sorted(set(list(random_counts.keys()) + list(heuristic_counts.keys())))

    random_vals    = [random_counts.get(r, 0)    for r in all_reasons]
    heuristic_vals = [heuristic_counts.get(r, 0) for r in all_reasons]

    x      = range(len(all_reasons))
    width  = 0.35

    plt.figure(figsize=(8, 5))
    plt.bar([i - width/2 for i in x], random_vals,    width, label="Random",    color="red",  alpha=0.7)
    plt.bar([i + width/2 for i in x], heuristic_vals, width, label="Heuristic", color="blue", alpha=0.7)
    plt.xticks(x, all_reasons)
    plt.xlabel("Raison de fin")
    plt.ylabel("Nombre d'épisodes")
    plt.title("Raisons de fin — Random vs Heuristic")
    plt.legend()
    plt.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    print(f"Bar chart sauvegardé : {save_path}")


def main():
    config = load_config()

    results_dir = config["paths"]["results"]

    random_csv    = os.path.join(results_dir, "random_log.csv")
    heuristic_csv = os.path.join(results_dir, "heuristic_log.csv")

    random_returns,    random_reasons    = load_csv(random_csv)
    heuristic_returns, heuristic_reasons = load_csv(heuristic_csv)

    returns_plot = os.path.join(results_dir, "baseline_returns.png")
    reasons_plot = os.path.join(results_dir, "baseline_reasons.png")

    plot_returns(random_returns, heuristic_returns, returns_plot)
    plot_reasons(random_reasons, heuristic_reasons, reasons_plot)

    print("\n--- Résumé ---")
    print(f"Random    mean return : {sum(random_returns)    / len(random_returns):.2f}")
    print(f"Heuristic mean return : {sum(heuristic_returns) / len(heuristic_returns):.2f}")


if __name__ == "__main__":
    main()