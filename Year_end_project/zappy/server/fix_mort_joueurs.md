# Bug : la mort des joueurs est déconnectée de la nourriture

## 1. Symptôme

Les joueurs meurent sur un **minuteur fixe**, quoi qu'ils fassent. Ramasser de
la nourriture (`Take food`) **ne prolonge pas leur survie**. Chaque joueur meurt
après `INITIAL_LIFE` intervalles, soit `10 × 126 / fréquence` secondes
(≈ 12,6 s à `-t 100`, ≈ 126 s à `-t 10`).

## 2. Cause racine

Le serveur manipule **deux compteurs indépendants** qui ne communiquent jamais :

| Compteur | Initialisé | Consommé par la faim | Augmenté en mangeant |
|----------|-----------|----------------------|----------------------|
| `Player::_life` | `10` (valeur par défaut du membre) | **Oui** (`consumeFood`) | **Non** |
| `Inventory[FOOD]` | `10` (au spawn) | **Non** | Oui (`Take food`) |

Autrement dit : la **vie** (`_life`) est ce qui décide de la mort, mais
**manger** ne touche que l'**inventaire** (`Inventory[FOOD]`). Les deux ne sont
jamais synchronisés → la nourriture ramassée est inutile pour survivre.

### Code fautif actuel

**`zappy_server/src/game/Player.cpp`** — la faim décrémente `_life`, jamais l'inventaire :

```cpp
void Player::consumeFood()
{
    if (_life > 0)
        _life--;
}
```

**`zappy_server/include/game/Player.hpp`** — la mort dépend de `_life` :

```cpp
int getLife() const override { return _life; }
void setLife(int life) { _life = life; }
void consumeFood() override;
bool isDead() const override { return _life <= 0; }
// ...
int _life = 10;
```

**`zappy_server/src/game/ActionHandler.cpp`** (`handleTake`) — manger n'augmente que l'inventaire :

```cpp
tile->getResources()[type]--;
player.getInventory()[type]++;   // <-- aucun effet sur _life
```

**`zappy_server/src/ServerApp.cpp`** — la boucle de faim consomme la vie :

```cpp
double foodInterval = Constants::FOOD_UNITS / static_cast<double>(_freq);
_foodTimer += deltaTime;
if (_foodTimer >= foodInterval) {
    _foodTimer -= foodInterval;
    for (auto &p : _players) {
        if (p->isDead() || p->isIncanting())
            continue;
        p->consumeFood();
        if (p->isDead()) {
            // dead\n + pdi + disconnect
        }
    }
}
```

## 3. Comportement attendu (règles Zappy)

Dans Zappy, **le stock de nourriture EST la vie** : 1 unité de nourriture =
126 unités de temps de survie. On meurt quand la nourriture tombe à 0, et
ramasser de la nourriture prolonge directement la vie.

> Conclusion : `_life` et `Inventory[FOOD]` doivent être **une seule et même
> valeur**. La correction recommandée supprime `_life` et fait de
> `Inventory[FOOD]` la **source unique de vérité**.

---

## 4. Correctif recommandé (source unique = `Inventory[FOOD]`)

Avantages : changement minimal, `Take food` prolonge naturellement la vie, et la
commande `Inventory` de l'IA (qui lit déjà `Inventory[FOOD]`) reflète exactement
la vie restante. Aucun autre code n'utilise `getLife()` ailleurs, donc aucun
risque de régression.

### Fichier 1 — `zappy_server/include/game/Player.hpp`

`ResourceType` est déjà disponible (via `Enums.hpp`) et `Inventory` possède un
`operator[] const`, donc l'usage dans les méthodes `const` compile.

**Avant**

```cpp
int getLife() const override { return _life; }
void setLife(int life) { _life = life; }
void consumeFood() override;
bool isDead() const override { return _life <= 0; }

// ... dans la section private :
int _life = 10;
```

**Après**

