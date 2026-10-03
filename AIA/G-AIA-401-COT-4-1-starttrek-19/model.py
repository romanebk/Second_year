import torch
import torch.nn as nn
import numpy as np

class Qnetwork(nn.Module):
    def __init__(self, state_dim = 8, action_dim = 4, hidden_dim = 128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim)
        )

    def forward(self, x):
        return self.net(x)
