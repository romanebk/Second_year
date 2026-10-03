#!/usr/bin/env python3
# test_comm.py - tests du chiffrement des broadcasts

import unittest
import comm


class TestComm(unittest.TestCase):
    def test_roundtrip(self):
        """Un message chiffré puis déchiffré avec la même clé revient identique."""
        for msg in ["rally 4 0.1234", "found sibur 4", "", "à é ç hello 123"]:
            blob = comm.encode(msg, "team1")
            self.assertEqual(comm.decode(blob, "team1"), msg)

    def test_sortie_ascii_sure(self):
        """Le message chiffré est de l'hexa pur (transmissible par Broadcast)."""
        blob = comm.encode("rally 2 0.9", "team1")
        self.assertTrue(all(c in "0123456789abcdef" for c in blob))
        self.assertNotIn("\n", blob)

    def test_cle_differente_est_illisible(self):
        """Avec une AUTRE clé (équipe adverse), le message est indéchiffrable."""
        blob = comm.encode("rally 5 0.5", "team1")
        self.assertIsNone(comm.decode(blob, "ennemi"))

    def test_bruit_rejete(self):
        """Un texte qui n'est pas un de nos blobs renvoie None."""
        self.assertIsNone(comm.decode("pas du hexa !!", "team1"))
        self.assertIsNone(comm.decode("deadbeef", "team1"))   # hexa mais mauvais marqueur
        self.assertIsNone(comm.decode("", "team1"))

    def test_meme_equipe_se_comprend(self):
        """Deux clients de la même équipe (même nom) se lisent."""
        env = comm.encode("rally 3 0.7", "EquipeA")
        self.assertEqual(comm.decode(env, "EquipeA"), "rally 3 0.7")


if __name__ == "__main__":
    unittest.main()
