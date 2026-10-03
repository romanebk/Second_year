# Architecture du Raytracer

Vue d'ensemble de l'architecture technique du projet raytracer Epitech G-OOP-400.

## Vue d'Ensemble

Le raytracer suit une architecture modulaire basée sur les principes SOLID et les patterns de design établis dans les [ADR](adr/README.md).

### Architecture Globale

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        RAYTRACER ARCHITECTURE                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     ┌───────────┐  │
│  │  main.cpp   │───▶│ SceneParser │───▶│ SceneBuilder │───▶│   Scene   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘     └───────────┘  │
│                                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│  │  Renderer   │◀───│    Camera   │◀───│    Ray      │                    │
│  └─────────────┘    └─────────────┘    └─────────────┘                    │
│                                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│  │  Primitives │    │   Lights    │    │    Math     │                    │
│  └─────────────┘    └─────────────┘    └─────────────┘                    │
└───────────────────────────────────────────────────────────────────────────┘
```

## Organisation des Modules

### Core Module (`src/Core/`)
Le cœur du moteur de rendu :

```cpp
Scene.hpp/cpp          # Gestionnaire d'objets et lumières
├── Camera.hpp/cpp     # Caméra et génération de rayons
├── Renderer.hpp/cpp    # Moteur de rendu multithreadé
├── Ray.hpp           # Structure de rayon
└── HitRecord.hpp     # Informations d'intersection
```

### Primitives Module (`src/Primitives/`)
Implémentations des objets 3D :

```cpp
IPrimitive.hpp (interface)
├── Sphere.hpp/cpp      # Sphère (intersection quadratique)
├── Plane.hpp/cpp       # Plan (intersection linéaire)
├── Cylinder.hpp/cpp    # Cylindre (intersection quadratique)
└── Cone.hpp/cpp        # Cône (intersection quadratique)
```

### Lights Module (`src/Lights/`)
Système d'éclairage :

```cpp
ILight.hpp (interface)
├── AmbientLight.hpp/cpp    # Lumière ambiante constante
├── DirectionalLight.hpp/cpp # Lumière directionnelle infinie
└── PointLight.hpp/cpp      # Lumière ponctuelle locale
```

### Math Module (`src/Math/`)
Utilitaires mathématiques :

```cpp
Vector3.hpp/cpp    # Vecteur 3D avec opérations
└── Matrix4.hpp/cpp   # Matrice 4x4 pour transformations
```

### Parser Module (`src/Parser/`)
Gestion des fichiers de configuration :

```cpp
Factory.hpp/cpp         # Création d'objets (Factory Pattern)
SceneBuilder.hpp/cpp    # Construction de scènes (Builder Pattern)
└── SceneParser.hpp/cpp   # Parsing libconfig++
```

## Flux de Données

### 1. Phase de Parsing
```
Fichier .cfg ──▶ SceneParser ──▶ Factory ──▶ Objets
                                            │
                                            ▼
                                      SceneBuilder ──▶ Scene
```

### 2. Phase de Rendu
```
Scene ──▶ Renderer
   │
   ├──▶ Camera.getRay() pour chaque pixel
   ├──▶ Scene.hitAnything() pour les intersections
   ├──▶ Lights.computeImpactLight() pour l'éclairage
   └──▶ Renderer.saveAsPPM() pour la sortie
```

## Patterns de Design

### Factory Pattern
**Localisation** : `src/Parser/Factory.cpp`
**Purpose** : Création centralisée d'objets
**Avantages** : Extensibilité, validation, testabilité

### Builder Pattern
**Localisation** : `src/Parser/SceneBuilder.cpp`
**Purpose** : Construction contrôlée de scènes complexes
**Avantages** : Immuabilité, validation, flexibilité

### Composite Pattern
**Localisation** : `src/Core/Scene.cpp`
**Purpose** : Traitement uniforme des collections
**Avantages** : Interface unique, hiérarchies flexibles

## Gestion Mémoire

### Smart Pointers
```cpp
std::unique_ptr<IPrimitive>  // Propriété exclusive
std::unique_ptr<ILight>     // Propriété exclusive
std::vector<std::unique_ptr<T>> // Collections safe
```

### Cycle de Vie
1. **Factory** : Création avec `std::make_unique`
2. **Builder** : Transfert avec `std::move`
3. **Scene** : Stockage dans vectors
4. **Destruction** : Automatique à la fin de la Scene

## Performance

### Multithreading
```cpp
Renderer::render() {
    // 4 threads pour les bandes horizontales
    std::vector<std::thread> threads;
    // Chaque thread traite une zone de l'image
}
```

### Optimisations Locales
- **Early Exit** : Arrêt au premier impact trouvé
- **Cache Friendly** : Accès séquentiel aux primitives
- **Vectorization** : Utilisation des opérations SIMD (futur)

## Extensibilité

### Ajouter une Primitive
1. Hériter de `IPrimitive`
2. Implémenter `hit()`
3. Ajouter méthode dans `Factory`
4. Ajouter parsing dans `SceneParser`
5. Ajouter au `Makefile`

### Ajouter une Lumière
1. Hériter de `ILight`
2. Implémenter `computeImpactLight()`
3. Ajouter méthode dans `Factory`
4. Ajouter parsing dans `SceneParser`
5. Ajouter au `Makefile`

### Ajouter un Format de Scène
1. Étendre `SceneParser` pour nouveau format
2. Créer Builder spécifique
3. Maintenir compatibilité libconfig++

## Métriques d'Architecture

### Complexité Cyclomatique
- **Scene** : Modérée (dépend du nombre de primitives)
- **Renderer** : Élevée (boucles imbriquées)
- **Factory** : Faible (méthodes simples)

### Couplage
- **Faible** : Modules communiquent par interfaces
- **Cohésion élevée** : Chaque module a une responsabilité unique

### Testabilité
- **Élevée** : Chaque module testable indépendamment
- **Mock-friendly** : Interfaces faciles à mocker

---

*Pour les décisions architecturales détaillées, voir les [ADR](adr/README.md)*
