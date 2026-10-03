#!/usr/bin/env python3
# navigation.py - perception et déplacement
#
# Couche située ENTRE la tuyauterie (reseau.py) et le cerveau :
#   - comprendre ce que le joueur voit (Look)
#   - traduire "va à telle case" en Forward/Left/Right
#   - se diriger vers l'émetteur d'un broadcast (direction K)
#   - gérer la reproduction (Fork) et le remplissage des nouveaux slots
#
# La géométrie est exprimée dans le repère DU JOUEUR :
#   - "devant" = +dy (le joueur regarde vers les dy croissants)
#   - "droite" = +dx
# Le joueur ne connaît jamais son orientation absolue : tout est relatif à lui.

import math
import os
import subprocess
import sys

# ──────────────────────────────────────────────────────────────────────────
# 1. PARSING AVANCÉ DU LOOK
# ──────────────────────────────────────────────────────────────────────────
#
# Le serveur renvoie une liste plate de cases :
#   [player, , linemate, food sibur, ...]
# Les cases sont rangées rangée par rangée, en partant de la case du joueur :
#
#        rangée 2 :  4  5  6  7  8        (5 cases)
#        rangée 1 :     1  2  3           (3 cases)
#        rangée 0 :        0              (1 case : le joueur)   ↑ il regarde par là
#
# La rangée r contient (2r+1) cases. La case d'indice i appartient donc à la
# rangée r = floor(sqrt(i)). "Parsing avancé" = associer à chaque case sa
# position (dx, dy) dans le repère du joueur, pour que le cerveau sache OÙ se
# trouve chaque objet.


def index_vers_position(i):
    """Convertit un indice de case du Look en position relative (dx, dy).

    dy = nombre de cases DEVANT le joueur (la rangée).
    dx = décalage latéral : négatif = gauche, 0 = pile devant, positif = droite.

    Exemples (niveau 1) :
        0 -> (0, 0)   la case du joueur
        1 -> (-1, 1)  devant-gauche
        2 -> (0, 1)   pile devant
        3 -> (1, 1)   devant-droite
    """
    rangee = math.isqrt(i)            # plus grand r tel que r*r <= i
    position_dans_rangee = i - rangee * rangee   # 0 .. 2*rangee
    dx = position_dans_rangee - rangee           # centre de la rangée = pile devant
    dy = rangee
    return (dx, dy)


def decouper_cases(reponse):
    """Découpe la string brute du Look en liste de cases (liste d'objets).

    '[player, , food sibur]' -> [['player'], [], ['food', 'sibur']]
    Le séparateur de cases est la virgule (avec ou sans espace) ; les objets
    d'une même case sont séparés par des espaces.
    """
    ligne = reponse.strip()
    if not (ligne.startswith("[") and ligne.endswith("]")):
        raise ValueError(f"Réponse Look invalide : {reponse!r}")
    contenu = ligne[1:-1]
    return [case.split() for case in contenu.split(",")]


def parser_look(reponse):
    """Transforme la string brute du Look en tableau enrichi case par case.

    Retourne une liste de dictionnaires :
        {"index": i, "rel": (dx, dy), "objets": ["food", ...]}
    """
    cases = decouper_cases(reponse)
    resultat = []
    for i, objets in enumerate(cases):
        resultat.append({"index": i, "rel": index_vers_position(i), "objets": objets})
    return resultat


def cases_contenant(cases, objet):
    """Retourne les cases (du résultat de parser_look) qui contiennent un objet.

    Pratique pour le cerveau : cases_contenant(vue, 'linemate') -> où aller.
    """
    return [case for case in cases if objet in case["objets"]]


# ──────────────────────────────────────────────────────────────────────────
# 2. NAVIGATION : (dx, dy) ou indice de case -> mouvements
# ──────────────────────────────────────────────────────────────────────────
#
# On ne dispose que de trois ordres : Forward (avancer d'une case), Left et
# Right (pivoter de 90° sur place). Pour atteindre une case (dx, dy) :
#   1. avancer dy fois (on reste aligné, dx ne change pas) ;
#   2. pivoter vers le côté voulu, puis avancer |dx| fois.
# L'orientation finale n'est pas garantie : le cerveau refait un Look ensuite.


def position_vers_mouvements(dx, dy):
    """Traduit une position relative (dx, dy) en séquence de mouvements."""
    mouvements = ["Forward"] * dy
    if dx > 0:
        mouvements.append("Right")
        mouvements += ["Forward"] * dx
    elif dx < 0:
        mouvements.append("Left")
        mouvements += ["Forward"] * (-dx)
    return mouvements


def index_vers_mouvements(i):
    """Traduit un indice de case du Look en séquence de mouvements pour y aller."""
    dx, dy = index_vers_position(i)
    return position_vers_mouvements(dx, dy)


