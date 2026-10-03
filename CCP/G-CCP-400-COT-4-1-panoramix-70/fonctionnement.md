# Panoramix — Explication du fonctionnement

## Concept général

Le projet simule le village gaulois d'Astérix. Un **druide** prépare une potion magique dans un chaudron. Les **villageois** viennent boire une portion avant chaque combat contre les Romains. Quand le chaudron est vide, un villageois réveille le druide pour qu'il le remplisse.

Techniquement : chaque villageois est un **thread**, le druide est un **thread**, et le chaudron est une **structure partagée** protégée par un **mutex** et deux **sémaphores**.

---

## Exemple du PDF : `./panoramix 3 5 3 1`

### Paramètres

| Argument | Valeur | Signification |
|----------|--------|---------------|
| `nb_villagers` | 3 | 3 villageois (ids 0, 1, 2) |
| `pot_size` | 5 | 5 portions max dans le chaudron |
| `nb_fights` | 3 | chaque villageois fait 3 combats |
| `nb_refills` | 1 | le druide peut remplir 1 fois |

**Calcul** : 3 villageois × 3 combats = 9 portions nécessaires. Le chaudron commence plein (5 portions) + 1 recharge (5 portions) = 10 portions disponibles. C'est suffisant.

---

### Déroulement pas à pas

#### 1. Démarrage

```
Druid: I'm ready... but sleepy...        ← le thread du druide démarre et attend sur empty_pot
Villager 2: Going into battle!            ← les threads villageois démarrer
Villager 1: Going into battle!
Villager 0: Going into battle!
```

Tous les threads sont créés. Le druide se met en attente sur `sem_wait(&c->empty_pot)`. Les villageois commencent leur boucle de combat.

---

#### 2. Premières tournées (le chaudron a 5 portions)

```
Villager 2: I need a drink... I see 5 servings left.   ← v2 boit (reste 4)
Villager 0: I need a drink... I see 4 servings left.   ← v0 boit (reste 3)
Villager 0: Take that roman scum! Only 2 left.         ← v0 combat (3→2 restants)
Villager 1: I need a drink... I see 3 servings left.   ← v1 boit (reste 2)
Villager 2: Take that roman scum! Only 2 left.         ← v2 combat (3→2)
Villager 1: Take that roman scum! Only 2 left.         ← v1 combat (3→2)
Villager 0: I need a drink... I see 2 servings left.   ← v0 boit (reste 1)
Villager 0: Take that roman scum! Only 1 left.         ← v0 combat (2→1)
Villager 2: I need a drink... I see 1 servings left.   ← v2 boit (reste 0)
```

Les 3 villageois se partagent les 5 portions. Chacun verrouille le mutex (`pthread_mutex_lock`) avant de lire/décrémenter `servings`, puis le déverrouille après. L'ordre exact des messages varie selon l'ordonnancement des threads.

---

#### 3. Le chaudron est vide → appel au druide

```
Villager 1: I need a drink... I see 0 servings left.   ← v1 trouve 0 portion
Villager 1: Hey Pano wake up! We need more potion.     ← v1 réveille le druide
```

Quand `v1` verrouille le mutex et voit `servings == 0` :
1. Vérifie que le druide n'a pas fini (`druid_done == 0`)
2. Vérifie que personne n'a déjà appelé le druide (`druid_called == 0`) → le passe à 1
3. Déverrouille le mutex
4. Poste `empty_pot` → réveille le druide
5. Attend sur `full_pot` que le druide ait rempli

Les autres villageois (`v0`, `v2`) qui arriveraient verraient `druid_called == 1` et iraient directement attendre sur `full_pot`.

---

#### 4. Le druide se réveille et remplit

```
Druid: Ah! Yes, yes, I'm awake! Working on it! Beware I can only make 0 more refills after this one.
Druid: I'm out of viscum. I'm going back to... zZz
```

Le druide :
1. Se réveille sur `sem_wait(&c->empty_pot)`
2. Verrouille le mutex
3. Vérifie qu'on ne lui demande pas de s'arrêter (`druid_done == 0`)
4. Remplit : `servings = pot_size` (5), `nb_refills--` (passe de 1 à 0)
5. `nb_refills == 0` → c'était le dernier remplissage :
   - Passe `druid_done = 1`
   - Déverrouille le mutex
   - Poste `full_pot` pour **tous les villageois** (boucle `for` sur `nb_villagers`)
6. Le thread du druide se termine

---

#### 5. Les villageois terminent leurs combats

