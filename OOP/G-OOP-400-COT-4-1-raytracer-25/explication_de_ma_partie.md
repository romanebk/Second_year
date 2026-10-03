Parfait, j'ai tout lu ! Je vais t'expliquer ta partie comme un pro.

---

## Ta partie : Les Primitives (Équipier 2)

### C'est quoi une primitive ?

Une primitive c'est une **forme géométrique de base** que le raytracer peut afficher. Ton rôle était d'implémenter la mathématique qui permet de savoir **si un rayon de lumière touche la forme ou pas**.

---

### L'interface `IPrimitive`

Toutes tes formes héritent de `IPrimitive` qui définit **une seule méthode obligatoire** :

```cpp
virtual bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const = 0;
```

Ce que ça fait :
- Prend un **rayon** (origine + direction)
- Retourne **true** si le rayon touche la forme entre `t_min` et `t_max`
- Si oui, remplit le **HitRecord** avec le point d'impact, la normale et la couleur

C'est le **pattern Strategy** — chaque primitive a sa propre implémentation de `hit()`.

---

### La Sphère — `Sphere.cpp`

C'est la forme la plus simple. La math repose sur l'**équation quadratique**.

**Équation de la sphère** : centre C, rayon r
```
‖P - C‖² = r²
```

**Équation du rayon** : `P = O + t·D`

**Substitution** : on remplace P par O + t·D dans l'équation de la sphère :
```
‖(O - C) + t·D‖² = r²
```

