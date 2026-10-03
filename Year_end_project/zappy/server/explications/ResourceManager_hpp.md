# `include/game/ResourceManager.hpp` — Header du gestionnaire de ressources

Gère le spawn périodique des ressources sur la carte.

---

```cpp
class ResourceManager {
    public:
        using SpawnCallback = std::function<void(int x, int y)>;

        ResourceManager(IMap &map);

        void initialize();
        void spawn();
        int getTimeUntilNextSpawn() const;

        void setOnSpawn(SpawnCallback cb) { _onSpawn = cb; }

    private:
        IMap &_map;
        double _timer = 0;
        SpawnCallback _onSpawn;

        int calculateTotal(ResourceType type) const;
        void addToRandomTile(ResourceType type, int count);
};
```
**Lignes 7-26** — `ResourceManager` a une référence à `IMap`. `initialize()` spawn les ressources initiales, `spawn()` est appelé périodiquement pour maintenir la densité. `_timer` suit le temps écoulé depuis le dernier spawn. `_onSpawn` est un callback pour notifier le GUI.
