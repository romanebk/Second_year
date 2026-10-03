# `include/protocol/GUIProtocol.hpp` — Header du protocole GUI

Formatage des messages à destination du GUI (client graphique).

---

```cpp
class GUIProtocol {
    public:
        enum class Request {
            MSZ, BCT, MCT, TNA, PPO, PLV, PIN, SGT, SST, UNKNOWN
        };

        static Request parse(const std::string &line, std::vector<std::string> &args);

        static std::string msz(int x, int y);
        static std::string bct(int x, int y, const Inventory &inv);
        // ... toutes les méthodes de formatage
        static std::string sbp();
};
```
**Lignes 9-41** — 20 méthodes statiques de formatage + 1 méthode `parse()` pour les requêtes entrantes du GUI. Chaque méthode correspond à une commande du protocole Zappy GUI.
