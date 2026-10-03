# Analyse détaillée de `src/client/main.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** main
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme le point d'entrée du client.

## Inclusions (lignes 8-12)
```c
#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
```

### Analyse détaillée
- **Ligne 8** : Header principal du client avec les structures et fonctions client
- **Ligne 9** : Header des utilitaires communs (buffer, JSON)
- **Ligne 10** : Entrées/sorties standard (printf)
- **Ligne 11** : Fonctions standard C (malloc, free, atoi)
- **Ligne 12** : Manipulation de chaînes (strcmp)

### Pourquoi ces inclusions ?
- **client.h** : Définit la structure client_t et les fonctions principales
- **utils.h** : Utilitaires pour les buffers et JSON
- **stdio.h** : Pour l'affichage de l'aide et des messages
- **stdlib.h** : Pour la gestion mémoire et conversion de port
- **string.h** : Pour la comparaison de chaînes (validation des flags)

## Fonction d'aide (lignes 14-19)
```c
void myteams_client_usage(void)
{
    printf("USAGE: ./myteams_cli ip port\n");
    printf("\tip is the server ip address on which the server socket listens\n");
    printf("\tport is the port number on which the server socket listens\n");
}
```

### Analyse détaillée
- **Ligne 14** : Fonction pour afficher l'aide d'utilisation du client
- **Ligne 16** : Syntaxe d'appel du programme avec IP et port
- **Ligne 17** : Explication du paramètre IP (adresse du serveur)
- **Ligne 18** : Explication du paramètre port (port d'écoute du serveur)

### Pourquoi cette fonction ?
- **Standard EPITECH** : Obligatoire pour les programmes en ligne de commande
- **Clarté** : Explique clairement les paramètres attendus
- **Utilité** : Aide l'utilisateur à comprendre comment se connecter

## Fonction de validation de flags (lignes 21-28)
```c
int myteams_client_validate_flag(char *flag)
{
    if (!strcmp(flag, "--help")) {
        myteams_client_usage();
        return 0;
    }
    return 84;
}
```

### Analyse détaillée
- **Ligne 21** : Fonction pour valider les arguments spéciaux (flags)
- **Paramètre** : `flag` - Argument à valider
- **Ligne 23** : `strcmp()` - Compare avec "--help"
- **Ligne 24** : Si "--help", affiche l'aide
- **Ligne 25** : Retour 0 (succès, sortie normale)
- **Ligne 27** : Retour 84 (erreur EPITECH standard)

### Pourquoi cette fonction ?
- **Centralisation** : Un seul endroit pour gérer les flags
- **Extensibilité** : Facile d'ajouter d'autres flags (--version, --debug, etc.)
- **Standard** : Respect des codes de retour EPITECH

## Fonction main() - Point d'entrée (lignes 30-45)
```c
int main(int ac, char **av)
{
    client_t *c = NULL;

    if (ac != 3)
        return myteams_client_validate_flag(av[1]);
    if (ac == 3) {
        c = myteams_client_create(av[1], atoi(av[2]));
        if (c == NULL)
            return 84;
        myteams_client_run(c);
        free(c);
        return 0;
    }
    return 84;
}
```

### Analyse détaillée ligne par ligne

#### **Ligne 30** : Signature standard du main
- **`ac`** (argc) : Nombre d'arguments
- **`av`** (argv) : Tableau des arguments

#### **Ligne 32** : Déclaration du client
- **`c = NULL`** : Pointeur vers la structure client, initialisé à NULL

#### **Ligne 34** : Validation du nombre d'arguments
- **`ac != 3`** : Vérifie qu'on a exactement 3 arguments (programme + ip + port)
- **`av[1]`** : Premier argument (potentiellement "--help" ou autre flag)
- **`myteams_client_validate_flag()`** : Gère les flags spéciaux

#### **Ligne 36** : Cas normal (3 arguments)
- **`ac == 3`** : Confirme qu'on a le bon nombre d'arguments

#### **Ligne 37** : Création du client
- **`myteams_client_create(av[1], atoi(av[2]))**** :
  - `av[1]` : Adresse IP du serveur (ex: "127.0.0.1")
  - `atoi(av[2])` : Port converti en entier (ex: 4242)
  - Retourne un pointeur vers client_t ou NULL en cas d'erreur

#### **Lignes 38-39** : Gestion d'erreur de création
- **`c == NULL`** : Si la création échoue (connexion impossible, etc.)
- **`return 84`** : Code d'erreur EPITECH

#### **Ligne 40** : Lancement de la boucle principale
- **`myteams_client_run(c)`** : Boucle d'interaction avec le serveur
- **Bloquant** : Cette fonction ne retourne qu'à la déconnexion

#### **Ligne 41** : Libération mémoire
- **`free(c)`** : Libère la structure client allouée

#### **Ligne 42** : Succès
- **`return 0`** : Sortie normale du programme

#### **Lignes 44-45** : Code par défaut
- **`return 84`** : Erreur par défaut (ne devrait pas être atteint)

## Architecture et Flux d'exécution

### Flux normal
```
./myteams_cli 127.0.0.1 4242
↓
main() avec ac=3, av=["./myteams_cli", "127.0.0.1", "4242"]
↓
myteams_client_create("127.0.0.1", 4242) → client_t*
↓
myteams_client_run(client_t*) → [boucle d'interaction]
↓
free(client_t*) → return 0
```

### Flux d'aide
```
./myteams_cli --help
↓
main() avec ac=2, av=["./myteams_cli", "--help"]
↓
strcmp(av[1], "--help") == 0 → myteams_client_usage() → return 0
```

### Flux d'erreur
```
./myteams_cli (pas assez d'arguments)
↓
main() avec ac=1
↓
ac != 3 et ac != 2 avec --help
↓
return 84
```

### Flux d'erreur de connexion
```
./myteams_cli 127.0.0.1 9999 (serveur inexistant)
↓
myteams_client_create() → NULL
↓
return 84
```

## Gestion des arguments

### Arguments attendus
1. **`./myteams_cli`** : Nom du programme
2. **`ip`** : Adresse IP du serveur (ex: "127.0.0.1", "192.168.1.1")
3. **`port`** : Port du serveur (ex: "4242", "8080")

### Flags supportés
- **`--help`** : Affiche l'aide et sort avec succès

### Validation
- **Nombre** : Exactement 3 arguments requis
- **IP** : Pas de validation spécifique (laissée à myteams_client_create)
- **Port** : Conversion avec atoi() (validation laissée à myteams_client_create)

## Codes de retour

### Succès
- **0** : Exécution normale réussie
- **0** : Aide affichée (sortie considérée comme normale)

### Erreurs
- **84** : Code d'erreur standard EPITECH
  - Mauvais nombre d'arguments
  - Flag non reconnu
  - Échec de création du client

## Bonnes pratiques observées

1. **Validation stricte** du nombre d'arguments
2. **Gestion d'erreurs** explicite avec codes standards
3. **Séparation des responsabilités** (usage, validation, création)
4. **Gestion mémoire propre** (free après utilisation)
5. **Messages clairs** pour l'utilisateur
6. **Extensibilité** via le système de flags

## Conception et Architecture

### Séparation des responsabilités
- **main()** : Orchestration globale et gestion des arguments
- **myteams_client_usage()** : Affichage de l'aide
- **myteams_client_validate_flag()** : Validation des flags
- **myteams_client_create()** : Création et connexion du client
- **myteams_client_run()** : Boucle d'interaction

### Gestion d'erreurs
- **Centralisée** dans myteams_client_validate_flag()
- **Propagée** via les codes de retour
- **Standardisée** avec le code 84 EPITECH

### Extensibilité
- **Facile** d'ajouter de nouveaux flags
- **Modulaire** : Chaque fonction a une responsabilité claire
- **Maintenable** : Code simple et lisible

## Sécurité et Validation

### Validation minimale
- **Nombre d'arguments** : Vérifié dans main()
- **Flags** : Validés dans myteams_client_validate_flag()
- **IP/Port** : Validation déléguée à myteams_client_create()

### Considérations de sécurité
- **atoi()** : Pas de validation de débordement (potentiellement problématique)
- **IP** : Pas de validation de format (laissée à la connexion)
- **Port** : Pas de validation de plage (laissée à la connexion)

## Performance et Optimisations

### Allocation mémoire
- **Unique** : Une seule allocation pour tout le programme
- **Libération** : Propre à la fin
- **Simple** : Pas de gestion complexe de mémoire

### Démarrage
- **Rapide** : Validation minimale avant création
- **Direct** : Création immédiate du client si arguments valides

## Conclusion

Ce fichier implémente un point d'entrée client robuste et simple avec :
- **Validation stricte** des arguments de ligne de commande
- **Gestion d'erreurs** standardisée et cohérente
- **Architecture modulaire** avec séparation claire des responsabilités
- **Extensibilité** pour ajouter de nouvelles fonctionnalités
- **Gestion mémoire propre** et efficace

L'approche minimaliste est appropriée pour un client, se concentrant sur l'essentiel : validation des arguments, création de la connexion, et gestion du cycle de vie du programme.
