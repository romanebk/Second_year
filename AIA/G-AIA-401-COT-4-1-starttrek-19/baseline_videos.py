import gymnasium as gym
import yaml
import os


def load_config(path="configs/base.yaml"):
    with open(path, "r") as f:
        return yaml.safe_load(f)


def make_env_with_video(env_name, video_folder):
    env = gym.make(env_name, render_mode="rgb_array")
    env = gym.wrappers.RecordVideo(
        env,
        video_folder=video_folder,
        episode_trigger=lambda ep: True
    )
    return env


def random_action(env, obs):
    return env.action_space.sample()


def heuristic_action(obs):
    x  = obs[0]
    vy = obs[3]

    if vy < -0.5:
        return 2  # moteur principal
    if x > 0.1:
        return 1  # moteur gauche
    if x < -0.1:
        return 3  # moteur droit
    return 0      # rien


def run_episode(env, seed, action_fn):
    obs, _ = env.reset(seed=seed)
    total_return = 0

    while True:
        action = action_fn(obs)
        obs, reward, terminated, truncated, _ = env.step(action)
        total_return += reward

        if terminated or truncated:
            break

    return total_return


def record_episodes(env_name, video_folder, n_episodes, base_seed, action_fn, label):
    os.makedirs(video_folder, exist_ok=True)
    env = make_env_with_video(env_name, video_folder)

    print(f"\n<=== {label} — {n_episodes} épisodes ===>")
    for episode in range(n_episodes):
        total_return = run_episode(env, seed=base_seed + episode, action_fn=action_fn)
        print(f"  Episode {episode} | Return: {total_return:.1f}")

    env.close()
    print(f"Vidéos sauvegardées dans : {video_folder}")


def main():
    config     = load_config()
    env_name   = config["env"]["name"]
    base_seed  = config["seed"]
    n_episodes = 3

    record_episodes(
        env_name    = env_name,
        video_folder= "videos/random",
        n_episodes  = n_episodes,
        base_seed   = base_seed,
        action_fn   = lambda obs: __import__('gymnasium').make(env_name).action_space.sample(),
        label       = "Random Policy"
    )

    record_episodes(
        env_name    = env_name,
        video_folder= "videos/heuristic",
        n_episodes  = n_episodes,
        base_seed   = base_seed,
        action_fn   = heuristic_action,
        label       = "Heuristic Policy"
    )


if __name__ == "__main__":
    main()