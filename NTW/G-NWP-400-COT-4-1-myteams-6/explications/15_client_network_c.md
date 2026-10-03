# Analyse détaillée de `src/client/network.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** network
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant la logique réseau du client.

## Inclusions (lignes 8-12)
```c
#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
```

### Analyse détaillée
- **Ligne 8** : Header principal du client avec les structures et fonctions
- **Ligne 9** : Header des utilitaires (buffer, JSON)
- **Ligne 10** : Entrées/sorties standard (fgets)
- **Ligne 11** : Fonctions standard C (calloc, free)
- **Ligne 12** : Manipulation de chaînes (memset, strcspn)

### Pourquoi ces inclusions ?
- **client.h** : Définit client_t et les fonctions de gestion
- **utils.h** : Utilitaires pour les buffers de communication
- **stdio.h** : Pour la lecture de l'entrée utilisateur
- **stdlib.h** : Pour l'allocation mémoire du client
- **string.h** : Pour la manipulation des chaînes et adresses réseau

## Fonction de création de socket (lignes 14-30)
```c
static int create_socket(const char *ip, int port)
{
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr;

    if (fd == -1)
        return -1;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = inet_addr(ip);
    if (connect(fd, (struct sockaddr *)&addr, sizeof(addr)) == -1) {
        close(fd);
        return -1;
    }
    return fd;
}
```

### Analyse détaillée ligne par ligne

#### **Ligne 14** : Fonction statique de connexion
- **`static`** : Visible uniquement dans ce fichier
- **Paramètres** :
  - `ip` : Adresse IP du serveur (ex: "127.0.0.1")
  - `port` : Port du serveur (ex: 4242)
- **Retour** : File descriptor du socket ou -1 en cas d'erreur

#### **Ligne 16** : Création du socket
- **`socket()`** : Crée un socket TCP/IP
  - **AF_INET** : Famille d'adresses IPv4
  - **SOCK_STREAM** : Socket TCP (fiable, orienté connexion)
  - **0** : Protocol auto-sélectionné (TCP pour AF_INET+SOCK_STREAM)

#### **Lignes 17-18** : Structure d'adresse
- **`struct sockaddr_in`** : Structure d'adresse Internet
- **Initialisation** : Déclarée mais pas encore initialisée

#### **Lignes 19-20** : Gestion d'erreur de création
- **`fd == -1`** : Si la création du socket échoue
- **`return -1`** : Code d'erreur pour échec

#### **Ligne 21** : Initialisation de l'adresse
- **`memset()`** : Met tous les octets à 0
- **Pourquoi ?** : Évite les valeurs indéfinies

#### **Lignes 22-24** : Configuration de l'adresse
- **`addr.sin_family = AF_INET`** : Famille d'adresses IPv4
- **`addr.sin_port = htons(port)`** : Port en network byte order
  - **htons()** : Host TO Network Short (conversion d'endianness)
- **`addr.sin_addr.s_addr = inet_addr(ip)`** : Conversion IP
  - **inet_addr()** : Convertit "127.0.0.1" en format binaire

#### **Lignes 25-28** : Connexion au serveur
- **`connect()`** : Établit la connexion TCP
- **`(struct sockaddr *)&addr`** : Cast vers le type générique
- **`sizeof(addr)`** : Taille de la structure d'adresse
- **Gestion d'erreur** :
  - Si connect() échoue, ferme le socket et retourne -1
  - **`close(fd)`** : Libère les ressources système

#### **Ligne 29** : Succès
- **`return fd`** : Retourne le file descriptor du socket connecté

### Pourquoi cette implémentation ?
- **Robustesse** : Gestion propre des erreurs à chaque étape
- **Standard** : Utilisation des fonctions socket POSIX standard
- **Sécurité** : Nettoyage des ressources en cas d'erreur
- **Portabilité** : Code compatible avec les systèmes UNIX/Linux

## Fonction de création du client (lignes 32-45)
```c
client_t *myteams_client_create(const char *ip, int port)
{
    client_t *c = calloc(1, sizeof(client_t));

    if (!c)
        return NULL;
    c->fd = create_socket(ip, port);
    if (c->fd == -1) {
        free(c);
        return NULL;
    }
    myteams_buffer_init(&c->buf);
    return c;
}
```

### Analyse détaillée
- **Ligne 32** : Fonction principale de création du client
- **Paramètres** : `ip` et `port` du serveur
- **Retour** : Pointeur vers client_t ou NULL en cas d'erreur

#### **Ligne 34** : Allocation mémoire
- **`calloc(1, sizeof(client_t))`** : Alloue et initialise à zéro
- **Pourquoi calloc ?** : Initialise tous les champs à 0/null
- **Avantages** : Évite les valeurs indéfinies

#### **Lignes 36-37** : Gestion d'erreur d'allocation
- **`!c`** : Si calloc échoue (mémoire insuffisante)
- **`return NULL`** : Propage l'erreur

#### **Ligne 38** : Création de la connexion
- **`create_socket(ip, port)`** : Appelle la fonction précédente
- **Stockage** : Sauvegarde le file descriptor dans la structure

#### **Lignes 39-42** : Gestion d'erreur de connexion
- **`c->fd == -1`** : Si la connexion échoue
- **`free(c)`** : Libère la mémoire allouée
- **`return NULL`** : Propage l'erreur

#### **Ligne 43** : Initialisation du buffer
- **`myteams_buffer_init(&c->buf)`** : Initialise le buffer de communication
- **Pourquoi ?** : Prépare le buffer pour recevoir les données du serveur

#### **Ligne 44** : Succès
- **`return c`** : Retourne le client complètement initialisé

### Pourquoi cette implémentation ?
- **Sécurité** : Initialisation complète à zéro avec calloc
- **Propre** : Nettoyage des ressources en cas d'erreur
- **Complet** : Initialise tous les composants nécessaires
- **Cohérent** : Pattern d'erreur standard (NULL en cas d'échec)

