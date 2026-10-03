# Design Patterns utilisés dans le projet Plazza

## 1. Singleton — `Logger`

**Fichiers :** `include/Logger.hpp`, `src/Logger.cpp`

**Description :** La classe `Logger` est un singleton garantissant qu'un seul objet de logging
existe dans tout le programme. Le constructeur est privé, les opérations de copie sont supprimées,
et l'accès se fait via `Logger::get()` qui retourne une référence à une instance statique locale.

```cpp
static Logger instance("plazza.log");
return instance;
```

**Utilisation :** Partout dans le projet (`Reception.cpp`, `Kitchen.cpp`, etc.) via
`Logger::get().info(...)`, `Logger::get().warn(...)`, etc. Tous les logs sont écrits
dans un unique fichier `plazza.log`.

---

## 2. Factory Method — `IpcMessage`, `Ingredient`, `Pizza`

**Fichiers :**
- `include/ipc/IpcMessage.hpp`, `src/ipc/IpcMessage.cpp`
- `include/Ingredient.hpp`, `src/Ingredient.cpp`
- `include/Pizza.hpp`, `src/Pizza.cpp`

**Description :** Plusieurs fonctions statiques encapsulent la création d'objets complexes :

- **`buildShutdownMessage()`** et **`buildPizzaMessage(payload)`** créent des messages IPC
  sérialisés (`std::vector<std::uint8_t>`) avec l'en-tête `IpcMessageKind` correct,
  sans exposer le format de sérialisation aux appelants.
- **`stockForPizza(PizzaType)`** construit un `IngredientStock` complet pour un type de pizza donné.
- **`Pizza::unpack(data)`** désérialise un `vector<uint8_t>` en objet `Pizza`.
- **`pizzaTypeFromName(name)`** et **`pizzaSizeFromToken(token)`** parsent des chaînes
  en valeurs d'énumérations.

**Utilisation :**
- `Reception` appelle `buildPizzaMessage()` pour envoyer des pizzas aux cuisines via IPC.
- `Kitchen` appelle `Pizza::unpack()` pour reconstruire les pizzas reçues.
- `Kitchen::handlePizza()` appelle `stockForPizza()` pour déterminer les ingrédients nécessaires.

---

## 3. Thread Pool — `ThreadPool`

**Fichiers :** `include/ThreadPool.hpp`, `src/ThreadPool.cpp`

**Description :** La classe `ThreadPool` gère un ensemble fixe de threads workers (cuisiniers)
et une file de tâches partagée (`std::deque<std::function<void()>>`).

- **Constructeur :** Crée N threads, chacun exécutant `workerLoop()`.
- **`enqueue(task)` :** Ajoute une tâche à la file et réveille un worker via une variable condition.
- **`workerLoop()` :** Chaque worker attend une tâche, la récupère et l'exécute en boucle.
- **`stop()` :** Arrête tous les threads, les join, et nettoie.

La synchronisation utilise `Mutex` et `ConditionVariable` pour un accès thread-safe à la file.

**Utilisation :** Chaque `Kitchen` possède son propre `ThreadPool` dont la taille est
déterminée par le multiplicateur de cuisson passé en paramètre du programme.

---

## 4. Command / Task Queue — `ThreadPool`, `Kitchen`

**Fichiers :**
- `include/ThreadPool.hpp`, `src/ThreadPool.cpp`
- `include/Kitchen.hpp`, `src/Kitchen.cpp`

**Description :** Le travail à exécuter est encapsulé sous forme d'objets `std::function<void()>`
(le Command) stockés dans une `std::deque` (la file de tâches) et exécutés plus tard
par les threads workers.

**`Kitchen::enqueuePizza(const Pizza&)`** empaquette le traitement d'une pizza dans une lambda
`[this, pizza] { handlePizza(pizza); }` et l'ajoute au `ThreadPool`.

**Utilisation :** La réception (appelée par `Reception` via IPC) envoie une pizza à une cuisine,
qui l'enqueue. Un cuisinier disponible la déqueue et l'exécute. Cela découple la soumission
des tâches de leur exécution.

---

## 5. RAII (Resource Acquisition Is Initialization) — Multiples classes

**Fichiers :**
- `include/sync/LockGuard.hpp`, `src/sync/LockGuard.cpp`
- `include/sync/Mutex.hpp`, `src/sync/Mutex.cpp`
- `include/sync/Thread.hpp`, `src/sync/Thread.cpp`
- `include/sync/ConditionVariable.hpp`, `src/sync/ConditionVariable.cpp`
- `include/ipc/IpcChannel.hpp`, `src/ipc/IpcChannel.cpp`
- `include/process/Process.hpp`, `src/process/Process.cpp`
- `include/ThreadPool.hpp`, `src/ThreadPool.cpp`

