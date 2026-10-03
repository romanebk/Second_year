# Aperçu de l'Architecture

## Diagramme système

```
┌───────────────────────────────────────────────────────┐
│                      Réception                        │
│  (processus principal — shell interactif)             │
│                                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Parser                                          │ │
│  │  • splitBySemicolon → tokenize TYPE TAILLE xN    │ │
│  │  • validation de la grammaire                    │ │
│  │  • retourne vector<PizzaOrder>                   │ │
│  └──────────────────────────────────────────────────┘ │
│                          │                            │
│                          ▼                            │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Dispatch                                        │ │
│  │  • handleOrder → pour chaque pizza :             │ │
│  │    • findKitchenWithMostFreeSlots                │ │
│  │    • sendPizzaToKitchen (écriture pipe)          │ │
│  │    • spawnKitchen si toutes saturées             │ │
│  └──────────────────────────────────────────────────┘ │
│                          │                            │
│         ┌────────────────┼────────────────┐           │
│         ▼                ▼                ▼           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ Cuisine #1 │  │ Cuisine #2 │  │ Cuisine #3 │       │
│  │  (pid N)   │  │  (pid M)   │  │  (pid O)   │       │
│  └────────────┘  └────────────┘  └────────────┘       │
│         │               │               │             │
│    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐        │
│    │ Thread  │     │ Thread  │     │ Thread  │        │
│    │ Pool    │     │ Pool    │     │ Pool    │        │
│    │ (cooks) │     │ (cooks) │     │ (cooks) │        │
│    └─────────┘     └─────────┘     └─────────┘        │
│         │               │               │             │
│    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐        │
│    │ Stock   │     │ Stock   │     │ Stock   │        │
│    │ Thread  │     │ Thread  │     │ Thread  │        │
│    │ Regen   │     │ Regen   │     │ Regen   │        │
│    └─────────┘     └─────────┘     └─────────┘        │
└───────────────────────────────────────────────────────┘
```

## Processus & IPC

- La **Réception** est le processus parent
- Chaque **Cuisine** est un processus enfant créé par `fork()`
- Communication : `pipe()` unidirectionnel — la Réception écrit,
  la Cuisine lit
- La sortie standard (stdout) de la Cuisine est héritée → visible dans le même terminal
- `waitpid(WNOHANG)` dans la Réception détecte les cuisines mortes

## Modèle de threads par cuisine

| Thread | Rôle |
|---|---|
| Workers `ThreadPool` (N threads) | Cuisinent les pizzas de la file |
| Thread de régénération (1) | Réapprovisionne les ingrédients tous les `regenIntervalMs` |
| Thread principal (1) | Boucle de lecture IPC, dispatch vers le pool |

## Primitives de synchronisation

Tous les wrappers personnalisés au-dessus de POSIX :

| Classe | Type POSIX | Utilisé pour |
|---|---|---|
| `Mutex` | `pthread_mutex_t` | Accès au stock, file de tâches |
| `ConditionVariable` | `pthread_cond_t` | Notification de tâches du thread pool |
| `LockGuard` | RAII sur Mutex | Verrouillage exceptionnellement sûr |
| `Thread` | `pthread_t` | Threads cuisiniers, thread de régénération |

## Protocole de messages IPC

Format message : `[4-byte size][kind_byte, payload...]` — chaque message est préfixé par sa taille (uint32_t little-endian) écrite par `IpcChannel::send()`.

| `IpcMessageKind` | Valeur | Payload | Sens | Description |
|---|---|---|---|---|
| `Pizza` | `1` | `[type_byte, taille_byte]` | Réception → Cuisine | Commander une pizza |
| `Shutdown` | `2` | *(aucun)* | Réception → Cuisine | Arrêter proprement la cuisine |

## Flux de données

```
[stdin] → Parser::parse()
         → vector<PizzaOrder>
         → Reception::handleOrder()
           → dispatchPizza(pizza)            [par pizza]
             → (écriture pipe) Kitchen::run()
               → readNextMessage()           [poll avec timeout 5s]
                → handleIncomingMessage()
                  → Pizza  : vérification canAccept(1)
                             → enqueuePizza()
                               → ++_pending
                               → ThreadPool::enqueue()
                                 → handlePizza()         [dans un thread worker]
                                   → waitForIngredients()
                                   → cookPizza()         [sleep]
                                   → std::cout "prête"
                                   → markPizzaDone()
                                     → --_pending
                  → Shutdown : sort de la boucle run()
```

## Modèle de données Pizza

```cpp
enum PizzaType : uint8_t { Regina=1, Margarita=2, Americana=4, Fantasia=8 };
enum PizzaSize  : uint8_t { S=1, M=2, L=4, XL=8, XXL=16 };
```

Format pack : `[type_byte, taille_byte]` (2 octets).

## Logger

`Logger` est un singleton thread-safe (`LockGuard` sur `Mutex`) qui écrit simultanément sur `stdout` et dans `plazza.log`. Il est instancié lors du premier appel à `Logger::get()` et vit jusqu'à la fin du programme.

| Méthode | Level | Utilisé dans |
|---|---|---|
| `info()` | `INFO ` | Démarrage, shutdown, status, exit |
| `warn()` | `WARN ` | Commande invalide |
| `error()` | `ERROR` | Échec fork, échec dispatch, échec envoi IPC |
| `order()` | `ORDER` | Réception d'une commande valide |
| `ready()` | `READY` | (disponible, non utilisé par défaut) |
| `kitchen()` | `KITCH` | Ouverture/fermeture cuisine, dispatch pizza |

## Décisions de conception clés

1. **`shared_ptr<Entry>` dans Thread** : survit aux réallocations du vecteur,
   empêche `bad_function_call`
2. **`poll()` avec timeout d'inactivité** : la cuisine se ferme après 5s
   d'inactivité (exigence du sujet)
3. **Dispatch par pizza** : chaque pizza va individuellement vers la
   cuisine la moins chargée
4. **Logger singleton** : un seul fichier log par session, thread-safe,
   partagé par toute la Réception