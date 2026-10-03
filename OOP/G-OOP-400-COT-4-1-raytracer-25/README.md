# Raytracer CPP

**YOUR CPU GOES BRRRR! />**

Un raytracer 3D implémenté en C++ pour le projet Epitech G-OOP-400.

## Objectif

Créer un programme capable de générer des images réalistes en simulant le chemin inverse de la lumière à partir d'une description de scène.

## Features Implémentées

### Fonctionnalités Obligatoires (Must)
- **Primitives** : Sphère, Plan
- **Transformations** : Translation
- **Lumière** : Lumière directionnelle, Lumière ambiante
- **Matériaux** : Couleur plate
- **Configuration de scène** : Ajout de primitives, configuration d'éclairage, configuration caméra
- **Interface** : Sortie vers fichier PPM (pas de GUI)

### Fonctionnalités Recommandées (Should)
- **Primitives** : Cylindre, Cône
- **Transformations** : Rotation
- **Lumière** : Ombres portées

## Architecture

Le projet utilise une architecture modulaire avec des interfaces pour l'extensibilité :

```
src/
├── Core/           # Cœur du moteur (Scene, Renderer, Camera)
├── Lights/         # Système d'éclairage (Ambient, Directional, Point)
├── Math/           # Utilitaires mathématiques (Vector3, Matrix4)
├── Parser/         # Parser de fichiers de scène (Factory, SceneBuilder, SceneParser)
├── Primitives/      # Objets 3D (Sphere, Plane, Cylinder, Cone)
└── main.cpp        # Point d'entrée

include/
├── Core/
├── Lights/
├── Math/
├── Parser/
├── Primitives/
└── Interfaces/     # Interfaces ILight et IPrimitive
```

## Installation

### Prérequis

```bash
# Installer les dépendances
sudo apt update
sudo apt install -y libconfig++-dev g++ make

# Pour visualiser les images (optionnel)
sudo apt install -y feh imagemagick eog
```

### Compilation

```bash
# Compiler le projet
make

# Nettoyer les fichiers objets
make clean

# Nettoyer tout (exécutable compris)
make fclean

# Recompiler entièrement
make re
```

## Format des Fichiers de Scène

Les scènes utilisent le format libconfig++ avec la structure suivante :

### Configuration de la Caméra

```cpp
camera:
{
    resolution = { width = 1920; height = 1080; };
    position = { x = 0; y = -100; z = 20; };
    rotation = { x = 0; y = 0; z = 0; };
    fieldOfView = 72.0; // en degrés
};
```

### Primitives

#### Sphères
```cpp
spheres = (
    { x = 0; y = 0; z = 0; r = 25; color = { r = 255; g = 64; b = 64; }; }
);
```

#### Plans
```cpp
planes = (
    { axis = "Z"; r = -20; color = { r = 64; g = 64; b = 255; }; }
);
```

#### Cylindres
```cpp
cylinders = (
    { x = 0; y = 0; z = 0; radius = 10; height = 40; color = { r = 255; g = 128; b = 0; }; }
);
```

#### Cônes
```cpp
cones = (
    { x = 0; y = 0; z = 0; radius = 15; height = 25; color = { r = 255; g = 0; b = 128; }; }
);
```

### Éclairage

```cpp
lights:
{
    ambient = 0.4;    // Multiplicateur lumière ambiante
    diffuse = 0.6;    // Multiplicateur lumière diffuse
    
    // Lumières ponctuelles
    point = (
        { x = 400; y = 100; z = 500; }
    );
    
    // Lumières directionnelles
    directional = (
        { x = -1; y = -1; z = -1; }  // Coordonnées entières
    );
};
```

## Utilisation

### Lancer le Raytracer

```bash
# Syntaxe de base
./raytracer <SCENE_FILE>

# Exemples
./raytracer scenes/simple_sphere.cfg
./raytracer scenes/colorful_spheres.cfg
./raytracer scenes/complex_scene.cfg
```

### Visualiser les Images

