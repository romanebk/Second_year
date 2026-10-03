# `src/game/ResourceManager.cpp` — Implémentation du gestionnaire de ressources

54 lignes.

---

```cpp
ResourceManager::ResourceManager(IMap &map) : _map(map) {}
```
**Ligne 6** — Constructeur : stocke la référence vers la carte.

```cpp
void ResourceManager::initialize()
{
    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++) {
        auto type = static_cast<ResourceType>(i);
        int total = calculateTotal(type);
        for (int j = 0; j < total; j++)
            addToRandomTile(type, 1);
    }
    _timer = 0;
}
```
**Lignes 8-17** — Initialisation : pour chaque type de ressource, calcule le nombre total à spawner selon la densité, et les place aléatoirement sur la carte. Remet le timer à 0.

```cpp
void ResourceManager::spawn()
{
    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++) {
        auto type = static_cast<ResourceType>(i);
        int total = calculateTotal(type);
        int currentTotal = 0;
        auto tiles = _map.getAllTiles();
        for (auto &tileRef : tiles) {
            auto &tile = tileRef.get();
            currentTotal += tile.getResources()[type];
        }
        int toAdd = std::max(0, total - currentTotal);
        for (int j = 0; j < toAdd; j++)
            addToRandomTile(type, 1);
    }
}
```
**Lignes 19-34** — `spawn()` est appelé périodiquement. Pour chaque type : calcule le total théorique, compte ce qui existe déjà, et spawn la différence (ne spawn que si le total actuel est inférieur au total théorique).

```cpp
int ResourceManager::getTimeUntilNextSpawn() const
{
    return static_cast<int>(Constants::SPAWN_INTERVAL - _timer);
}
```
**Lignes 36-39** — Temps restant avant le prochain spawn (en ticks).

```cpp
int ResourceManager::calculateTotal(ResourceType type) const
{
    return static_cast<int>(std::round(
        _map.getWidth() * _map.getHeight() * Constants::RESOURCE_DENSITY[static_cast<int>(type)]));
}
```
**Lignes 41-45** — Calcule le nombre total d'une ressource : `largeur * hauteur * densité`. Par exemple, pour une carte 10×10 avec food (densité 0.5) : 100 * 0.5 = 50 foods.

```cpp
void ResourceManager::addToRandomTile(ResourceType type, int count)
{
    int x = std::rand() % _map.getWidth();
    int y = std::rand() % _map.getHeight();
    _map.getTile(x, y).getResources()[type] += count;
    if (_onSpawn)
        _onSpawn(x, y);
}
```
**Lignes 47-54** — Ajoute `count` ressources d'un type sur une tuile aléatoire. Si un callback `_onSpawn` est défini (pour notifier le GUI), il est appelé.
