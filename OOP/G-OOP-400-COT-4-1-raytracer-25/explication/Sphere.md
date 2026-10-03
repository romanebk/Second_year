# Sphere — Sphère

## Fichiers

- `include/Primitives/Sphere.hpp`
- `src/Primitives/Sphere.cpp`

---

## Sphere.hpp

```cpp
#ifndef SPHERE_HPP_
#define SPHERE_HPP_

#include "../Interfaces/IPrimitive.hpp"
#include "../Math/Vector3.hpp"

class Sphere : public IPrimitive {
    private:
        Vector3 center;
        double radius;
        Vector3 color;
        Vector3 translation;
    public:
        Sphere(const Vector3& center, double radius, const Vector3& color, const Vector3& translation = Vector3(0,0,0));
        ~Sphere() = default;
        bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const override;
};
#endif
```

### Membres privés

| Membre | Type | Rôle |
|---|---|---|
| `center` | `Vector3` | Centre de la sphère dans son espace local |
| `radius` | `double` | Rayon de la sphère |
| `color` | `Vector3` | Couleur RGB de la sphère (composantes 0-255) |
| `translation` | `Vector3` | Déplacement à appliquer à la sphère dans l'espace monde |

### Constructeur

```cpp
Sphere(const Vector3& center, double radius, const Vector3& color,
       const Vector3& translation = Vector3(0,0,0));
```

- `center` et `radius` définissent la sphère localement
- `color` est la couleur de base
- `translation` est optionnel (par défaut `(0,0,0)` = pas de translation)

### Note sur `translation` vs `center`

- `center` = position dans l'espace local de la primitive
- `translation` = déplacement global appliqué au moment du rendu

Cette séparation permet de définir des primitives centrées à l'origine puis de les déplacer via la translation, ce qui facilite les calculs d'intersection.

---

## Sphere.cpp

```cpp
#include "../../include/Primitives/Sphere.hpp"
#include <cmath>
```

### Constructeur

```cpp
Sphere::Sphere(const Vector3& center, double radius, const Vector3& color, const Vector3& translation)
    : center(center), radius(radius), color(color), translation(translation) {}
```

Simple initialisation des membres via la liste d'initialisation.

### Méthode `hit()` — Intersection rayon-sphère

```cpp
bool Sphere::hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const
{
    Ray transformedRay(ray.origin - translation, ray.direction);
    Vector3 oc = transformedRay.origin - center;
    // ...
}
```

#### Étape 1 : Transformation inverse

On soustrait `translation` à l'origine du rayon pour travailler dans l'espace local :  
`Ray transformedRay(ray.origin - translation, ray.direction)`

#### Étape 2 : Équation quadratique

On calcule le vecteur `oc = origine_rayon - centre_sphère` (dans l'espace local), puis :

```
a = D · D                (produit scalaire de la direction avec elle-même)
b = 2 × (oc · D)
c = oc · oc - r²
discriminant = b² - 4ac
```

- `a` est toujours ≥ 0 (c'est la norme au carré de la direction)
- Le discriminant détermine si le rayon touche la sphère :
  - **∆ < 0** → pas d'intersection (le rayon rate la sphère)
  - **∆ = 0** → le rayon est tangent à la sphère (un seul point)
  - **∆ > 0** → deux intersections (entrée et sortie de la sphère)

#### Étape 3 : Résolution

```cpp
double sqrtD = std::sqrt(discriminant);
double t = (-b - sqrtD) / (2.0 * a);    // première racine (la plus proche)
if (t < t_min || t > t_max) {
    t = (-b + sqrtD) / (2.0 * a);        // deuxième racine
    if (t < t_min || t > t_max)
        return false;                     // aucune racine valide
}
```

On prend d'abord `(-b - sqrtD) / (2a)` qui donne la **plus petite valeur de t** (entrée dans la sphère). Si elle n'est pas dans l'intervalle, on essaie `(-b + sqrtD) / (2a)` (sortie de la sphère).

#### Étape 4 : Remplissage du HitRecord

```cpp
rec.t = t;
rec.point = ray.origin + ray.direction * t;       // Point d'impact dans l'espace monde
rec.normal = (rec.point - (center + translation)) / radius;  // Normale = (point - centre) / rayon
rec.couleur = color;
return true;
```

- **`rec.t`** : distance le long du rayon
- **`rec.point`** : calculé avec le rayon **original** (espace monde)
- **`rec.normal`** : pour une sphère, la normale en un point est le vecteur du centre vers le point, normalisé (on centre + translation pour revenir dans l'espace monde)
- **`rec.couleur`** : la couleur de base

### D'où vient l'équation quadratique ?

L'intersection rayon-sphère repose sur l'équation paramétrique du rayon `P(t) = O + D·t` et l'équation de la sphère `|P - C|² = r²`. En substituant :

```
|O + D·t - C|² = r²
|oc + D·t|² = r²        (avec oc = O - C)
(oc·oc) + 2t(oc·D) + t²(D·D) - r² = 0
```

Soit : `a·t² + b·t + c = 0` avec `a = D·D`, `b = 2(oc·D)`, `c = oc·oc - r²`.

---

## Questions possibles en défense

1. **Pourquoi séparer `center` et `translation` ?**  
   *Pour pouvoir définir la sphère localement autour de l'origine et faciliter les maths, puis la déplacer dans la scène.*

2. **Pourquoi transforme-t-on le rayon et pas la sphère ?**  
   *Transformation inverse : c'est équivalent et plus simple. Au lieu de calculer une sphère translatée, on translate le rayon dans la direction opposée.*

3. **Que se passe-t-il si `a = 0` ?**  
   *Cela signifierait que la direction du rayon est nulle, ce qui n'arrive pas en pratique car la direction est normalisée.*

4. **Pourquoi deux racines ?**  
   *Une sphère est une surface fermée. La première racine est l'entrée, la seconde la sortie. On prend toujours la plus petite dans l'intervalle.*

5. **Comment est calculée la normale ?**  
   *La normale à la surface de la sphère en un point est le vecteur allant du centre à ce point, divisé par le rayon pour le normaliser.*
