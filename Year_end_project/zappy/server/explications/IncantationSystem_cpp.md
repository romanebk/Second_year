# `src/game/IncantationSystem.cpp` — Implémentation de l'incantation

63 lignes, 3 méthodes.

---

```cpp
bool IncantationSystem::checkRequirements(Tile &tile, int targetLevel)
{
    if (targetLevel < 2 || targetLevel > 8)
        return false;

    const auto &req = Constants::ELEVATION[targetLevel - 2];

    int eligibleCount = 0;
    for (auto *p : tile.getPlayers()) {
        if (p->getLevel() == targetLevel - 1 && !p->isIncanting())
            eligibleCount++;
    }
    if (eligibleCount < req.playersRequired)
        return false;

    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++) {
        if (tile.getResources().resources[i] < req.resources[i])
            return false;
    }

    return true;
}
```
**Lignes 5-26** — `checkRequirements()` vérifie :
1. Le `targetLevel` doit être entre 2 et 8.
2. Récupère les prérequis depuis `Constants::ELEVATION[targetLevel-2]`.
3. Compte les joueurs sur la tuile ayant le niveau `targetLevel - 1` et n'incantant pas déjà.
4. Vérifie que la tuile a assez de ressources.

```cpp
bool IncantationSystem::performIncantation(Tile &tile, int targetLevel,
                                             const std::vector<Player *> &participants)
{
    if (targetLevel < 2 || targetLevel > 8)
        return false;

    const auto &req = Constants::ELEVATION[targetLevel - 2];

    int eligibleCount = 0;
    for (auto *p : participants) {
        if (p && p->getLevel() == targetLevel - 1 && p->getTile() == &tile)
            eligibleCount++;
    }
    if (eligibleCount < req.playersRequired)
        return false;

    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++) {
        if (tile.getResources().resources[i] < req.resources[i])
            return false;
    }

    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++)
        tile.getResources().resources[i] -= req.resources[i];

    return true;
}
```
**Lignes 28-53** — `performIncantation()` est appelée après le timer. Vérifie à nouveau les conditions (les joueurs ont pu bouger entre temps), puis consomme les ressources de la tuile. La montée de niveau des joueurs est gérée par `ActionHandler::handleIncantation()`.

```cpp
std::vector<Player *> IncantationSystem::getEligiblePlayers(Tile &tile, int level)
{
    std::vector<Player *> eligible;
    for (auto *p : tile.getPlayers()) {
        if (p->getLevel() == level && !p->isIncanting())
            eligible.push_back(p);
    }
    return eligible;
}
```
**Lignes 55-63** — Liste les joueurs d'une tuile ayant un niveau donné et n'incantant pas. Utilisé pour envoyer le `pic` au GUI.
