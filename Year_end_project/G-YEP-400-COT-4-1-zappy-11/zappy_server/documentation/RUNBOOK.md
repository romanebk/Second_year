# RUNBOOK — Serveur Zappy

## Prérequis

- GCC ≥ 7 (C++17)
- Linux (non testé sur macOS/Windows)
- Make

## Build

```bash
cd zappy_server
make          # compile le serveur
make re       # clean + compile
make test     # compile et lance les tests unitaires
make clean    # supprime les .o
make fclean   # supprime .o + binaire
```

Le binaire produit est `zappy_server`.

## Utilisation

```bash
./zappy_server -p port -x width -y height -n team1 team2 ... -c clientsNb -f freq
```

### Arguments

| Argument | Description | Exemple |
|----------|-------------|---------|
| `-p` | Port d'écoute (1-65535) | `-p 4242` |
| `-x` | Largeur de la carte | `-x 20` |
| `-y` | Hauteur de la carte | `-y 20` |
| `-n` | Noms d'équipes (un par `-n` ou liste en fin de commande) | `-n Team1 Team2` |
| `-c` | Nombre de slots par équipe | `-c 3` |
| `-f` | Fréquence (ticks par seconde) | `-f 100` |

### Exemple

```bash
./zappy_server -p 4242 -x 20 -y 20 -n Team1 Team2 -c 3 -f 100
```

### Arrêt

- `Ctrl+D` sur stdin → arrêt propre
- `Ctrl+C` → arrêt immédiat (signal)

## Tests

```bash
make test
```

Tests disponibles :
- `tests/test_buffer.cpp` — buffer circulaire et lecture ligne par ligne
- `tests/test_gui_protocol.cpp` — formatage des messages GUI

Test d'intégration Python (stress test) :
```bash
python3 tests/stress_test.py
```

## Monitoring

### Logs

Le serveur n'a pas de système de logs interne. Sources de diagnostic :

| Source | Méthode |
|--------|---------|
| Console | stdout : messages de démarrage, `spawn` |
| Console (erreur) | stderr : erreurs socket, bind, accept |
| GUI | Se connecter avec `zappy_gui` pour visualiser l'état |
| Comportement | Connecter une AI ou un script Python |
| Réseau | `nc -v localhost 4242` → doit envoyer "WELCOME" |
| Réseau | `telnet localhost 4242` → pareil |

### Messages console

```
Zappy server started on port 4242 (20x20, 2 teams, 3 slots/team, freq=100)
```

### Erreurs fréquentes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `bind failed on port X` | Port déjà utilisé | `lsof -i :4242`, tuer le processus |
| `Failed to start server on port X` | Port invalide ou privé | Utiliser un port > 1024 |
| `accept failed` | Backlog plein | Normal si temporaire, vérifier `listen(_, 10)` |
| Client déconnecté sans raison | Timeout, overflow buffer | Vérifier `Client::isOverloaded()` |
| `freeSlots` négatif | Bug egg consume (historique) | Vérifier commit `114ef90` |

## Architecture réseau

- TCP IPv4, non-bloquant
- Port par défaut : 4242
- Listen backlog : 10
- Buffer sortant max : 64 Ko
- Buffer entrant max : 128 Ko
- Timeout `poll()` : dynamique (temps jusqu'à la prochaine action)

## Capacité

- Jusqu'à ~100 clients simultanés sans latence excessive
- Au-delà : le `poll()` monothreadé peut devenir goulot
- Facteurs limitants : CPU (itérations sur tous les clients), mémoire (buffers)

## Dépannage

### Le serveur ne démarre pas

1. Vérifier `make re` (pas d'erreur de compilation)
2. Vérifier `./zappy_server -p 4242 -x 10 -y 10 -n Team -c 1 -f 100`
3. Vérifier `netstat -tlnp | grep 4242` (port libre)
4. Vérifier `strace -f ./zappy_server ...` (erreur système)

### Les clients AI recoivent "ko" à l'incantation

Si c'est systématique au niveau 1, vérifier `performIncantation()` ligne 45 : `!p->isIncanting()` doit être absent (fix `114ef90`).

### Le GUI n'affiche rien

1. Vérifier que le GUI est connecté : `"GRAPHIC\n"` envoyé après `"WELCOME\n"`
2. Vérifier que `handleGUIConnect()` envoie `msz`, `bct`, etc.
3. Vérifier le réseau : `tcpdump -i lo port 4242`

### Crash ou comportement étrange

1. Compiler avec `-g -O0` dans le Makefile pour les symboles de debug
2. Lancer avec `gdb --args ./zappy_server ...`
3. Si le crash est aléatoire, vérifier les pointeurs bruts dans Team/Tile

## Recommandations production

- Démarrer avec `freq=100` (valeur par défaut)
- Carte minimum 10×10 pour permettre le placement initial
- Au moins 2 équipes avec 3 slots chacune
- Ne pas descendre en dessous de `freq=10` (le jeu devient très lent)
- Ne pas dépasser `freq=1000` (le CPU peut saturer)
- Pour un stress test : `stress_test.py` lance plusieurs clients AI simultanément
