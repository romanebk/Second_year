# ADR-007: Patterns Factory/Builder/Composite

## Status
Accepted
# ADR-007: Patterns Factory/Builder/Composite
## Context
Le cahier des charges Epitech G-OOP-400 exige :

## Alternatives considérées

### Sans patterns (code procédural)
- **Description** : Fonctions directes pour créer et manipuler les objets
- **Avantages** : Simple à comprendre, rapide à implémenter
- **Inconvénients** : Non extensible, code dupliqué, difficile à maintenir

### Factory seul
- **Description** : Uniquement pattern Factory pour créer les objets
- **Avantages** : Centralisation de la création
- **Inconvénients** : Construction d'objets complexes difficile

### Builder seul
- **Description** : Uniquement pattern Builder pour construire les scènes
- **Avantages** : Construction étape par étape
- **Inconvénients** : Création d'objets décentralisée

### Composite seul
- **Description** : Uniquement pattern Composite pour les collections
- **Avantages** : Traitement uniforme
- **Inconvénients** : Pas de flexibilité dans la création

### Combinaison Factory + Builder + Composite
- **Description** : Utilisation des trois patterns ensemble
- **Avantages** : Extensibilité maximale, séparation des responsabilités
- **Inconvénients** : Complexité accrue, plus de fichiers

## Decision
Nous avons choisi **la combinaison Factory + Builder + Composite** :

### 1. Factory Pattern
**Localisation** : `src/Parser/Factory.cpp`
```cpp
class Factory {
public:
    // Primitives
    static std::unique_ptr<IPrimitive> createSphere(const Vector3& pos, double radius, const Vector3& color);
    static std::unique_ptr<IPrimitive> createPlane(const std::string& axis, double position, const Vector3& color);
    static std::unique_ptr<IPrimitive> createCylinder(const Vector3& pos, double radius, double height, const Vector3& color);
    static std::unique_ptr<IPrimitive> createCone(const Vector3& pos, double radius, double height, const Vector3& color);
    
    // Lights
    static std::unique_ptr<ILight> createAmbientLight(double intensity);
    static std::unique_ptr<ILight> createDirectionalLight(const Vector3& direction, double intensity);
    static std::unique_ptr<ILight> createPointLight(const Vector3& position, double intensity);
};
```

**Bénéfices** :
- Extensibilité : Ajouter nouvelle primitive = nouvelle méthode Factory
- Centralisation : Tout la création passe par un point
- Validation : Paramètres validés à la création

### 2. Builder Pattern
**Localisation** : `src/Parser/SceneBuilder.cpp`
```cpp
class SceneBuilder {
private:
    Scene currentScene;
public:
    void setCamera(const Camera& camera);
    void addPrimitive(std::unique_ptr<IPrimitive> prim);
    void addLight(std::unique_ptr<ILight> light);
    void setDiffuseMultiplier(double diff);
    Scene getResult();
};
```

**Flux de construction** :
```cpp
SceneParser parser("scene.cfg");
SceneBuilder builder;

// Étapes de construction
builder.setCamera(camera);
builder.addPrimitive(Factory::createSphere(...));
builder.addLight(Factory::createAmbientLight(...));

// Objet final immuable
Scene scene = builder.getResult();
```

**Bénéfices** :
- Construction contrôlée : Étapes validées
- Immuabilité : Scene finale non modifiable
- Flexibilité : Ordre de construction variable

### 3. Composite Pattern
**Localisation** : `src/Core/Scene.cpp`
```cpp
class Scene {
private:
    std::vector<std::unique_ptr<IPrimitive>> primitives;
    std::vector<std::unique_ptr<ILight>> lights;
public:
    bool hitAnything(const Ray& ray, double t_min, double t_max, HitRecord& rec) const {
        HitRecord temp_rec;
        bool hit_anything = false;
        auto closest_so_far = t_max;

        // Traitement uniforme de toutes les primitives
        for (const auto& primitive : primitives) {
            if (primitive->hit(ray, t_min, closest_so_far, temp_rec)) {
                hit_anything = true;
                closest_so_far = temp_rec.t;
                rec = temp_rec;
            }
        }
        return hit_anything;
    }
};
```

**Bénéfices** :
- Interface unique : `primitive->hit()` pour tous types
- Extensibilité : Nouvelle primitive automatiquement supportée
- Performance : Parcours optimisé de la collection

## Consequences

### Positives
- **Extensibilité maximale** : 3 patterns pour 3 aspects différents
- **Séparation des responsabilités** : Création, construction, traitement
- **Maintenabilité** : Chaque pattern isolé et testable
- **Epitech compliant** : 3 patterns > exigence de 2
- **Prêt pour plugins** : Structure idéale pour chargement dynamique

### Négatives
- **Complexité accrue** : Plus de classes et de fichiers
- **Courbe d'apprentissage** : Patterns à comprendre pour nouveaux développeurs
- **Overhead d'indirection** : Appels virtuels et pointeurs

### Mitigations
- **Documentation complète** : ADRs et guides d'extension
- **Exemples clairs** : Scènes de test et templates
- **Code comments** : Explication des patterns dans le code

### Intégration des patterns
```cpp
// Parser utilise Factory pour créer les objets
std::unique_ptr<IPrimitive> sphere = Factory::createSphere(pos, radius, color);

// Builder reçoit les objets et construit la scène
builder.addPrimitive(std::move(sphere));

// Scene utilise Composite pour traiter uniformément les primitives
scene.hitAnything(ray, t_min, t_max, record);
```

### Extensibilité future
- **Nouvelle primitive** : Ajouter méthode Factory + implémenter IPrimitive
- **Nouveau type de lumière** : Ajouter méthode Factory + implémenter ILight
- **Nouveau format de scène** : Créer nouveau Builder
- **Optimisation** : Remplacer Composite par arbre spatial (BVH)

---

*Decision prise le 12 mai 2026*
