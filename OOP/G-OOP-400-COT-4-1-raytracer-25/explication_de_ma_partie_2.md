Parfait, j'ai tout lu ! Voici une préparation complète pour ta défense.

---

## Ce que tu dois savoir sur CHAQUE fichier de ta partie

### `Sphere.cpp` — Ce que tu dis à la défense

"La sphère utilise l'équation quadratique. Je substitue l'équation du rayon `P = O + t·D` dans l'équation de la sphère `‖P - C‖² = r²`. Ça donne :

```
oc = O - C
a = D·D
b = 2·(oc·D)
c = oc·oc - r²
Δ = b² - 4ac
t = (-b - √Δ) / (2a)
N = (P - C) / r
```

Je calcule le discriminant — si il est négatif, pas d'intersection. Sinon je prends le `t` le plus petit qui est dans `[t_min, t_max]`. Ensuite je remplis le `HitRecord` avec le point d'impact, la normale normalisée et la couleur.

Pour la translation, j'applique la translation inverse sur le rayon au lieu de déplacer la sphère — c'est mathématiquement équivalent mais bien plus simple."

---

### `Plane.cpp` — Ce que tu dis

"Un plan perpendiculaire à l'axe Z à la position `p` vérifie simplement `z = p`. Je résous `Oz + Dz·t = p` ce qui donne :

```
Axe X : t = (p - Ox) / Dx    N = (1, 0, 0)
Axe Y : t = (p - Oy) / Dy    N = (0, 1, 0)
Axe Z : t = (p - Oz) / Dz    N = (0, 0, 1)
```

Si `D_axis` est quasi-nul, le rayon est parallèle au plan, pas d'intersection. Mon plan supporte les 3 axes X, Y, Z — ce qui est plus flexible que le minimum demandé."

---

### `Cylinder.cpp` — Ce que tu dis

"Le cylindre infini sur l'axe Y vérifie `x² + z² = r²`. J'ignore le composant Y et je projette sur le plan XZ — ça donne encore une équation quadratique :

```
oc = O - C
a = Dx² + Dz²
b = 2·(oc.x·Dx + oc.z·Dz)
c = oc.x² + oc.z² - r²
Δ = b² - 4ac
t = (-b - √Δ) / (2a)
```

Après avoir trouvé les deux solutions `t₁` et `t₂`, je vérifie que le point d'impact est entre `0` et `height` sur l'axe Y avec `y_hit = oc.y + t·Dy`. C'est ce qui le rend **limité** — c'est le Limited Cylinder qui vaut 0.5 point bonus. La normale pointe radialement vers l'extérieur : `N = (hit.x / r, 0, hit.z / r)`."

---

### `Cone.cpp` — Ce que tu dis

"Le cône sur l'axe Y vérifie `x² + z² = k·y²` où `k = (r/h)²`. C'est comme le cylindre mais avec un terme Y dans l'équation qui crée l'angle du cône :

```
oc = O - apex
a = Dx² + Dz² - k·Dy²
b = 2·(oc.x·Dx + oc.z·Dz - k·oc.y·Dy)
c = oc.x² + oc.z² - k·oc.y²
Δ = b² - 4ac
t = (-b - √Δ) / (2a)
```

Même principe — deux solutions, je prends la plus proche valide entre `0` et `height` avec `y_hit = oc.y + t·Dy`. C'est aussi un **Limited Cone** — 0.5 point bonus. La normale est perpendiculaire à la surface latérale :

```
r_hit = √(hit.x² + hit.z²)
N = (hit.x / r_hit,  -(r/h),  hit.z / r_hit)
```"

---

### Les Design Patterns — TRÈS important pour la défense

Tu **dois** savoir expliquer les 2 patterns obligatoires :

**Factory** — dans `Factory.cpp` :
"La Factory est une classe statique qui crée les primitives et lumières sans exposer leurs constructeurs directement. Le `SceneParser` ne connaît pas `Sphere` ou `Cylinder` directement — il passe par `Factory::createSphere(...)`. Ça respecte le principe de séparation des responsabilités."

**Builder** — dans `SceneBuilder.cpp` :
"Le Builder construit la scène étape par étape. On appelle `addPrimitive()`, `addLight()`, `setCamera()` dans n'importe quel ordre, et à la fin `getResult()` livre la scène complète. C'est pratique parce que le parser peut construire la scène progressivement en lisant le fichier ligne par ligne."

---

### L'interface `IPrimitive` — pourquoi c'est important

"Toutes mes primitives héritent de `IPrimitive` qui définit une seule méthode virtuelle pure `hit()`. Grâce au polymorphisme, la `Scene` peut stocker toutes les formes dans un seul `vector<unique_ptr<IPrimitive>>` et appeler `hit()` sans savoir si c'est une sphère, un cylindre ou un cône. C'est aussi le **pattern Composite** — `hitAnything()` dans `Scene.cpp` parcourt toutes les primitives et garde la collision la plus proche."

---

### Questions pièges probables

**"Pourquoi `t_min = 0.001` et pas `0` ?"**
"Pour éviter l'auto-intersection — si on met `0`, le rayon peut toucher la surface d'où il part lui-même à cause des erreurs de flottants. `0.001` crée une petite marge de sécurité."

**"Pourquoi `unique_ptr` ?"**
"Pour la gestion automatique de la mémoire — quand la `Scene` est détruite, tous les `unique_ptr` libèrent automatiquement la mémoire. Et ça empêche la copie accidentelle des primitives."

**"C'est quoi le HitRecord ?"**
"C'est une structure qui stocke toutes les infos d'une collision : `t` la distance, `point` les coordonnées 3D du point d'impact, `normal` la perpendiculaire à la surface, et `couleur` la couleur de l'objet. C'est passé par référence à `hit()` pour éviter de copier des données."

**"Comment tu gères la translation ?"**
"Au lieu de déplacer la forme dans l'espace monde, j'applique la translation inverse sur le rayon. Mathématiquement c'est identique mais bien plus efficace — je n'ai pas besoin de recalculer la géométrie de la forme."

**"Quelle est la différence entre raycasting et raytracing ?"**
"Le raycasting calcule analytiquement les intersections avec des formules mathématiques pour générer une image. Le raytracing est plus complexe — il simule le chemin de la lumière, calcule des rayons secondaires pour les reflets et réfractions, et peut utiliser plusieurs rayons par pixel pour l'antialiasing. Notre projet fait du raycasting avec des effets d'éclairage, ce qui le rapproche du raytracing."

---

### Ce que tu peux montrer pendant la défense

Prépare ces scènes à avoir prêtes :

**demo_sphere.cfg** — juste une sphère, explique l'équation quadratique
**demo_plane.cfg** — sphère + plan, montre les ombres portées
**demo_cylinder.cfg** — cylindre limité
**demo_cone.cfg** — cône limité
**demo_translation.cfg** — une primitive avec et sans translation pour montrer que ça marche
**scene_city.cfg** — la scène impressionnante pour la fin

Tu es prêt pour la défense !