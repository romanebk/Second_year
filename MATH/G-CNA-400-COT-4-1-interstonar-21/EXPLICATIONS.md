# Interstonar - Simulation de trajectoire et détection d'intersection

## But du projet

Le projet **Interstonar** simule la recherche d'une pierre mystérieuse perdue dans la ceinture d'astéroïdes du système solaire. La pierre possède des propriétés spéciales qui la rendent unique. Pour la retrouver, on lance une roche ordinaire sur tous les objets de la ceinture et on observe leur comportement.

Le projet fonctionne sur **deux niveaux d'analyse** :

1. **Mode Global** : Simulation gravitationnelle planétaire pour suivre la trajectoire de la roche
2. **Mode Local** : Ray marching pour détecter l'intersection avec des formes géométriques

---

## Mode Global - Analyse Planétaire

### Objectif
Calculer l'évolution de la roche lancée dans un système planétaire, en tenant compte de l'influence gravitationnelle des corps célestes.

### Paramètres
- **Masse de la roche** : 1 000 kg (constante)
- **Intégration** : Méthode d'Euler
- **Limite** : 1 000 pas de simulation maximum
- **Arrêt** : Collision avec un corps ou 1 000 deltas atteints

### Calculs Physiques

#### 1. Loi de la Gravitation Universelle de Newton
```
F = G × (m₁ × m₂) / r²
```

Où :
- **F** : Force gravitationnelle (N)
- **G** : Constante gravitationnelle = 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻²
- **m₁** : Masse de la roche (1 000 kg)
- **m₂** : Masse du corps céleste
- **r** : Distance entre les centres des masses

#### 2. Calcul du vecteur force
Pour chaque corps céleste :
```rust
let distance = rock_pos.distance_to(&body.position);
let force_magnitude = G * ROCK_MASS * body.mass / (distance * distance);
let direction = (body.position - rock_pos).normalize();
let force = direction * force_magnitude;
```

#### 3. Intégration d'Euler
```rust
// Calcul de l'accélération
let acceleration = total_force * (1.0 / ROCK_MASS);

// Mise à jour vitesse et position
current_vel = current_vel + acceleration * delta_time;
current_pos = current_pos + current_vel * delta_time;
```

#### 4. Détection de collision
```rust
if rock_pos.distance_to(&body.position) <= body.radius {
    // Collision détectée !
}
```

#### 5. Fusion de corps (si collision entre corps célestes)
- **Nouvelle masse** : m₁ + m₂
- **Nouveau rayon** : Calculé à partir du volume total
  ```
  V_total = V₁ + V₂ = (4/3)πr₁³ + (4/3)πr₂³
  r_nouveau = (3 × V_total / 4π)^(1/3)
  ```
- **Nouvelle position** : Moyenne pondérée par les masses
- **Nouvelle vitesse** : Moyenne pondérée par les masses
- **Nouveau nom** : Concaténation alphabétique des noms

---

## Mode Local - Analyse d'Astéroïdes

### Objectif
Déterminer quelle forme géométrique intersecte la trajectoire de la roche en utilisant le ray marching avec Signed Distance Functions (SDF).

### Formes supportées
1. **Sphères**
2. **Cylindres circulaires droits** (autour de l'axe Z)
3. **Boîtes** (parallèles au plan Oxy)
4. **Torus** (parallèles au plan Oxy)

### Signed Distance Functions (SDF)

Les SDF calculent la distance signée d'un point à une surface géométrique :

#### 1. SDF Sphère
```rust
fn sdf_sphere(point: &Vec3, center: &Vec3, radius: f64) -> f64 {
    point.distance_to(center) - radius
}
```

#### 2. SDF Cylindre
```rust
fn sdf_cylinder(point: &Vec3, center: &Vec3, radius: f64, height: Option<f64>) -> f64 {
    let dx = (point.x - center.x).hypot(point.y - center.y) - radius;
    let dz = if let Some(h) = height {
        (point.z - center.z).abs() - h / 2.0
    } else {
        0.0  // Cylindre infini
    };
    dx.max(dz)
}
```

#### 3. SDF Boîte
```rust
fn sdf_box(point: &Vec3, center: &Vec3, sides: &Vec3) -> f64 {
    let q = Vec3::new(
        (point.x - center.x).abs() - sides.x / 2.0,
        (point.y - center.y).abs() - sides.y / 2.0,
        (point.z - center.z).abs() - sides.z / 2.0,
    );
    q.x.max(q.y.max(q.z))
}
```

#### 4. SDF Torus
```rust
fn sdf_torus(point: &Vec3, center: &Vec3, inner_radius: f64, outer_radius: f64) -> f64 {
    let q = Vec3::new(
        (point.x - center.x).hypot(point.y - center.y) - inner_radius,
        point.z - center.z,
        0.0,
    );
    q.magnitude() - outer_radius
}
```

### Ray Marching Algorithm

1. **Point de départ** : Position initiale de la roche
2. **Direction** : Vecteur vitesse normalisé
3. **Pas** : Avancer de 1.0 unité à chaque itération
4. **Test d'intersection** : SDF ≤ 0.1

```rust
for step in 1..=MAX_STEPS {
    current_pos = current_pos + direction * 1.0;
    
    for body in &config.body {
        let distance = calculate_sdf(&current_pos, body);
        
        if distance <= SDF_THRESHOLD {
            // Intersection détectée !
            return;
        }
    }
}
```

### Conditions d'arrêt
- **Intersection** : SDF ≤ 0.1
- **Hors scène** : Distance > 1 000
- **Limite atteinte** : 1 000 pas maximum

---

## Format des Fichiers de Configuration

### Global (corps célestes)
```toml
[[body]]
name = "Sun"
position = {x = 1.81899e8, y = 9.83630e8, z = -1.58778e8}
direction = {x = -1.12474e1, y = 7.54876e0, z = 2.68723e-1}
mass = 1.98854e30
radius = 696342000
```

### Local (formes géométriques)
```toml
[[body]]
name = "s1"
position = {x = 0, y = 0, z = 0}
type = "sphere"
radius = 1

[[body]]
type = "cylinder"
position = {x = 0, y = 0, z = 0}
radius = 1
height = 100
```

---

## Utilisation

```bash
# Mode global avec delta time
./interstonar --global scene.toml --delta=3600 Px Py Pz Vx Vy Vz

# Mode local
./interstonar --local scene.toml Px Py Pz Vx Vy Vz

# Aide
./interstonar --help
```

---

## Unités

Toutes les valeurs sont en **unités de base du SI** :
- Distance : mètres (m)
- Masse : kilogrammes (kg)
- Temps : secondes (s)
- Vitesse : mètres/secondes (m/s)

---

## Constantes

- **G** : 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻² (constante gravitationnelle)
- **ROCK_MASS** : 1 000 kg
- **MAX_STEPS** : 1 000
- **SDF_THRESHOLD** : 0.1
