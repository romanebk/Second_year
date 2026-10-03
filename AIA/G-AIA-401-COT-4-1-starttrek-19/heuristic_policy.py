import gymnasium as gym
import csv
import os
import yaml


def load_config(path="configs/base.yaml"):
    with open(path, "r") as f:
        return yaml.safe_load(f)


def make_env(config):
    return gym.make(config["env"]["name"])


def get_termination_reason(terminated, truncated, reward):
    if terminated:
        return "crash" if reward < 0 else "landing"
    if truncated:
        return "timeout"
    return "unknown"


def choose_action(obs):
    x  = obs[0]
    vy = obs[3]

    if vy < -0.5:
        return 2  # moteur principal (ralentir la chute)
    if x > 0.1:
        return 1  # moteur gauche (revenir au centre)
    if x < -0.1:
        return 3  # moteur droit (revenir au centre)
    return 0      # ne rien faire


def run_episode(env, seed):
    obs, _ = env.reset(seed=seed)
    total_return = 0
    length = 0
    termination_reason = "unknown"

    while True:
        action = choose_action(obs)
        obs, reward, terminated, truncated, _ = env.step(action)

        total_return += reward
        length += 1

        if terminated or truncated:
            termination_reason = get_termination_reason(terminated, truncated, reward)
            break

    return total_return, length, termination_reason


def save_csv(results, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["episode", "total_return", "length", "termination_reason"])
        writer.writeheader()
        writer.writerows(results)


def run_heuristic_policy(n_episodes, base_seed, env):
    results = []

    for episode in range(n_episodes):
        total_return, length, reason = run_episode(env, seed=base_seed + episode)

        results.append({
            "episode": episode,
            "total_return": round(total_return, 3),
            "length": length,
            "termination_reason": reason
        })

        print(f"Episode {episode:3d} | Return: {total_return:8.1f} | Length: {length:4d} | End: {reason}")

    return results


def print_summary(results, n_episodes):
    returns = [r["total_return"] for r in results]
    reasons = [r["termination_reason"] for r in results]

    print(f"\n--- Résumé ---")
    print(f"Mean return : {sum(returns) / len(returns):.2f}")
    print(f"Min return  : {min(returns):.2f}")
    print(f"Max return  : {max(returns):.2f}")

    from collections import Counter
    counts = Counter(reasons)
    print(f"\nRaisons de fin :")
    for reason, count in counts.items():
        print(f"  {reason:10s} : {count} ({count / n_episodes * 100:.1f}%)")


def main():
    config = load_config()

    n_episodes = 100
    base_seed  = config["seed"]
    csv_path   = os.path.join(config["paths"]["results"], "heuristic_log.csv")

    env = make_env(config)

    print(f"=== Heuristic Policy — {n_episodes} épisodes ===\n")
    results = run_heuristic_policy(n_episodes, base_seed, env)
    env.close()

    save_csv(results, csv_path)
    print(f"\nCSV sauvegardé : {csv_path}")

    print_summary(results, n_episodes)


if __name__ == "__main__":
    main()