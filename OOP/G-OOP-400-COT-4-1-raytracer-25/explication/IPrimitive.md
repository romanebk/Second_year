# IPrimitive.hpp — Interface abstraite des primitives

## Chemin

`include/Interfaces/IPrimitive.hpp`

## Code

```cpp
#ifndef IPRIMITIVE_HPP_
#define IPRIMITIVE_HPP_

#include "../Core/HitRecord.hpp"
#include "../Core/Ray.hpp"

class IPrimitive {
    public:
        virtual ~IPrimitive() = default;
        virtual bool hit(const Ray& _ray, double t_min, double t_max, HitRecord& rec) const = 0;
};
#endif
```

## Explication détaillée

### Rôle

`IPrimitive` est l'**interface abstraite** (classe de base virtuelle pure) dont héritent toutes les primitives géométriques du raytracer : `Sphere`, `Plane`, `Cylinder` et `Cone`. Elle définit le **contrat** que chaque primitive doit respecter pour pouvoir être intersectée par un rayon.

### Pourquoi une interface ?

Dans un raytracer, le cœur du programme (**Renderer**, **Scene**) doit pouvoir traiter **n'importe quelle primitive** de manière uniforme, sans connaître son type concret. C'est le principe du **polymorphisme** : `Scene` stocke un `std::vector<std::unique_ptr<IPrimitive>>` et appelle `hit()` sur chaque élément sans savoir si c'est une sphère ou un cône.

### Méthode virtuelle pure

```cpp
virtual bool hit(const Ray& _ray, double t_min, double t_max, HitRecord& rec) const = 0;
```

- `const Ray& _ray` — Le rayon à tester (paramètres : origine + direction)
- `double t_min, t_max` — Intervalle de distance valide pour l'intersection (permet d'ignorer les intersections trop proches ou trop lointaines, et notamment d'éviter l'auto-intersection avec `t_min = 0.001`)
- `HitRecord& rec` — **Paramètre de sortie** : si intersection, les informations (point, normale, couleur) y sont écrites
- `return bool` — `true` si le rayon touche la primitive dans l'intervalle, `false` sinon
- `const = 0` — Rend la classe **abstraite** (on ne peut pas instancier `IPrimitive` directement)

### Destructeur virtuel

```cpp
virtual ~IPrimitive() = default;
```

Nécessaire pour que la destruction via un pointeur de la classe de base appelle correctement le destructeur de la classe dérivée. `= default` indique qu'on utilise le destructeur par défaut.

### Algorithme commun à toutes les primitives

Chaque `hit()` concrète suit ce schéma :

1. **Transformer le rayon** dans l'espace local (soustraire la translation)
2. **Résoudre l'équation d'intersection** (quadratique pour sphère, cylindre, cône ; linéaire pour le plan)
3. **Trouver la plus petite racine `t`** dans l'intervalle [t_min, t_max]
4. **Vérifier les contraintes** (hauteur pour cylindre/cône)
5. **Remplir le HitRecord** avec `t`, le point d'impact, la normale et la couleur
6. **Retourner** `true` ou `false`

### Note sur `_ray`

Le paramètre est nommé `_ray` avec un underscore, ce qui est une convention pour éviter la collision avec le nom de type `Ray`. Cela n'a pas d'incidence sur le comportement.
