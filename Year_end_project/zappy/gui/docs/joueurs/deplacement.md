# Déplacement réaliste des joueurs

## Problème

Le protocole graphique Zappy envoie la position **instantanée** via `ppo` (et parfois `pin`). Sans traitement côté GUI, les joueurs **téléportent** d'une tuile à l'autre, ce qui casse l'immersion.

## Solution : `PlayerMovement`

Le module `PlayerMovement` maintient un état visuel **séparé** de l'état serveur pour chaque joueur :

```cpp
struct PlayerVisualState {
    float x, y;           // position continue (grille)
    float angleDeg;       // rotation Y en degrés
    float progress;       // avancement de l'animation [0, 1]
    float duration;       // durée totale du déplacement
    bool  animating;
};
```

### Synchronisation

À chaque frame, `update(dt, state)` :

1. Compare la position serveur (`player.x`, `player.y`, `player.orientation`) avec la dernière valeur connue.
2. Si changement détecté → lance une animation depuis la position **actuelle à l'écran**.
3. Supprime les joueurs disparus (`pdi`).

### Durée calée sur le serveur

La durée d'un déplacement correspond à **7 unités de temps** (durée standard d'un `forward` Zappy) :

```
durée = 7 × timeUnit / 1000   (secondes)
```

- `timeUnit` provient de `sgt` / `sst`.
- Si `timeUnit == 0`, fallback à **0,35 s**.

Exemple : `sgt 100` → durée = **0,7 s** par déplacement.

### Carte toroïdale (wrap)

La map Zappy est circulaire : sortir à droite = entrer à gauche. Pour éviter un déplacement « à travers toute la map », on calcule le **plus court chemin** :

```cpp
float wrapDelta(float from, float to, int mapSize) {
    float delta = to - from;
    if (delta > mapSize/2)  delta -= mapSize;
    if (delta < -mapSize/2) delta += mapSize;
    return delta;
}
```

### Rotation fluide

Les orientations serveur (1–4) sont converties en angles :

| Orientation | Direction | Angle (°) |
|-------------|-----------|-----------|
| 1 | Nord | 180 |
| 2 | Est | −90 |
| 3 | Sud | 0 |
| 4 | Ouest | 90 |

La rotation prend le **chemin angulaire le plus court** (évite un tour complet de 270°).

### Easing

L'interpolation utilise un **smoothstep** pour un démarrage et une fin doux :

```
ease(t) = t² × (3 − 2t)
```

Position et orientation sont animées **simultanément** quand les deux changent.

## Fichiers

- `src/renderer/PlayerMovement.hpp`
- `src/renderer/PlayerMovement.cpp`

## API publique

```cpp
void update(float dt, const GameState &state);
const PlayerVisualState *get(int id) const;
static float orientationToAngle(int orientation);
static const char *orientationLabel(int orientation);
```