**Description :** Toute la gestion des ressources repose sur le principe RAII :
les ressources sont acquises dans les constructeurs et libérées dans les destructeurs.

| Classe | Ressource acquise (constructeur) | Ressource libérée (destructeur) |
|--------|----------------------------------|--------------------------------|
| `LockGuard` | Verrouille un `Mutex` | Déverrouille le `Mutex` |
| `Mutex` | `pthread_mutex_init()` | `pthread_mutex_destroy()` |
| `Thread` | `pthread_create()` | `pthread_join()` (si joignable) |
| `ConditionVariable` | `pthread_cond_init()` | `pthread_cond_destroy()` |
| `IpcChannel` | `mkfifo()`, `open()` | `close()`, `unlink()` |
| `Process` | `fork()` | `waitpid()` (parent) ou `_exit(0)` (enfant) |
| `ThreadPool` | Création des threads workers | `stop()` : join + delete des threads |

Toutes les opérations de copie sont supprimées (`= delete`) pour éviter les duplications
de ressources.

**Utilisation :** Partout dans le projet. Garantit qu'il n'y a pas de fuite de ressources
(mutex, threads, descripteurs de fichiers, FIFO, processus enfants).

---

## 6. Adapter / Wrapper — `Mutex`, `Thread`, `ConditionVariable`, `Process`, `IpcChannel`

**Fichiers :**
- `include/sync/Mutex.hpp`, `src/sync/Mutex.cpp`
- `include/sync/Thread.hpp`, `src/sync/Thread.cpp`
- `include/sync/ConditionVariable.hpp`, `src/sync/ConditionVariable.cpp`
- `include/process/Process.hpp`, `src/process/Process.cpp`
- `include/ipc/IpcChannel.hpp`, `src/ipc/IpcChannel.cpp`

**Description :** Chacune de ces classes adapte une API C/POSIX de bas niveau en une
interface orientée objet C++ avec sémantique RAII :

- `Mutex` encapsule `pthread_mutex_t` et expose `lock()`, `unlock()`, `tryLock()`, `nativeHandle()`.
- `Thread` encapsule `pthread_t` et expose `join()`, `detach()`.
- `ConditionVariable` encapsule `pthread_cond_t` et expose `wait()`, `signal()`, `broadcast()`.
- `IpcChannel` encapsule deux file descriptors (lecture/écriture) et un chemin de FIFO,
  et expose `send()`, `receive()`, `operator<<`, `operator>>`.
- `Process` encapsule `fork()/waitpid()` et expose `isChild()`, `isParent()`.

**Utilisation :** Partout dans le code synchro, IPC et gestion de processus.

---

## 7. Memento (Sérialisation) — `Pizza`

**Fichiers :** `include/Pizza.hpp`, `src/Pizza.cpp`

**Description :** La classe `Pizza` fournit deux méthodes pour capturer et restaurer son état :

- **`pack()` :** Sérialise le `type` et la `size` de la pizza dans un
  `std::vector<std::uint8_t>` (le memento).
- **`unpack(data)` :** Factory statique qui reconstruit un objet `Pizza` à partir
  d'un vecteur d'octets (restauration du memento).

**Utilisation :** Utilisé par `Reception` pour envoyer des pizzas aux cuisines via le canal IPC
(FIFO), et par `Kitchen` pour les désérialiser à la réception.

---

## 8. Builder — `Ingredient`

**Fichiers :** `include/Ingredient.hpp`, `src/Ingredient.cpp`

**Description :** La fonction `stockForPizza(PizzaType)` construit un `IngredientStock`
(un `std::array<int, N>`) en composant les ingrédients étape par étape :

1. `addBaseIngredients(stock)` — ajoute les ingrédients communs (Dough, Tomato)
2. Puis une fonction spécifique au type ajoute les ingrédients supplémentaires :
   - `addMargaritaIngredients` → Gruyere
   - `addReginaIngredients` → Gruyere, Ham, Mushrooms
   - `addAmericanaIngredients` → Gruyere, Steak
   - `addFantasiaIngredients` → Eggplant, GoatCheese, ChiefLove

Ce pattern sépare la construction d'un stock d'ingrédients complexe de sa représentation finale.

**Utilisation :** Appelé par `Kitchen::handlePizza()` pour déterminer les ingrédients
à retirer du stock lors de la préparation d'une pizza.

---

## 9. Exception Hierarchy — `PlazzaException`

**Fichiers :** `include/PlazzaException.hpp`, `src/PlazzaException.cpp`

**Description :** Une hiérarchie de classes d'exception pour différents domaines d'erreur :