Le Makefile inclut des commandes pour visualiser les fichiers PPM :

```bash
# Visualiser tous les fichiers PPM
make view

# Visualiser un fichier spécifique
make view-nom_du_fichier  # ex: make view-simple_sphere
```

## Fichiers de Scène de Test

Le projet inclut plusieurs scènes de test dans le dossier `scenes/` :

| Scène | Description | Complexité |
|-------|-------------|------------|
| `simple_sphere.cfg` | Sphère rouge simple | * |
| `colorful_spheres.cfg` | Sphères colorées multiples | ** |
| `cylinders_cones.cfg` | Cylindres et cônes | *** |
| `directional_light.cfg` | Éclairage directionnel | *** |
| `complex_scene.cfg` | Scène complète avec tout | **** |

## Patterns de Design Utilisés

Le projet implémente plusieurs patterns de design pour l'extensibilité :

### 1. Factory Pattern
- **Localisation** : `src/Parser/Factory.cpp`
- **Utilité** : Création d'instances de primitives et de lumières
- **Avantages** : Extensibilité facile, centralisation de la création

### 2. Builder Pattern
- **Localisation** : `src/Parser/SceneBuilder.cpp`
- **Utilité** : Construction étape par étape des scènes complexes
- **Avantages** : Séparation de la construction de la représentation

### 3. Composite Pattern
- **Localisation** : `src/Core/Scene.cpp` (méthode `hitAnything`)
- **Utilité** : Traitement uniforme des collections de primitives
- **Avantages** : Interface unique pour les objets individuels et composites

## Documentation

Pour une documentation complète :

- **Documentation principale** : `docs/README.md`
- **Architecture technique** : `docs/architecture/README.md`
- **Décisions d'architecture** : `docs/architecture/adr/README.md`
- **Guides pratiques** : `docs/guides/README.md`
- **Guide de contribution** : `CONTRIBUTING.md`

## Dépannage

### Erreurs Communes

#### "Données invalides pour le plan"
- **Cause** : Utilisation de `position` au lieu de `r` pour les plans
- **Solution** : Utiliser `r = -30;` au lieu de `position = -30;`

#### "Données invalides pour la lumière directionnelle"
- **Cause** : Utilisation de valeurs décimales pour les coordonnées
- **Solution** : Utiliser des entiers : `{ x = -1; y = -1; z = -1; }`

### Problèmes de Compilation

```bash
# Si libconfig++ n'est pas trouvé
sudo apt install -y libconfig++-dev

# Si le C++20 n'est pas supporté
# Changer dans le Makefile : -std=c++20 → -std=c++17
```

## Personnalisation

### Ajouter une Nouvelle Primitive

1. **Créer la classe** héritant de `IPrimitive`
2. **Implémenter** la méthode `hit()`
3. **Ajouter** la création dans `Factory::create...()`
4. **Ajouter** le parsing dans `SceneParser.cpp`

### Ajouter un Nouveau Type de Lumière

1. **Créer la classe** héritant de `ILight`
2. **Implémenter** la méthode `computeImpactLight()`
3. **Ajouter** la création dans `Factory::create...()`
4. **Ajouter** le parsing dans `SceneParser.cpp`

## Performance

### Optimisations Implémentées
- **Multithreading** : Rendu parallèle sur 4 threads
- **Smart Pointers** : Gestion mémoire automatique
- **Early Exit** : Arrêt des calculs au premier impact

### Améliorations Possibles
- **Spatial Partitioning** : BVH, Octree, KD-Tree
- **Adaptive Supersampling** : Anti-aliasing intelligent
- **GPU Computing** : CUDA/OpenCL pour parallélisation massive

## Contributeurs

- **Ariel** - Architecture, Primitives, Makefile
- **Murchid07** - Système d'éclairage
- **darrylnoumonvi** - Renderer et multithreading

## Licence

Projet réalisé dans le cadre du programme Epitech G-OOP-400.

---

**YOUR CPU GOES BRRRR!**
