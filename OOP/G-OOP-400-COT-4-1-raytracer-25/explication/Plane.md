# Plane — Plan

## Fichiers

- `include/Primitives/Plane.hpp`
- `src/Primitives/Plane.cpp`

---

## Plane.hpp

```cpp
#ifndef PLANE_HPP_
#define PLANE_HPP_

#include "../Interfaces/IPrimitive.hpp"
#include "../Math/Vector3.hpp"
#include <string>

class Plane : public IPrimitive {
    private:
        std::string axis;
        double position;
        Vector3 color;
        Vector3 translation;
    public:
        Plane(const std::string& axis, double position, const Vector3& color, const Vector3& translation = Vector3(0,0,0));
        ~Plane() = default;
        bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const override;
};
#endif
```

### Membres privés

| Membre | Type | Rôle |
|---|---|---|
| `axis` | `std::string` | Axe perpendiculaire au plan : `"X"`, `"Y"` ou `"Z"` |
| `position` | `double` | Position du plan le long de l'axe (ex: Y = -2) |
| `color` | `Vector3` | Couleur RGB du plan |
| `translation` | `Vector3` | Déplacement du plan dans l'espace monde |

### Particularité du Plan

Contrairement aux autres primitives, le **plan est défini par un axe et une position**, pas par un centre. Cela le rend **infini** : il n'a pas de limites dans les deux autres dimensions.

Exemples :
- `axis = "Y", position = -2` → plan horizontal à Y = -2 (comme un sol)
- `axis = "X", position = 0` → plan vertical à X = 0
- `axis = "Z", position = 5` → plan vertical à Z = 5

---

## Plane.cpp

```cpp
#include "../../include/Primitives/Plane.hpp"
#include <cmath>
```

### Constructeur

```cpp
Plane::Plane(const std::string& axis, double position, const Vector3& color, const Vector3& translation)
    : axis(axis), position(position), color(color), translation(translation) {}
```

Stocke simplement les paramètres.

### Méthode `hit()` — Intersection rayon-plan

```cpp
bool Plane::hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const
{
    Ray transformedRay(ray.origin - translation, ray.direction);
    // ...
}
```

#### Étape 1 : Transformation inverse

Comme pour toutes les primitives, on soustrait la translation au rayon.

#### Étape 2 : Sélection de l'axe

```cpp
double origin_val = 0;
double dir_val = 0;
Vector3 normal;

if (axis == "X") {
    origin_val = transformedRay.origin.x;
    dir_val = transformedRay.direction.x;
    normal = Vector3(1, 0, 0);
} else if (axis == "Y") {
    origin_val = transformedRay.origin.y;
    dir_val = transformedRay.direction.y;
    normal = Vector3(0, 1, 0);
} else {
    origin_val = transformedRay.origin.z;
    dir_val = transformedRay.direction.z;
    normal = Vector3(0, 0, 1);
}
```

Selon l'axe, on extrait la composante correspondante de l'origine et de la direction du rayon transformé.

La normale est un vecteur unitaire sur l'axe choisi :
- Plan X → normale `(1, 0, 0)` (pointe vers +X)
- Plan Y → normale `(0, 1, 0)` (pointe vers +Y)
- Plan Z → normale `(0, 0, 1)` (pointe vers +Z)

#### Étape 3 : Équation linéaire (1er degré)

```cpp
if (std::fabs(dir_val) < 1e-8)
    return false;

double t = (position - origin_val) / dir_val;
```

Contrairement à la sphère (quadratique), l'intersection rayon-plan est une **équation linéaire** :

```
P(t) = O + D·t
Plan : composante_axe = position

Donc : origin_val + dir_val × t = position
→ t = (position - origin_val) / dir_val
```

Si `dir_val ≈ 0` (fabs < 1e-8), le rayon est **parallèle** au plan → pas d'intersection.

#### Étape 4 : Validation et HitRecord

```cpp
if (t < t_min || t > t_max)
    return false;

rec.t = t;
rec.point = ray.origin + ray.direction * t;
rec.normal = normal;
rec.couleur = color;
return true;
```

- La normale est **constante** pour tout le plan (contrairement à la sphère où elle varie)
- Le point d'impact est calculé dans l'espace monde
- Pas de vérification supplémentaire (le plan est infini)

### Pourquoi le plan est-il limité à 3 axes ?

Le plan est **axis-aligned** (aligné sur les axes). Cela simplifie énormément les calculs :
- Pas de rotation supportée pour le plan
- L'équation d'intersection se réduit à une simple division
- Rapide à calculer

### Qu'est-ce que le `1e-8` ?

C'est une **tolérance epsilon** pour éviter la division par zéro. En virgule flottante, on ne teste jamais l'égalité exacte avec zéro. Si `|dir_val| < 1e-8`, on considère que le rayon est parallèle au plan.

---

## Questions possibles en défense

1. **Pourquoi le plan n'a-t-il pas de centre ?**  
   *Parce qu'un plan infini est défini par un axe et une position, pas par un point central. Cela correspond mieux à son utilisation (sol, murs).*

2. **Pourquoi 3 axes seulement ?**  
   *C'est un plan axis-aligned. On pourrait supporter des plans orientés avec une normale quelconque, mais cela nécessiterait plus de paramètres (normale + distance) et n'est pas demandé.*

3. **Que se passe-t-il si `dir_val` est exactement 0 ?**  
   *Le rayon est parallèle au plan, donc jamais d'intersection (sauf s'il est dans le plan, mais on ignore ce cas).*

4. **Pourquoi la normale est-elle constante ?**  
   *Un plan infini a une seule direction perpendiculaire, identique en tous ses points. C'est ce qui le différencie d'une surface courbe.*

5. **Le plan peut-il être translaté ?**  
   *Oui, via `translation`. La translation s'applique à l'origine du rayon (transformation inverse), ce qui revient à déplacer le plan dans la direction opposée.*

6. **Quel est l'avantage d'un plan axis-aligned ?**  
   *La simplicité : une seule division au lieu d'une équation quadratique complète. C'est très rapide.*
