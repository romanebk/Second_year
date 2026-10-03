import random
import numpy as np
import torch
from collections import deque


class ReplayBuffer:
    def __init__(self, capacity, device="cpu"):
        self.buffer = deque(maxlen=capacity)
        self.device = device

    def add_transition(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample_batch(self, batch_size):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)

        states      = torch.FloatTensor(np.array(states)).to(self.device)
        actions     = torch.LongTensor(np.array(actions)).to(self.device)
        rewards     = torch.FloatTensor(np.array(rewards)).to(self.device)
        next_states = torch.FloatTensor(np.array(next_states)).to(self.device)
        dones       = torch.FloatTensor(np.array(dones, dtype=np.float32)).to(self.device)

        return states, actions, rewards, next_states, dones

    def is_ready(self, batch_size):
        return len(self.buffer) >= batch_size

    def __len__(self):
        return len(self.buffer)


if __name__ == "__main__":
    buf = ReplayBuffer(capacity=1000)

    for i in range(500):
        state      = np.random.rand(8).astype(np.float32)
        action     = random.randint(0, 3)
        reward     = random.uniform(-1, 1)
        next_state = np.random.rand(8).astype(np.float32)
        done       = random.random() < 0.05
        buf.add_transition(state, action, reward, next_state, done)

    print(f"Taille buffer : {len(buf)}")

    states, actions, rewards, next_states, dones = buf.sample_batch(32)
    print(f"states shape     : {states.shape}")
    print(f"actions shape    : {actions.shape}")
    print(f"rewards shape    : {rewards.shape}")
    print(f"next_states shape: {next_states.shape}")
    print(f"dones shape      : {dones.shape}")
    print("OK")