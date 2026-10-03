# Documentation Technique du Raytracer

## Table des Matières

1. [Architecture Globale](#architecture-globale)
2. [Patterns de Design](#patterns-de-design)
3. [Format des Fichiers de Scène](#format-des-fichiers-de-scène)
4. [Guide d'Extension](#guide-dextension)
5. [Optimisations](#optimisations)
6. [Dépannage](#dépannage)

---

## Architecture Globale

### Vue d'Ensemble

Le raytracer suit une architecture modulaire basée sur les principes SOLID :

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   main.cpp     │───▶│  SceneParser    │───▶│  SceneBuilder   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐              │
│   Renderer     │◀───│     Scene      │◀─────────────┘
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Camera       │    │   Primitives   │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │    Lights      │
                       └─────────────────┘
```

### Flux de Données

1. **Parsing** : `SceneParser` lit le fichier de configuration
2. **Construction** : `SceneBuilder` construit l'objet `Scene`
3. **Rendu** : `Renderer` parcourt chaque pixel et génère les rayons
4. **Intersection** : `Scene::hitAnything()` teste les collisions avec les primitives
5. **Éclairage** : Les lumières calculent leur contribution
6. **Sortie** : Image sauvegardée en format PPM

---

## 🎨 Patterns de Design

### 1. Factory Pattern

**Purpose** : Création d'objets sans spécifier leur classe exacte

**Implementation** :
```cpp
// Factory.hpp
class Factory {
public:
    static std::unique_ptr<IPrimitive> createSphere(const Vector3& pos, double radius, const Vector3& color);
    static std::unique_ptr<IPrimitive> createPlane(const std::string& axis, double position, const Vector3& color);
    static std::unique_ptr<ILight> createAmbientLight(double intensity);
    // ...
};
```

**Avantages** :
- Extensibilité facile
- Centralisation de la création
- Validation des paramètres

### 2. Builder Pattern

**Purpose** : Construction d'objets complexes étape par étape

**Implementation** :
```cpp
// SceneBuilder.hpp
class SceneBuilder {
private:
    Scene currentScene;
public:
    void setCamera(const Camera& camera);
    void addPrimitive(std::unique_ptr<IPrimitive> prim);
    void addLight(std::unique_ptr<ILight> light);
    Scene getResult();
};
```

**Avantages** :
- Séparation construction/représentation
- Contrôle fin du processus
- Immuabilité de l'objet final

### 3. Composite Pattern

**Purpose** : Traitement uniforme d'objets individuels et de collections

**Implementation** :
```cpp
// Scene.hpp
class Scene {
private:
    std::vector<std::unique_ptr<IPrimitive>> primitives;
public:
    bool hitAnything(const Ray& ray, double t_min, double t_max, HitRecord& rec) const {
        for (const auto& primitive : primitives) {
            if (primitive->hit(ray, t_min, t_max, temp_rec)) {
                // Traitement uniforme
            }
        }
    }
};
```

**Avantages** :
- Interface unique
- Hiérarchies flexibles
- Code client simplifié

---

## 📝 Format des Fichiers de Scène

### Structure Complète

```cpp
// Fichier de scène libconfig++
camera:
{
    resolution = { width = 1920; height = 1080; };
    position = { x = 0; y = -100; z = 20; };
    rotation = { x = 0; y = 0; z = 0; };
    fieldOfView = 72.0;
};

primitives:
{
    spheres = (
        { x = 0; y = 0; z = 0; r = 25; color = { r = 255; g = 64; b = 64; }; }
    );
    planes = (
        { axis = "Z"; r = -20; color = { r = 64; g = 64; b = 255; }; }
    );
    cylinders = (
        { x = 0; y = 0; z = 0; radius = 10; height = 40; color = { r = 255; g = 128; b = 0; }; }
    );
    cones = (
        { x = 0; y = 0; z = 0; radius = 15; height = 25; color = { r = 255; g = 0; b = 128; }; }
    );
};

lights:
{
    ambient = 0.4;
    diffuse = 0.6;
    point = (
        { x = 400; y = 100; z = 500; }
    );
    directional = (
        { x = -1; y = -1; z = -1; }
    );
};
```

### Contraintes de Format

**Important** : Le parser impose des contraintes spécifiques :

1. **Plans** : Utiliser `r` (pas `position`)
   ```cpp
   // ❌ Incorrect
   { axis = "Z"; position = -20; color = { r = 64; g = 64; b = 64; }; }
   
   // ✅ Correct
   { axis = "Z"; r = -20; color = { r = 64; g = 64; b = 64; }; }
   ```

2. **Lumières Directionnelles** : Coordonnées entières
   ```cpp
   // ❌ Incorrect
   { x = -0.5; y = -0.7; z = -0.5; }
   
   // ✅ Correct
   { x = -1; y = -1; z = -1; }
   ```

3. **Types de Données** :
   - Positions : entiers
   - Couleurs : entiers (0-255)
   - Rayons/Dimensions : doubles
   - Angles : doubles (degrés)

---

## 🔧 Guide d'Extension

### Ajouter une Nouvelle Primitive

#### Étape 1 : Interface

```cpp
// include/Primitives/NewPrimitive.hpp
class NewPrimitive : public IPrimitive {
private:
    // Attributs spécifiques
public:
    NewPrimitive(const Vector3& pos, /* autres paramètres */, const Vector3& color);
    ~NewPrimitive() = default;
    
    bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const override;
};
```

#### Étape 2 : Implementation

```cpp
// src/Primitives/NewPrimitive.cpp
#include "../../include/Primitives/NewPrimitive.hpp"

NewPrimitive::NewPrimitive(const Vector3& pos, /* autres paramètres */, const Vector3& color)
    : /* initialisation */ {}

bool NewPrimitive::hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const {
    // Algorithme d'intersection rayon-primitive
    // Remplir rec si intersection trouvée
    return true/false;
}
```

#### Étape 3 : Factory

```cpp
// include/Parser/Factory.hpp
class Factory {
public:
    static std::unique_ptr<IPrimitive> createNewPrimitive(const Vector3& pos, /* params */, const Vector3& color);
};

// src/Parser/Factory.cpp
std::unique_ptr<IPrimitive> Factory::createNewPrimitive(const Vector3& pos, /* params */, const Vector3& color) {
    return std::make_unique<NewPrimitive>(pos, /* params */, color);
}
```

#### Étape 4 : Parser

```cpp
// src/Parser/SceneParser.cpp
// Ajouter dans la section primitives
if (primitives.exists("newprimitives")) {
    const Setting& newprimitives = primitives["newprimitives"];
    for (int a = 0; a < newprimitives.getLength(); a++) {
        try {
            // Parsing des paramètres
            builder.addPrimitive(Factory::createNewPrimitive(pos, /* params */, color));
        } catch (...) {
            throw std::runtime_error("Erreur Parser : Données invalides pour la newprimitive numéro " + std::to_string(a + 1));
        }
    }
}
```

#### Étape 5 : Makefile

```makefile
SRC = $(SRCDIR)/main.cpp \
       # ...
       $(SRCDIR)/Primitives/NewPrimitive.cpp \
       # ...
```

### Ajouter un Nouveau Type de Lumière

Le processus est similaire à celui des primitives :

1. **Interface** : Hériter de `ILight`
2. **Implementation** : Implémenter `computeImpactLight()`
3. **Factory** : Ajouter méthode de création
4. **Parser** : Ajouter section de parsing
5. **Makefile** : Ajouter fichier source

---

## ⚡ Optimisations

### Actuelles

1. **Multithreading**
   ```cpp
   // Renderer.cpp - render()
   int numThreads = 4;
   std::vector<std::thread> threads;
   // Répartition du travail sur plusieurs threads
   ```

2. **Smart Pointers**
   ```cpp
   // Gestion mémoire automatique
   std::vector<std::unique_ptr<IPrimitive>> primitives;
   std::vector<std::unique_ptr<ILight>> lights;
   ```

3. **Early Exit**
   ```cpp
   // Arrêt au premier impact trouvé
   if (primitive->hit(ray, t_min, closest_so_far, temp_rec)) {
       closest_so_far = temp_rec.t;
   }
   ```

### Futures Possibles

#### 1. Spatial Partitioning

**BVH (Bounding Volume Hierarchy)**
```cpp
class BVHNode {
    std::unique_ptr<BVHNode> left, right;
    BoundingBox bbox;
    std::vector<std::unique_ptr<IPrimitive>> primitives;
    
    bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const;
};
```

**Octree**
```cpp
class OctreeNode {
    std::array<std::unique_ptr<OctreeNode>, 8> children;
    std::vector<std::unique_ptr<IPrimitive>> objects;
    BoundingBox bounds;
};
```

#### 2. Adaptive Supersampling

```cpp
Vector3 Renderer::adaptiveSample(int x, int y, int depth = 0) {
    if (depth > MAX_DEPTH) return computeColor(x, y);
    
    Vector3 colors[4];
    for (int i = 0; i < 4; i++) {
        colors[i] = computeColor(x + offsets[i].x, y + offsets[i].y);
    }
    
    if (colorsSimilar(colors)) return average(colors);
    return recursiveSubdivision(x, y, depth + 1);
}
```

#### 3. GPU Computing

**CUDA Kernel**
```cuda
__global__ void renderKernel(Pixel* pixels, Scene scene, Camera camera) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x < camera.width && y < camera.height) {
        Ray ray = camera.getRay(x, y);
        pixels[y * camera.width + x] = computeColor(ray, scene);
    }
}
```

---

## 🐛 Dépannage

### Erreurs de Parsing

#### "Données invalides pour le plan"
**Cause** : Mauvais nom de paramètre
```cpp
// ❌
{ axis = "Z"; position = -20; color = { r = 64; g = 64; b = 64; }; }

// ✅
{ axis = "Z"; r = -20; color = { r = 64; g = 64; b = 64; }; }
```

#### "Données invalides pour la lumière directionnelle"
**Cause** : Type de données incorrect
```cpp
// ❌
{ x = -0.5; y = -0.7; z = -0.5; }

// ✅
{ x = -1; y = -1; z = -1; }
```

### Problèmes de Compilation

#### libconfig++ non trouvé
```bash
sudo apt install -y libconfig++-dev
```

#### C++20 non supporté
```makefile
# Dans Makefile
CXXFLAGS = -std=c++17  # Au lieu de -std=c++20
```

### Problèmes de Performance

#### Rendu lent
1. **Vérifier** : Nombre de primitives élevé
2. **Solution** : Implémenter spatial partitioning
3. **Vérifier** : Résolution d'image trop élevée
4. **Solution** : Commencer avec 800x600 pour tester

#### Artefacts visuels
1. **Ombres incorrectes** : Vérifier calculs de direction
2. **Aliasing** : Implémenter supersampling
3. **Couleurs incorrectes** : Vérifier bornage (0-255)

---

## 📊 Métriques et Benchmarks

### Performance Actuelle

| Scène | Résolution | Temps (4 threads) | Mémoire |
|--------|------------|-------------------|---------|
| Simple | 800x600    | ~2s              | 50MB    |
| Moyenne | 1200x800  | ~8s              | 200MB   |
| Complexe | 1600x1200 | ~25s             | 500MB   |

### Objectifs d'Optimisation

- **Speedup 10x** avec BVH
- **Réduction 50%** mémoire avec streaming
- **Quality 4x** avec adaptive sampling

---

*Documentation technique complète du raytracer Epitech G-OOP-400*
