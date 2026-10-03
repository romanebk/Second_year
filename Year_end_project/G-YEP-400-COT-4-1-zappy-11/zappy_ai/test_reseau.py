#!/usr/bin/env python3
# test_reseau.py - Tests unitaires pour la couche réseau

import unittest
from unittest.mock import Mock, patch, MagicMock
import socket
from reseau import Reseau, ReseauException, JoueurMortException


class TestReseauParsing(unittest.TestCase):
    """Tests des fonctions de parsing sans connexion réelle"""

    def setUp(self):
        """Mock un objet Reseau sans connexion"""
        with patch('socket.socket'):
            self.reseau = Mock(spec=Reseau)
            # Copier les méthodes de parsing (elles sont stateless)
            self.reseau.parser_inventaire = Reseau.parser_inventaire.__get__(self.reseau)
            self.reseau.parse_vision = Reseau.parse_vision.__get__(self.reseau)
            self.reseau.parse_broadcast = Reseau.parse_broadcast.__get__(self.reseau)
            self.reseau.parse_eject = Reseau.parse_eject.__get__(self.reseau)
            self.reseau.est_broadcast = Reseau.est_broadcast.__get__(self.reseau)
            self.reseau.est_eject = Reseau.est_eject.__get__(self.reseau)
            self.reseau._contenu_crochets = Reseau._contenu_crochets.__get__(self.reseau)

    def test_parser_inventaire_valide(self):
        """Test parsing inventaire avec données valides"""
        reponse = "[food 5, linemate 2, deraumere 1, sibur 0]"
        inv = self.reseau.parser_inventaire(reponse)
        
        self.assertEqual(inv['food'], 5)
        self.assertEqual(inv['linemate'], 2)
        self.assertEqual(inv['deraumere'], 1)
        self.assertEqual(inv['sibur'], 0)

    def test_parser_inventaire_vide(self):
        """Test parsing inventaire vide"""
        reponse = "[]"
        inv = self.reseau.parser_inventaire(reponse)
        self.assertEqual(inv, {})

    def test_parser_inventaire_invalide(self):
        """Test parsing inventaire avec format invalide"""
        with self.assertRaises(ReseauException):
            self.reseau.parser_inventaire("[food]")
        
        with self.assertRaises(ReseauException):
            self.reseau.parser_inventaire("food 5")  # Pas de crochets

    def test_parse_vision_valide(self):
        """Test parsing vision avec plusieurs cases"""
        reponse = "[player, food linemate, , deraumere sibur]"
        vision = self.reseau.parse_vision(reponse)
        
        self.assertEqual(len(vision), 4)
        self.assertEqual(vision[0], ['player'])
        self.assertEqual(vision[1], ['food', 'linemate'])
        self.assertEqual(vision[2], [])
        self.assertEqual(vision[3], ['deraumere', 'sibur'])

    def test_parse_vision_vide(self):
        """Test parsing vision case vide"""
        reponse = "[]"
        vision = self.reseau.parse_vision(reponse)
        self.assertEqual(vision, [[]])

    def test_parse_broadcast_avec_message(self):
        """Test parsing broadcast avec texte"""
        reponse = "message 3, besoin aide niveau 2"
        direction, texte = self.reseau.parse_broadcast(reponse)
        
        self.assertEqual(direction, 3)
        self.assertEqual(texte, "besoin aide niveau 2")

    def test_parse_broadcast_sans_message(self):
        """Test parsing broadcast sans texte"""
        reponse = "message 0, "
        direction, texte = self.reseau.parse_broadcast(reponse)
        
        self.assertEqual(direction, 0)
        self.assertEqual(texte, "")

    def test_parse_broadcast_direction_invalide(self):
        """Test parsing broadcast avec direction invalide"""
        with self.assertRaises(ValueError):
            self.reseau.parse_broadcast("message abc, texte")

    def test_parse_eject_valide(self):
        """Test parsing eject"""
        reponse = "eject: 5"
        direction = self.reseau.parse_eject(reponse)
        self.assertEqual(direction, 5)

    def test_parse_eject_invalide(self):
        """Test parsing eject invalide"""
        with self.assertRaises(ValueError):
            self.reseau.parse_eject("eject: abc")

    def test_est_broadcast(self):
        """Test détection de broadcast"""
        self.assertTrue(self.reseau.est_broadcast("message 1, hello"))
        self.assertFalse(self.reseau.est_broadcast("ok"))
        self.assertFalse(self.reseau.est_broadcast("dead"))

    def test_est_eject(self):
        """Test détection d'eject"""
        self.assertTrue(self.reseau.est_eject("eject: 3"))
        self.assertFalse(self.reseau.est_eject("ok"))
        self.assertFalse(self.reseau.est_eject("message 1, test"))


