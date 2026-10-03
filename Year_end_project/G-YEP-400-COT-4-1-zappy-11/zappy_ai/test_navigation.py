#!/usr/bin/env python3
# test_navigation.py - Tests unitaires pour le module navigation

import unittest
from navigation import (
    index_vers_position,
    position_vers_mouvements,
    index_vers_mouvements,
    broadcast_vers_mouvements,
    parser_look,
    cases_contenant,
    decouper_cases
)


class TestIndexVersPosition(unittest.TestCase):
    """Tests de la conversion index -> position (dx, dy)"""

    def test_case_joueur(self):
        """Case 0 = position du joueur (0, 0)"""
        self.assertEqual(index_vers_position(0), (0, 0))

    def test_rangee_1(self):
        """Rangée 1 : cases 1, 2, 3"""
        self.assertEqual(index_vers_position(1), (-1, 1))  # gauche devant
        self.assertEqual(index_vers_position(2), (0, 1))   # pile devant
        self.assertEqual(index_vers_position(3), (1, 1))   # droite devant

    def test_rangee_2(self):
        """Rangée 2 : cases 4, 5, 6, 7, 8"""
        self.assertEqual(index_vers_position(4), (-2, 2))
        self.assertEqual(index_vers_position(5), (-1, 2))
        self.assertEqual(index_vers_position(6), (0, 2))   # pile devant loin
        self.assertEqual(index_vers_position(7), (1, 2))
        self.assertEqual(index_vers_position(8), (2, 2))

    def test_rangee_3(self):
        """Rangée 3 : cases 9-15"""
        self.assertEqual(index_vers_position(9), (-3, 3))
        self.assertEqual(index_vers_position(12), (0, 3))  # pile devant
        self.assertEqual(index_vers_position(15), (3, 3))


class TestPositionVersMouvements(unittest.TestCase):
    """Tests de la conversion (dx, dy) -> mouvements"""

    def test_case_joueur(self):
        """Pas de mouvement pour rester sur place"""
        self.assertEqual(position_vers_mouvements(0, 0), [])

    def test_pile_devant(self):
        """Aller pile devant (dx=0)"""
        self.assertEqual(position_vers_mouvements(0, 1), ["Forward"])
        self.assertEqual(position_vers_mouvements(0, 3), ["Forward", "Forward", "Forward"])

    def test_droite_devant(self):
        """Aller devant puis à droite"""
        mouvements = position_vers_mouvements(2, 1)
        self.assertEqual(mouvements, ["Forward", "Right", "Forward", "Forward"])

    def test_gauche_devant(self):
        """Aller devant puis à gauche"""
        mouvements = position_vers_mouvements(-2, 1)
        self.assertEqual(mouvements, ["Forward", "Left", "Forward", "Forward"])

    def test_droite_pure(self):
        """Aller à droite sans avancer d'abord"""
        mouvements = position_vers_mouvements(1, 0)
        self.assertEqual(mouvements, ["Right", "Forward"])

    def test_gauche_pure(self):
        """Aller à gauche sans avancer d'abord"""
        mouvements = position_vers_mouvements(-1, 0)
        self.assertEqual(mouvements, ["Left", "Forward"])


class TestIndexVersMouvements(unittest.TestCase):
    """Tests de la conversion directe index -> mouvements"""

    def test_index_0(self):
        """Case 0 (joueur) = pas de mouvement"""
        self.assertEqual(index_vers_mouvements(0), [])

    def test_index_2(self):
        """Case 2 (pile devant) = 1 Forward"""
        self.assertEqual(index_vers_mouvements(2), ["Forward"])

    def test_index_6(self):
        """Case 6 (pile devant rangée 2) = 2 Forward"""
        self.assertEqual(index_vers_mouvements(6), ["Forward", "Forward"])

    def test_index_1(self):
        """Case 1 (gauche devant)"""
        mouvements = index_vers_mouvements(1)
        self.assertEqual(mouvements, ["Forward", "Left", "Forward"])

    def test_index_3(self):
        """Case 3 (droite devant)"""
        mouvements = index_vers_mouvements(3)
        self.assertEqual(mouvements, ["Forward", "Right", "Forward"])


class TestBroadcastVersMouvements(unittest.TestCase):
    """Tests de la conversion direction broadcast -> mouvements"""

    def test_broadcast_0(self):
        """Direction 0 = déjà sur place"""
        self.assertEqual(broadcast_vers_mouvements(0), [])

    def test_broadcast_1(self):
        """Direction 1 = devant"""
        self.assertEqual(broadcast_vers_mouvements(1), ["Forward"])

    def test_broadcast_3(self):
        """Direction 3 = gauche"""
        self.assertEqual(broadcast_vers_mouvements(3), ["Left", "Forward"])

    def test_broadcast_5(self):
        """Direction 5 = derrière (demi-tour)"""
        self.assertEqual(broadcast_vers_mouvements(5), ["Left", "Left", "Forward"])

    def test_broadcast_7(self):
        """Direction 7 = droite"""
        self.assertEqual(broadcast_vers_mouvements(7), ["Right", "Forward"])

    def test_broadcast_invalide(self):
        """Direction invalide doit lever ValueError"""
        with self.assertRaises(ValueError):
            broadcast_vers_mouvements(9)
        with self.assertRaises(ValueError):
            broadcast_vers_mouvements(-1)