- **`PlazzaException`** (hérite de `std::runtime_error`)
  - **`IpcException`** — erreurs IPC/FIFO
  - **`SyncException`** — erreurs de synchronisation pthread
  - **`ProcessException`** — erreurs fork/processus
  - **`PizzaException`** — erreurs de parsing type/taille de pizza

Cela permet d'attraper des types d'erreur spécifiques ou le type de base pour
une gestion générique.

**Utilisation :** Lancées dans tout le code bas niveau (`IpcChannel`, `Mutex`, `Thread`,
`Process`, parsing de commandes) et attrapées dans les couches supérieures.

---

## 10. Facade — `Reception`

**Fichiers :** `include/Reception.hpp`, `src/Reception.cpp`

**Description :** La classe `Reception` fournit une interface simplifiée de haut niveau
qui masque la complexité des sous-systèmes :

- **Parsing** (délègue à `Parser`)
- **Communication IPC** (encapsule `IpcChannel`)
- **Création de processus** (`fork()`, gère les `KitchenSlot`)
- **Load balancing** (dispatch des pizzas vers la cuisine la moins chargée)
- **Gestion du cycle de vie** (création, surveillance, arrêt des cuisines)

Tout le système est exposé à `main.cpp` via une interface simple à deux méthodes :
`Reception(settings)` et `run()`.

---

## 11. Master-Worker (Architecture) — `Reception`, `Kitchen`, `IpcChannel`

**Fichiers :**
- `include/Reception.hpp`, `src/Reception.cpp` — le master
- `include/Kitchen.hpp`, `src/Kitchen.cpp` — les workers
- `include/ipc/IpcChannel.hpp`, `src/ipc/IpcChannel.cpp` — le canal de communication

**Description :** Au niveau architectural, le projet suit le pattern **Master-Worker** :

- **Reception** (master/processus parent) accepte les commandes utilisateur, les parse,
  et dispatch les pizzas aux cuisines (processus enfants).
- Chaque **Kitchen** (worker/processus enfant) s'exécute indépendamment, reçoit les pizzas
  via IPC et les traite avec son propre thread pool.
- La communication se fait via des **FIFO (named pipes)** (`IpcChannel`), unidirectionnelles
  (le parent écrit, l'enfant lit).
- Le master surveille la santé des workers via `waitpid()` avec `WNOHANG` et nettoie
  les processus morts.

---

## 12. Producer-Consumer — `ThreadPool`, `Mutex`, `ConditionVariable`

**Fichiers :**
- `include/ThreadPool.hpp`, `src/ThreadPool.cpp`
- `include/sync/Mutex.hpp`, `src/sync/Mutex.cpp`
- `include/sync/ConditionVariable.hpp`, `src/sync/ConditionVariable.cpp`

**Description :** Au sein du `ThreadPool`, on retrouve le pattern classique producteur-consommateur :

- **Producteurs :** `Kitchen::enqueuePizza()` appelle `ThreadPool::enqueue()`, qui pousse
  les tâches dans la deque `_tasks` partagée et notifie un worker en attente.
- **Consommateurs :** Les threads workers (`workerLoop()`) attendent sur la variable condition
  (`waitForTask`), récupèrent les tâches quand elles sont disponibles et les exécutent.
- **Synchronisation :** La deque `_tasks` est protégée par un `Mutex`, et la `ConditionVariable`
  sert au réveil efficace des workers inactifs.

---

## Résumé

| # | Pattern | Type | Fichiers principaux |
|---|---------|------|---------------------|
| 1 | Singleton | Création | `Logger.hpp/cpp` |
| 2 | Factory Method | Création | `IpcMessage.hpp/cpp`, `Ingredient.hpp/cpp`, `Pizza.hpp/cpp` |
| 3 | Thread Pool | Concurrence | `ThreadPool.hpp/cpp` |
| 4 | Command / Task Queue | Comportemental | `ThreadPool.hpp/cpp`, `Kitchen.hpp/cpp` |
| 5 | RAII | Idiome | `LockGuard`, `Mutex`, `Thread`, `ConditionVariable`, `IpcChannel`, `Process` |
| 6 | Adapter / Wrapper | Structurel | `Mutex`, `Thread`, `ConditionVariable`, `Process`, `IpcChannel` |
| 7 | Memento | Comportemental | `Pizza.hpp/cpp` |
| 8 | Builder | Création | `Ingredient.hpp/cpp` |
| 9 | Exception Hierarchy | Idiome | `PlazzaException.hpp/cpp` |
| 10 | Facade | Structurel | `Reception.hpp/cpp` |
| 11 | Master-Worker | Architecture | `Reception.hpp/cpp`, `Kitchen.hpp/cpp`, `IpcChannel.hpp/cpp` |
| 12 | Producer-Consumer | Concurrence | `ThreadPool.hpp/cpp`, `Mutex`, `ConditionVariable` |
