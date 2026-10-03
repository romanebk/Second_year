import copy
import torch
import numpy as np
import unittest
from model import Qnetwork
from replay_buffer import ReplayBuffer
from train import select_action

class TestDQNAgent(unittest.TestCase):
    def setUp(self):
        # appelé avant chaque test
        # on initialise ce dont on a besoin
        self.q_net      = Qnetwork()
        self.target_net = copy.deepcopy(self.q_net)
        self.buffer     = ReplayBuffer(1000)

    def test_q_network_forward(self):
        fake_state = torch.randn(1, 8)
        q_values = self.q_net(fake_state)
        self.assertEqual(q_values.shape, (1, 4))
        print("test 1 passed")

    def test_select_action(self):
        fake_state = np.random.rand(8)
        action = select_action(fake_state, 0.5)
        self.assertIn(action, [0, 1, 2, 3])
        print("test 2 passed")

    def test_replay_buffer(self):
        # on crée de fausses transitions
        for i in range(100):
            state      = np.random.randn(8)
            action     = np.random.randint(4)
            reward     = np.random.randn()
            next_state = np.random.randn(8)
            done       = 0.0
            self.buffer.add_transition(state, action, reward, next_state, done)

        self.assertEqual(len(self.buffer), 100)
        states, actions, rewards, next_states, dones = self.buffer.sample_batch(64)
        self.assertEqual(states.shape, (64, 8))
        self.assertEqual(actions.shape, (64,))
        self.assertEqual(rewards.shape, (64,))
        self.assertEqual(next_states.shape, (64, 8))
        self.assertEqual(dones.shape, (64,))
        print("test 3 passed")

    def test_target_network_update(self):
        reward = torch.tensor([1.0, 2.0, 3.0])
        next_state = torch.randn(3, 8)
        done = torch.tensor([0.0, 0.0, 1.0])
        gamma = 0.99

        with torch.no_grad():
            next_q = self.target_net(next_state).max(1)[0]
            target_q = reward + gamma * next_q * (1 - done)
        self.assertEqual(target_q.shape, torch.Size([3]))
        print("test 4 passed")

if __name__ == "__main__":
    unittest.main()