## Fonction de gestion de l'entrée utilisateur (lignes 47-55)
```c
static void handle_stdin(client_t *c)
{
    char input[BUF_SIZE];

    if (!fgets(input, BUF_SIZE, stdin))
        return;
    input[strcspn(input, "\n")] = 0;
    myteams_client_handle_input(c, input);
}
```

### Analyse détaillée
- **Ligne 47** : `static` - fonction locale à ce fichier
- **Paramètre** : `c` - Structure client
- **Ligne 49** : Buffer pour l'entrée utilisateur

#### **Ligne 51** : Lecture de l'entrée
- **`fgets(input, BUF_SIZE, stdin)`** : Lit une ligne depuis stdin
- **Retour NULL** : Si EOF (Ctrl+D) ou erreur
- **`return`** : Sort silencieusement en cas d'erreur

#### **Ligne 53** : Suppression du newline
- **`strcspn(input, "\n")`** : Trouve la position du premier '\n'
- **`input[...] = 0`** : Remplace '\n' par '\0' (terminateur nul)
- **Pourquoi ?** : Nettoie la chaîne pour le traitement

#### **Ligne 54** : Traitement de la commande
- **`myteams_client_handle_input(c, input)`** : Traite la commande utilisateur
- **Délégation** : La logique de parsing est dans une autre fonction

### Pourquoi cette implémentation ?
- **Simplicité** : Lecture simple avec fgets
- **Robustesse** : Gère EOF et erreurs de lecture
- **Propre** : Supprime le caractère de fin de ligne
- **Modulaire** : Délègue le traitement à une fonction spécialisée

## Boucle principale du client (lignes 57-71)
```c
void myteams_client_run(client_t *c)
{
    struct pollfd fds[2];

    fds[0].fd = STDIN_FILENO;
    fds[0].events = POLLIN;
    fds[1].fd = c->fd;
    fds[1].events = POLLIN;
    while (poll(fds, 2, -1) > 0) {
        if (fds[0].revents & POLLIN)
            handle_stdin(c);
        if (fds[1].revents & POLLIN)
            myteams_client_handle_server(c);
    }
}
```

### Analyse détaillée
- **Ligne 57** : Boucle principale d'interaction client/serveur
- **Paramètre** : `c` - Structure client initialisée

#### **Ligne 59** : Tableau pour poll()
- **`struct pollfd fds[2]`** : 2 descripteurs à surveiller
  - **fds[0]** : Entrée utilisateur (stdin)
  - **fds[1]** : Socket serveur

