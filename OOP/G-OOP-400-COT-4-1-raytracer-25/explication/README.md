# Raytracer - Vue d'ensemble du projet

## Présentation générale

Ce projet est un **raytracer** développé en **C++20** dans le cadre de l'unité **G-OOP-400** à Epitech.  
Un raytracer est un programme qui génère une image 2D à partir d'une scène 3D en simulant le parcours de la lumière : pour chaque pixel de l'image, on lance un **rayon** depuis la caméra à travers la scène et on calcule l'objet le plus proche qu'il intersecte, puis l'éclairage en ce point.

Le projet utilise `libconfig++` pour lire des fichiers de scène (`.cfg`) et produit une image au format **PPM**.

---

## Architecture du projet

```
├── include/              # En-têtes (.hpp)
│   ├── Core/             # Cœur du raytracer (Camera, Ray, HitRecord, Renderer, Scene)
│   ├── Interfaces/       # Interfaces abstraites (IPrimitive, ILight)
│   ├── Lights/           # Types de lumières (Ambient, Directional, Point)
│   ├── Math/             # Bibliothèque mathématique (Vector3, Matrix4)
│   ├── Parser/           # Lecture et construction de la scène (Factory, SceneBuilder, SceneParser)
│   └── Primitives/       # Primitives géométriques (Sphere, Plane, Cylinder, Cone)
├── src/                  # Implémentations (.cpp)
│   ├── Core/
│   ├── Lights/
│   ├── Math/
│   ├── Parser/
│   └── Primitives/
├── Makefile              # Build system (g++, c++20, libconfig++-dev)
└── scenes/               # Fichiers de configuration de scènes (.cfg)
```

---

## Design Patterns utilisés

| Pattern | Emplacement | Rôle |
|---|---|---|
| **Factory** | `Parser/Factory` | Crée les objets (primitives, lumières) à partir de paramètres lus dans le fichier de config |
| **Builder** | `Parser/SceneBuilder` | Construit une scène étape par étape (setCamera, addPrimitive, addLight, getResult) |
| **Composite** | `Core/Scene` | Traite toutes les primitives de manière uniforme via `hitAnything()` |

---

## Déroulement du programme

```
main.cpp
  │
  ▼
SceneParser::parse(filename)    ── lit le fichier .cfg avec libconfig++
  │
  ▼
SceneBuilder                     ── construit la scène
  │
  ▼
Scene                            ── contient Camera, primitives, lumières
  │
  ▼
Camera::init()                   ── calcule les vecteurs direction du viewport
  │
  ▼
Renderer::render()               ── multi-threadé (4 threads)
  │                                pour chaque pixel → lance un rayon
  ▼                                ↓
Scene::hitAnything(ray)          ── teste toutes les primitives (Composite)
  │                                ↓
  ▼                                retourne HitRecord (point, normale, couleur)
Calcul d'éclairage               ── somme des contributions lumineuses
  │
  ▼
Renderer::saveAsPPM()            ── écrit l'image au format PPM
```

---

## Pipeline de rendu (pour chaque pixel)

1. **Génération du rayon** : `Camera::getRay(x, y)` calcule un rayon qui part de la caméra et traverse le pixel (x,y) du viewport virtuel
2. **Intersection** : `Scene::hitAnything(ray)` parcourt toutes les primitives et retourne l'intersection la plus proche (`HitRecord`)
3. **Éclairage** : pour chaque lumière dans la scène :
   - **Ambient** : contribution fixe `couleur × intensité`
   - **Directional** : Lambert + rayon d'ombre vers la lumière directionnelle
   - **Point** : Lambert + atténuation distance + rayon d'ombre
4. **Couleur finale** : `color * (ambient + diffuse + point)`, clampée entre 0 et 255

---

## Concepts mathématiques clés

### Équation paramétrique d'un rayon
```
P(t) = O + D × t
```
Où `O` est l'origine, `D` la direction normalisée, et `t` la distance.

### Algorithme de hit (`IPrimitive::hit`)
Chaque primitive implémente `bool hit(Ray, t_min, t_max, HitRecord& rec)` qui :
1. Transforme le rayon dans l'espace local (soustraction de la translation)
2. Résout une équation pour trouver `t` (le point d'intersection)
3. Vérifie que `t` est dans l'intervalle [t_min, t_max]
4. Remplit le `HitRecord` avec `t`, le point, la normale et la couleur

### Translation des primitives
Toutes les primitives supportent la **translation** via **transformation inverse** du rayon :
```cpp
Ray transformedRay(ray.origin - translation, ray.direction);
```
Au lieu de déplacer la primitive, on déplace le rayon dans la direction opposée, ce qui est mathématiquement équivalent et plus simple à implémenter.

---

## Structure de données : HitRecord

```cpp
struct HitRecord {
    double t;          // distance le long du rayon
    Vector3 point;     // point d'impact dans l'espace monde
    Vector3 normal;    // normale à la surface au point d'impact
    Vector3 couleur;   // couleur de base de la primitive
};
```

---

## Système de fichiers de scène (`.cfg`)

Format utilisant `libconfig++` :
```cfg
camera = {
    position = (0, 0, -5);
    rotation = (0, 0, 0);
    fov = 70;
    resolution = (1920, 1080);
};
primitives = {
    spheres = (
        { center = (0, 0, 0); radius = 1; color = (255, 0, 0); }
    );
    planes = (
        { axis = "Y"; position = -2; color = (128, 128, 128); }
    );
};
lights = {
    ambient = { color = (255, 255, 255); intensity = 0.1; };
    directional = (
        { direction = (-1, -1, -1); color = (255, 255, 255); intensity = 0.8; }
    );
};
```

---

## Compilation et exécution

```bash
make            # compile le projet
./raytracer scenes/scene.cfg   # exécute le raytracer
make view       # exécute et affiche l'image (si un visualiseur est configuré)
make clean      # nettoie les fichiers objets
make fclean     # nettoie tout (objets + binaire)
```

---

## Fichiers expliqués en détail

- [IPrimitive.hpp](IPrimitive.md) — Interface abstraite des primitives
- [Sphere.hpp & Sphere.cpp](Sphere.md) — Sphère
- [Plane.hpp & Plane.cpp](Plane.md) — Plan
- [Cylinder.hpp & Cylinder.cpp](Cylinder.md) — Cylindre
- [Cone.hpp & Cone.cpp](Cone.md) — Cône
