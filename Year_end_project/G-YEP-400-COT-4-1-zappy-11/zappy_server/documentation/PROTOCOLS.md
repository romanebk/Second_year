# Protocoles du Serveur Zappy

Deux protocoles distincts sur le même port TCP :

| Client | Handshake | Comportement |
|--------|-----------|--------------|
| **AI** | Envoie le nom de l'équipe après `WELCOME` | Envoie des commandes, reçoit des réponses |
| **GUI** | Envoie `GRAPHIC` après `WELCOME` | Envoie des requêtes, reçoit des notifications push |

---

## Protocole AI

### Handshake

```
Serveur → Client : "WELCOME\n"
Client → Serveur : "<teamName>\n"
Serveur → Client : "<slotCount>\n <X> <Y>\n"
```

- `slotCount` : nombre de places libres restantes dans l'équipe
- `X Y` : dimensions de la carte

Échec : si l'équipe n'existe pas ou plus de slot, le serveur répond `"ko\n"` et déconnecte.

### Commandes AI

Chaque commande est une ligne terminée par `\n`. Le serveur répond après un délai (`actionTime / freq` secondes).

| Commande | Délai (ticks) | Réponse succès | Réponse échec | Description |
|----------|:------------:|----------------|---------------|-------------|
| `Forward` | 7 | `ok\n` | — | Avance d'une case |
| `Right` | 7 | `ok\n` | — | Tourne à droite 90° |
| `Left` | 7 | `ok\n` | — | Tourne à gauche 90° |
| `Look` | 7 | `[ligne vue]\n` | — | Vision en cône |
| `Inventory` | 1 | `[inventaire]\n` | — | Inventaire du joueur |
| `Broadcast texte` | 7 | `ok\n` | — | Diffusion aux joueurs |
| `Connect_nbr` | 0 | `<nombre>\n` | — | Slots restants |
| `Fork` | 42 | `ok\n` | — | Pond un œuf |
| `Eject` | 7 | `ok\n` | `ko\n` | Expulse les joueurs sur la case |
| `Take objet` | 7 | `ok\n` | `ko\n` | Ramasse une ressource |
| `Set objet` | 7 | `ok\n` | `ko\n` | Dépose une ressource |
| `Incantation` | 300 | `Elevation underway\n` | `ko\n` | Début d'incantation |

### Ressources

Noms utilisés dans `Take` et `Set` :

| Nom | Type |
|-----|------|
| `food` | FOOD |
| `linemate` | LINEMATE |
| `deraumere` | DERAUMERE |
| `sibur` | SIBUR |
| `mendiane` | MENDIANE |
| `phiras` | PHIRAS |
| `thystame` | THYSTAME |

### Format de `Look`

```
<case0>,<case1>,...,<caseN>\n
```

Chaque case contient les entités séparées par des espaces : `joueur` (autres joueurs), `food`, `linemate`, etc.

### Format de `Inventory`

```
[food X, linemate Y, deraumere Z, sibur W, mendiane V, phiras U, thystame T]\n
```

### Événements push (asynchrones)

| Message | Déclencheur |
|---------|-------------|
| `message K, texte\n` | Un joueur a broadcasté (`K` = direction) |
| `eject: K\n` | A été expulsé (`K` = direction) |
| `Current level: N\n` | Incantation réussie, niveau augmenté |
| `dead\n` | Le joueur est mort de faim (déconnexion immédiate) |

### Contraintes

- Max 10 commandes en file par joueur (`MAX_COMMANDS_QUEUED`)
- Pendant une incantation, toutes les commandes sont refusées (`ko\n`)
- Joueur mort → reçoit `dead\n` → déconnecté → nettoyé

---

## Protocole GUI

### Handshake

```
Serveur → Client : "WELCOME\n"
Client → Serveur : "GRAPHIC\n"
Serveur → Client : msz + bct (×N) + tna (×M) + pnw (×P) + enw (×E) + sgt
```

### Requêtes GUI (client → serveur)

| Requête | Réponse |
|---------|---------|
| `msz` | `msz X Y\n` |
| `bct X Y` | `bct X Y r0 r1 r2 r3 r4 r5 r6\n` |
| `mct` | `bct\n` pour chaque tuile |
| `tna` | `tna name\n` pour chaque équipe |
| `ppo #id` | `ppo #id X Y O\n` |
| `plv #id` | `plv #id L\n` |
| `pin #id` | `pin #id X Y r0...r6\n` |
| `sgt` | `sgt T\n` |
| `sst T` | `sst T\n` |

