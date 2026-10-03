#!/usr/bin/env python3
# adaptateur.py - pont entre le cerveau (binôme) et le réseau (reseau.py).
#
# Le cerveau (cerveau.py) a été écrit pour un objet "réseau" de type mock,
# exposant une interface simple :
#     network.connect()                 -> (slots, largeur, hauteur)
#     network.is_connected()            -> bool
#     network.send("Forward\n")         envoie une commande (newline incluse)
#     network.receive_response()        -> "ok\n" (réponse brute, newline incluse)
#     network.receive_response(is_look=True)      -> vision parsée (liste de cases)
#     network.receive_response(is_inventory=True) -> inventaire parsé (dict)
#
# Notre vrai réseau (Reseau) a une interface différente et plus riche
# (envoyer_commande/recevoir_reponse, file de 10 commandes, messages async,
# parsing). Cet adaptateur traduit l'une vers l'autre SANS toucher au cerveau.
#
# Le cerveau fonctionne en mode strictement synchrone (un envoi -> une
# réponse), ce qui s'accorde naturellement avec la file de commandes du Reseau.


class AdaptateurCerveau:
    """Expose au cerveau l'interface attendue, en s'appuyant sur un Reseau."""

    def __init__(self, reseau):
        self.reseau = reseau
        # Niveau reçu via un "Current level: K" (sollicité OU non) ; jamais
        # perdu, le cerveau le consomme. None = pas de montée en attente.
        self.level_signal = None

    # ------------------------------------------------------------------ état
    def connect(self):
        """Le handshake est déjà fait par Reseau.__init__ ; on renvoie juste
        les infos d'équipe/carte sous la forme attendue par le cerveau."""
        largeur, hauteur = self.reseau.taille
        return self.reseau.places, largeur, hauteur

    def is_connected(self):
        return self.reseau.est_vivant()

    # ------------------------------------------------------------------ envoi
    def send(self, commande):
        """Envoie une commande façon mock : chaîne avec '\\n' final, p. ex.
        'Take food\\n'. On la découpe en commande + arguments pour Reseau."""
        morceaux = commande.strip().split()
        if not morceaux:
            return
        self.reseau.envoyer_commande(morceaux[0], *morceaux[1:])

    # ------------------------------------------------------------------ réception
    def receive_response(self, is_look=False, is_inventory=False):
        """Récupère la prochaine réponse à une commande.

        - is_look=True      : renvoie la vision parsée (liste de cases, chaque
                              case étant une liste d'objets), comme attendu par
                              Player.update_vision.
        - is_inventory=True : renvoie l'inventaire parsé (dict), comme attendu
                              par Player.update_inventory.
        - sinon             : renvoie la réponse brute AVEC le '\\n' final, pour
                              rester compatible avec les comparaisons du cerveau
                              ('ok\\n', 'Elevation underway\\n', ...).

        Les broadcasts/ejects reçus entre-temps sont gérés en interne par
        Reseau.recevoir_reponse ; une mort du joueur lève JoueurMortException.
        """
        ligne = self.reseau.recevoir_reponse()
        # "Current level: K" peut arriver comme réponse à N'IMPORTE quelle
        # commande (un joueur gelé en plein Look reçoit sa montée de niveau
        # là où il attendait une vision). On capte le signal de façon centrale
        # pour ne JAMAIS le perdre, quel que soit le contexte.
        if ligne.startswith("Current level"):
            try:
                self.level_signal = int(ligne.split(":")[1])
            except (ValueError, IndexError):
                self.level_signal = -1
            return None if (is_look or is_inventory) else ligne + "\n"
        # Un joueur gelé reçoit "ko" à la place d'une vision/inventaire : on
        # renvoie None pour que le cerveau le détecte (au lieu de planter).
        if is_look:
            return self.reseau.parse_vision(ligne) if ligne.startswith("[") else None
        if is_inventory:
            return self.reseau.parser_inventaire(ligne) if ligne.startswith("[") else None
        return ligne + "\n"

    # ------------------------------------------------------------------ async
    def poll_messages(self, timeout=0.0):
        """Renvoie les messages reçus du serveur sans bloquer (ou jusqu'à
        `timeout` s). Liste de tuples :
            ("broadcast", (direction_k, texte))
            ("eject",     direction_k)
            ("reponse",   ligne_brute)   # réponse arrivée hors d'un envoi
        Utilisé par le cerveau pour réagir aux broadcasts et pour qu'un
        participant gelé capte le "Current level: K" non sollicité de fin
        d'incantation sans émettre de commande (évite toute désync)."""
        return self.reseau.relever_messages_async(timeout)
