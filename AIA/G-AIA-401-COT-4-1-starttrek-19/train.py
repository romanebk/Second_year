import torch
import torch.nn as nn
import numpy as np
import gymnasium as gym
import yaml
import csv
import os
import copy
import argparse
from model import Qnetwork
from replay_buffer import ReplayBuffer

parser = argparse.ArgumentParser()
parser.add_argument("--seed", type=int, default=None)
args = parser.parse_args()

with open("configs/base.yaml", "r") as f:
    config = yaml.safe_load(f)

if args.seed is not None:
    config['seed'] = args.seed

SEED   = config['seed']
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

env = gym.make(config['env']['name'])

q_net      = Qnetwork().to(DEVICE)
target_net = copy.deepcopy(q_net)
target_net.eval()

optimizer = torch.optim.Adam(q_net.parameters(), lr=config['training']['lr'])
loss_fn   = nn.MSELoss()

replay_buffer = ReplayBuffer(
    capacity=config['training']['buffer_capacity'],
    device=DEVICE
)

def select_action(state, epsilon):
    if np.random.rand() < epsilon:
        return env.action_space.sample()
    state_t = torch.FloatTensor(state).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        q_values = q_net(state_t)
    return q_values.argmax().item()

def get_termination_reason(terminated, truncated, reward):
    if terminated:
        return "crash" if reward < 0 else "landing"
    if truncated:
        return "timeout"
    return "unknown"

def train():
    os.makedirs(config['paths']['results'], exist_ok=True)
    os.makedirs(config['paths']['models'],  exist_ok=True)

    csv_path = os.path.join(config['paths']['results'], f"dqn_seed{SEED}_log.csv")
    csv_file = open(csv_path, "w", newline="")
    writer   = csv.DictWriter(csv_file, fieldnames=[
        "episode", "total_return", "length",
        "epsilon", "mean_loss", "termination_reason"
    ])
    writer.writeheader()

    step_count = 0
    epsilon    = config['training']['epsilon_start']

    for episode in range(config['training']['n_episodes']):
        obs, info          = env.reset(seed=SEED + episode)
        episode_return     = 0
        episode_length     = 0
        losses             = []
        termination_reason = "unknown"

        while True:
            action = select_action(obs, epsilon)
            next_obs, reward, terminated, truncated, info = env.step(action)

            if terminated or truncated:
                termination_reason = get_termination_reason(terminated, truncated, reward)

            done = terminated or truncated
            replay_buffer.add_transition(obs, action, reward, next_obs, float(done))

            obs             = next_obs
            episode_return += reward
            episode_length += 1
            step_count     += 1

            if replay_buffer.is_ready(config['training']['batch_size']):
                states, actions_b, rewards_b, next_states, dones = \
                    replay_buffer.sample_batch(config['training']['batch_size'])

                current_q = q_net(states).gather(1, actions_b.unsqueeze(1)).squeeze(1)

                with torch.no_grad():
                    next_q   = target_net(next_states).max(1)[0]
                    target_q = rewards_b + config['training']['gamma'] * next_q * (1 - dones)

                loss = loss_fn(current_q, target_q)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                losses.append(loss.item())

            if step_count % config['training']['target_update_freq'] == 0:
                target_net.load_state_dict(q_net.state_dict())

            if done:
                break

        epsilon = max(
            config['training']['epsilon_end'],
            epsilon * config['training']['epsilon_decay']
        )

        writer.writerow({
            "episode":            episode,
            "total_return":       round(episode_return, 3),
            "length":             episode_length,
            "epsilon":            round(epsilon, 5),
            "mean_loss":          round(np.mean(losses), 5) if losses else 0,
            "termination_reason": termination_reason
        })

        if episode % config['logging']['log_every'] == 0:
            print(f"[Seed {SEED}] Episode {episode:4d} | "
                  f"Return: {episode_return:8.1f} | "
                  f"Epsilon: {epsilon:.3f} | "
                  f"End: {termination_reason}")

    model_path = os.path.join(config['paths']['models'], f"dqn_seed{SEED}.pt")
    torch.save(q_net.state_dict(), model_path)
    csv_file.close()
    env.close()
    print(f"[Seed {SEED}] Entraînement terminé → {model_path}")

if __name__ == "__main__":
    train()