# Analyse détaillée de `include/server.h`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** server
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant le projet, l'année, le nom du projet et la description du fichier.

## Protection d'inclusion (lignes 8-9)
```c
#ifndef SERVER_H_
#define SERVER_H_
```
- **Ligne 8** : Protection contre les inclusions multiples. Si `SERVER_H_` n'est pas défini, le compilateur continue.
- **Ligne 9** : Définit `SERVER_H_` pour éviter les inclusions futures de ce header.

## Inclusions système (lignes 11-25)
```c
#include <stdio.h>      // Entrées/sorties standard (printf, fprintf, etc.)
#include <unistd.h>     // Appels système UNIX (read, write, close, etc.)
#include <stdlib.h>     // Fonctions standard C (malloc, free, atoi, etc.)
#include <string.h>     // Manipulation de chaînes (strcpy, strcmp, memset, etc.)
#include <stdbool.h>    // Type booléen (true/false)
#include <signal.h>     // Gestion des signaux (signal, SIGINT, etc.)
#include <sys/socket.h> // Programmation socket (socket, bind, listen, etc.)
#include <arpa/inet.h>  // Conversion d'adresses réseau (inet_addr, htons, etc.)
#include <netinet/in.h> // Structures d'adresses Internet (sockaddr_in)
#include <netinet/ip.h> // Protocole IP
#include <fcntl.h>      // Opérations sur fichiers (fcntl pour les flags)
#include <poll.h>        // Multiplexage E/S (poll, struct pollfd)
#include <ctype.h>       // Classification de caractères (isdigit, etc.)
#include <time.h>        // Fonctions temporelles (time, timestamp)
#include <uuid/uuid.h>   // Génération et manipulation d'UUIDs
```
Chaque inclusion fournit des fonctionnalités essentielles pour le serveur :
- **stdio.h** : Pour les affichages et messages d'erreur
- **unistd.h** : Pour les opérations système de base
- **stdlib.h** : Pour la gestion mémoire et conversions
- **string.h** : Pour la manipulation des chaînes de caractères
- **stdbool.h** : Pour utiliser des booléens explicites
- **signal.h** : Pour gérer l'arrêt propre du serveur
- **socket.h/inet.h** : Pour la programmation réseau TCP/IP
- **poll.h** : Pour gérer multiples clients simultanément
- **time.h** : Pour horodater les messages et threads
- **uuid.h** : Pour générer des identifiants uniques

## Inclusions locales (lignes 27-28)
```c
#include "../libs/myteams/logging_server.h"
#include "utils.h"
```
- **Ligne 27** : Inclusion du header de logging serveur pour les fonctions de journalisation
- **Ligne 28** : Inclusion des utilitaires communs (buffer, JSON, etc.)

## Constantes de configuration (lignes 30-41)
```c
#define MAX_CLIENTS 1000         // Nombre maximum de clients simultanés
#define BUFFER_SIZE 4096         // Taille des buffers de communication
#define MAX_NAME_LENGTH 32       // Longueur max des noms (teams, channels, etc.)
#define MAX_DESC_LENGTH 255      // Longueur max des descriptions
#define MAX_BODY_LENGTH 512      // Longueur max des corps de messages
#define MAX_USERS 100            // Nombre maximum d'utilisateurs enregistrés
#define MAX_TEAMS 100            // Nombre maximum d'équipes
#define MAX_CHANNELS 100         // Nombre maximum de canaux par équipe
#define MAX_THREADS 500          // Nombre maximum de discussions
#define MAX_COMMENTS 1000        // Nombre maximum de commentaires
#define MAX_MESSAGES 1000       // Nombre maximum de messages privés
#define MAX_SUBSCRIPTIONS 1000   // Nombre maximum d'abonnements
```
Ces constantes définissent les limites du système pour éviter les débordements mémoire et garantir la stabilité.

## Structures de données