Soit `oc = O - C` (vecteur du centre à l'origine du rayon). En développant le produit scalaire :
```
(oc + t·D)·(oc + t·D) = r²
oc·oc + 2·t·(oc·D) + t²·(D·D) = r²
(D·D)·t² + 2·(oc·D)·t + (oc·oc - r²) = 0
```

On obtient une équation quadratique `a·t² + b·t + c = 0` avec :
```
a = D·D           → toujours ≥ 0 (produit scalaire d'un vecteur avec lui-même)
b = 2·(oc·D)
c = oc·oc - r²
```

**Discriminant** : `Δ = b² - 4ac`

**Interprétation du discriminant** :
- `Δ < 0` → pas d'intersection (le rayon rate la sphère)
- `Δ = 0` → tangent (1 seul point de contact)
- `Δ > 0` → 2 points d'intersection (on prend le plus proche, i.e. le plus petit t)

**Calcul du point d'impact** (quand Δ ≥ 0) :
```
t₁ = (-b - √Δ) / (2a)    → solution la plus proche
t₂ = (-b + √Δ) / (2a)    → solution la plus lointaine
```
On teste d'abord `t₁`. S'il est hors de `[t_min, t_max]`, on teste `t₂`.

**Normale au point d'impact** (vecteur perpendiculaire à la surface) :
```
N = (P - C) / r
```
C'est le vecteur qui va du centre C au point d'impact P, normalisé (car divisé par le rayon r).

---

### Le Plan — `Plane.cpp`

Encore plus simple. Un plan perpendiculaire à un axe à une position donnée vérifie une équation linéaire.

**Équation du plan** (3 axes supportés) :
```
Axe X : x = position    → plan perpendiculaire à X
Axe Y : y = position    → plan perpendiculaire à Y
Axe Z : z = position    → plan perpendiculaire à Z
```

**Substitution du rayon** `P = O + t·D` :
```
Axe X : Ox + t·Dx = position  →  t = (position - Ox) / Dx
Axe Y : Oy + t·Dy = position  →  t = (position - Oy) / Dy
Axe Z : Oz + t·Dz = position  →  t = (position - Oz) / Dz
```

**Condition** : si la direction du rayon est quasi-parallèle au plan (`|D_axis| < 1e-8`), pas d'intersection.

**Normale** (constante, dépend de l'axe) :
```
Axe X : N = (1,  0,  0)
Axe Y : N = (0,  1,  0)
Axe Z : N = (0,  0,  1)
```

C'est le seul cas où la normale est **constante** sur toute la surface — contrairement à la sphère où elle varie en chaque point.

Ton plan supporte les **3 axes X, Y, Z** — c'est plus flexible que le sujet qui n'en demandait qu'un.

---

### Le Cylindre — `Cylinder.cpp`

Le cylindre (axe Y, centre C) est basé sur l'équation d'un cylindre infini, puis limité par une hauteur.

**Équation du cylindre infini** (axe Y, rayon r) :
```
x² + z² = r²
```
On ignore complètement la coordonnée Y — le cylindre s'étend à l'infini sur Y.

**Substitution du rayon** `P = O + t·D` dans l'équation :
```
(Ox + t·Dx)² + (Oz + t·Dz)² = r²
```

Soit `oc = O - C` (où C est le centre du cylindre). On projette sur le plan XZ :
```
(oc.x + t·Dx)² + (oc.z + t·Dz)² = r²
```
En développant :
```
oc.x² + 2·oc.x·Dx·t + Dx²·t² + oc.z² + 2·oc.z·Dz·t + Dz²·t² = r²
(Dx² + Dz²)·t² + 2·(oc.x·Dx + oc.z·Dz)·t + (oc.x² + oc.z² - r²) = 0
```

Équation quadratique `a·t² + b·t + c = 0` avec :
```
a = Dx² + Dz²              → projection de la direction sur XZ
b = 2·(oc.x·Dx + oc.z·Dz)
c = oc.x² + oc.z² - r²
```

**Discriminant** : `Δ = b² - 4ac`

**Solutions** :
```
t₁ = (-b - √Δ) / (2a)    (solution la plus proche)
t₂ = (-b + √Δ) / (2a)    (solution la plus lointaine)
```

**Limited Cylinder (0.5 pt bonus)** — on vérifie la hauteur :
Après avoir trouvé `t`, on calcule la hauteur du point d'impact sur l'axe Y :
```
y_hit = oc.y + t·Dy
```
Le point est valide seulement si `y_hit ∈ [0, height]`.

**Normale** (radiale, pas de composante Y) :
```
N = (hit.x / r,  0,  hit.z / r)
```
C'est un vecteur qui pointe radialement vers l'extérieur du cylindre, perpendiculairement à l'axe Y.

---

### Le Cône — `Cone.cpp`

Le cône (axe Y, sommet en haut/apex) est similaire au cylindre mais avec un **rétrécissement progressif** vers le sommet.

**Équation du cône** (axe Y, rayon r à la base, hauteur h, sommet au `apex`) :
```
x² + z² = k·y²    où   k = (r / h)²
```
- `y = 0` → `x² + z² = 0` → le sommet (apex)
- `y = h` → `x² + z² = r²` → la base (rayon max)

**Substitution du rayon** `P = O + t·D` dans l'équation :
```
(Ox + t·Dx)² + (Oz + t·Dz)² = k·(Oy + t·Dy)²
```

Soit `oc = O - apex`. En développant chaque côté :
```
Côté gauche : oc.x² + 2·oc.x·Dx·t + Dx²·t² + oc.z² + 2·oc.z·Dz·t + Dz²·t²
Côté droit :  k·(oc.y² + 2·oc.y·Dy·t + Dy²·t²)
```

On regroupe tout du même côté :
```
(Dx² + Dz² - k·Dy²)·t² + 2·(oc.x·Dx + oc.z·Dz - k·oc.y·Dy)·t + (oc.x² + oc.z² - k·oc.y²) = 0
```

Équation quadratique `a·t² + b·t + c = 0` avec :
```
a = Dx² + Dz² - k·Dy²
b = 2·(oc.x·Dx + oc.z·Dz - k·oc.y·Dy)
c = oc.x² + oc.z² - k·oc.y²
```
Note : contrairement au cylindre, le terme Y **compte** ici via `k·Dy²` et `k·oc.y·Dy`.

**Discriminant** : `Δ = b² - 4ac`

**Solutions** :
```
t₁ = (-b - √Δ) / (2a)
t₂ = (-b + √Δ) / (2a)
```

**Limited Cone (0.5 pt bonus)** — on vérifie la hauteur :
```
y_hit = oc.y + t·Dy    →   doit être ∈ [0, height]
```

**Normale** : perpendiculaire à la surface latérale du cône. Calculée en chaque point :
```
r_hit = √(hit.x² + hit.z²)    (rayon local au point d'impact)
N = (hit.x / r_hit,  -(radius / height),  hit.z / r_hit)
```
- Les composantes X et Z sont radiales (pointent vers l'extérieur)
- La composante Y est négative (pointe vers le bas, car le cône s'élargit vers le bas)
- La normale n'est **pas** constante — elle dépend du point d'impact sur la surface

---

### La Translation

Au lieu de déplacer la forme, on **déplace le rayon dans le sens inverse** :

```cpp
Ray transformedRay(ray.origin - translation, ray.direction);
```

C'est bien plus simple et efficace — on travaille toujours en coordonnées locales.

---

### Les Design Patterns que tu utilises

Tu dois pouvoir expliquer ça à la défense :

**Factory** — `Factory.cpp` crée tes primitives :
```cpp
Factory::createSphere(pos, radius, color, translation, rotation);
```
Sans exposer les constructeurs directement.

**Builder** — `SceneBuilder.cpp` construit la scène étape par étape :
```cpp
builder.addPrimitive(...);
builder.addLight(...);
Scene scene = builder.getResult();
```

**Composite** — `Scene::hitAnything()` parcourt toutes les primitives et retourne la collision la plus proche — c'est le pattern Composite appliqué aux primitives.

---

### Questions probables à la défense

**"Explique comment tu détectes l'intersection rayon/sphère"** → Parle de l'équation quadratique et du discriminant.

**"Pourquoi utilises-tu t_min et t_max ?"** → Pour éviter les auto-intersections (`t_min = 0.001`) et limiter la distance de recherche.

**"C'est quoi le HitRecord ?"** → C'est la structure qui stocke toutes les infos d'une collision : distance `t`, point d'impact, normale, couleur.

**"Comment fonctionne la translation ?"** → On applique la translation inverse sur le rayon pour travailler en coordonnées locales.

**"Pourquoi hériter de IPrimitive ?"** → Pour le polymorphisme — la scène peut stocker toutes les formes dans un seul `vector<unique_ptr<IPrimitive>>` et appeler `hit()` sans savoir quelle forme c'est.

---

Envoie les `.cpp` maintenant pour qu'on vérifie que tout est cohérent avec ce que tu vas dire !