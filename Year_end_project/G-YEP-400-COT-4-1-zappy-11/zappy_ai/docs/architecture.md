# Architecture Système — Zappy AI

**Auteurs :** Helena & Fresnel  
**Projet :** G-YEP-400

---

## Vue d'ensemble

```
┌─────────────────────── zappy_ai.py ───────────────────────┐
│  Parse args (-p PORT -n TEAM -h HOST)                      │
│  Instancie Reseau → Handshake → Instancie Brain → run()   │
└───────────────────────────────────────────────────────────┘
          │                          │
          ▼                          ▼
┌─────────────────┐        ┌─────────────────────────┐
│   Reseau        │        │   Brain (cerveau.py)     │
│   (reseau.py)   │◄──────►│                         │
│                 │        │  ┌─────────────────────┐│
│  socket TCP     │        │  │  State Machine       ││
│  buffer cmds    │        │  │  SURVIVE / COLLECT   ││
│  parsing brut   │        │  │  ELEVATE / RALLY     ││
│  async msgs     │        │  │  JOIN / EXPLORE      ││
└────────┬────────┘        │  └─────────────────────┘│
         │                 │                          │
         │                 │  ┌─────────────────────┐│
         ▼                 │  │  Player (player.py)  ││
  Serveur Zappy            │  │  inventory / vision  ││
  (TCP 4242)               │  │  level / can_elevate ││
                           │  └─────────────────────┘│
                           └─────────────────────────┘
                                       │
                           navigation.py
                           (pathfinding, parsing Look)
```

---

## Couches d'abstraction

| Couche | Fichier | Responsabilité |
|--------|---------|----------------|
| **Transport** | `reseau.py` | Socket TCP, file de 10 cmd, parsing brut |
| **Navigation** | `navigation.py` | Géométrie grille, index↔mouvements, broadcast K |
| **Adaptation** | `adaptateur.py` | Traduit l'API Reseau vers l'interface Brain |
| **Modèle** | `player.py` | État interne du drone (inventaire, vision) |
| **Décision** | `cerveau.py` | Machine à états, stratégies, arbitrage |
| **Entrée** | `zappy_ai.py` | Args CLI, initialisation, lancement |

---

## Flux d'un tour de boucle

```
Brain.run()
  │
  ├─ 1. refresh_vision()         → Look\n → [cases...] → player.vision
  ├─ 2. refresh_inventory()      → Inventory\n → [...] → player.inventory
  ├─ 3. _consume_level_signal()  → level_signal async → player.level
  ├─ 4. process_broadcasts()     → poll_messages() → switch JOIN si rally
  ├─ 5. arbitrate()              → décide l'état
  └─ 6. act()
         ├─ SURVIVE   → survive()
         ├─ COLLECT   → collect()
         ├─ ELEVATE   → elevate_here()
         ├─ RALLY     → rally()
         ├─ JOIN      → do_join() ou hold_position()
         ├─ REPRODUCE → reproduce()
         └─ EXPLORE   → explore()
```

---

## Flux de connexion (protocole Zappy)

```
Client                        Serveur
  │                              │
  │──── TCP connect ────────────►│
  │◄─── "WELCOME\n" ────────────│
  │──── "team1\n" ─────────────►│
  │◄─── "3\n"  (slots libres) ──│
  │◄─── "10 10\n" (taille map) ─│
  │                              │
  │  (jeu en cours)              │
  │──── "Look\n" ──────────────►│
  │◄─── "[player food, ,]\n" ───│
  │──── "Take food\n" ─────────►│
  │◄─── "ok\n" ─────────────────│
```

---

## Coordination multi-joueurs (RALLY / JOIN)

```
Drone A (leader)                    Drone B (helper)
────────────────                    ────────────────
can_elevate() → True
state = RALLY

ensure_stones_on_tile()
Broadcast "rally 2 0.7312\n"  ───►  process_broadcasts()
                                     lvl == player.level ?
                                     0.7312 > B.rank ? → JOIN
                                     move toward K
                                     join_arrived = True
                                     hold_position()

vision[0].count("player") >= 2
requirements_on_tile() → True
Incantation\n ───────────────►  [GELÉ]
               "Elevation underway\n"
Current level: 3\n ──────────►  _consume_level_signal()
                                 player.level = 3
                                 _reset_helper()
```

---

## Gestion de la mort

```
Serveur envoie "dead\n" à tout moment
        ↓
Reseau lève JoueurMortException
        ↓
zappy_ai.py attrape l'exception
        ↓
Fermeture propre du socket
```