class TestReseauGestionSlots(unittest.TestCase):
    """Tests de la gestion de la file de commandes"""

    def setUp(self):
        """Mock connexion pour tester la logique des slots"""
        self.mock_socket = MagicMock()
        with patch('socket.socket', return_value=self.mock_socket):
            # Simuler le handshake
            self.mock_socket.recv.side_effect = [
                b"WELCOME\n",
                b"5\n",
                b"10 10\n"
            ]
            self.reseau = Reseau("localhost", 4242, "test_team", timeout_connexion=1.0)

    def test_slots_initiaux(self):
        """Vérifier que les slots sont initialisés à 10"""
        self.assertEqual(self.reseau.slots_disponibles, 10)
        self.assertEqual(self.reseau.commandes_en_attente(), 0)

    def test_envoi_commande_decremente_slots(self):
        """Vérifier qu'envoyer une commande décrémente les slots"""
        self.reseau.envoyer_commande("Forward")
        
        self.assertEqual(self.reseau.slots_disponibles, 9)
        self.assertEqual(self.reseau.commandes_en_attente(), 1)

    def test_file_pleine_leve_exception(self):
        """Vérifier qu'on ne peut pas envoyer plus de 10 commandes"""
        for _ in range(10):
            self.reseau.envoyer_commande("Forward")
        
        self.assertEqual(self.reseau.slots_disponibles, 0)
        
        with self.assertRaises(ReseauException):
            self.reseau.envoyer_commande("Forward")

    def test_peut_envoyer(self):
        """Vérifier la fonction peut_envoyer()"""
        self.assertTrue(self.reseau.peut_envoyer())
        
        for _ in range(10):
            self.reseau.envoyer_commande("Forward")
        
        self.assertFalse(self.reseau.peut_envoyer())

    def test_recevoir_reponse_libere_slot(self):
        """Vérifier que recevoir une réponse libère un slot"""
        self.reseau.envoyer_commande("Forward")
        self.assertEqual(self.reseau.slots_disponibles, 9)
        
        # Simuler réception de "ok"
        self.mock_socket.recv.side_effect = [b"ok\n"]
        self.reseau.recevoir_reponse()
        
        self.assertEqual(self.reseau.slots_disponibles, 10)
        self.assertEqual(self.reseau.commandes_en_attente(), 0)


class TestReseauMessagesAsync(unittest.TestCase):
    """Tests des messages asynchrones (broadcast, eject, dead)"""

    def setUp(self):
        """Mock connexion"""
        self.mock_socket = MagicMock()
        with patch('socket.socket', return_value=self.mock_socket):
            self.mock_socket.recv.side_effect = [
                b"WELCOME\n",
                b"5\n",
                b"10 10\n"
            ]
            self.reseau = Reseau("localhost", 4242, "test_team", timeout_connexion=1.0)

    def test_broadcast_bufferise(self):
        """Vérifier que les broadcasts sont bufferisés"""
        self.reseau.envoyer_commande("Forward")
        
        # Simuler broadcast puis réponse
        self.mock_socket.recv.side_effect = [
            b"message 3, hello\nok\n"
        ]
        
        reponse = self.reseau.recevoir_reponse()
        
        # La réponse doit être "ok", le broadcast bufferisé
        self.assertEqual(reponse, "ok")
        self.assertEqual(len(self.reseau.messages_async), 1)
        self.assertEqual(self.reseau.messages_async[0][0], "broadcast")
        self.assertEqual(self.reseau.messages_async[0][1], (3, "hello"))

    def test_eject_bufferise(self):
        """Vérifier que les ejects sont bufferisés"""
        self.reseau.envoyer_commande("Forward")
        
        self.mock_socket.recv.side_effect = [
            b"eject: 5\nok\n"
        ]
        
        reponse = self.reseau.recevoir_reponse()
        
        self.assertEqual(reponse, "ok")
        self.assertEqual(len(self.reseau.messages_async), 1)
        self.assertEqual(self.reseau.messages_async[0][0], "eject")
        self.assertEqual(self.reseau.messages_async[0][1], 5)

    def test_dead_leve_exception(self):
        """Vérifier que 'dead' lève JoueurMortException"""
        self.reseau.envoyer_commande("Forward")
        
        self.mock_socket.recv.side_effect = [b"dead\n"]

        with self.assertRaises(JoueurMortException):
            self.reseau.recevoir_reponse()
        
        self.assertTrue(self.reseau.est_mort)
        self.assertFalse(self.reseau.est_vivant())

    def test_relever_messages_async(self):
        """Vérifier le relevé des messages asynchrones"""
        # Simuler plusieurs messages async en attente, puis "plus rien à lire"
        self.mock_socket.recv.side_effect = [
            b"message 1, test\neject: 3\n",
            BlockingIOError(),
        ]

        import select
        with patch('select.select', return_value=([self.mock_socket], [], [])):
            messages = self.reseau.relever_messages_async(timeout=0.1)
        
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0][0], "broadcast")
        self.assertEqual(messages[1][0], "eject")


class TestReseauDelaisCommandes(unittest.TestCase):
    """Tests des délais de commandes"""

    def test_delais_definis(self):
        """Vérifier que tous les délais sont définis"""
        commandes = [
            "Forward", "Right", "Left", "Look", "Inventory",
            "Broadcast", "Connect_nbr", "Fork", "Eject", "Take", "Set", "Incantation"
        ]
        
        for cmd in commandes:
            self.assertIn(cmd, Reseau.DELAIS_COMMANDES)
            self.assertIsInstance(Reseau.DELAIS_COMMANDES[cmd], int)

    def test_incantation_delai_max(self):
        """Vérifier que Incantation a le plus long délai"""
        max_delai = max(Reseau.DELAIS_COMMANDES.values())
        self.assertEqual(Reseau.DELAIS_COMMANDES["Incantation"], max_delai)
        self.assertEqual(max_delai, 300)


if __name__ == '__main__':
    print("=== Tests de la couche réseau Zappy ===\n")
    unittest.main(verbosity=2)
