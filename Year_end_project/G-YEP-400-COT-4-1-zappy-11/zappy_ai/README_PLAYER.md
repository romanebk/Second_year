# Documentation — `player.py`

**Auteur :** Helena  
**Rôle :** Modèle de données du drone Trantorien

---

## Vue d'ensemble

`Player` est le **modèle de données** du projet. Il stocke tout ce que le drone sait sur lui-même à un instant donné : son inventaire, sa vision, son niveau. Le cerveau (`Brain`) ne fait que lire et écrire dans cet objet — il ne contient aucune logique de décision.

---

## Classe `Player`

### Initialisation

```python
from player import Player

player = Player()
```

### Attributs

| Attribut | Type | Description |
|----------|------|-------------|
| `level` | `int` | Niveau actuel (1 à 7) |
| `inventory` | `dict` | Ressources en possession |
| `vision` | `list[list[str]]` | Cases visibles (tableau de tableaux) |
| `map_width` | `int` | Largeur de la carte (fournie au handshake) |
| `map_height` | `int` | Hauteur de la carte (fournie au handshake) |
| `team_slots` | `int` | Slots restants dans l'équipe |

### Inventaire

```python
# Format initial
player.inventory = {
    "food":      10,
    "linemate":   0,
    "deraumere":  0,
    "sibur":      0,
    "mendiane":   0,
    "phiras":     0,
    "thystame":   0,
}
```

### Vision

```python
# Format après update_vision()
player.vision = [
    ["player", "food"],   # index 0 : case du joueur
    ["linemate"],          # index 1
    [],                    # index 2
    ["sibur", "food"],     # index 3
]
```

---

## Méthodes

### `update_inventory(parsed_inventory: dict)`
Met à jour l'inventaire depuis les données brutes parsées du serveur.

```python
player.update_inventory({"food": 34, "linemate": 2, "sibur": 0, ...})
```

### `update_vision(parsed_vision: list)`
Remplace la vision actuelle par la liste de cases fournie.

```python
player.update_vision([["player", "food"], ["linemate"], []])
```

### `is_hungry(threshold: int = 15) -> bool`
Retourne `True` si la nourriture est inférieure au seuil critique.

```python
if player.is_hungry():
    # Passer en mode SURVIVE
```

### `can_elevate() -> bool`
Retourne `True` si l'inventaire contient toutes les gemmes nécessaires pour la prochaine incantation.

```python
if player.can_elevate():
    # Passer en mode ELEVATE ou RALLY
```

### `get_missing_resources() -> dict`
Retourne un dictionnaire des ressources manquantes pour le niveau suivant.

```python
missing = player.get_missing_resources()
# Exemple : {"linemate": 1, "sibur": 2}
```

---

## Constante `ELEVATION_REQUIREMENTS`

Définit les prérequis pour chaque incantation :

```python
Player.ELEVATION_REQUIREMENTS = {
    1: {"players": 1, "linemate": 1, ...},   # 1→2
    2: {"players": 2, "linemate": 1, ...},   # 2→3
    ...
    7: {"players": 6, "linemate": 2, ..., "thystame": 1},  # 7→8
}
```

---

## Notes de conception

- `Player` ne contient **aucune logique métier** : pas de décision, pas d'envoi réseau.
- Les mises à jour (`update_*`) sont appelées exclusivement par le `Brain` après chaque commande réseau.
- La vision est une **liste mutable** : le `Brain` peut retirer les objets ramassés directement (`vision[0].remove("food")`) pour éviter un `Look` réseau.
