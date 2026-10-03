#!/usr/bin/env python3
# reseau.py -la tuyauterie : tout ce qui parle au serveur

import select
import socket
import sys
from collections import deque


class ReseauException(Exception):
    """Exception levée en cas de problème réseau"""

    pass


class JoueurMortException(Exception):
    """Exception levée quand le joueur meurt"""

    pass


class Reseau:
    # Temps en unités de temps serveur pour chaque commande
    DELAIS_COMMANDES = {
        "Forward": 7,
        "Right": 7,
        "Left": 7,
        "Look": 7,
        "Inventory": 1,
        "Broadcast": 7,
        "Connect_nbr": 0,
        "Fork": 42,
        "Eject": 7,
        "Take": 7,
        "Set": 7,
        "Incantation": 300,
    }

    # Le serveur accepte au maximum 10 commandes en tampon par joueur.
    MAX_SLOTS = 10

    def __init__(self, host, port, team, timeout_connexion=5.0, timeout_lecture=None):
        """Connexion + handshake.

        timeout_connexion : délai max pour établir la connexion et faire le
            handshake (évite de bloquer indéfiniment sur un mauvais port).
        timeout_lecture : délai max pour les lectures une fois en jeu. None =
            bloquant. On NE met PAS de petit timeout ici car une action longue
            (Incantation = 300/f s, Fork = 42/f s) peut légitimement prendre
            plusieurs centaines de secondes à faible fréquence.
        """
        self.tel = None
        self.timeout_lecture = timeout_lecture
        # Buffer d'octets pour le découpage manuel des lignes (on n'utilise pas
        # makefile : il bufferise en interne, ce qui casse select() pour les
        # lectures non bloquantes des messages asynchrones).
        self._buf = b""
        self._timeout_courant = timeout_connexion

        # File des commandes envoyées en attente de réponse
        self.file_commandes = deque()
        self.slots_disponibles = self.MAX_SLOTS
        self.est_mort = False

        # Messages asynchrones poussés par le serveur (broadcast, eject) que
        # le cerveau pourra consommer sans qu'ils interfèrent avec les réponses.
        self.messages_async = deque()

        try:
            self.tel = socket.socket()
            self.tel.connect((host, port))

            # Handshake initial : WELCOME -> team -> CLIENT-NUM -> X Y
            self.lire()  # WELCOME (lève si vide / connexion fermée)

            self.ecrire(team)

            places_str = self.lire()
            self.places = int(places_str)

            taille_str = self.lire()
            morceaux = taille_str.split()
            if len(morceaux) != 2:
                raise ReseauException(f"Taille de carte invalide : {taille_str!r}")
            self.taille = (int(morceaux[0]), int(morceaux[1]))

            # Passage en mode lecture de jeu (timeout dédié, bloquant par défaut)
            self._timeout_courant = self.timeout_lecture

        except socket.timeout:
            self.fermer()
            raise ReseauException(f"Timeout lors de la connexion à {host}:{port}")
        except socket.error as e:
            self.fermer()
            raise ReseauException(f"Erreur de connexion : {e}")
        except ValueError as e:
            self.fermer()
            raise ReseauException(f"Erreur de parsing lors de l'initialisation : {e}")

    # ------------------------------------------------------------------ I/O bas niveau

    def lire(self):
        """Lit une ligne (bloquant). Lève ReseauException si la connexion est
        fermée ou en cas de timeout."""
        ligne = self._lire_ligne(bloquant=True)
        if ligne is None:
            raise ReseauException("Connexion fermée par le serveur")
        return ligne

    def _lire_ligne(self, bloquant):
        """Découpe une ligne depuis le buffer, en remplissant via recv au besoin.

        bloquant=True  : attend une ligne (selon self._timeout_courant), renvoie
            None uniquement si la connexion est fermée.
        bloquant=False : renvoie une ligne déjà disponible ou None s'il n'y a
            rien à lire sans bloquer.
        """
        while b"\n" not in self._buf:
            if not bloquant:
                pret, _, _ = select.select([self.tel], [], [], 0)
                if not pret:
                    return None
            try:
                self.tel.settimeout(self._timeout_courant if bloquant else 0.0)
                data = self.tel.recv(4096)
            except socket.timeout:
                raise ReseauException("Timeout lors de la lecture")
            except BlockingIOError:
                return None
            except socket.error as e:
                raise ReseauException(f"Erreur lors de la lecture : {e}")
            if not data:
                return None  # connexion fermée par le serveur
            self._buf += data

        ligne, _, self._buf = self._buf.partition(b"\n")
        return ligne.decode(errors="replace").strip()

    def ecrire(self, message):
        try:
            self.tel.sendall((message + "\n").encode())
        except socket.timeout:
            raise ReseauException("Timeout lors de l'écriture")
        except socket.error as e:
            raise ReseauException(f"Erreur lors de l'écriture : {e}")

    # ------------------------------------------------------------------ commandes

    def envoyer_commande(self, commande, *args):
        """Envoie une commande si un slot est disponible.

        Lève ReseauException si le tampon serveur (10 commandes) est plein :
        le cerveau doit appeler peut_envoyer() avant, ou consommer une réponse.
        """
        cmd_complete = (
            commande if not args else f"{commande} {' '.join(map(str, args))}"
        )

        if self.slots_disponibles <= 0:
            raise ReseauException("File de commandes pleine, attendez une réponse")

        self.ecrire(cmd_complete)
        self.slots_disponibles -= 1
        delai = self.DELAIS_COMMANDES.get(commande, 7)
        self.file_commandes.append((commande, delai))

    def recevoir_reponse(self):
        """Bloque jusqu'à la prochaine réponse à une commande.

        Les messages asynchrones du serveur (broadcast, eject) reçus entre-temps
        sont bufferisés dans self.messages_async et NE consomment pas de slot.
        Lève JoueurMortException si le serveur signale la mort du joueur.
        """
        while True:
            ligne = self.lire()

            if self._traiter_si_async(ligne):
                continue

            # Vraie réponse à une commande : on libère un slot.
            self.slots_disponibles = min(self.slots_disponibles + 1, self.MAX_SLOTS)
            if self.file_commandes:
                self.file_commandes.popleft()
            return ligne

    def commandes_en_attente(self):
        """Nombre de commandes envoyées en attente de réponse"""
        return len(self.file_commandes)

    def peut_envoyer(self):
        """Vrai s'il reste de la place dans le tampon serveur"""
        return self.slots_disponibles > 0

    # ------------------------------------------------------------------ messages asynchrones

    def _traiter_si_async(self, ligne):
        """Traite une ligne si c'est un message asynchrone du serveur.

        Retourne True si la ligne a été consommée comme message asynchrone,
        False si c'est une réponse à une commande.
        """
        if ligne == "dead":
            self.est_mort = True
            raise JoueurMortException("Le joueur est mort")

        if self.est_broadcast(ligne):
            self.messages_async.append(("broadcast", self.parse_broadcast(ligne)))
            return True

        if self.est_eject(ligne):
            self.messages_async.append(("eject", self.parse_eject(ligne)))
            return True

        return False

    def relever_messages_async(self, timeout=0.0):
        """Lit (sans bloquer par défaut) les messages asynchrones en attente
        sur la socket et renvoie la liste de ceux accumulés, puis vide le buffer.

        Permet au cerveau de réagir aux broadcasts/ejects hors d'une attente de
        réponse. timeout=0 -> non bloquant ; >0 -> attend au plus ce délai.
        Lève JoueurMortException si un 'dead' est reçu.
        """
        # Attente optionnelle de la première donnée (le buffer peut déjà en
        # contenir suite à une lecture précédente).
        if timeout > 0 and b"\n" not in self._buf:
            select.select([self.tel], [], [], timeout)

        while True:
            ligne = self._lire_ligne(bloquant=False)
            if ligne is None:
                break
            if not self._traiter_si_async(ligne):
                # Réponse de commande arrivée pendant le poll : on libère un slot
                # et on l'expose au cerveau, taguée comme "reponse".
                self.slots_disponibles = min(
                    self.slots_disponibles + 1, self.MAX_SLOTS
                )
                if self.file_commandes:
                    self.file_commandes.popleft()
                self.messages_async.append(("reponse", ligne))

        messages = list(self.messages_async)
        self.messages_async.clear()
        return messages

    # ------------------------------------------------------------------ parsing

    # [food 345, linemate 2, sibur 3]
    def parser_inventaire(self, reponse):
        contenu = self._contenu_crochets(reponse)
        inventaire = {}
        if not contenu:
            return inventaire
        try:
            for item in contenu.split(","):
                morceaux = item.split()
                if len(morceaux) != 2:
                    raise ReseauException(f"Item d'inventaire invalide : {item!r}")
                inventaire[morceaux[0]] = int(morceaux[1])
        except ValueError as e:
            raise ReseauException(f"Inventaire illisible : {reponse!r} ({e})")
        return inventaire

    def parse_vision(self, reponse):
        contenu = self._contenu_crochets(reponse)
        # Chaque case est séparée par ',' ; une case vide -> liste vide.
        return [case.split() for case in contenu.split(",")]

    def parse_broadcast(self, reponse):
        """Parse un message broadcast: 'message K, texte'
        Retourne (direction, texte) où direction est l'entier K (0-8)
        0 = origine inconnue ou du joueur lui-même
        1-8 = direction du son par rapport au joueur
        """
        if not self.est_broadcast(reponse):
            raise ValueError(f"Format de broadcast invalide : {reponse}")

        contenu = reponse[len("message "):]
        if ", " in contenu:
            direction_str, texte = contenu.split(", ", 1)
        else:
            direction_str, texte = contenu, ""

        try:
            direction = int(direction_str)
        except ValueError:
            raise ValueError(f"Direction de broadcast invalide : {reponse}")
        return (direction, texte)

    def parse_eject(self, reponse):
        """Parse un message d'éjection : 'eject: K'. Retourne la direction K."""
        if not self.est_eject(reponse):
            raise ValueError(f"Format d'eject invalide : {reponse}")
        try:
            return int(reponse[len("eject:"):].strip())
        except ValueError:
            raise ValueError(f"Direction d'eject invalide : {reponse}")

    def _contenu_crochets(self, reponse):
        """Retourne le contenu entre crochets, en validant le format."""
        ligne = reponse.strip()
        if not (ligne.startswith("[") and ligne.endswith("]")):
            raise ReseauException(f"Réponse sans crochets : {reponse!r}")
        return ligne[1:-1].strip()

    def est_broadcast(self, reponse):
        """Vérifie si une réponse est un message broadcast"""
        return reponse.startswith("message ")

    def est_eject(self, reponse):
        """Vérifie si une réponse est une éjection"""
        return reponse.startswith("eject:")

    def est_vivant(self):
        """Vérifie si le joueur est encore en vie"""
        return not self.est_mort

    # ------------------------------------------------------------------ fermeture

    def fermer(self):
        try:
            if self.tel:
                self.tel.close()
        except Exception:
            pass


