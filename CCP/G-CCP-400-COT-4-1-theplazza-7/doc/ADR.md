# Registre des Décisions d'Architecture

## ADR-001 : IPC par FIFO (named pipe) unidirectionnel

**Statut** : Accepté  
**Contexte** : La Réception et les cuisines sont des processus séparés.
Une communication est nécessaire pour envoyer les commandes de pizzas et
déclencher l'affichage du statut.  
**Décision** : Utiliser un seul `mkfifo()` (named pipe) par cuisine, créant un canal
unidirectionnel de la Réception vers la Cuisine.  
**Justification** : Le FIFO fournit un canal nommé sur le filesystem, pratique
pour le debug. Le canal Réception → Cuisine suffit pour les deux
types de messages nécessaires (Pizza, Shutdown). Les messages
"pizza prête" des cuisines transitent par stdout héritée, partagée avec
le terminal de la Réception.  
**Conséquences** : La Réception utilise le temps de cuisson estimé pour
suivre la charge de la cuisine (voir ADR-002). L'affichage du statut
ne montre que le pending estimé par la Réception (voir ADR-006).

---

## ADR-002 : Équilibrage de charge par estimation temporelle

**Statut** : Accepté  
**Contexte** : La Réception doit suivre l'occupation des cuisines pour
l'équilibrage de charge, mais l'IPC est unidirectionnel.  
**Décision** : Suivre un compteur `pending` par cuisine, décrémenté
par des timeouts de complétion estimés plutôt que par un retour IPC.  
**Justification** : Sans canal retour, la seule façon de savoir quand
une pizza est prête est d'estimer à partir du temps de cuisson.
L'estimation (`cookTimeMs`) est déterministe par type/taille de pizza
et multiplicateur.  
**Conséquences** : `pending` est approximatif. Le temps d'attente des
ingrédients n'est pas pris en compte, donc les cuisines peuvent sembler
occupées légèrement plus longtemps que la réalité.

---

## ADR-003 : Threads POSIX plutôt que std::thread

**Statut** : Accepté  
**Contexte** : Le projet nécessite l'encapsulation objet de Thread,
Mutex et ConditionVariable.  
**Décision** : Encapsuler les primitives POSIX pthread (`pthread_create`,
`pthread_mutex_t`, `pthread_cond_t`) dans des classes C++ personnalisées.  
**Justification** : Le sujet exige explicitement l'encapsulation de ces
4 notions (Process, Thread, Mutex, Variables Conditionnelles). Les threads
POSIX fournissent l'API de plus bas niveau qui correspond directement
à l'exigence.  
**Conséquences** : Légèrement plus verbeux que `std::thread`, mais répond
exactement aux exigences d'encapsulation.

---

## ADR-004 : Allocation heap de la fonction d'entrée du thread

**Statut** : Accepté  
**Contexte** : ThreadPool stocke des objets `Thread` dans un
`std::vector`. La réallocation du vecteur lors de la croissance déplace
les objets Thread, ce qui invaliderait le pointeur `this` passé
à `pthread_create`.  
**Décision** : Allouer la fonction d'entrée sur le heap (`new std::function<void()>`)
et passer le pointeur brut en argument `void*` à `pthread_create`
via une fonction trampoline statique. Le thread delete la fonction après exécution.  
**Justification** : L'allocation heap survit aux déplacements du vecteur.
Le thread en cours d'exécution a toujours un pointeur valide
vers la fonction d'entrée, indépendamment de l'adresse de l'objet Thread.  
**Conséquences** : Léger surcoût d'allocation heap par thread, mais
élimine le crash `bad_function_call` lors de la croissance du vecteur.

---

## ADR-005 : Timeout d'inactivité basé sur poll()

**Statut** : Accepté  
**Contexte** : Chaque cuisine doit se fermer après 5 secondes d'inactivité.
La boucle principale bloque sur la lecture du pipe.  
**Décision** : Remplacer `read()` bloquant par `poll()` sur le fd du pipe
en utilisant un timeout calculé (budget d'inactivité restant).  
**Justification** : `poll()` fournit une manière portable d'attendre des
données avec un timeout. Le timeout est calculé dynamiquement à partir
du temps d'inactivité écoulé.  
**Conséquences** : Appel système supplémentaire par itération de boucle,
mais nécessaire pour implémenter l'exigence du sujet.

---

## ADR-006 : Statut par estimation côté Réception

**Statut** : Accepté  
**Contexte** : La commande `status` doit afficher l'occupation de chaque cuisine.
Le stock d'ingrédients est détenu par le processus enfant et n'est pas accessible
depuis la Réception.  
**Décision** : La Réception suit uniquement le compteur `pending` estimé par
cuisine. L'affichage du stock réel est laissé pour une extension future.  
**Justification** : Sans canal retour, la façon la plus simple est de se baser
sur les estimations déjà calculées pour l'équilibrage de charge.  
**Conséquences** : Le stock n'est pas affiché par la commande `status` — seul
le nombre de pizzas en attente par cuisine est visible.

---

## ADR-007 : Logger singleton thread-safe

**Statut** : Accepté  
**Contexte** : Les événements de la Réception (dispatch, erreurs, commandes)
doivent être tracés à la fois sur la console et dans un fichier persistant.  
**Décision** : Implémenter un singleton `Logger` (méyer's singleton) avec
un `Mutex` interne. Chaque appel à `log()` écrit simultanément sur `stdout`
et dans `plazza.log` (mode append).  
**Justification** : Un singleton garantit un seul fichier log par session.
Le mutex protège contre les écritures concurrentes dans un contexte multi-threadé.
Le mode append conserve l'historique des sessions successives.  
**Conséquences** : Le Logger n'est utilisé que dans le processus Réception
(parent). Les cuisines (processus enfants) héritent d'une copie du singleton
en mémoire mais ne l'utilisent pas — elles écrivent directement sur stdout.