from enum import Enum

class Direction(Enum):
    NORTH = 0
    EAST = 1
    SOUTH = 2
    WEST = 3

class Player:
    ELEVATION_REQUIREMENTS = {
        1: {"players": 1, "linemate": 1, "deraumere": 0, "sibur": 0, "mendiane": 0, "phiras": 0, "thystame": 0},
        2: {"players": 2, "linemate": 1, "deraumere": 1, "sibur": 1, "mendiane": 0, "phiras": 0, "thystame": 0},
        3: {"players": 2, "linemate": 2, "deraumere": 0, "sibur": 1, "mendiane": 0, "phiras": 2, "thystame": 0},
        4: {"players": 4, "linemate": 1, "deraumere": 1, "sibur": 2, "mendiane": 0, "phiras": 1, "thystame": 0},
        5: {"players": 4, "linemate": 1, "deraumere": 2, "sibur": 1, "mendiane": 3, "phiras": 0, "thystame": 0},
        6: {"players": 6, "linemate": 1, "deraumere": 2, "sibur": 3, "mendiane": 0, "phiras": 1, "thystame": 0},
        7: {"players": 6, "linemate": 2, "deraumere": 2, "sibur": 2, "mendiane": 2, "phiras": 2, "thystame": 1},
    }

    def __init__(self):
        self.level = 1
        self.direction = Direction.NORTH
        self.inventory = {
            "food": 10,
            "linemate": 0,
            "deraumere": 0,
            "sibur": 0,
            "mendiane": 0,
            "phiras": 0,
            "thystame": 0,
        }
        self.vision = []
        self.map_width = 0
        self.map_height = 0
        self.team_slots = 0
        # Compteur local de ticks écoulés depuis le dernier inventaire absolu.
        self.tick_counter = 0

    def add_ticks(self, ticks: int):
        """Incrémente le compteur local de ticks (cache prédictif entre deux
        Inventory absolus)."""
        self.tick_counter += ticks

    def update_inventory(self, parsed_inventory: dict):
        self.inventory.update(parsed_inventory)
        # Reset local tick counter since we have fresh absolute data
        self.tick_counter = 0

    def update_vision(self, parsed_vision: list):
        self.vision = parsed_vision

    def is_hungry(self, threshold: int = 15) -> bool:
        return self.inventory["food"] < threshold

    def can_elevate(self) -> bool:
        req = self.ELEVATION_REQUIREMENTS.get(self.level, {})
        return all(self.inventory.get(k, 0) >= req[k] for k in req if k != "players")

    def get_missing_resources(self) -> dict:
        empty = {}
        req = self.ELEVATION_REQUIREMENTS.get(self.level, {})
        for k, amount in req.items():
            if k == "players": continue
            missing = amount - self.inventory.get(k, 0)
            if missing > 0:
                empty[k] = missing
        return empty
