import numpy as np
import gymnasium as gym
import yaml
import csv
import os

class QLearningAgent:
    def __init__(self, config):
        self.gamma        = config['training']['gamma']
        self.lr           = config['training']['lr']
        self.epsilon      = config['training']['epsilon_start']
        self.epsilon_end  = config['training']['epsilon_end']
        self.epsilon_decay = config['training']['epsilon_decay']
        self.n_actions    = 4
        self.n_bins       = 6

        self.q_table = {}

    def discretize(self, state):
        bins = np.linspace(-1, 1, self.n_bins)
        discretized = tuple(np.digitize(s, bins) for s in state)
        return discretized

    def select_action(self, state):
        state_d = self.discretize(state)

        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)

        if state_d not in self.q_table:
            return np.random.randint(self.n_actions)

        return np.argmax(self.q_table[state_d])

    def update(self, state, action, reward, next_state, done):
        state_d      = self.discretize(state)
        next_state_d = self.discretize(next_state)

        if state_d not in self.q_table:
            self.q_table[state_d] = np.zeros(self.n_actions)
        if next_state_d not in self.q_table:
            self.q_table[next_state_d] = np.zeros(self.n_actions)

        current_q = self.q_table[state_d][action]

        if done:
            target_q = reward
        else:
            target_q = reward + self.gamma * np.max(self.q_table[next_state_d])

        self.q_table[state_d][action] += self.lr * (target_q - current_q)
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)