```cpp
// La vie est mesurée en unités de nourriture : l'inventaire FOOD est
// la source unique de vérité (1 FOOD = un intervalle de survie).
int getLife() const override { return _inventory[ResourceType::FOOD]; }
void setLife(int life) { _inventory[ResourceType::FOOD] = life; }
void consumeFood() override;
bool isDead() const override { return _inventory[ResourceType::FOOD] <= 0; }

// ... dans la section private :
// (supprimer le membre _life : il n'est plus la source de vérité)
```

### Fichier 2 — `zappy_server/src/game/Player.cpp`

**Avant**

```cpp
void Player::consumeFood()
{
    if (_life > 0)
        _life--;
}
```

**Après**

```cpp
void Player::consumeFood()
{
    if (_inventory[ResourceType::FOOD] > 0)
        _inventory[ResourceType::FOOD]--;
}
```

> `Player.cpp` inclut déjà `Tile.hpp`/`Constants.hpp` ; `ResourceType` provient
> de `Enums.hpp` (inclus transitivement par `Player.hpp`). Aucun include
> supplémentaire nécessaire.

### Fichier 3 (cohérence) — `zappy_server/src/ServerApp.cpp`

Au spawn, la vie initiale est codée en dur à `10`. On la remplace par la
constante prévue pour ça, afin que tout reste cohérent si elle change un jour.

**Avant**

```cpp
player->getInventory()[ResourceType::FOOD] = 10;
```

**Après**

```cpp
player->getInventory()[ResourceType::FOOD] = Constants::INITIAL_LIFE;
```

> La boucle de faim (`update`) n'a **aucune modification** à recevoir : elle
> appelle déjà `consumeFood()` et `isDead()`, qui pointent désormais vers
> l'inventaire. `Take food` (dans `ActionHandler::handleTake`) reste **inchangé** :
> son `player.getInventory()[type]++;` prolonge maintenant automatiquement la vie.

---

## 5. Effet du correctif

- Vie de départ : `Inventory[FOOD] = INITIAL_LIFE` (10) → 10 intervalles de survie.
- Faim : `consumeFood()` retire 1 FOOD toutes les `126 / fréquence` s.
- Manger : `Take food` ajoute 1 FOOD → **+1 intervalle de survie**.
- Mort : quand `Inventory[FOOD] <= 0` → `dead\n`, `pdi`, déconnexion (inchangé).
- La commande IA `Inventory` (`[food N, ...]`) affiche enfin la **vraie** vie restante.

---

## 6. Variante (si l'on veut garder `_life`)

Déconseillée (deux compteurs à maintenir, et la commande `Inventory` de l'IA
divergerait de la vie réelle), mais possible : conserver `_life` et le
réalimenter en mangeant.

### `zappy_server/src/game/ActionHandler.cpp` (dans `handleTake`)

```cpp
tile->getResources()[type]--;
player.getInventory()[type]++;

// Variante : 1 nourriture = 1 intervalle de survie supplémentaire.
if (type == ResourceType::FOOD)
    player.setLife(player.getLife() + 1);
```

Dans ce cas, `consumeFood()`, `isDead()` et la boucle de faim restent tels
quels. Inconvénient : `Inventory[FOOD]` (lu par l'IA) ne représente plus la vie
restante, ce qui est trompeur pour l'IA et le GUI.

---

## 7. Récapitulatif des fichiers à modifier (correctif recommandé)

| Fichier | Modification |
|---------|--------------|
| `zappy_server/include/game/Player.hpp` | `getLife`/`setLife`/`isDead` basés sur `Inventory[FOOD]` ; supprimer le membre `_life` |
| `zappy_server/src/game/Player.cpp` | `consumeFood()` décrémente `Inventory[FOOD]` |
| `zappy_server/src/ServerApp.cpp` | Spawn : `Inventory[FOOD] = Constants::INITIAL_LIFE` (cohérence) |

Aucune autre modification n'est nécessaire ; `ActionHandler::handleTake` et la
boucle de faim fonctionnent alors correctement sans changement.
