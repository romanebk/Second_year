import time
import random
from enum import Enum

from player import Player
import navigation
import comm


class Role(Enum):
    LEADER = "leader"
    FARMER = "farmer"
    SCOUT = "scout"


class State(Enum):
    SURVIVE = "survive"      # se nourrir (urgence ou recharge)
    COLLECT = "collect"      # ramasser les pierres manquantes
    ELEVATE = "elevate"      # incantation solo (niveau 1->2 : 1 joueur)
    RALLY = "rally"          # leader : rassembler des coéquipiers et incanter
    JOIN = "join"            # helper : rejoindre un leader puis attendre l'incant
    REPRODUCE = "reproduce"  # pondre un œuf (Fork) pour agrandir l'équipe
    EXPLORE = "explore"      # déplacement aléatoire


class Brain:
    """Cerveau de l'IA.

    - Survie agressive (la famine était le 1er facteur de mort).
    - Coordination multi-joueurs pour les élévations >= niveau 2 :
      un leader (qui possède les pierres) reste sur place, émet "rally L rank"
      et attend assez de coéquipiers de même niveau ; les autres entendent le
      broadcast, se rapprochent de la source (direction K) puis, une fois sur
      la case, cessent d'émettre et attendent le "Current level: K".
    """

    HUNGER_CRITICAL = 25     # en dessous : tout lâcher pour manger
    FOOD_TARGET = 60         # niveau de nourriture visé avant de faire autre chose
    RALLY_TIMEOUT = 25.0     # durée max d'attente d'un helper avant d'abandonner
    BROADCAST_PERIOD = 0.4   # throttle des broadcasts de rassemblement (s)
    MAX_FORKS = 2            # œufs pondus par joueur (agrandit l'équipe pour les quorums)

    def __init__(self, network, player: Player, spawn_callback=None,
                 role=Role.SCOUT, team="zappy"):
        self.network = network
        self.player = player
        # Appelé après un Fork réussi : doit faire connecter un nouveau client
        # pour occuper l'œuf pondu (subprocess en jeu réel, thread en test).
        self.spawn_callback = spawn_callback
        self.role = role
        # Clé de chiffrement des broadcasts = nom d'équipe (secret partagé).
        self.team_key = team
        self.state = State.SURVIVE
        self.rank = random.random()          # jeton d'élection du leader
        self.forks_done = 0
        # bookkeeping helper
        self.join_dir = None
        self.join_arrived = False
        self.helper_deadline = 0.0
        self.last_broadcast = 0.0
        self.enemy_dir = None                # direction d'un broadcast ennemi à contrer

    # ------------------------------------------------------------------ boucle
    def run(self):
        while self.network.is_connected():
            # Un helper arrivé sur la case n'émet plus rien : il attend en
            # lecture pure le "Current level" (sinon il se ferait geler en
            # plein Look et se désynchroniserait).
            if self.state == State.JOIN and self.join_arrived:
                self.hold_position()
                continue

            self.refresh_vision()
            self.refresh_inventory()
            if self._consume_level_signal():
                continue              # on vient de monter de niveau (incant tierce)
            self.process_broadcasts()
            self.arbitrate()
            self.act()

    def _consume_level_signal(self) -> bool:
        """Applique une montée de niveau signalée par l'adaptateur (un
        'Current level: K' reçu dans n'importe quel contexte). Renvoie True si
        on a monté de niveau."""
        lvl = self.network.level_signal
        if lvl is None:
            return False
        self.network.level_signal = None
        if lvl > 0:
            self.player.level = lvl
        else:
            self.player.level += 1
        self._reset_helper()
        return True

    def arbitrate(self):
        food = self.player.inventory.get("food", 0)

        # Urgence vitale : prime sur tout, y compris un rassemblement en cours.
        if food < self.HUNGER_CRITICAL:
            self.state = State.SURVIVE
            return

        # Rôle helper décidé par un broadcast : on le conserve.
        if self.state == State.JOIN:
            return

        # Reproduction précoce : tant qu'on est bas niveau et rassasié, on
        # agrandit l'équipe (indispensable pour les quorums de 4 puis 6).
        if (self.spawn_callback and self.forks_done < self.MAX_FORKS
                and self.player.level <= 2 and food >= self.FOOD_TARGET):
            self.state = State.REPRODUCE
            return

        # --- Arbitrage spécialisé par rôle ---
        if self.role == Role.FARMER:
            self._arbitrate_farmer(food)
        elif self.role == Role.LEADER:
            self._arbitrate_leader(food)
        else:
            self._arbitrate_scout(food)

    def _arbitrate_farmer(self, food):
        # Le farmer est obsédé par la bouffe. Il collecte des pierres
        # seulement quand il est vraiment rassasié (food >= 80).
        if food < self.FOOD_TARGET + 20:
            self.state = State.SURVIVE
        elif self.player.can_elevate():
            req = self.player.ELEVATION_REQUIREMENTS.get(self.player.level, {}).get("players", 1)
            self.state = State.RALLY if req > 1 else State.ELEVATE
        elif sum(self.player.get_missing_resources().values()) > 0:
            self.state = State.COLLECT
        else:
            self.state = State.SURVIVE

    def _arbitrate_leader(self, food):
        # Le leader priorise l'élévation. Il collecte activement les pierres
        # et lance les rassemblements dès que possible.
        if self.player.can_elevate():
            req = self.player.ELEVATION_REQUIREMENTS.get(self.player.level, {}).get("players", 1)
            self.state = State.RALLY if req > 1 else State.ELEVATE
        elif food < self.FOOD_TARGET:
            self.state = State.SURVIVE
        elif sum(self.player.get_missing_resources().values()) > 0:
            self.state = State.COLLECT
        else:
            self.state = State.EXPLORE

    def _arbitrate_scout(self, food):
        # Le scout explore en priorité et broadcast les ressources rares
        # qu'il croise. Il collecte quand même si une pierre est à ses pieds.
        if self.player.can_elevate():
            req = self.player.ELEVATION_REQUIREMENTS.get(self.player.level, {}).get("players", 1)
            self.state = State.RALLY if req > 1 else State.ELEVATE
        elif food < self.FOOD_TARGET:
            self.state = State.SURVIVE
        elif sum(self.player.get_missing_resources().values()) > 0:
            self.state = State.COLLECT
        else:
            self.state = State.EXPLORE

    def act(self):
        if self.state == State.SURVIVE:
            self.survive()
        elif self.state == State.COLLECT:
            self.collect()
        elif self.state == State.ELEVATE:
            self.elevate_here()
        elif self.state == State.RALLY:
            self.rally()
        elif self.state == State.JOIN:
            self.do_join()
        elif self.state == State.REPRODUCE:
            self.reproduce()
        else:
            # En dernier recours (rien d'urgent à faire) : si on a repéré une
            # coordination ennemie, on va la perturber ; sinon on explore.
            if self.enemy_dir is not None:
                self.attack()
            elif self.role == Role.SCOUT:
                # Le scout broadcast les ressources rares qu'il voit en explorant.
                self.scout_explore()
            else:
                self.explore()

    def reproduce(self):
        """Pond un œuf (Fork) puis demande la connexion d'un nouveau client
        pour l'occuper. +1 joueur dans l'équipe."""
        self.network.send("Fork\n")
        reply = self.network.receive_response()
        if reply == "ok\n":
            self.forks_done += 1
            if self.spawn_callback:
                try:
                    self.spawn_callback()
                except Exception:
                    pass

    # ------------------------------------------------------------------ survie
    def survive(self):
        vision = self.player.vision
        # Manger tout ce qu'il y a sous les pieds.
        if vision and "food" in vision[0]:
            while self.player.vision and "food" in self.player.vision[0]:
                self.network.send("Take food\n")
                if self.network.receive_response() == "ok\n":
                    self.player.inventory["food"] += 1
                    self.player.vision[0].remove("food")
                else:
                    break
            return

        idx = self.find_resource_in_vision("food")
        if idx > 0:
            self.execute_moves(navigation.index_vers_mouvements(idx))
            self.refresh_vision()
            if self.player.vision and "food" in self.player.vision[0]:
                self.network.send("Take food\n")
                if self.network.receive_response() == "ok\n":
                    self.player.inventory["food"] += 1
        else:
            self.explore()

    # ------------------------------------------------------------------ collecte
    def collect(self):
        # On profite de la nourriture croisée en chemin.
        if self.player.vision and "food" in self.player.vision[0]:
            self.network.send("Take food\n")
            if self.network.receive_response() == "ok\n":
                self.player.inventory["food"] += 1
                self.player.vision[0].remove("food")
            return

        missing = self.player.get_missing_resources()
        for res in missing:
            if self.player.vision and res in self.player.vision[0]:
                self.network.send(f"Take {res}\n")
                if self.network.receive_response() == "ok\n":
                    self.player.inventory[res] += 1
                    self.player.vision[0].remove(res)
                return
            idx = self.find_resource_in_vision(res)
            if idx > 0:
                self.execute_moves(navigation.index_vers_mouvements(idx))
                return
        self.explore()

    # ------------------------------------------------------------------ élévation
    def elevate_here(self):
        """Incantation sur place (niveau dont l'exigence est de 1 joueur)."""
        self.ensure_stones_on_tile()
        if self.requirements_on_tile():
            self.incant()
        else:
            self.explore()

    def rally(self):
        """Leader : poser les pierres, appeler, et incanter quand le quorum
        de joueurs de même niveau est présent sur la case."""
        self.ensure_stones_on_tile()

        now = time.time()
        if now - self.last_broadcast >= self.BROADCAST_PERIOD:
            self.broadcast(f"rally {self.player.level} {self.rank:.4f}")
            self.last_broadcast = now

        present = self.player.vision[0].count("player") if self.player.vision else 1
        required = self.player.ELEVATION_REQUIREMENTS.get(self.player.level, {}).get("players", 1)
        if present >= required and self.requirements_on_tile():
            self.incant()
        # sinon : on reste sur place ; la survie reprend la main si on a faim.

    def incant(self):
        self.network.send("Incantation\n")
        reply = self.network.receive_response()
        if "Elevation underway" in reply:
            self.network.receive_response()            # "Current level: K" (~300/freq s)
            if self.network.level_signal is not None:
                self._consume_level_signal()
                return True
        # Fail-safe : incantation rollback. Si ko, les pierres sont au sol.
        # On les re-ramasse pour ne pas les perdre.
        self.recover_stones_from_tile()
        return False

    def recover_stones_from_tile(self):
        """Récupère les pierres posées au sol après un échec d'incantation."""
        self.refresh_vision()
        if not self.player.vision:
            return
        on_tile = self.player.vision[0]
        stones = ["linemate", "deraumere", "sibur", "mendiane", "phiras", "thystame"]
        for stone in stones:
            while stone in on_tile:
                self.network.send(f"Take {stone}\n")
                if self.network.receive_response() == "ok\n":
                    self.player.inventory[stone] = self.player.inventory.get(stone, 0) + 1
                    on_tile.remove(stone)
                else:
                    break

    def ensure_stones_on_tile(self):
        """Dépose depuis l'inventaire les pierres manquantes sur la case."""
        if not self.player.vision:
            return
        on_tile = self.player.vision[0]
        reqs = self.player.ELEVATION_REQUIREMENTS.get(self.player.level, {})
        for res, need in reqs.items():
            if res == "players":
                continue
            while on_tile.count(res) < need and self.player.inventory.get(res, 0) > 0:
                self.network.send(f"Set {res}\n")
                if self.network.receive_response() == "ok\n":
                    self.player.inventory[res] -= 1
                    on_tile.append(res)
                else:
                    break

    def requirements_on_tile(self) -> bool:
        if not self.player.vision:
            return False
        on_tile = self.player.vision[0]
        reqs = self.player.ELEVATION_REQUIREMENTS.get(self.player.level, {})
        for res, need in reqs.items():
            if res != "players" and on_tile.count(res) < need:
                return False
        return True

    # ------------------------------------------------------------------ helper
    def do_join(self):
        """Phase navigation du helper : se rapprocher d'un pas vers la source."""
        if time.time() > self.helper_deadline:
            self._reset_helper()
            return
        if self.join_dir is None:
            return                      # on attend le prochain broadcast de rally
        if self.join_dir == 0:
            self.join_arrived = True    # arrivé : la boucle passera en attente
            return
        self.execute_moves(navigation.broadcast_vers_mouvements(self.join_dir))
        self.join_dir = None            # consommé ; on réécoute au tour suivant

    def hold_position(self):
        """Sur la case du leader : on RESTE sur place et on continue de manger
        (sinon on meurt de faim avant que le quorum se forme), jusqu'à monter
        de niveau, jusqu'au timeout, ou jusqu'à ce que le leader bouge.

        Dès qu'une commande renvoie autre chose qu'une vision (gel par
        l'incantation), on bascule en attente pure du 'Current level'."""
        while time.time() < self.helper_deadline and self.network.is_connected():
            # Écoute passive : déplacement du leader (broadcast ré-orienté).
            for kind, payload in self.network.poll_messages(0):
                if kind == "broadcast":
                    k, texte = payload
                    if texte.startswith("rally"):
                        if k == 0:
                            self.helper_deadline = time.time() + self.RALLY_TIMEOUT
                        else:
                            self.join_dir = k
                            self.join_arrived = False
                            return

            # Manger sur place pour survivre à l'attente (lecture brute : on ne
            # peut jamais perdre un 'Current level').
            self.network.send("Look\n")
            raw = self.network.receive_response()
            if self._consume_level_signal():
                return
            if not raw.startswith("["):
                # "ko" : gelé par l'incantation, on n'émet plus rien.
                self._await_level_up()
                return
            tiles = navigation.decouper_cases(raw.strip())
            while tiles and "food" in tiles[0]:
                self.network.send("Take food\n")
                self.network.receive_response()
                if self._consume_level_signal():
                    return
                tiles[0].remove("food")
        self._reset_helper()

    def _await_level_up(self):
        """Phase gelée : aucune émission, on lit jusqu'au 'Current level: K'."""
        deadline = time.time() + self.RALLY_TIMEOUT
        while time.time() < deadline and self.network.is_connected():
            for kind, payload in self.network.poll_messages(0.5):
                if kind == "reponse" and "Current level" in str(payload):
                    self._set_level_from(payload)
                    self._reset_helper()
                    return
        self._reset_helper()

    def _reset_helper(self):
        self.join_dir = None
        self.join_arrived = False
        self.state = State.SURVIVE

    def _set_level_from(self, ligne):
        try:
            self.player.level = int(str(ligne).split(":")[1])
        except (ValueError, IndexError):
            self.player.level += 1

    # ------------------------------------------------------------------ broadcasts
    def process_broadcasts(self):
        """Consomme les broadcasts entrants. Chaque message est déchiffré avec
        notre clé d'équipe : s'il est illisible, c'est une équipe ADVERSE -> on
        retient sa direction pour la contrer (Eject). Sinon on traite notre
        propre coordination (rally...)."""
        for kind, payload in self.network.poll_messages(0):
            if kind != "broadcast":
                continue
            k, texte = payload
            clair = comm.decode(texte, self.team_key)
            if clair is None:
                # Broadcast d'une autre équipe (indéchiffrable) : on le note
                # comme cible d'attaque, sans le laisser perturber notre logique.
                if k != 0:
                    self.enemy_dir = k
                continue
            parts = clair.split()
            if len(parts) < 2 or parts[0] != "rally":
                continue
            try:
                lvl = int(parts[1])
                other_rank = float(parts[2]) if len(parts) > 2 else 1.0
            except ValueError:
                continue
            if lvl != self.player.level:
                continue
            # Élection : si je suis déjà leader et que l'autre est plus faible,
            # je l'ignore (c'est à lui de venir). Sinon je deviens helper.
            if self.state == State.RALLY and other_rank <= self.rank:
                continue
            self.state = State.JOIN
            self.join_dir = k
            self.join_arrived = (k == 0)
            self.helper_deadline = time.time() + self.RALLY_TIMEOUT

    def broadcast(self, message: str):
        """Émet un message de coordination CHIFFRÉ (seule notre équipe le lit)."""
        chiffre = comm.encode(message, self.team_key)
        self.network.send(f"Broadcast {chiffre}\n")
        self.network.receive_response()

    def attack(self):
        """Contre-mesure : on a entendu une coordination ENNEMIE (broadcast
        indéchiffrable). On se rapproche de la source et, une fois sur sa case,
        on Eject pour disperser son rassemblement / gêner son incantation."""
        k = self.enemy_dir
        self.enemy_dir = None                # consommé ; on réécoutera ensuite
        if k is None:
            return
        if k == 0:                           # sur la case ennemie : on éjecte
            self.network.send("Eject\n")
            self.network.receive_response()
        else:                                # sinon : un pas vers la source
            self.execute_moves(navigation.broadcast_vers_mouvements(k))

    # ------------------------------------------------------------------ I/O
    def explore(self):
        action = random.choices(["Forward", "Left", "Right"], weights=[0.8, 0.1, 0.1])[0]
        self.network.send(action + "\n")
        self.network.receive_response()

    def scout_explore(self):
        """Le scout explore et broadcast les ressources rares qu'il voit."""
        rare_stones = ["thystame", "phiras", "mendiane", "sibur", "deraumere"]
        if self.player.vision:
            for stone in rare_stones:
                idx = self.find_resource_in_vision(stone)
                if idx >= 0:
                    now = time.time()
                    if now - self.last_broadcast >= self.BROADCAST_PERIOD:
                        self.broadcast(f"found {stone} {self.player.level}")
                        self.last_broadcast = now
                    break
        self.explore()

    def execute_moves(self, moves):
        for mouvement in moves:
            # Fail-safe : anti-starvation guard.
            # Si on n'a plus de nourriture en plein déplacement, on arrête
            # tout et on mange ce qu'on trouve sur place.
            if self.player.inventory.get("food", 0) <= 1:
                self.emergency_eat()
                return
            self.network.send(mouvement + "\n")
            self.network.receive_response()

    def emergency_eat(self):
        """Manger de la nourriture d'urgence sur la case actuelle."""
        self.refresh_vision()
        if self.player.vision and "food" in self.player.vision[0]:
            while self.player.vision and "food" in self.player.vision[0]:
                self.network.send("Take food\n")
                if self.network.receive_response() == "ok\n":
                    self.player.inventory["food"] += 1
                    self.player.vision[0].remove("food")
                else:
                    break
        # Force la survie au prochain tour de boucle.
        self.state = State.SURVIVE

    def refresh_vision(self):
        self.network.send("Look\n")
        look = self.network.receive_response(is_look=True)
        if look is not None:                 # None = gelé (incantation) -> on garde
            self.player.update_vision(look)

    def refresh_inventory(self):
        self.network.send("Inventory\n")
        inv = self.network.receive_response(is_inventory=True)
        if inv is not None:
            self.player.update_inventory(inv)

    def find_resource_in_vision(self, resource: str) -> int:
        for i, tile_content in enumerate(self.player.vision):
            if resource in tile_content:
                return i
        return -1
