# Cone — Cône

## Fichiers

- `include/Primitives/Cone.hpp`
- `src/Primitives/Cone.cpp`

---

## Cone.hpp

```cpp
#ifndef CONE_HPP_
#define CONE_HPP_

#include "../Interfaces/IPrimitive.hpp"
#include "../Math/Vector3.hpp"

class Cone : public IPrimitive {
    private:
        Vector3 apex;
        double radius;
        double height;
        Vector3 color;
        Vector3 translation;
    public:
        Cone(const Vector3& apex, double radius, double height, const Vector3& color, const Vector3& translation = Vector3(0,0,0));
        ~Cone() = default;
        bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const override;
};
#endif
```

### Membres privés

| Membre | Type | Rôle |
|---|---|---|
| `apex` | `Vector3` | Apex (pointe) du cône |
| `radius` | `double` | Rayon à la base du cône |
| `height` | `double` | Hauteur du cône (de l'apex à la base, le long de Y) |
| `color` | `Vector3` | Couleur RGB du cône |
| `translation` | `Vector3` | Déplacement dans l'espace monde |

### Particularité du cône

Le cône est **droit** et aligné sur Y. Il est défini par :
- Un **apex** (pointe) en haut
- Un **rayon** à la base
- Une **hauteur** (distance entre l'apex et la base)
- La base est en `apex + height` sur Y, l'apex est en `apex`

Visuellement : apex en haut, la base s'élargit vers le bas.

---

## Cone.cpp

```cpp
#include "../../include/Primitives/Cone.hpp"
#include <cmath>
```

### Constructeur

```cpp
Cone::Cone(const Vector3& apex, double radius, double height, const Vector3& color, const Vector3& translation)
    : apex(apex), radius(radius), height(height), color(color), translation(translation) {}
```

Stocke les paramètres.

### Méthode `hit()` — Intersection rayon-cône

#### Étape 1 : Transformation inverse

```cpp
Ray transformedRay(ray.origin - translation, ray.direction);
```

L'apex est déjà dans l'espace local.

#### Étape 2 : Calcul du coefficient de conicité

```cpp
double k = (radius / height) * (radius / height);
```

`k = (r/h)²` est le **coefficient de conicité** qui relie le rayon à la hauteur.  
Pour un cône, le rayon à une hauteur `y` (mesurée depuis l'apex) est : `r(y) = (r/h) × y`

L'équation du cône est :
```
x² + z² = k × y²
```
où `y` est la distance depuis l'apex.

#### Étape 3 : Équation quadratique modifiée

```cpp
Vector3 oc = transformedRay.origin - apex;

double a = transformedRay.direction.x * transformedRay.direction.x
         + transformedRay.direction.z * transformedRay.direction.z
         - k * transformedRay.direction.y * transformedRay.direction.y;

double b = 2.0 * (oc.x * transformedRay.direction.x
         + oc.z * transformedRay.direction.z
         - k * oc.y * transformedRay.direction.y);

double c = oc.x * oc.x + oc.z * oc.z - k * oc.y * oc.y;
```

**Différence avec le cylindre** : on inclut le terme `-k × Dy²` dans `a`, `-k × oc.y × Dy` dans `b`, et `-k × oc.y²` dans `c`. C'est ce qui donne la forme conique (qui se rétrécit vers l'apex).

L'équation générale dérive de :
```
|P - apex|²_xz = k × (P.y - apex.y)²
```
Avec `P(t) = O + D·t` :
```
(O.x + Dx·t - apex.x)² + (O.z + Dz·t - apex.z)² = k × (O.y + Dy·t - apex.y)²
```

#### Étape 4 : Résolution

```cpp
double discriminant = b * b - 4 * a * c;
if (discriminant < 0)
    return false;

double sqrtD = std::sqrt(discriminant);
double t1 = (-b - sqrtD) / (2.0 * a);
double t2 = (-b + sqrtD) / (2.0 * a);
```

Si `a ≈ 0`, le rayon est parallèle à la surface du cône → pas d'intersection.

#### Étape 5 : Contrainte de hauteur (clipping Y)

```cpp
double t = -1.0;
double y_hit = 0.0;

if (t1 >= t_min && t1 <= t_max) {
    y_hit = oc.y + t1 * transformedRay.direction.y;
    if (y_hit >= 0 && y_hit <= height)
        t = t1;
}

if (t < 0 && t2 >= t_min && t2 <= t_max) {
    y_hit = oc.y + t2 * transformedRay.direction.y;
    if (y_hit >= 0 && y_hit <= height)
        t = t2;
}

if (t < 0)
    return false;
```

Comme pour le cylindre, on vérifie que `y_hit` (distance depuis l'apex) est entre 0 et `height` :
- `y_hit = 0` → intersection à l'apex (possible mais rare)
- `y_hit = height` → intersection à la base

#### Étape 6 : Normale

```cpp
rec.t = t;
rec.point = ray.origin + ray.direction * t;
Vector3 hit_local = rec.point - (apex + translation);
double r_hit = std::sqrt(hit_local.x * hit_local.x + hit_local.z * hit_local.z);
if (r_hit < 1e-8) r_hit = 1e-8;
rec.normal = Vector3(
    hit_local.x / r_hit,
    -r_hit / height * (radius / height),
    hit_local.z / r_hit
);
rec.couleur = color;
```

La normale d'un cône est plus complexe que celle du cylindre :

```
N = (point.x / r_hit,  -r_hit / height × (r/h),  point.z / r_hit)
```

- Les composantes X et Z sont radiales (comme le cylindre)
- La composante Y est **négative et proportionnelle** au rayon local : elle pointe vers le bas et vers l'extérieur, reflétant la pente du cône
- `r_hit` est le rayon local au point d'impact (distance en XZ depuis l'axe)
- Le `/height * (radius/height)` vient de la dérivée de l'équation du cône

Le `if (r_hit < 1e-8)` évite une division par zéro si le point d'impact est exactement à l'apex.

---

## Résumé de l'algorithme

1. Transformer le rayon dans l'espace local
2. Calculer `k = (r/h)²` (coefficient de forme)
3. Résoudre l'équation quadratique du cône (incluant le facteur Y)
4. Pour chaque solution, vérifier si Y est entre 0 et height
5. Calculer la normale avec la composante Y inclinée

---

## Cône vs Cylindre : les différences

| Aspect | Cylindre | Cône |
|---|---|---|
| Équation | `x² + z² = r²` | `x² + z² = k × y²` |
| Section | Constante | Variable (rétrécit vers apex) |
| Coefficient `k` | N/A (pas de `k`) | `k = (r/h)²` |
| Normale Y | 0 (horizontale) | Non-nulle (inclinée) |
| Terme `-k×Dy²` dans `a` | Non | Oui |

---

## Questions possibles en défense

1. **À quoi sert `k = (radius/height)²` ?**  
   *C'est le facteur qui définit la pente du cône. Il relie le rayon à la hauteur. Plus k est grand, plus le cône s'évase rapidement.*

2. **Pourquoi la normale a-t-elle une composante Y ?**  
   *Parce que la surface du cône est inclinée. La normale n'est pas purement radiale comme pour le cylindre ; elle a une composante verticale qui dépend de la pente.*

3. **Le cône a-t-il une base (couvercle) ?**  
   *Non, comme le cylindre, seule la surface latérale est intersectée. Pas de cap.*

4. **Que se passe-t-il si le rayon touche exactement l'apex ?**  
   *La normale serait mal définie (division par zéro). Le `if (r_hit < 1e-8)` protège contre ce cas.*

5. **Pourquoi 'a' pourrait-il être nul ?**  
   *Si `Dx² + Dz² = k × Dy²`, le rayon suit la pente exacte du cône. Il est alors parallèle à la surface et ne l'intersecte pas (tangent).*

6. **Pourquoi 'oc' n'est-il pas transformé de la même manière que pour la sphère ?**  
   *C'est le même principe : `oc = origine_rayon - apex` dans l'espace local du cône. La différence est dans l'équation elle-même.*
