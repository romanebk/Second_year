# Documentation — `cerveau.py`

**Auteur · Logique de base :** Helena  
**Extension coordination multi-joueurs :** Fresnel  
**Rôle :** Machine à états — toute la logique de décision du drone

---

## Vue d'ensemble

`Brain` est le **chef d'orchestre** de l'IA. Il lit l'état du `Player`, décide quoi faire (via `arbitrate()`), puis exécute l'action correspondante en envoyant des commandes via l'objet `network`. Il ne manipule jamais le socket directement.

---

## Classe `Brain`

### Initialisation

```python
from cerveau import Brain
from player import Player

brain = Brain(network=reseau, player=player, spawn_callback=None)
brain.run()
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `network` | objet réseau | Interface vers le serveur (send / receive) |
| `player` | `Player` | Modèle de données du drone |
| `spawn_callback` | callable | Appelé après un Fork réussi pour spawner un nouveau processus |

---

## États (machine à états)

```python
class State(Enum):
    SURVIVE    # Chercher de la nourriture — priorité absolue
    COLLECT    # Ramasser les gemmes manquantes pour l'incantation
    ELEVATE    # Incantation solo (niveau 1→2 : 1 seul joueur requis)
    RALLY      # Leader : poser les pierres, appeler du renfort, incanter
    JOIN       # Helper : converger vers le leader, attendre l'incantation
    REPRODUCE  # Pondre un œuf (Fork) pour agrandir l'équipe
    EXPLORE    # Déplacement aléatoire pondéré (fallback)
```

---

## Boucle principale — `run()`

```
┌─────────────────────────────┐
│         run()               │
│                             │
│  refresh_vision()           │ ← Look + mise à jour player.vision
│  refresh_inventory()        │ ← Inventory + mise à jour player.inventory
│  _consume_level_signal()    │ ← Montée de niveau reçue en async ?
│  process_broadcasts()       │ ← Écoute broadcasts entrants
│  arbitrate()                │ ← Choisit l'état
│  act()                      │ ← Exécute l'action
└─────────────────────────────┘
```

---

## Arbitrage — priorités

| Priorité | Condition | État choisi |
|----------|-----------|-------------|
| 1 | `food < HUNGER_CRITICAL (25)` | `SURVIVE` |
| 2 | En cours de JOIN (helper) | Conserve `JOIN` |
| 3 | Peut se reproduire (niveau ≤ 2, rassasié) | `REPRODUCE` |
| 4 | Toutes les pierres collectées → `can_elevate()` | `ELEVATE` ou `RALLY` |
| 5 | `food < FOOD_TARGET (60)` | `SURVIVE` |
| 6 | Ressources manquantes | `COLLECT` |
| 7 | Aucune condition | `EXPLORE` |

---

## Méthodes — Helena

### `survive()`
Cherche et ramasse de la nourriture.
1. Si nourriture sur la case 0 → `Take food` en boucle.
2. Si nourriture visible → déplacement + prise.
3. Sinon → `explore()`.

### `collect()`
Ramasse les gemmes manquantes pour le niveau suivant.
1. Ramasse opportunément la nourriture si présente.
2. Pour chaque ressource manquante : cherche dans la vision ou explore.

### `elevate_here()`
Incantation solo (niveau 1→2).
1. `ensure_stones_on_tile()` → dépose les pierres nécessaires.
2. `requirements_on_tile()` → vérifie que tout est au sol.
3. `incant()` → envoie `Incantation\n`.

### `explore()`
Déplacement aléatoire pondéré.
```python
random.choices(["Forward", "Left", "Right"], weights=[0.8, 0.1, 0.1])
```

### `find_resource_in_vision(resource: str) -> int`
Retourne l'index de la première case visible contenant `resource`, `-1` sinon.

### `refresh_vision()` / `refresh_inventory()`
Envoie `Look\n` / `Inventory\n` et met à jour `player`.

---

## Méthodes — Fresnel (coordination)

### `rally()`
Leader : pose les pierres, broadcast `"rally <niveau> <rang>"` périodiquement, incante dès que le quorum de joueurs est sur la case.

### `do_join()` / `hold_position()`
Helper : navigue vers la source du broadcast (`broadcast_vers_mouvements(K)`), puis attend en consommant de la nourriture sur place jusqu'à la montée de niveau.

### `process_broadcasts()`
Écoute les messages entrants. Si un `"rally <niveau>"` de même niveau est reçu, bascule en `JOIN` (avec élection par rang pour éviter les conflits leader/leader).

### `reproduce()`
Envoie `Fork\n`, appelle `spawn_callback()` pour connecter un nouveau drone.

---

## Constantes configurables

| Constante | Valeur | Rôle |
|-----------|--------|------|
| `HUNGER_CRITICAL` | 25 | Seuil de faim absolue |
| `FOOD_TARGET` | 60 | Stock de nourriture visé |
| `RALLY_TIMEOUT` | 25 s | Durée max d'attente d'un helper |
| `BROADCAST_PERIOD` | 0.4 s | Anti-spam des broadcasts |
| `MAX_FORKS` | 2 | Nombre d'œufs max par drone |

---

## Exemple d'usage

```python
from reseau import Reseau
from player import Player
from cerveau import Brain

r = Reseau("localhost", 4242, "team1")
slots, w, h = r.places, *r.taille
p = Player()
p.map_width, p.map_height = w, h

brain = Brain(network=r, player=p)
brain.run()
```
