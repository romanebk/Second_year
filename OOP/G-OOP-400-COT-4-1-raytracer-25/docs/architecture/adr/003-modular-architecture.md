# ADR-003: Architecture modulaire avec interfaces

## Status
Accepted

## Context
Pour le projet raytracer Epitech G-OOP-400, l'extensibilité est une exigence clé. Le cahier des charges mentionne :
- "A rendering engine should be extensible"
- "One should be able to add new features without completely rewriting the code"
- "You must use interfaces, at least, for your primitives and lights"

## Alternatives considérées

### Monolithique
- **Description** : Tout le code dans quelques gros fichiers
- **Avantages** : Simple à démarrer, moins de fichiers
- **Inconvénients** : Difficile à étendre, couplage fort

### Modularité sans interfaces
- **Description** : Séparation en modules mais héritage direct
- **Avantages** : Meilleure organisation
- **Inconvénients** : Couplage fort, difficile d'ajouter nouveaux types

### Modularité avec interfaces abstraites
- **Description** : Interfaces virtuelles pures + polymorphisme
- **Avantages** : Extensibilité maximale, découplage
- **Inconvénients** : Légère overhead virtuelle

### Modularité avec templates
- **Description** : Templates pour performance compile-time
- **Avantages** : Zéro overhead, type-safe
- **Inconvénients** : Compilation plus lente, erreurs complexes

## Decision
Nous avons choisi **l'architecture modulaire avec interfaces abstraites** :

### Structure
```
Interfaces/
├── IPrimitive.hpp    # Interface pour tous les objets 3D
└── ILight.hpp        # Interface pour tous les types de lumière

Core/
├── Scene.hpp         # Gestionnaire de primitives et lumières
├── Renderer.hpp      # Moteur de rendu
└── Camera.hpp        # Caméra et génération de rayons

Primitives/
├── Sphere.hpp        # Implémentation sphère
├── Plane.hpp         # Implémentation plan
├── Cylinder.hpp      # Implémentation cylindre
└── Cone.hpp          # Implémentation cône

Lights/
├── AmbientLight.hpp  # Lumière ambiante
├── DirectionalLight.hpp # Lumière directionnelle
└── PointLight.hpp    # Lumière ponctuelle
```

### Interfaces clés
```cpp
class IPrimitive {
public:
    virtual ~IPrimitive() = default;
    virtual bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const = 0;
};

class ILight {
public:
    virtual ~ILight() = default;
    virtual Vector3 computeImpactLight(const HitRecord& rec, const Scene& scene) const = 0;
};
```

## Consequences

### Positives
- **Extensibilité** : Ajouter nouvelle primitive = implémenter IPrimitive
- **Découplage** : Core ne connaît que les interfaces
- **Testabilité** : Chaque module testable indépendamment
- **Maintenabilité** : Modifications isolées à un module
- **Plugins** : Structure prête pour chargement dynamique (.so)

### Négatives
- **Overhead virtuelle** : Légère pénalité performance
- **Complexité** : Plus de fichiers à gérer
- **Compilation** : Temps de compilation augmenté

### Mitigations
- **Inline judicieux** : Réduire overhead virtuelle
- **Smart pointers** : Gestion mémoire automatique
- **Makefile modulaire** : Compilation incrémentale

---

*Decision prise le 12 mai 2026*