Erreurs :
- `suc\n` : commande inconnue
- `sbp\n` : paramètre invalide

### Événements push (serveur → GUI)

#### Carte et équipes

| Événement | Format | Déclencheur |
|-----------|--------|-------------|
| `msz` | `msz X Y\n` | Taille de la carte (init) |
| `bct` | `bct X Y r0 r1 r2 r3 r4 r5 r6\n` | Changement de tuile |
| `tna` | `tna name\n` | Nom d'équipe (init) |

Ordre des ressources dans `bct` / `pin` : FOOD(0), LINEMATE(1), DERAUMERE(2), SIBUR(3), MENDIANE(4), PHIRAS(5), THYSTAME(6)

#### Joueurs

| Événement | Format | Déclencheur |
|-----------|--------|-------------|
| `pnw` | `pnw #id X Y O L team\n` | Nouveau joueur |
| `ppo` | `ppo #id X Y O\n` | Mouvement/rotation |
| `plv` | `plv #id L\n` | Changement de niveau |
| `pin` | `pin #id X Y r0...r6\n` | Inventaire modifié |
| `pex` | `pex #id\n` | Expulsion |
| `pbc` | `pbc #id msg\n` | Broadcast |
| `pdi` | `pdi #id\n` | Joueur mort |

#### Incantations

| Événement | Format | Déclencheur |
|-----------|--------|-------------|
| `pic` | `pic X Y L #id1 #id2...\n` | Début incantation |
| `pie` | `pie X Y R\n` | Fin incantation (R=0 échec, 1 succès) |
| `plv` | `plv #id L\n` | Participants upgradés |

#### Œufs

| Événement | Format | Déclencheur |
|-----------|--------|-------------|
| `pfk` | `pfk #id\n` | Joueur pose un œuf |
| `enw` | `enw #eid #pid X Y\n` | Œuf pondu |
| `ebo` | `ebo #eid\n` | Œuf éclos |
| `edi` | `edi #eid\n` | Œuf mort |

#### Temps et fin de jeu

| Événement | Format | Déclencheur |
|-----------|--------|-------------|
| `sgt` | `sgt T\n` | Time unit actuel |
| `sst` | `sst T\n` | Time unit changé |
| `seg` | `seg team\n` | Équipe gagnante |
| `smg` | `smg msg\n` | Message générique |

---

## Règles métier

### Incantation

1. L'AI envoie `Incantation` → `checkRequirements()` vérifie :
   - Ressources suffisantes sur la tuile
   - Nombre suffisant de joueurs éligibles (même niveau, pas incanting)
2. Succès → `Elevation underway\n`, les participants sont marqués `incanting=true`
3. Après 300 ticks → `performIncantation()` vérifie :
   - Ressources toujours là (elles sont consommées)
   - Participants toujours là (même tuile, même niveau, pas morts)
4. Succès → niveau augmenté, ressources disparaissent
5. Échec → `ko\n` à chaque participant, `incanting=false`

### Niveaux d'élévation

| Niveau cible | Joueurs requis | Ressources |
|:------------:|:--------------:|------------|
| 2 | 1 | 1 linemate |
| 3 | 2 | 1 linemate, 1 deraumere, 1 sibur |
| 4 | 2 | 2 linemate, 1 sibur, 2 phiras |
| 5 | 4 | 1 linemate, 1 deraumere, 2 sibur, 1 phiras |
| 6 | 4 | 1 linemate, 2 deraumere, 1 sibur, 3 mendiane |
| 7 | 6 | 1 linemate, 2 deraumere, 3 sibur, 1 phiras |
| 8 | 6 | 2 linemate, 2 deraumere, 2 sibur, 2 mendiane, 2 phiras, 1 thystame |

### Nourriture

- Vie initiale : 10 unités de nourriture
- Consommation : 1 unité toutes les `126 / freq` secondes
- Mort : quand `food ≤ 0` → `dead\n` → déconnexion → nettoyage

### Œufs

- Ponte : `Fork` (42 ticks) → `PendingEgg` avec timer 600 ticks
- Éclosion : `PendingEgg.remainingTime → 0` → `hatch()` → notification GUI `ebo`
- Consommation : `handleTeamJoin()` avec `egg->consume()` (ne retire pas de la liste)

### Victoire

Condition : une équipe a au moins 6 joueurs (`WIN_PLAYERS`) de niveau 8 (`WIN_LEVEL`)

Vérifiée après chaque incantation réussie. Déclenche `seg teamName\n` et arrête le jeu.
