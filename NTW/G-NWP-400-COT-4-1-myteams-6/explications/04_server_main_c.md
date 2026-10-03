# Analyse détaillée de `src/server/main.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** main
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme le point d'entrée du serveur.

## Inclusion (ligne 8)
```c
#include "../../include/server.h"
```
- **Ligne 8** : Inclusion du header principal du serveur contenant toutes les définitions et déclarations nécessaires.

## Fonction d'aide (lignes 10-14)
```c
void myteams_server_usage(void)
{
    printf("USAGE: ./myteams_server port\n");
    printf("\tport is the port number on which the server socket listens\n");
}
```
### Analyse détaillée
- **Purpose** : Affiche l'aide d'utilisation du programme
- **Ligne 12** : Affiche la syntaxe d'appel du programme
- **Ligne 13** : Explique ce que représente le paramètre port
- **Pourquoi cette fonction ?** : Standard EPITECH pour les programmes en ligne de commande

## Fonction de validation de port (lignes 16-25)
```c
static int is_valid_port(char *arg)
{
    int i = 0;

    for (i = 0; arg[i]; i++) {
        if (!isdigit(arg[i]))
            return 0;
    }
    return 1;
}
```
### Analyse détaillée
- **Ligne 16** : `static` - fonction visible uniquement dans ce fichier
- **Ligne 17** : Déclaration et initialisation du compteur
- **Ligne 20** : Boucle parcourant chaque caractère de l'argument
- **Ligne 21** : `isdigit()` vérifie si le caractère est un chiffre (0-9)
- **Ligne 22** : Si non-chiffre trouvé, retourne 0 (invalide)
- **Ligne 24** : Si tous les caractères sont des chiffres, retourne 1 (valide)

### Pourquoi cette validation ?
- **Sécurité** : Évite les injections de commandes via le port
- **Robustesse** : Prévient les erreurs de conversion
- **Clarté** : Message d'erreur explicite pour l'utilisateur

## Fonction main() - Point d'entrée (lignes 27-71)
```c
int main(int ac, char **av)
{
    server_t server = {0};
    socket_config_t sock = {0};
    int ret = 0;

    setbuf(stdout, NULL);
    if (ac != 3) {
        if (ac == 2 && strcmp(av[1], "--help") == 0) {
            myteams_server_usage();
            return 0;
        }
        return 84;
    }
    if (!is_valid_port(av[1])) {
        write(2, "Invalid port number\n", 20);
        return 84;
    }
    server.port = atoi(av[1]);
    if (server.port < 1 || server.port > 65535) {
        write(2, "Invalid port number\n", 20);
        return 84;
    }
    signal(SIGINT, myteams_server_signal_handler);
    if (myteams_server_init(&server, &sock) == 84)
        return 84;
    printf("Server launched on port %d\n", server.port);
    ret = myteams_server_run(&server);
    if (server.fd > 0)
        close(server.fd);
    return ret;
}
```

### Analyse détaillée ligne par ligne

#### **Ligne 29** : Signature standard du main
- **`ac`** (argc) : Nombre d'arguments
- **`av`** (argv) : Tableau des arguments

#### **Lignes 31-33** : Initialisation des structures
- **`server = {0}`** : Initialise la structure serveur à zéro
- **`sock = {0}`** : Initialise la structure socket à zéro
- **`ret = 0`** : Variable pour le code de retour

#### **Ligne 35** : Désactivation du buffer stdout
- **`setbuf(stdout, NULL)` : Rend stdout non-bufferisé
- **Pourquoi ?** : Les messages apparaissent immédiatement (utile pour le debugging)

#### **Lignes 36-41** : Validation des arguments
- **`ac != 3`** : Vérifie qu'on a exactement 3 arguments (programme + port)
- **`ac == 2 && strcmp(av[1], "--help") == 0`** : Gère le cas --help
- **`myteams_server_usage()`** : Affiche l'aide si demandée
- **`return 84`** : Code d'erreur EPITECH si mauvais nombre d'arguments

#### **Lignes 42-47** : Validation du port
- **`!is_valid_port(av[1])`** : Vérifie que le port ne contient que des chiffres
- **`server.port = atoi(av[1])`** : Convertit la chaîne en entier
- **Vérification de plage** : Port doit être entre 1 et 65535
- **Message d'erreur** : "Invalid port number" sur stderr

