# Plazza — Simulation de Pizzeria

Projet EPITECH — G-CCP-400. Une simulation de pizzeria utilisant
les processus, les threads et l'IPC.

Le but de ce projet est de réaliser une simulation de pizzeria, composée
d'une réception qui accepte les nouvelles commandes, de plusieurs cuisines,
elles-mêmes composées de plusieurs cuisiniers, cuisinant plusieurs pizzas.
Vous apprendrez à gérer divers problèmes, notamment l'équilibrage de charge,
la synchronisation de processus et de threads, et la communication.

## Compilation

Prérequis : `g++` avec support C++17, `make`, `pthread`.

```sh
make        # construction du binaire
make re     # reconstruction complète
make clean  # suppression des fichiers objets
make fclean # suppression des fichiers objets + binaire
```

Sortie : `./plazza`

## Utilisation

```sh
./plazza <multiplicateur_cuisson> <cuisiniers_par_cuisine> <ms_regen>
```

### Arguments

| Argument | Type | Description |
|---|---|---|
| `multiplicateur_cuisson` | double (≥0) | Multiplie le temps de cuisson (utilisez 0–1 pour débogage rapide) |
| `cuisiniers_par_cuisine` | int (>0) | Nombre de cuisiniers par processus cuisine |
| `ms_regen` | int (>0) | Millisecondes entre les réapprovisionnements d'ingrédients |

### Shell interactif

Une fois lancé, tapez les commandes :

```
regina XXL x2; fantasia M x3; margarita S x1
status
```

Grammaire : `TYPE TAILLE xQUANTITE[; TYPE TAILLE xQUANTITE]*`

> **Note** : les types de pizzas sont insensibles à la casse (`regina`, `REGINA`, `Regina` sont acceptés). Les tailles sont en majuscules (`S`, `M`, `L`, `XL`, `XXL`).

| Type | Taille |
|---|---|
| `regina` | `S`, `M`, `L`, `XL`, `XXL` |
| `margarita` | |
| `americana` | |
| `fantasia` | |

Commandes spéciales :
- `status` — affiche pour chaque cuisine : la charge en attente (pending / capacité maximale)
- `exit` — ferme proprement toutes les cuisines et quitte

### Exemple

```sh
$ ./plazza 2 2 2000
Plazza reception ready. Type orders or 'status'.
> margarita XXL x4; fantasia S x2
Opened kitchen #1 (pid 12345)
Dispatch margarita XXL to kitchen pid 12345
...
Kitchen: margarita XXL is ready
Kitchen: fantasia S is ready
>
```

### Logs

Chaque session écrit ses événements dans `plazza.log` (créé dans le répertoire courant, mode append) :

```
2026-05-31 15:05:33 [INFO ] Reception started (multiplier=2.000000 cooks=2 regen=2000ms)
2026-05-31 15:05:33 [ORDER] Received: "margarita XXL x4; fantasia S x2"
2026-05-31 15:05:33 [KITCH] Opened kitchen #1 (pid 12345)
2026-05-31 15:05:33 [KITCH] Dispatch margarita XXL to kitchen pid 12345
2026-05-31 15:05:37 [KITCH] Kitchen pid 12345 closed (exit status 0)
```

Niveaux disponibles : `INFO`, `WARN`, `ERROR`, `ORDER`, `READY`, `KITCH`.

## Structure du projet

```
src/
  main.cpp            Point d'entrée, parsing CLI
  Reception.cpp       Shell interactif, répartition des commandes
  Parser.cpp          Analyse grammaticale des commandes
  Kitchen.cpp         Processus cuisine : boucle IPC, cuisson
  Pizza.cpp           Modèle pizza, pack/unpack
  Ingredient.cpp      Définitions d'ingrédients
  Stock.cpp           Stock d'ingrédients thread-safe
  ThreadPool.cpp      Pool de threads worker par cuisine
  Logger.cpp          Logger singleton thread-safe (console + fichier)
  sync/
    Thread.cpp        Wrapper POSIX thread
    Mutex.cpp         Wrapper POSIX mutex
    ConditionVariable.cpp  Wrapper POSIX condvar
    LockGuard.cpp     Verrou RAII mutex
  ipc/
    IpcChannel.cpp    Canal unidirectionnel basé sur pipe
    IpcMessage.cpp    Sérialisation de messages (Pizza, Shutdown)
  process/
    Process.cpp       Wrapper fork
include/              En-têtes correspondants
```