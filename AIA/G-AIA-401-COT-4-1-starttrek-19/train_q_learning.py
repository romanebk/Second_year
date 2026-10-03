import gymnasium as gym
import yaml
import csv
import os
import numpy as np
from q_learning_agent import QLearningAgent

def train_qlearning(seed=0):
    with open("configs/base.yaml", "r") as f:
        config = yaml.safe_load(f)
    
    seed = config['seed']

    os.makedirs("results", exist_ok=True)

    env   = gym.make("LunarLander-v3")
    agent = QLearningAgent(config)

    csv_file = open(f"q_learn/qlearning_seed{seed}_log.csv", "w", newline="")
    writer   = csv.DictWriter(csv_file, fieldnames=[
        "episode", "total_return", "length",
        "epsilon", "termination_reason"
    ])
    writer.writeheader()

    for episode in range(config['training']['n_episodes']):
        obs, info      = env.reset(seed=seed)
        episode_return = 0
        episode_length = 0
        termination_reason = "unknown"

        while True:
            action = agent.select_action(obs)
            next_obs, reward, terminated, truncated, info = env.step(action)

            if terminated:
                termination_reason = "crash" if reward == -100 else "landing"
            elif truncated:
                termination_reason = "truncated"

            agent.update(obs, action, reward, next_obs, terminated or truncated)

            obs             = next_obs
            episode_return += reward
            episode_length += 1

            if terminated or truncated:
                break

        writer.writerow({
            "episode":            episode,
            "total_return":       episode_return,
            "length":             episode_length,
            "epsilon":            agent.epsilon,
            "termination_reason": termination_reason
        })

        if episode % 100 == 0:
            print(f"[QL Seed {seed}] Episode {episode:4d} | "
                  f"Return: {episode_return:8.1f} | "
                  f"Epsilon: {agent.epsilon:.3f} | "
                  f"End: {termination_reason}")

    csv_file.close()
    env.close()
    print(f"q_learn/qlearning_seed{seed}_log.csv chargé")

if __name__ == "__main__":
    train_qlearning(seed=0)