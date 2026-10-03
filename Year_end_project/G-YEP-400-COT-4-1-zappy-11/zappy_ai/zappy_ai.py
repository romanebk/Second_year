#!/usr/bin/env python3
# zappy_ai.py - point d'entrée du client IA
# USAGE: ./zappy_ai -p port -n name -h machine

import sys

from reseau import JoueurMortException, Reseau, ReseauException
from adaptateur import AdaptateurCerveau
from player import Player
from cerveau import Brain, Role
import navigation

USAGE = "USAGE: ./zappy_ai -p port -n name -h machine\n" \
        "\t-p port\t\tnuméro de port\n" \
        "\t-n name\t\tnom de l'équipe\n" \
        "\t-h machine\tnom de la machine (localhost par défaut)"


def parser_arguments(argv):
    """Parse les arguments façon sujet : -p port -n name -h machine.

    -h désigne la machine (pas l'aide), comme imposé par le sujet.
    Retourne (host, port, team). Lève ValueError si les arguments sont
    invalides ou incomplets.
    """
    host = "localhost"
    port = None
    team = None

    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == "--help":
            raise ValueError("help")
        if i + 1 >= len(argv):
            raise ValueError(f"argument manquant après {arg}")
        valeur = argv[i + 1]
        if arg == "-p":
            try:
                port = int(valeur)
            except ValueError:
                raise ValueError(f"port invalide : {valeur!r}")
        elif arg == "-n":
            team = valeur
        elif arg == "-h":
            host = valeur
        else:
            raise ValueError(f"argument inconnu : {arg!r}")
        i += 2

    if port is None or port <= 0:
        raise ValueError("port manquant ou invalide")
    if not team:
        raise ValueError("nom d'équipe manquant")
    return host, port, team


def main(argv):
    try:
        host, port, team = parser_arguments(argv)
    except ValueError as e:
        if str(e) != "help":
            print(f"Erreur : {e}", file=sys.stderr)
        print(USAGE, file=sys.stderr)
        return 84

    try:
        reseau = Reseau(host, port, team)
    except ReseauException as e:
        print(f"Erreur réseau : {e}", file=sys.stderr)
        return 84

    print(f"Connecté à {host}:{port} (équipe '{team}')")
    print(f"Places restantes : {reseau.places}")
    print(f"Taille de la carte : {reseau.taille[0]}x{reseau.taille[1]}")

    try:
        # ── Point d'intégration du cerveau (partie binôme) ─────────────────
        # On présente au cerveau l'interface qu'il attend via l'adaptateur,
        # branché sur le vrai réseau, puis on lance sa boucle de décision.
        network = AdaptateurCerveau(reseau)
        slots, largeur, hauteur = network.connect()

        player = Player()
        player.team_slots = slots
        player.map_width = largeur
        player.map_height = hauteur

        # --- Attribution du rôle en fonction de l'ordre de connexion ---
        # slots = places restantes AVANT notre connexion.
        # Le 1er connecté voit le max de slots -> Leader.
        # Les 2 suivants -> Farmers. Le reste -> Scouts.
        total_slots = reseau.places
        if total_slots >= 5:
            role = Role.LEADER
        elif total_slots >= 3:
            role = Role.FARMER
        else:
            role = Role.SCOUT

        print(f"Rôle assigné : {role.value}")

        # Après un Fork, on lance un nouveau client pour occuper l'œuf pondu.
        def spawn():
            navigation.lancer_nouveau_client(host, port, team)

        Brain(network, player, spawn_callback=spawn, role=role, team=team).run()
    except JoueurMortException:
        print("Le joueur est mort.", file=sys.stderr)
        return 0
    except ReseauException as e:
        print(f"Erreur réseau : {e}", file=sys.stderr)
        return 84
    except KeyboardInterrupt:
        pass
    finally:
        reseau.fermer()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
