# Interface HUD — Joueurs

## `PlayerPanel`

Panneau latéral droit affiché quand un joueur est sélectionné.

**Contenu :**
- Barre de couleur d'équipe
- ID, nom d'équipe
- Position `(x, y)` serveur
- Orientation (Nord / Est / Sud / Ouest)
- Niveau
- Inventaire complet (7 ressources)

**Fichiers :** `src/hud/PlayerPanel.hpp`, `PlayerPanel.cpp`

---

## `TeamPanel`

Panneau sous les stats générales (coin haut-gauche).

**Contenu :**
- Liste des équipes (`tna`)
- Nombre de joueurs vivants par équipe
- Niveau maximum atteint

**Fichiers :** `src/hud/TeamPanel.hpp`, `TeamPanel.cpp`

---

## `HUD`

### Minimap

Coin bas-droit : représentation 2D de la map avec un point coloré par joueur (position **interpolée**).

### Journal de broadcasts

Bandeau central haut : derniers messages `pbc` reçus (5 max).

Format : `#id : message`

### Événements éphémères

Notifications temporaires (4 s) :

| Commande | Message |
|----------|---------|
| `pex` | Expulsion du joueur #id |
| `pfk` | Fork du joueur #id |

**Fichiers :** `src/hud/HUD.hpp`, `HUD.cpp`

---

## `PlayerSelector`

Gère la sélection active du joueur inspecté.

| Entrée | Comportement |
|--------|--------------|
| Shift + clic gauche | Sélectionne le joueur sous le curseur |
| Tab | Cycle entre les joueurs vivants |
| Échap | Désélectionne |

**Fichiers :** `src/renderer/PlayerSelector.hpp`, `PlayerSelector.cpp`

---

## Tuile sélectionnée

Le panneau `TileSelector` liste aussi les **joueurs présents** sur la tuile cliquée (ID, niveau, équipe).

---

## Ordre d'affichage SFML

```
drawOverlay()      → stats + légende + aide
TeamPanel          → équipes
HUD                → minimap + broadcasts + events
TileSelector       → ressources + joueurs sur tuile
PlayerPanel        → détail joueur sélectionné (si actif)
```
