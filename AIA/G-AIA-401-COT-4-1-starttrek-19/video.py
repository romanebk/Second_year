import gymnasium as gym
import torch
import numpy as np
from model import Qnetwork

def record_video(model_path, seed=0, video_folder="videos"):
    # Charger le modèle entraîné
    q_net = Qnetwork()
    q_net.load_state_dict(torch.load(model_path))
    q_net.eval()

    # Créer l'environnement avec wrapper vidéo
    env = gym.wrappers.RecordVideo(
        gym.make("LunarLander-v3", render_mode="rgb_array"),
        video_folder=f"{video_folder}/seed{seed}",
        episode_trigger=lambda ep: True
    )

    # Jouer 5 épisodes
    for episode in range(5):
        obs, info = env.reset(seed=seed + episode)
        episode_return = 0

        while True:
            # Toujours exploiter — plus d'exploration
            state_t  = torch.FloatTensor(obs).unsqueeze(0)
            with torch.no_grad():
                action = q_net(state_t).argmax().item()

            obs, reward, terminated, truncated, info = env.step(action)
            episode_return += reward

            if terminated or truncated:
                print(f"Episode {episode} | Return: {episode_return:.1f}")
                break

    env.close()
    print(f"Vidéos sauvegardées dans {video_folder}/seed{seed}/")

if __name__ == "__main__":
    for seed in range(5):
        record_video(
            model_path=f"models/dqn_seed{seed}.pt",
            seed=seed
        )