if __name__ == "__main__":
    try:
        r = Reseau("127.0.0.1", 4242, "team1")
        print("Places restantes :", r.places)
        print("Taille de la carte :", r.taille)
        print(f"Joueur vivant : {r.est_vivant()}")

        # Test de la file d'attente
        print(f"\nSlots disponibles : {r.slots_disponibles}")

        r.envoyer_commande("Forward")
        print(
            f"Après Forward - slots : {r.slots_disponibles}, en attente : {r.commandes_en_attente()}"
        )

        r.envoyer_commande("Look")
        print(
            f"Après Look - slots : {r.slots_disponibles}, en attente : {r.commandes_en_attente()}"
        )

        # Réception des réponses
        print("\nRéponse Forward :", r.recevoir_reponse())
        print(
            f"Après réception - slots : {r.slots_disponibles}, en attente : {r.commandes_en_attente()}"
        )

        print("Réponse Look :", r.recevoir_reponse())
        print(
            f"Après réception - slots : {r.slots_disponibles}, en attente : {r.commandes_en_attente()}"
        )

        # Test du parsing de broadcast
        print("\n--- Test parsing broadcast ---")
        test_broadcasts = [
            "message 0, salut",
            "message 3, besoin aide niveau 2",
            "message 5, ",
            "message 1, linemate trouvée en 10,5",
        ]

        for msg in test_broadcasts:
            if r.est_broadcast(msg):
                direction, texte = r.parse_broadcast(msg)
                print(f"'{msg}' -> direction={direction}, texte='{texte}'")

        # Messages asynchrones éventuellement reçus pendant la session
        print("\n--- Messages asynchrones ---")
        print(r.relever_messages_async())

        r.fermer()
    except JoueurMortException as e:
        print(f"Le joueur est mort : {e}", file=sys.stderr)
        sys.exit(2)
    except ReseauException as e:
        print(f"Erreur réseau : {e}", file=sys.stderr)
        sys.exit(1)
