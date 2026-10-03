# `src/game/Team.cpp` — Implémentation de l'équipe

70 lignes, 9 méthodes.

---

```cpp
Team::Team(const std::string &name, int maxSlots)
    : _name(name), _maxSlots(maxSlots) {}
```
**Ligne 5-6** — Constructeur : stocke le nom et le nombre max de slots.

```cpp
int Team::getFreeSlots() const
{
    int eggSlots = 0;
    for (auto &egg : _eggs) {
        if (egg->isHatched() && !egg->isDead())
            eggSlots++;
    }
    return _maxSlots - _players.size() + eggSlots;
}
```
**Lignes 8-16** — Calcule les slots libres : `maxSlots - joueurs_connectés + oeufs_éclos_non_morts`. Chaque œuf éclos non mort offre un slot supplémentaire.

```cpp
void Team::addPlayer(Player *player)
{
    if (player)
        _players.push_back(player);
}
```
**Lignes 18-22** — Ajoute un joueur à l'équipe.

```cpp
void Team::removePlayer(Player *player)
{
    auto it = std::find(_players.begin(), _players.end(), player);
    if (it != _players.end())
        _players.erase(it);
}
```
**Lignes 24-29** — Retire un joueur de l'équipe (déconnexion ou mort).

```cpp
Player *Team::getPlayer(int id) const
{
    for (auto *p : _players) {
        if (p->getId() == id)
            return p;
    }
    return nullptr;
}
```
**Lignes 31-38** — Cherche un joueur par son ID dans l'équipe.

```cpp
void Team::addEgg(Egg *egg)
{
    if (egg)
        _eggs.push_back(egg);
}
```
**Lignes 40-44** — Ajoute un œuf à l'équipe.

```cpp
void Team::removeEgg(Egg *egg)
{
    auto it = std::find(_eggs.begin(), _eggs.end(), egg);
    if (it != _eggs.end())
        _eggs.erase(it);
}
```
**Lignes 46-51** — Retire un œuf de l'équipe.

```cpp
Egg *Team::getAvailableEgg() const
{
    for (auto *egg : _eggs) {
        if (egg->isHatched() && !egg->isDead())
            return egg;
    }
    return nullptr;
}
```
**Lignes 53-60** — Trouve le premier œuf éclos et non mort, utilisé pour faire spawner un nouveau joueur.

```cpp
bool Team::hasWon() const
{
    int count = 0;
    for (auto *p : _players) {
        if (p->getLevel() >= Constants::WIN_LEVEL)
            count++;
    }
    return count >= Constants::WIN_PLAYERS;
}
```
**Lignes 62-70** — Condition de victoire : au moins `WIN_PLAYERS` (6) joueurs de l'équipe ont atteint le niveau `WIN_LEVEL` (8).
