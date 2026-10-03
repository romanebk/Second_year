# Cylinder — Cylindre

## Fichiers

- `include/Primitives/Cylinder.hpp`
- `src/Primitives/Cylinder.cpp`

---

## Cylinder.hpp

```cpp
#ifndef CYLINDER_HPP_
#define CYLINDER_HPP_

#include "../Interfaces/IPrimitive.hpp"
#include "../Math/Vector3.hpp"

class Cylinder : public IPrimitive {
    private:
        Vector3 center;
        double radius;
        double height;
        Vector3 color;
        Vector3 translation;
    public:
        Cylinder(const Vector3& center, double radius, double height, const Vector3& color, const Vector3& translation = Vector3(0,0,0));
        ~Cylinder() = default;
        bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const override;
};
#endif
```

### Membres privés

| Membre | Type | Rôle |
|---|---|---|
| `center` | `Vector3` | Centre du cylindre (au milieu de sa hauteur, à la base du cylindre dans ce code) |
| `radius` | `double` | Rayon du cylindre |
| `height` | `double` | Hauteur du cylindre (le long de l'axe Y) |
| `color` | `Vector3` | Couleur RGB du cylindre |
| `translation` | `Vector3` | Déplacement dans l'espace monde |

### Particularité du cylindre

Le cylindre est **droit** (son axe est aligné sur Y). Il est défini par :
- Une section circulaire dans le plan XZ (rayon)
- Une hauteur le long de Y (de 0 à height)
- Un centre à la base

---

## Cylinder.cpp

```cpp
#include "../../include/Primitives/Cylinder.hpp"
#include <cmath>
```

### Constructeur

```cpp
Cylinder::Cylinder(const Vector3& center, double radius, double height, const Vector3& color, const Vector3& translation)
    : center(center), radius(radius), height(height), color(color), translation(translation) {}
```

Stocke les paramètres. `center` est la position de la base du cylindre.

### Méthode `hit()` — Intersection rayon-cylindre

#### Étape 1 : Transformation inverse

```cpp
Ray transformedRay(ray.origin - translation, ray.direction);
Vector3 oc = transformedRay.origin - center;
```

#### Étape 2 : Équation quadratique dans le plan XZ

Contrairement à la sphère (3D), le cylindre est défini seulement par son rayon en **XZ**. On ignore Y :

```cpp
double a = transformedRay.direction.x * transformedRay.direction.x
         + transformedRay.direction.z * transformedRay.direction.z;
double b = 2.0 * (oc.x * transformedRay.direction.x
         + oc.z * transformedRay.direction.z);
double c = oc.x * oc.x + oc.z * oc.z - radius * radius;
```

C'est l'équation d'un **cercle en 2D** (XZ) :

```
a = Dx² + Dz²
b = 2 × (oc.x × Dx + oc.z × Dz)
c = oc.x² + oc.z² - r²
```

Si `a ≈ 0`, la direction du rayon est parallèle à l'axe Y → il ne peut pas intersecter le cylindre.

#### Étape 3 : Résolution de la quadratique

```cpp
double discriminant = b * b - 4 * a * c;
if (discriminant < 0)
    return false;

double sqrtD = std::sqrt(discriminant);
double t1 = (-b - sqrtD) / (2.0 * a);
double t2 = (-b + sqrtD) / (2.0 * a);
```

Même principe que la sphère : discriminant ≥ 0 pour qu'il y ait intersection.

#### Étape 4 : Contrainte de hauteur (clipping Y)

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

**C'est la différence clé avec la sphère** : on vérifie que la coordonnée Y du point d'intersection est comprise entre 0 et `height`.

- `y_hit = oc.y + t × Dy` : composante Y du point d'impact dans l'espace local
- Si `y_hit` est entre 0 et `height`, l'intersection est sur le corps du cylindre
- On teste d'abord `t1` (plus proche), puis `t2` si besoin

Si aucun des deux `t` ne satisfait la contrainte de hauteur, pas d'intersection.

> **Note importante** : ce code ne gère pas les **couvercles** (caps) du cylindre. Les faces du haut et du bas ne sont pas intersectées. Un rayon qui traverse le cylindre par le dessus ne verra que le bord incurvé.

#### Étape 5 : Normale

```cpp
rec.t = t;
rec.point = ray.origin + ray.direction * t;
Vector3 hit_local = rec.point - (center + translation);
rec.normal = Vector3(hit_local.x / radius, 0, hit_local.z / radius);
rec.couleur = color;
```

La normale d'un cylindre droit est **horizontale** (Y = 0) et pointe radialement depuis l'axe central :

```
Normale = (hit_local.x / r, 0, hit_local.z / r)
```

C'est un vecteur unitaire pointant vers l'extérieur dans le plan XZ.

---

## Résumé de l'algorithme

1. Transformer le rayon dans l'espace local
2. Résoudre l'équation du cercle en XZ (comme un cercle 2D)
3. Pour chaque solution, vérifier si Y est entre 0 et height
4. Si oui, remplir le HitRecord avec le point, la normale horizontale et la couleur

---

## Questions possibles en défense

1. **Pourquoi le cylindre n'a-t-il pas de couvercles ?**  
   *Les caps (dessus et dessous) ne sont pas implémentés dans cette version. Cela signifie que si on regarde le cylindre d'en haut, on voit à travers. C'est une limitation connue.*

2. **Pourquoi utilise-t-on seulement X et Z dans l'équation ?**  
   *Parce que le cylindre est aligné sur Y. Sa section est un cercle dans le plan XZ. Y ne détermine que la hauteur.*

3. **Comment fonctionne la contrainte de hauteur ?**  
   *On calcule la coordonnée Y du point d'intersection potentiel et on vérifie qu'elle est entre 0 et height. Si oui, le point appartient bien au cylindre.*

4. **Pourquoi la normale a-t-elle Y = 0 ?**  
   *Pour un cylindre droit, la normale à la surface latérale est purement radiale (horizontale). Elle est perpendiculaire à l'axe Y.*

5. **Que se passe-t-il si `a = 0` ?**  
   *Cela signifie que la direction du rayon n'a pas de composante X ou Z, donc il est parallèle à l'axe Y. Il ne peut pas toucher la surface latérale.*

6. **Le cylindre supporte-t-il la rotation ?**  
   *Non, le cylindre est toujours aligné sur Y. La rotation n'est pas implémentée (le paramètre rotation est parsé mais ignoré dans Factory).*