#### **Ligne 48** : Gestion du signal SIGINT (Ctrl+C)
- **`signal()`** : Installe un gestionnaire de signal
- **`SIGINT`** : Signal d'interruption (Ctrl+C)
- **`myteams_server_signal_handler`** : Fonction pour arrêt propre du serveur

#### **Lignes 49-53** : Initialisation et lancement du serveur
- **`myteams_server_init()`** : Initialise le socket et la configuration
- **`printf()`** : Affiche le message de lancement
- **`myteams_server_run()`** : Lance la boucle principale (bloquant)

#### **Lignes 54-56** : Nettoyage des ressources
- **`server.fd > 0`** : Vérifie que le socket est valide avant de le fermer
- **`close(server.fd)`** : Libère le descripteur de fichier système

#### **Ligne 57** : Retour final
- **`ret`** : Propage le code de retour du serveur

### Pourquoi cette approche simplifiée ?
- **Simplicité** : Toute la logique est dans une seule fonction
- **Lisibilité** : Le flux est direct et facile à suivre
- **Maintenance** : Moins de fonctions à maintenir
### Architecture et Flux d'exécution

### Flux normal
```
./myteams_server 4242
↓
main() avec ac=3, av=["./myteams_server", "4242"]
↓
Validation du port numérique et de la plage (1-65535)
↓
signal() → Installation du handler SIGINT
↓
myteams_server_init() → "Server launched on port 4242" → myteams_server_run()
↓
[Boucle serveur jusqu'à SIGINT]
↓
close() → return 0
```

### Flux avec erreur
```
./myteams_server abc
↓
Validation du port échoue (!is_valid_port())
↓
write(2, "Invalid port number\n") → return 84
```

### Flux d'aide
```
./myteams_server --help
↓
ac=2, strcmp(av[1], "--help") == 0
↓
myteams_server_usage() → return 0
```

### Flux avec mauvais nombre d'arguments
```
./myteams_server (pas assez d'arguments)
↓
ac != 3 et ac != 2 avec --help
↓
return 84
```

## Codes de retour
- **0** : Succès normal
- **84** : Erreur (standard EPITECH)
  - Mauvais nombre d'arguments
  - Port invalide (non numérique ou hors plage)
  - Erreur d'initialisation du serveur

## Bonnes pratiques observées
1. **Validation stricte** des entrées utilisateur
2. **Gestion propre** des ressources (close des sockets)
3. **Messages clairs** pour l'utilisateur
4. **Codes d'erreur** standards et cohérents
5. **Simplicité** : Logique directe dans le main
6. **Gestion des signaux** pour arrêt propre

## Conclusion

Ce `main.c` implémente un point d'entrée robuste et sécurisé pour le serveur MyTeams avec :
- **Validation complète** des arguments (numériques et plage)
- **Gestion d'erreurs** explicite avec messages informatifs
- **Arrêt propre** via signaux
- **Architecture simplifiée** avec toute la logique dans le main
- **Messages informatifs** pour l'utilisateur
- **Code standard** EPITECH tout en étant professionnel et robuste.

L'approche simplifiée réduit le nombre de fonctions tout en maintenant une validation complète et une gestion d'erreurs robuste.
↓
signal() → Installation du handler SIGINT
↓
passing() → init() → "Server launched on port 4242" → run()
↓
[Boucle serveur jusqu'à SIGINT]
↓
close() → return 0
```

### Flux avec erreur
```
./myteams_server abc
↓
check_valid_argument() → ret=-1
↓
write(2, "Invalid port number\n") → return 84
```

### Flux d'aide
```
./myteams_server --help
↓
check_valid_argument() → usage() → ret=1
↓
return 0
```

## Codes de retour
- **0** : Succès normal
- **84** : Erreur (standard EPITECH)
- **1** : Aide affichée (sortie normale malgré le nom)

## Bonnes pratiques observées
1. **Validation stricte** des entrées utilisateur
2. **Gestion propre** des ressources (close des sockets)
3. **Messages clairs** pour l'utilisateur
4. **Codes d'erreur** standards et cohérents
5. **Séparation des responsabilités** entre les fonctions
6. **Gestion des signaux** pour arrêt propre

## Conclusion

Ce `main.c` implémente un point d'entrée robuste et sécurisé pour le serveur MyTeams avec :
- **Validation complète** des arguments
- **Gestion d'erreurs** explicite
- **Arrêt propre** via signaux
- **Messages informatifs** pour l'utilisateur
- **Architecture modulaire** facilitant la maintenance

Le code suit les standards EPITECH tout en étant professionnel et robuste.