```
Villager 1: Take that roman scum! Only 1 left.         ← v1 combat (2→1)
Villager 2: Take that roman scum! Only 1 left.         ← v2 combat (2→1)
Villager 0: I need a drink... I see 4 servings left.   ← v0 boit (reste 4→3)
Villager 1: I need a drink... I see 3 servings left.   ← v1 boit (reste 3→2)
Villager 0: Take that roman scum! Only 0 left.         ← v0 combat (1→0) FINI
Villager 2: I need a drink... I see 2 servings left.   ← v2 boit (reste 2→1)
Villager 1: Take that roman scum! Only 0 left.         ← v1 combat (1→0) FINI
Villager 2: Take that roman scum! Only 0 left.         ← v2 combat (1→0) FINI
Villager 0: I'm going to sleep now.
Villager 1: I'm going to sleep now.
Villager 2: I'm going to sleep now.
```

Après le réveil sur `full_pot`, les villageois reprennent leur boucle :
- Verrouillent le mutex
- Vérifient `servings`
- Boivent une portion → décrémentent `servings`
- Combat → décrémentent leur compteur de combats
- Quand leur compteur arrive à 0 → "I'm going to sleep now" et le thread se termine

Les villageois qui avaient déjà bu avant la recharge peuvent combattre directement (ils avaient déjà pris une portion avant que le pot soit vide).

---

## Schéma de synchronisation

```
┌─────────────────────────────────────────────────────────────┐
│                      CHAUDRON (cauldron_t)                   │
│  servings, druid_called, druid_done, nb_refills             │
│  protégé par pot_mutex (mutex)                              │
└─────────────────────────────────────────────────────────────┘
          ▲                            ▲
          │ mutex lock/unlock          │ mutex lock/unlock
          ▼                            ▼
┌──────────────────┐        ┌──────────────────┐
│   VILLAGEOIS     │        │     DRUIDE       │
│ (N threads)      │        │  (1 thread)      │
├──────────────────┤        ├──────────────────┤
│ Boucle :         │        │ Boucle :         │
│  lock mutex      │        │  sem_wait(empty) │
│  si servings==0  │        │  lock mutex      │
│  → druid_called  │◄──────►│  refill pot      │
│  → sem_wait(full)│  sem   │  sem_post(full)  │
│  si servings>0   │  phore │  unlock mutex    │
│  → boire,combattre│       └──────────────────┘
│  unlock mutex    │
└──────────────────┘
```

### Rôle des sémaphores

| Sémaphore | Initialisé à | Qui attend ? | Qui poste ? |
|-----------|-------------|--------------|-------------|
| `empty_pot` | 0 | Le **druide** (attend qu'on l'appelle) | Le **villageois** qui trouve le pot vide |
| `full_pot` | 0 | Les **villageois** (attend que le pot soit rempli) | Le **druide** après avoir rempli |

### Rôle du mutex

Le **`pot_mutex`** protège l'accès aux variables partagées du chaudron :
- `servings` : nombre de portions restantes
- `druid_called` : un villageois a-t-il déjà appelé le druide ?
- `druid_done` : le druide a-t-il fini ses recharges ?
- `nb_refills` : nombre de recharges restantes

Sans mutex, deux threads pourraient lire/écrire `servings` en même temps → **data race**.

---

## Cas problématique : starvation

> *"There are cases when villagers may wait endlessly. Can you see which ones?"*

Si `nb_refills` est trop petit par rapport au nombre total de combats, les villageois peuvent attendre indéfiniment.

**Exemple** : `./panoramix 3 1 3 0`
- 3 villageois × 3 combats = 9 portions → chaudron de taille 1, 0 recharge
- Le premier villageois boit la seule portion, combat
- Le deuxième trouve le pot vide → appelle le druide
- Le druide se réveille, mais `nb_refills == 0` → il ne peut pas remplir
- Le villageois reste bloqué sur `sem_wait(&c->full_pot)` pour toujours

Ce n'est **pas un deadlock** (le druide ne détient pas de ressource, il dort), c'est un problème de **starvation**.

---

## Codes source

- `include/panoramix.h` — structures (`params_t`, `cauldron_t`, `villager_t`) et prototypes
- `src/main.c` — initialisation du chaudron, création des threads, nettoyage
- `src/villager.c` — routine des villageois : boire → combattre → répéter
- `src/druid.c` — routine du druide : attendre → remplir → répéter
- `src/validate.c` — validation des arguments