### Structure utilisateur (lignes 43-47)
```c
typedef struct user_s {
    char uuid[UUID_LEN];           // Identifiant unique de l'utilisateur
    char name[MAX_NAME_LENGTH + 1]; // Nom de l'utilisateur (+1 pour le '\0')
    bool is_logged_in;             // État de connexion
} user_t;
```
- **uuid** : Identifiant unique généré automatiquement
- **name** : Nom d'utilisateur (max 32 caractères + null terminator)
- **is_logged_in** : Booléen indiquant si l'utilisateur est connecté

### Structure équipe (lignes 49-54)
```c
typedef struct team_s {
    char uuid[UUID_LEN];           // Identifiant unique de l'équipe
    char name[MAX_NAME_LENGTH + 1]; // Nom de l'équipe
    char description[MAX_DESC_LENGTH + 1]; // Description de l'équipe
    char creator_uuid[UUID_LEN];   // UUID du créateur
} team_t;
```
Représente une équipe/workspace dans laquelle les utilisateurs peuvent collaborer.

### Structure canal (lignes 56-61)
```c
typedef struct channel_s {
    char uuid[UUID_LEN];           // Identifiant unique du canal
    char team_uuid[UUID_LEN];      // UUID de l'équipe parente
    char name[MAX_NAME_LENGTH + 1]; // Nom du canal
    char description[MAX_DESC_LENGTH + 1]; // Description du canal
} channel_t;
```
Canal de discussion au sein d'une équipe.

### Structure discussion/thread (lignes 63-71)
```c
typedef struct thread_s {
    char uuid[UUID_LEN];           // Identifiant unique de la discussion
    char channel_uuid[UUID_LEN];   // UUID du canal parent
    char team_uuid[UUID_LEN];      // UUID de l'équipe
    char creator_uuid[UUID_LEN];   // UUID du créateur
    char title[MAX_NAME_LENGTH + 1]; // Titre de la discussion
    char body[MAX_BODY_LENGTH + 1]; // Corps du message initial
    time_t timestamp;              // Horodatage de création
} thread_t;
```
Discussion/thread contenant un message initial et des réponses.

### Structure commentaire (lignes 73-80)
```c
typedef struct comment_s {
    char thread_uuid[UUID_LEN];    // UUID de la discussion parente
    char channel_uuid[UUID_LEN];    // UUID du canal parent
    char team_uuid[UUID_LEN];       // UUID de l'équipe
    char creator_uuid[UUID_LEN];   // UUID de l'auteur
    char body[MAX_BODY_LENGTH + 1]; // Contenu du commentaire
    time_t timestamp;              // Horodatage
} comment_t;
```
Réponse à une discussion existante.

### Structure message privé (lignes 82-87)
```c
typedef struct message_s {
    char sender_uuid[UUID_LEN];    // UUID de l'expéditeur
    char receiver_uuid[UUID_LEN];   // UUID du destinataire
    char body[MAX_BODY_LENGTH + 1]; // Contenu du message
    time_t timestamp;              // Horodatage
} message_t;
```
Message privé entre deux utilisateurs.

### Structure abonnement (lignes 89-92)
```c
typedef struct subscription_s {
    char user_uuid[UUID_LEN];      // UUID de l'utilisateur
    char team_uuid[UUID_LEN];      // UUID de l'équipe
} subscription_t;
```
Lien entre un utilisateur et une équipe (abonnement).

### Structure configuration socket (lignes 94-96)
```c
typedef struct {
    struct sockaddr_in addr;       // Configuration d'adresse réseau
} socket_config_t;
```
Structure pour la configuration du socket serveur.

### Structure client (lignes 98-106)
```c
typedef struct client_s {
    int fd;                         // File descriptor du socket client
    char buffer[BUFFER_SIZE];       // Buffer de réception
    int buf_len;                    // Longueur actuelle du buffer
    user_t *user;                   // Pointeur vers l'utilisateur connecté
    char team_uuid[UUID_LEN];       // Contexte : équipe sélectionnée
    char channel_uuid[UUID_LEN];    // Contexte : canal sélectionné
    char thread_uuid[UUID_LEN];      // Contexte : discussion sélectionnée
} client_t;
```
Représente un client connecté avec son état et son contexte de navigation.

