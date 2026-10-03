# Rendu 3D des joueurs

## `EntityRenderer`

Chaque joueur vivant dans `GameState::players` est dessiné comme un **cube 3D** positionné au centre de sa tuile, légèrement au-dessus du sol.

### Position monde

```
worldX = offsetX + renderX × TILE_SIZE
worldZ = offsetZ + renderY × TILE_SIZE
worldY = PLAYER_HEIGHT (0,55)
```

`renderX` / `renderY` proviennent de `PlayerMovement` (position interpolée).

### Orientation

Le cube est pivoté sur l'axe Y selon `angleDeg` de l'état visuel. La face avant (+Z locale) indique la direction regardée.

### Taille et niveau

```
scale = BASE_SCALE + (level − 1) × 0,035
hauteur = scale × 1,15   (cube légèrement vertical)
```

Un joueur de niveau élevé apparaît donc **plus grand** et avec un **glow** proportionnel (`levelGlow` dans le shader).

### Couleurs d'équipe

`EntityRenderer::teamColor()` assigne une couleur stable :

1. Index dans `state.teamNames` → palette prédéfinie (8 couleurs).
2. Sinon hash du nom d'équipe → palette.

Palette par défaut :

| Index | Couleur approximative |
|-------|----------------------|
| 0 | Blanc (Empire) |
| 1 | Orange (Rébellion) |
| 2 | Cyan |
| 3 | Rose |
| 4 | Vert |
| 5 | Violet |
| 6 | Jaune |
| 7 | Turquoise |

### Joueur sélectionné

Le shader `player.frag` mélange la couleur d'équipe avec un **jaune doré** quand `selected = 1`.

## Shaders

### `player.vert`

Identique au vertex shader des tuiles (position + normale), sans coordonnées UV.

### `player.frag`

Uniforms :

| Uniform | Rôle |
|---------|------|
| `teamColor` | Couleur de base de l'équipe |
| `selected` | 1 si joueur sélectionné |
| `levelGlow` | Intensité lumineuse selon le niveau |

Éclairage Lambertien identique aux tuiles pour cohérence visuelle.

## Sélection (`pickPlayer`)

Projection écran du centre du cube ; le joueur le plus proche du curseur (< 48 px) est retourné.

## Fichiers

- `src/renderer/EntityRenderer.hpp`
- `src/renderer/EntityRenderer.cpp`
- `assets/shaders/player.vert`
- `assets/shaders/player.frag`

## Intégration

Dans `RenderThread::run`, l'ordre de rendu est :

1. Carte (`MapRenderer`)
2. Ressources (`ResourceRenderer`)
3. **Joueurs** (`EntityRenderer`)
4. Overlays SFML (HUD, panneaux)
