# Référence Protocole — Serveur Zappy

**Document de référence rapide**  
**Projet :** G-YEP-400

---

## Handshake initial

```
Serveur → "WELCOME\n"
Client  → "NOM_EQUIPE\n"
Serveur → "SLOTS_RESTANTS\n"      (int : places libres dans l'équipe)
Serveur → "LARGEUR HAUTEUR\n"    (int int : dimensions de la carte)
```

---

## Commandes disponibles

### Déplacement

| Commande | Effet | Coût (unités) | Réponse |
|----------|-------|--------------|---------|
| `Forward\n` | Avance d'une case | 7 | `ok` / `ko` |
| `Right\n` | Tourne à droite (90°) | 7 | `ok` / `ko` |
| `Left\n` | Tourne à gauche (90°) | 7 | `ok` / `ko` |

> La carte est **torique** : dépasser un bord ramène de l'autre côté.  
> Il n'existe **pas** de commande Backward.

---

### Perception

| Commande | Effet | Coût | Réponse |
|----------|-------|------|---------|
| `Look\n` | Vision triangulaire autour du drone | 7 | `[cases...]` |
| `Inventory\n` | Contenu du sac | 1 | `[ressources...]` |

**Format Look :**
```
[player, food, linemate,   , sibur food, , , , ]
  ↑ case 0   ↑ case 1    ↑ case 2      ...
```
Les cases sont séparées par des virgules. Chaque case contient les objets séparés par des espaces.

**Format Inventory :**
```
[food 10, linemate 0, deraumere 0, sibur 0, mendiane 0, phiras 0, thystame 0]
```

---

### Manipulation d'objets

| Commande | Effet | Coût | Réponse |
|----------|-------|------|---------|
| `Take food\n` | Ramasse un objet sur la case | 7 | `ok` / `ko` |
| `Set food\n` | Dépose un objet sur la case | 7 | `ok` / `ko` |

**Objets valides :** `food`, `linemate`, `deraumere`, `sibur`, `mendiane`, `phiras`, `thystame`

---

### Élévation

| Commande | Effet | Coût | Réponse |
|----------|-------|------|---------|
| `Incantation\n` | Lance le rituel d'élévation | 300 | `Elevation underway` → `Current level: K` |

Le drone est **gelé** pendant 300 unités. Toute commande reçue pendant ce temps renvoie `ko`.  
En cas d'échec (conditions non remplies) : `ko` immédiat.

---

### Communication

| Commande | Effet | Coût | Réponse |
|----------|-------|------|---------|
| `Broadcast texte\n` | Diffuse un message à toute la map | 7 | `ok` |
| `Connect_nbr\n` | Nombre de slots libres dans l'équipe | 0 | `N` |

**Réception d'un broadcast :**
```
message K, texte
```
K ∈ {0..8} indique la direction de la source :

```
2  1  8
3  0  7      0 = même case, 1 = devant, sens anti-horaire
4  5  6
```

---

### Reproduction & Éjection

| Commande | Effet | Coût | Réponse |
|----------|-------|------|---------|
| `Fork\n` | Pond un œuf (slot d'équipe supplémentaire) | 42 | `ok` |
| `Eject\n` | Éjecte tous les joueurs de la case dans la direction du drone | 7 | `ok` / `ko` |

**Réception d'une éjection :**
```
eject: K
```
K = direction d'où provient l'éjection (0–8).

---

## Messages asynchrones

Le serveur peut envoyer ces messages **à tout moment**, même sans commande en cours :

| Message | Signification |
|---------|---------------|
| `dead\n` | Le joueur est mort (famine). Connexion fermée. |
| `message K, texte\n` | Broadcast reçu d'un autre joueur |
| `eject: K\n` | Éjection reçue |

---

## Temps de jeu

- 1 unité de temps = `1 / f` secondes (`f` = fréquence du serveur, arg `-f`)
- 1 nourriture = **126 unités** de vie
- Un drone spawn avec **10 food**

---

## Ressources par niveau d'incantation

| Niveau | Joueurs | linemate | deraumere | sibur | mendiane | phiras | thystame |
|--------|---------|----------|-----------|-------|----------|--------|----------|
| 1 → 2 | 1 | 1 | — | — | — | — | — |
| 2 → 3 | 2 | 1 | 1 | 1 | — | — | — |
| 3 → 4 | 2 | 2 | — | 1 | — | 2 | — |
| 4 → 5 | 4 | 1 | 1 | 2 | — | 1 | — |
| 5 → 6 | 4 | 1 | 2 | 1 | 3 | — | — |
| 6 → 7 | 6 | 1 | 2 | 3 | — | 1 | — |
| 7 → 8 | 6 | 2 | 2 | 2 | 2 | 2 | 1 |