class TestDecouperCases(unittest.TestCase):
    """Tests du découpage de la réponse Look"""

    def test_cases_simples(self):
        """Découper cases simples"""
        resultat = decouper_cases("[player, food, linemate]")
        self.assertEqual(resultat, [["player"], ["food"], ["linemate"]])

    def test_cases_multiples_objets(self):
        """Cases avec plusieurs objets"""
        resultat = decouper_cases("[player, food linemate, deraumere sibur]")
        self.assertEqual(resultat, [
            ["player"],
            ["food", "linemate"],
            ["deraumere", "sibur"]
        ])

    def test_cases_vides(self):
        """Cases vides"""
        resultat = decouper_cases("[player, , food]")
        self.assertEqual(resultat, [["player"], [], ["food"]])

    def test_tout_vide(self):
        """Toutes les cases vides"""
        resultat = decouper_cases("[, , ]")
        self.assertEqual(resultat, [[], [], []])

    def test_format_invalide(self):
        """Format sans crochets doit lever ValueError"""
        with self.assertRaises(ValueError):
            decouper_cases("player, food")


class TestParserLook(unittest.TestCase):
    """Tests du parsing enrichi Look"""

    def test_look_simple(self):
        """Parser Look basique"""
        resultat = parser_look("[player, food, linemate]")
        
        self.assertEqual(len(resultat), 3)
        
        # Case 0 (joueur)
        self.assertEqual(resultat[0]["index"], 0)
        self.assertEqual(resultat[0]["rel"], (0, 0))
        self.assertEqual(resultat[0]["objets"], ["player"])
        
        # Case 1
        self.assertEqual(resultat[1]["index"], 1)
        self.assertEqual(resultat[1]["rel"], (-1, 1))
        self.assertEqual(resultat[1]["objets"], ["food"])
        
        # Case 2
        self.assertEqual(resultat[2]["index"], 2)
        self.assertEqual(resultat[2]["rel"], (0, 1))
        self.assertEqual(resultat[2]["objets"], ["linemate"])

    def test_look_cases_vides(self):
        """Parser Look avec cases vides"""
        resultat = parser_look("[player, , food]")
        
        self.assertEqual(resultat[1]["objets"], [])

    def test_look_objets_multiples(self):
        """Parser Look avec plusieurs objets par case"""
        resultat = parser_look("[player deraumere, food linemate sibur]")
        
        self.assertEqual(resultat[0]["objets"], ["player", "deraumere"])
        self.assertEqual(resultat[1]["objets"], ["food", "linemate", "sibur"])


class TestCasesContenant(unittest.TestCase):
    """Tests de la fonction cases_contenant"""

    def setUp(self):
        """Créer une vue de test"""
        self.vue = parser_look("[player food, linemate, , food sibur]")

    def test_trouver_food(self):
        """Trouver toutes les cases avec food"""
        cases_food = cases_contenant(self.vue, "food")
        
        self.assertEqual(len(cases_food), 2)
        self.assertEqual(cases_food[0]["index"], 0)
        self.assertEqual(cases_food[1]["index"], 3)

    def test_trouver_linemate(self):
        """Trouver linemate"""
        cases_linemate = cases_contenant(self.vue, "linemate")
        
        self.assertEqual(len(cases_linemate), 1)
        self.assertEqual(cases_linemate[0]["index"], 1)

    def test_objet_absent(self):
        """Chercher objet absent"""
        cases = cases_contenant(self.vue, "deraumere")
        self.assertEqual(cases, [])

    def test_trouver_player(self):
        """Trouver le joueur"""
        cases_player = cases_contenant(self.vue, "player")
        
        self.assertEqual(len(cases_player), 1)
        self.assertEqual(cases_player[0]["rel"], (0, 0))


class TestCoherenceGeometrique(unittest.TestCase):
    """Tests de cohérence globale du système géométrique"""

    def test_aller_retour_index_position(self):
        """Vérifier cohérence index -> position -> mouvements"""
        for i in range(16):  # Test jusqu'au niveau 3
            pos = index_vers_position(i)
            mouvements = position_vers_mouvements(*pos)
            
            # Vérifier que le nombre de mouvements est cohérent
            dx, dy = pos
            nb_attendu = abs(dy) + abs(dx) + (1 if dx != 0 else 0)  # +1 pour rotation
            self.assertEqual(len(mouvements), nb_attendu)

    def test_symetrie_gauche_droite(self):
        """Vérifier symétrie gauche/droite"""
        # Case gauche devant
        mvts_gauche = index_vers_mouvements(1)
        # Case droite devant
        mvts_droite = index_vers_mouvements(3)
        
        # Même nombre de mouvements
        self.assertEqual(len(mvts_gauche), len(mvts_droite))
        
        # Différence uniquement Left vs Right
        self.assertIn("Left", mvts_gauche)
        self.assertIn("Right", mvts_droite)


if __name__ == '__main__':
    print("=== Tests du module navigation ===\n")
    unittest.main(verbosity=2)
