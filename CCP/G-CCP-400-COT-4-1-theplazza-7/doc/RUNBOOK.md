# Plazza — Runbook

## Démarrage rapide

```sh
make && ./plazza 2 2 2000
```

## Que se passe-t-il au lancement

1. `main()` analyse 3 arguments CLI → construit `Reception::Settings`
2. `Logger::get()` instancie le singleton, ouvre `plazza.log` en mode append
3. `Reception::run()` démarre le shell interactif
4. À la première commande, `Reception::spawnKitchen()` forke un processus enfant
5. L'enfant (Cuisine) crée `cuisiniers_par_cuisine` threads workers (ThreadPool)
6. La Cuisine démarre un thread de régénération d'ingrédients
7. La Réception envoie les pizzas via pipe (IPC) une par une pour l'équilibrage de charge

## Flux d'une commande

```
Entrée utilisateur (stdin)
  → Parser::parse()          Validation grammaticale, extraction des tokens
  → Reception::handleOrder()   Pour chaque pizza :
    → dispatchPizza()
      → findKitchenWithMostFreeSlots()
      → sendPizzaToKitchen() via pipe
      → Logger::kitchen() [KITCH]
```

## Cycle de vie d'une cuisine

1. **Démarrage** : créée par `Reception::spawnKitchen()` via `fork()`
2. **Exécution** : boucle `Kitchen::run()` :
   - `poll()` sur le fd de lecture du pipe (timeout max 5s)
   - Sur données : `readNextMessage()` → `handleIncomingMessage()`
      - message `Pizza` → `enqueuePizza()`
      - message `Shutdown` → sort de la boucle
   - Inactivité >5s → sortie
3. **Cuisson** : un worker ThreadPool appelle `handlePizza()` :
   - `waitForIngredients()` (busy-poll 50ms jusqu'à disponibilité du stock)
   - `cookPizza()` (sleep pour `baseCookTime × multiplicateur`)
   - `markPizzaDone()` (décrémente `_pending`)
4. **Arrêt** : reçoit un message `Shutdown` ou le pipe est fermé

## Équilibrage de charge

La Réception suit le `pending` par cuisine (nombre de pizzas dispatchées
non encore estimées comme terminées). Elle estime le temps de complétion
basé sur `cookTimeMs` et décrémente `pending` quand l'estimation expire.

`findKitchenWithMostFreeSlots()` sélectionne la cuisine avec le `pending`
le plus bas. Si toutes sont saturées (`pending ≥ 2×N`), une nouvelle
cuisine est créée.

## Commande status

```
> status
  Kitchen #1 pending: 2 / 4
  Kitchen #2 pending: 0 / 4
```

La Réception affiche le nombre de pizzes en attente par cuisine, estimé
via les temps de cuisson. Le stock d'ingrédients n'est pas affiché (pas
de canal de retour depuis les cuisines).

## Timeout d'inactivité

Chaque cuisine a un timeout d'inactivité de 5 secondes. `readNextMessage()`
utilise `poll()` avec un timeout. Si aucun message n'arrive dans le budget
d'inactivité restant, la cuisine se termine. La Réception détecte la fermeture
via `waitpid(WNOHANG)` et log l'événement (`[KITCH] Kitchen pid X closed`).

## Régénération des ingrédients

Un thread dédié dans chaque cuisine dort `regenIntervalMs` puis ajoute
1 unité de chaque ingrédient au stock. Stock initial : 5 unités chacun.

## Logs

Tous les événements de la Réception sont écrits dans `plazza.log` (répertoire courant) :

```sh
tail -f plazza.log   # suivre les événements en direct
```

| Level | Événement |
|---|---|
| `INFO ` | Démarrage, shutdown, status, exit |
| `WARN ` | Commande invalide (avec l'input brut) |
| `ERROR` | Échec fork, échec envoi IPC, dispatch impossible |
| `ORDER` | Commande valide reçue (ligne entière) |
| `KITCH` | Ouverture/fermeture cuisine, chaque dispatch de pizza |

> **Note** : les cuisines (processus enfants) n'utilisent pas le Logger — elles
> écrivent directement sur stdout. Seule la Réception utilise le Logger.

## Dépannage

| Symptôme | Cause | Correctif |
|---|---|---|
| `make re -j` échoue | Course de compilation parallèle dans l'ancien Makefile | Utilisez `make re` (sans `-j`) ou le Makefile mis à jour |
| Binaire introuvable | Échec de compilation | Vérifiez la sortie du compilateur, lancez `make` |
| Pas de sortie des cuisines | Le stdout des cuisines va vers le terminal | Devrait apparaître dans le même terminal |
| Les cuisines ne se ferment pas | Timeout d'inactivité non déclenché | Vérifiez que `poll()` retourne correctement |
| Le stock n'apparaît pas dans `status` | Pas de canal de retour depuis les cuisines | Feature non implémentée — seul le pending est affiché |
| `plazza.log` non créé | Permissions du répertoire courant | Vérifiez les droits d'écriture dans le répertoire de lancement |