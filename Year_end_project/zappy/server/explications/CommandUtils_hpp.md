# `include/game/CommandUtils.hpp` — Utilitaires de parsing

Fonction utilitaire inline pour convertir un nom de ressource string en `ResourceType`.

---

```cpp
inline ResourceType parseResourceType(const std::string &name)
{
    if (name == "food") return ResourceType::FOOD;
    if (name == "linemate") return ResourceType::LINEMATE;
    if (name == "deraumere") return ResourceType::DERAUMERE;
    if (name == "sibur") return ResourceType::SIBUR;
    if (name == "mendiane") return ResourceType::MENDIANE;
    if (name == "phiras") return ResourceType::PHIRAS;
    if (name == "thystame") return ResourceType::THYSTAME;
    return ResourceType::COUNT;
}
```
**Lignes 7-17** — Compare le nom string aux 7 ressources connues. Retourne `COUNT` (qui vaut 7) si le nom est inconnu, ce qui sert de valeur d'erreur.