### Structure serveur (lignes 108-126)
```c
typedef struct server_s {
    int fd;                         // File descriptor du socket serveur
    int port;                       // Port d'écoute
    client_t clients[MAX_CLIENTS];  // Tableau des clients connectés
    user_t users[MAX_USERS];        // Base de données utilisateurs
    int user_count;                 // Nombre d'utilisateurs enregistrés
    team_t teams[MAX_TEAMS];        // Base de données équipes
    int team_count;                 // Nombre d'équipes créées
    channel_t channels[MAX_CHANNELS]; // Base de données canaux
    int channel_count;              // Nombre de canaux créés
    thread_t threads[MAX_THREADS];  // Base de données discussions
    int thread_count;               // Nombre de discussions créées
    comment_t comments[MAX_COMMENTS]; // Base de données commentaires
    int comment_count;              // Nombre de commentaires
    message_t messages[MAX_MESSAGES]; // Base de données messages privés
    int message_count;              // Nombre de messages privés
    subscription_t subscriptions[MAX_SUBSCRIPTIONS]; // Base abonnements
    int subscription_count;         // Nombre d'abonnements
} server_t;
```
Structure principale contenant tout l'état du serveur.

### Structure commande (lignes 128-131)
```c
typedef struct {
    char *name;                     // Nom de la commande
    void (*func)(client_t *client, char **args, int arg_count, server_t *server);
} command_t;
```
Structure pour mapper les noms de commandes aux fonctions handlers.

## Déclarations de fonctions

### Fonctions principales (lignes 133-134)
```c
void myteams_server_usage(void);
void myteams_server_signal_handler(int signum);
```
- **usage** : Affiche l'aide d'utilisation du serveur
- **signal_handler** : Gestionnaire de signal pour l'arrêt propre du serveur

### Fonctions réseau (lignes 136-142)
```c
void myteams_server_configure(server_t *server, socket_config_t *sock);
int myteams_server_init(server_t *server, socket_config_t *sock);
void myteams_server_init_client(client_t *c);
int myteams_server_run(server_t *server);
void myteams_server_handle_disconnection(struct pollfd *fds, client_t *clients, server_t *server);
void myteams_server_execute_command(client_t *client, char *buffer, server_t *server);
```
Fonctions pour la gestion réseau et le cycle de vie du serveur.

### Fonctions utilitaires (lignes 146-157)
```c
void generate_uuid(char *dest);
user_t *find_user_by_uuid(server_t *server, const char *uuid);
user_t *find_user_by_name(server_t *server, const char *name);
team_t *find_team_by_uuid(server_t *server, const char *uuid);
channel_t *find_channel_by_uuid(server_t *server, const char *uuid);
thread_t *find_thread_by_uuid(server_t *server, const char *uuid);
client_t *find_client_by_uuid(server_t *server, const char *uuid);
int is_subscribed(server_t *server, const char *user_uuid, const char *team_uuid);
void broadcast_all(server_t *server, const char *msg, int exclude_fd);
void broadcast_team(server_t *server, const char *team_uuid, const char *msg, int exclude_fd);
```
Fonctions de recherche et communication.

### Fonctions de persistance (lignes 159-160)
```c
int save_server(server_t *server);
int load_server(server_t *server);
```
Sauvegarde et chargement de l'état du serveur.

### Fonctions de commandes (lignes 162-193)
Toutes les commandes du protocole MyTeams avec leur signature standardisée.

## Fin du header (lignes 195)
```c
#endif
```
Fermeture de la protection d'inclusion.

## Conclusion

Ce header définit toute l'architecture du serveur MyTeams :
- **Structures de données** hiérarchiques (user → team → channel → thread → comment)
- **Système de commandes** extensible via la structure `command_t`
- **Gestion réseau** avec multiplexage (poll)
- **Persistance** des données
- **Logging** intégré

Chaque structure est optimisée pour les performances avec des tailles fixes et des UUIDs pour l'identification unique.
