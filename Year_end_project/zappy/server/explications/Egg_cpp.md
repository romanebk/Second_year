# `src/game/Egg.cpp` — Implémentation de l'œuf

8 lignes, 3 méthodes.

---

```cpp
Egg::Egg(int id, const std::string &teamName, const Position &pos)
    : _id(id), _teamName(teamName), _pos(pos) {}
```
**Ligne 3-4** — Constructeur : initialise l'ID, le nom d'équipe et la position. `_hatched` et `_dead` restent à `false` (valeurs par défaut dans le header).

```cpp
void Egg::hatch() { _hatched = true; }
```
**Ligne 6** — Marque l'œuf comme éclos. Après éclosion, un joueur peut spawner sur cet œuf.

```cpp
void Egg::kill() { _dead = true; }
```
**Ligne 8** — Marque l'œuf comme mort (piétiné par un `Eject` ou détruit).
