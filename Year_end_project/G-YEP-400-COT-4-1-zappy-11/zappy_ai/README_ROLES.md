# Documentation — Système de Rôles Spécialisés (Bonus)

**Auteur :** Helena  
**Statut :** Bonus — Fonctionnalité d'optimisation stratégique

---

## Problème

Sans rôles, tous les drones font exactement la même chose : survive → collect → elevate → explore. Résultat : ils se marchent tous dessus pour les mêmes ressources, personne ne garde assez de nourriture en réserve, et les rassemblements d'élévation sont lents et chaotiques.

---

## Solution : Trois rôles spécialisés

Chaque drone se voit attribuer un rôle **au moment de sa connexion** au serveur, en fonction du nombre de slots restants dans l'équipe. Le premier connecté est le Leader, les suivants sont des Farmers, et le reste sont des Scouts.

### Attribution automatique

```python
# zappy_ai.py — attribution au spawn
total_slots = reseau.places
if total_slots >= 5:       # 1er connecté
    role = Role.LEADER
elif total_slots >= 3:     # 2e et 3e connectés
    role = Role.FARMER
else:                      # tous les suivants
    role = Role.SCOUT
```

> Les seuils sont calibrés pour une équipe de 6 joueurs (`-c 6`).  
> `reseau.places` retourne les slots restants après le handshake : plus il y en a, plus on est arrivé tôt.

---

## Comportement par rôle

### Leader (`Role.LEADER`)

| Priorité | Comportement |
|----------|-------------|
| 1 | Urgence faim (food < 25) → `SURVIVE` |
| 2 | Pierres complètes → `ELEVATE` ou `RALLY` (lance l'incantation en premier) |
| 3 | Nourriture insuffisante → `SURVIVE` |
| 4 | Pierres manquantes → `COLLECT` |
| 5 | Sinon → `EXPLORE` |

**Stratégie :** Le Leader priorise l'élévation au-dessus de tout. Dès qu'il a les pierres nécessaires, il se met en position de `RALLY` et appelle les autres. Il ne perd pas de temps à accumuler de la nourriture au-delà du minimum.

---

### Farmer (`Role.FARMER`)

| Priorité | Comportement |
|----------|-------------|
| 1 | Urgence faim (food < 25) → `SURVIVE` |
| 2 | Nourriture < 80 → `SURVIVE` (seuil élevé : `FOOD_TARGET + 20`) |
| 3 | Pierres complètes → `ELEVATE` ou `RALLY` |
| 4 | Pierres manquantes → `COLLECT` |
| 5 | Sinon → `SURVIVE` (retourne manger, pas explorer) |

**Stratégie :** Le Farmer est obsédé par la nourriture. Son seuil de survie est de **80** (contre 60 pour les autres). Il ne collecte des pierres que lorsqu'il est vraiment rassasié. Et quand il n'a rien d'autre à faire, il retourne manger au lieu d'explorer. Résultat : il meurt beaucoup moins que les autres et est toujours disponible pour les rassemblements.

---

### Scout (`Role.SCOUT`)

| Priorité | Comportement |
|----------|-------------|
| 1 | Urgence faim (food < 25) → `SURVIVE` |
| 2 | Pierres complètes → `ELEVATE` ou `RALLY` |
| 3 | Nourriture insuffisante → `SURVIVE` |
| 4 | Pierres manquantes → `COLLECT` |
| 5 | Sinon → `EXPLORE` (avec broadcast des ressources rares) |

**Stratégie :** Le Scout est le drone éclaireur. Quand il explore, il utilise `scout_explore()` au lieu du simple `explore()` :

```python
def scout_explore(self):
    rare_stones = ["thystame", "phiras", "mendiane", "sibur", "deraumere"]
    if self.player.vision:
        for stone in rare_stones:
            idx = self.find_resource_in_vision(stone)
            if idx >= 0:
                self.broadcast(f"found {stone} {self.player.level}")
                break
    self.explore()
```

Il scanne sa vision à la recherche de pierres rares (classées par rareté décroissante) et **broadcast leur présence** aux autres drones. Les pierres rares comme `thystame` sont prioritaires car elles n'apparaissent qu'une seule fois dans les prérequis du niveau 8.

Le broadcast est throttlé par `BROADCAST_PERIOD` (0.4s) pour ne pas spammer.

---

## Intégration dans l'architecture

Le système de rôles ne casse rien de l'architecture existante. Il s'intègre en 3 points :

1. **`Role` enum** dans `cerveau.py` — 3 valeurs : `LEADER`, `FARMER`, `SCOUT`
2. **`arbitrate()`** — délègue à `_arbitrate_leader()`, `_arbitrate_farmer()` ou `_arbitrate_scout()` selon `self.role`
3. **`act()`** — le `EXPLORE` du Scout appelle `scout_explore()` au lieu de `explore()`

```
arbitrate()
    │
    ├── food < 25 → SURVIVE        (commun à tous)
    ├── state == JOIN → garder     (commun à tous)
    ├── fork possible → REPRODUCE  (commun à tous)
    │
    └── dispatch par rôle :
        ├── FARMER → _arbitrate_farmer()   (seuil bouffe élevé)
        ├── LEADER → _arbitrate_leader()   (priorise élévation)
        └── SCOUT  → _arbitrate_scout()    (explore + broadcast)
```

---

## Avantages mesurables

| Sans rôles (avant) | Avec rôles (après) |
|----|---|
| Tous explorent au hasard | Les Scouts signalent les ressources rares |
| Mort de faim fréquente | Les Farmers accumulent de la nourriture (seuil 80) |
| Incantations lentes et désorganisées | Le Leader lance les rassemblements en priorité |
| Drones interchangeables | Spécialisation → efficacité collective |

---

## Design Pattern utilisé

**Strategy Pattern** — Chaque rôle définit une stratégie d'arbitrage différente (`_arbitrate_*`) sans modifier la boucle principale `run()`. Ajouter un nouveau rôle = ajouter une méthode `_arbitrate_X()` et un cas dans l'enum.