# ──────────────────────────────────────────────────────────────────────────
# 3. DIRECTION D'UN BROADCAST (K) -> mouvements pour rejoindre l'émetteur
# ──────────────────────────────────────────────────────────────────────────
#
# K (0..8) indique d'où VIENT le son, donc où est l'émetteur, dans le repère
# du joueur. K=1 = devant, puis sens trigonométrique (anti-horaire) :
#
#        2   1   8
#        3   P   7
#        4   5   6
#
# Stratégie : on ne fait qu'UN PAS vers la source, puis on réécoute. Comme le
# monde est sphérique (toroïdal) et que le serveur choisit le chemin le plus
# court, ce rapprochement itératif finit par donner K=0 (on est arrivé).

MOUVEMENTS_BROADCAST = {
    0: [],                              # déjà sur la case de l'émetteur
    1: ["Forward"],                     # devant
    2: ["Forward"],                     # devant-gauche : avancer rapproche
    3: ["Left", "Forward"],             # gauche
    4: ["Left", "Forward"],             # arrière-gauche
    5: ["Left", "Left", "Forward"],     # derrière : demi-tour
    6: ["Right", "Forward"],            # arrière-droite
    7: ["Right", "Forward"],            # droite
    8: ["Forward"],                     # devant-droite
}


def broadcast_vers_mouvements(k):
    """Retourne la séquence de mouvements pour se rapprocher de l'émetteur."""
    if k not in MOUVEMENTS_BROADCAST:
        raise ValueError(f"Direction de broadcast invalide : {k}")
    return list(MOUVEMENTS_BROADCAST[k])


# ──────────────────────────────────────────────────────────────────────────
# 4. REPRODUCTION (Fork) ET REMPLISSAGE DES SLOTS
# ──────────────────────────────────────────────────────────────────────────
#
# Fork pond un œuf -> un nouveau slot s'ouvre dans l'équipe. Pour que ce slot
# serve, il faut qu'un NOUVEAU client s'y connecte : dans Zappy, un joueur =
# un client = un processus. On lance donc un nouveau processus zappy_ai.
#
# NB : forker()/connexions_disponibles() envoient une commande PUIS lisent la
# réponse ; à n'utiliser que si aucune autre commande n'est déjà en attente
# (les réponses arrivent dans l'ordre — FIFO).


def connexions_disponibles(reseau):
    """Envoie Connect_nbr et renvoie le nombre de slots libres dans l'équipe."""
    reseau.envoyer_commande("Connect_nbr")
    return int(reseau.recevoir_reponse())


def forker(reseau):
    """Envoie Fork (pond un œuf) et renvoie True si le serveur a répondu 'ok'."""
    reseau.envoyer_commande("Fork")
    return reseau.recevoir_reponse() == "ok"


def lancer_nouveau_client(host, port, team, script=None):
    """Lance un nouveau client IA (processus) pour occuper un slot libre.

    Retourne l'objet subprocess.Popen (le cerveau peut le suivre/arrêter).
    """
    if script is None:
        script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "zappy_ai.py")
    return subprocess.Popen(
        [sys.executable, script, "-p", str(port), "-n", team, "-h", host]
    )


# ──────────────────────────────────────────────────────────────────────────
# 5. NAVIGATEUR : exécute réellement les déplacements via le réseau
# ──────────────────────────────────────────────────────────────────────────


class Navigateur:
    """Couche d'exécution : envoie les mouvements au serveur via un Reseau,
    en respectant le tampon de 10 commandes."""

    def __init__(self, reseau):
        self.reseau = reseau

    def executer(self, mouvements):
        """Envoie une séquence de mouvements et consomme toutes les réponses.

        Gère le tampon de 10 : si plein, on lit une réponse avant d'envoyer.
        """
        for cmd in mouvements:
            while not self.reseau.peut_envoyer():
                self.reseau.recevoir_reponse()
            self.reseau.envoyer_commande(cmd)
        while self.reseau.commandes_en_attente() > 0:
            self.reseau.recevoir_reponse()

    def regarder(self):
        """Fait un Look et renvoie la vue enrichie (cf. parser_look)."""
        self.reseau.envoyer_commande("Look")
        return parser_look(self.reseau.recevoir_reponse())

    def aller_a_case(self, index):
        """Se déplace jusqu'à la case d'indice 'index' du dernier Look."""
        self.executer(index_vers_mouvements(index))

    def aller_vers_broadcast(self, k):
        """Fait un pas vers l'émetteur d'un broadcast (direction K)."""
        self.executer(broadcast_vers_mouvements(k))


if __name__ == "__main__":
    # Démonstration des fonctions pures (sans serveur).
    print("Look :", parser_look("[player, player deraumere,, linemate]"))
    print("Case 5 ->", index_vers_position(5), "mouvements:", index_vers_mouvements(5))
    for k in range(9):
        print(f"Broadcast K={k} -> {broadcast_vers_mouvements(k)}")