#### **Lignes 61-64** : Configuration des descripteurs
- **`fds[0].fd = STDIN_FILENO`** : Entrée standard (clavier)
- **`fds[0].events = POLLIN`** : Intéressé par les données entrantes
- **`fds[1].fd = c->fd`** : Socket de connexion au serveur
- **`fds[1].events = POLLIN`** : Intéressé par les données du serveur

#### **Ligne 65** : Boucle d'attente d'événements
- **`poll(fds, 2, -1)`** : Attend les événements
  - **2** : Nombre de descripteurs
  - **-1** : Timeout infini (attente indéfinie)
- **`> 0`** : Continue si des événements sont disponibles
- **Sortie** : Si poll retourne ≤ 0 (erreur ou timeout)

#### **Lignes 66-67** : Événement utilisateur
- **`fds[0].revents & POLLIN`** : Si données disponibles sur stdin
- **`handle_stdin(c)`** : Traite l'entrée utilisateur

#### **Lignes 68-69** : Événement serveur
- **`fds[1].revents & POLLIN`** : Si données disponibles du serveur
- **`myteams_client_handle_server(c)`** : Traite les réponses du serveur

### Pourquoi cette implémentation ?
- **Efficacité** : Un seul thread gère les deux directions
- **Non-bloquant** : poll() permet l'attente passive
- **Simultanéité** : Gère utilisateur et serveur en même temps
- **Standard** : Utilise poll() POSIX standard

## Architecture réseau du client

### Cycle de vie
```
myteams_client_create() → myteams_client_run() → [boucle] → fin
         ↓                      ↓              ↓
    allocation           multiplexage      sortie
    connexion          entrée/sortie
    initialisation     interaction
```

### Flux de données
```
Utilisateur → handle_stdin() → myteams_client_handle_input() → socket → Serveur
Serveur → socket → myteams_client_handle_server() → affichage → Utilisateur
```

### Gestion des événements
```
poll() → vérification → dispatch → traitement
  ↓         ↓           ↓          ↓
attente   stdin/     handle_*   logique
infinie   serveur    spécifique  métier
```

## Sécurité et Robustesse

### Gestion d'erreurs
- **Socket** : Vérification fd == -1
- **Allocation** : Vérification c == NULL
- **Connexion** : Fermeture propre en cas d'échec
- **Entrée** : Gestion de EOF et erreurs fgets

### Validation
- **Port** : Conversion avec atoi() (pas de validation ici)
- **IP** : Conversion avec inet_addr() (validation partielle)
- **Entrée** : Limitée à BUF_SIZE caractères

### Nettoyage
- **Ressources** : Libération mémoire en cas d'erreur
- **Sockets** : Fermeture propre des descripteurs
- **Buffers** : Initialisation propre des structures

## Performance et Optimisations

### Multiplexage
- **poll()** : Efficace pour gérer multiples sources
- **Non-bloquant** : Pas de CPU gaspillé en attente active
- **Simultanéité** : Gère entrée utilisateur et serveur

### Allocation
- **calloc()** : Allocation unique pour tout le client
- **Buffer** : Taille fixe (BUF_SIZE) pour éviter les réallocations

### Communication
- **TCP** : Fiable et ordonné
- **Bufferisé** : Gère les fragments de messages

## Conception et Architecture

### Séparation des responsabilités
- **create_socket()** : Bas niveau - connexion réseau
- **myteams_client_create()** : Haut niveau - structure client
- **handle_stdin()** : Interface utilisateur
- **myteams_client_run()** : Orchestration globale

### Modularité
- **Fonctions statiques** : Cachent l'implémentation
- **Délégation** : Traitement délégué à d'autres fonctions
- **Interface claire** : Fonctions publiques bien définies

### Extensibilité
- **poll()** : Facile d'ajouter d'autres descripteurs
- **Pattern** : Code réutilisable pour d'autres clients
- **Structure** : Facile d'ajouter de nouvelles fonctionnalités

## Conclusion

Ce fichier implémente une couche réseau client robuste et efficace avec :
- **Connexion TCP/IP** sécurisée et bien gérée
- **Multiplexage E/S** avec poll() pour la simultanéité
- **Gestion d'erreurs** complète à tous les niveaux
- **Architecture modulaire** avec séparation claire des responsabilités
- **Performance** optimisée pour l'interaction utilisateur/serveur

L'utilisation de poll() permet une gestion élégante de la communication bidirectionnelle sans la complexité des threads, tout en offrant d'excellentes performances pour un client interactif.
