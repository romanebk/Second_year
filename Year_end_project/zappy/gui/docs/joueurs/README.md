# Système joueurs — Vue d'ensemble

Ce dossier documente l'implémentation GUI des **joueurs (trantoriens)** dans `zappy_gui`.

## Fichiers implémentés

| Module | Fichiers | Rôle |
|--------|----------|------|
| Animation | `src/renderer/PlayerMovement.*` | Interpolation fluide position/orientation |
| Rendu 3D | `src/renderer/EntityRenderer.*` | Cubes colorés par équipe au-dessus des tuiles |
| Shaders | `assets/shaders/player.vert`, `player.frag` | Éclairage et surbrillance du joueur sélectionné |
| Sélection | `src/renderer/PlayerSelector.*` | Clic Shift+LMB et Tab pour cibler un joueur |
| Panneau joueur | `src/hud/PlayerPanel.*` | Inventaire, niveau, orientation, équipe |
| Panneau équipes | `src/hud/TeamPanel.*` | Effectifs et niveau max par équipe |
| HUD | `src/hud/HUD.*` | Minimap, broadcasts, événements (expulsion, fork) |

## Flux de données

```
Serveur Zappy
    │  pnw, ppo, plv, pin, pdi, pbc, pex, pfk ...
    ▼
NetworkThread → Parser → GameState (SharedState)
    │
    ▼
RenderThread (60 FPS)
    ├── PlayerMovement.update()   ← interpolation
    ├── EntityRenderer.draw()     ← cubes 3D
    ├── HUD.update/draw()         ← minimap + messages
    └── PlayerPanel / TeamPanel   ← panneaux SFML
```

## Contrôles

| Action | Touche / souris |
|--------|-----------------|
| Sélectionner un joueur | **Shift + clic gauche** sur le cube |
| Joueur suivant | **Tab** |
| Désélectionner | **Échap** |
| Voir les joueurs d'une tuile | **Clic gauche** sur une tuile |

## Documentation détaillée

- [Déplacement réaliste](deplacement.md)
- [Rendu 3D des joueurs](rendu.md)
- [Interface HUD](hud.md)
