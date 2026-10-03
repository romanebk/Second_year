# ADR-005: Smart pointers pour gestion mémoire

## Status
Accepted

## Context
Le raytracer manipule de nombreux objets dynamiques :
- Primitives créées par le parser
- Lumières ajoutées à la scène
- Collections d'objets polymorphiques
- Durée de vie complexe (parser → scene → renderer)

## Alternatives considérées

### Pointeurs bruts (new/delete)
- **Description** : Gestion manuelle avec `new`/`delete`
- **Avantages** : Performance maximale, contrôle total
- **Inconvénients** : Fuites mémoire fréquentes, double delete, exception unsafe

### Pointeurs bruts avec RAII
- **Description** : Wrappers manuels avec destructeurs
- **Avantages** : Gestion automatique, customisable
- **Inconvénients** : Code complexe, réinventer la roue

### std::unique_ptr
- **Description** : Pointeur exclusif avec gestion automatique
- **Avantages** : Exception safe, zéro overhead, move semantics
- **Inconvénients** : Non copiable, transfert explicite

### std::shared_ptr
- **Description** : Pointeur partagé avec comptage de références
- **Avantages** : Partage safe, destruction automatique
- **Inconvénients** : Overhead atomic, cycles dangereux

## Decision
Nous avons choisi **mix de std::unique_ptr et std::shared_ptr** :

### std::unique_ptr pour la propriété exclusive
```cpp
// Dans Scene.hpp
std::vector<std::unique_ptr<IPrimitive>> primitives;
std::vector<std::unique_ptr<ILight>> lights;

// Dans Factory.cpp
return std::make_unique<Sphere>(pos, radius, color);

// Transfert de propriété
primitives.push_back(std::move(prim));
```

### Références pour l'accès partagé
```cpp
// Dans Renderer.cpp
const std::vector<std::unique_ptr<ILight>>& lights = _scene.getLights();

// Accès sans transfert de propriété
for (const auto& light : lights) {
    Vector3 contribution = light->computeImpactLight(record, _scene);
}
```

## Consequences

### Positives
- **Zéro fuites** : Destruction automatique garantie
- **Exception safety** : Nettoyage même en cas d'exception
- **Performance** : `unique_ptr` a zéro overhead runtime
- **Clarté** : Propriété explicite via `unique_ptr`
- **Move semantics** : Transferts efficaces d'objets

### Négatives
- **Complexité** : Syntaxe plus verbeuse
- **Learning curve** : Nouveaux concepts pour certains développeurs
- **Compilation** : Templates plus lents à compiler

### Patterns utilisés
```cpp
// Factory Pattern avec unique_ptr
std::unique_ptr<IPrimitive> Factory::createSphere(...) {
    return std::make_unique<Sphere>(...);
}

// Builder Pattern avec move semantics
void SceneBuilder::addPrimitive(std::unique_ptr<IPrimitive> prim) {
    currentScene.addPrimitive(std::move(prim));
}
```

### Memory safety
- **Pas de leaks** : Valgrind montre 0 bytes "definitely lost"
- **Pas de double delete** : Un seul propriétaire par objet
- **Pas de dangling pointers** : Références valides garanties

---

*Decision prise le 12 mai 2026*
