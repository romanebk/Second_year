# Analyse détaillée de `include/client.h`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams-21
** File description:
** client
*/
```
- **Lignes 1-6** : Header standard EPITECH. Note : le nom du projet contient "myteams-21" suggérant une variation ou une version spécifique.

## Protection d'inclusion (lignes 8-9)
```c
#ifndef CLIENT_H_
#define CLIENT_H_
```
- **Ligne 8** : Protection contre les inclusions multiples
- **Ligne 9** : Définition du guard pour éviter les inclusions futures

## Inclusions système (lignes 11-21)
```c
#include <stdio.h>      // Entrées/sorties standard
#include <unistd.h>     // Appels système UNIX
#include <stdlib.h>     // Fonctions standard C
#include <string.h>     // Manipulation de chaînes
#include <stdbool.h>    // Types booléens
#include <signal.h>     // Gestion des signaux
#include <sys/socket.h> // Programmation socket
#include <arpa/inet.h>  // Conversions réseau
#include <netinet/in.h> // Structures Internet
#include <fcntl.h>      // Opérations fichiers
#include <poll.h>       // Multiplexage E/S
```
Similaires au serveur mais avec moins d'inclusions (pas de time.h, uuid.h directement car utilisés via d'autres headers).

## Inclusions locales (lignes 22-23)
```c
#include "../libs/myteams/logging_client.h"
#include "utils.h"
```
- **Ligne 22** : Logging spécifique au client
- **Ligne 23** : Utilitaires communs (buffer, JSON)

## Structure client (lignes 25-35)
```c
typedef struct client_s {
    int fd;                     // File descriptor du socket serveur
    bool logged;                // État d'authentification
    char uuid[UUID_LEN];        // UUID de l'utilisateur connecté
    char username[33];          // Nom d'utilisateur (32 + '\0')
    char team_uuid[UUID_LEN];   // Contexte : équipe sélectionnée
    char channel_uuid[UUID_LEN]; // Contexte : canal sélectionné
    char thread_uuid[UUID_LEN];  // Contexte : discussion sélectionnée
    buffer_t buf;               // Buffer de communication avec serveur
    int pending_list_type;      // Type de liste en attente (pour parsing)
} client_t;
```

### Analyse détaillée des champs

#### `int fd`
- **Purpose** : File descriptor du socket de connexion au serveur
- **Valeurs** : -1 si non connecté, sinon un fd valide (>0)
- **Utilisation** : Pour toutes les communications réseau (read/write)

#### `bool logged`
- **Purpose** : Indique si l'utilisateur est authentifié
- **Valeurs** : `false` initialement, `true` après LOGIN réussi
- **Utilisation** : Contrôle d'accès aux commandes nécessitant une authentification

#### `char uuid[UUID_LEN]`
- **Purpose** : UUID de l'utilisateur connecté
- **Rempli** : Après une commande LOGIN réussie
- **Format** : UUID standard de 36 caractères + '\0'

#### `char username[33]`
- **Purpose** : Nom d'affichage de l'utilisateur
- **Taille** : 32 caractères + terminateur nul
- **Utilisation** : Pour les affichages et certains messages

#### Champs de contexte (team_uuid, channel_uuid, thread_uuid)
- **Purpose** : Maintenir le contexte de navigation de l'utilisateur
- **Utilisation** : Pour les commandes contextuelles (CREATE, LIST, INFO)
- **Initialisation** : Vidés (''0') à la déconnexion, modifiés par USE

#### `buffer_t buf`
- **Purpose** : Buffer pour les communications avec le serveur
- **Utilisation** : Stockage temporaire des données reçues du serveur
- **Gestion** : Utilise les fonctions de utils.h (append, get_line)

#### `int pending_list_type`
- **Purpose** : Type de liste en cours de réception du serveur
- **Valeurs** : Définies dans le code client (probablement des constantes)
- **Utilisation** : Pour savoir comment parser les réponses LIST multiples

## Déclarations de fonctions principales (lignes 37-38)
```c
client_t *myteams_client_create(const char *ip, int port);
void myteams_client_run(client_t *client);
```

### `myteams_client_create`
- **Purpose** : Crée et initialise une structure client
- **Paramètres** :
  - `ip` : Adresse IP du serveur (ex: "127.0.0.1")
  - `port` : Port du serveur (ex: 4242)
- **Retour** : Pointeur vers client_t ou NULL en cas d'erreur
- **Actions** :
  - Allocation mémoire
  - Connexion socket au serveur
  - Initialisation des champs à zéro

### `myteams_client_run`
- **Purpose** : Boucle principale du client
- **Paramètre** : `client` - Structure client initialisée
- **Actions** :
  - Gestion des entrées utilisateur (stdin)
  - Gestion des réponses serveur
  - Boucle poll() pour multiplexage

## Déclarations de fonctions de gestion E/S (lignes 40-42)
```c
void myteams_client_handle_input(client_t *client, char *input);
void myteams_client_handle_server(client_t *client);
void myteams_client_send_cmd(client_t *client, const char *fmt, ...);
```

### `myteams_client_handle_input`
- **Purpose** : Traite une entrée utilisateur
- **Paramètres** :
  - `client` : Structure client
  - `input` : Ligne entrée par l'utilisateur
- **Actions** : Parse et dispatch vers les commandes appropriées

### `myteams_client_handle_server`
- **Purpose** : Traite les données reçues du serveur
- **Paramètre** : `client` - Structure client
- **Actions** : Lit du socket, parse les réponses, met à jour l'état

### `myteams_client_send_cmd`
- **Purpose** : Envoie une commande au serveur
- **Paramètres** :
  - `client` : Structure client
  - `fmt` : Format de la commande (printf-style)
  - `...` : Arguments variables
- **Actions** : Formate et envoie la commande via le socket

## Déclarations de fonctions de parsing (lignes 44-45)
```c
int myteams_client_parse_args(const char *input, char *arg1, char *arg2, char *arg3);
int myteams_client_validate_format(const char *input);
```

### `myteams_client_parse_args`
- **Purpose** : Extrait les arguments d'une commande utilisateur
- **Paramètres** :
  - `input` : Ligne de commande complète
  - `arg1/arg2/arg3` : Buffers pour stocker les arguments extraits
- **Retour** : Nombre d'arguments trouvés
- **Actions** : Parse les arguments entre guillemets

### `myteams_client_validate_format`
- **Purpose** : Valide le format d'une commande
- **Paramètre** : `input` - Ligne de commande à valider
- **Retour** : 1 si valide, 0 sinon
- **Actions** : Vérifie la syntaxe (guillemets, etc.)

## Déclarations de fonctions de traitement (lignes 47-48)
```c
void myteams_client_process_input_subs(client_t *client, char *input, int n, char *arg1);
void myteams_client_process_input_context(client_t *client, char *input, int n, char *arg1, char *arg2, char *arg3);
```

### `myteams_client_process_input_subs`
- **Purpose** : Traite les commandes d'abonnement
- **Paramètres** :
  - `client` : Structure client
  - `input` : Commande complète
  - `n` : Nombre d'arguments
  - `arg1` : Premier argument
- **Actions** : Gère SUBSCRIBE/UNSUBSCRIBE/SUBSCRIBED

### `myteams_client_process_input_context`
- **Purpose** : Traite les commandes contextuelles
- **Paramètres** :
  - `client` : Structure client
  - `input` : Commande complète
  - `n` : Nombre d'arguments
  - `arg1/arg2/arg3` : Arguments
- **Actions** : Gère USE/CREATE/LIST/INFO selon le contexte

## Déclarations de fonctions utilitaires (lignes 50-50)
```c
void myteams_client_usage(void);
```

### `myteams_client_usage`
- **Purpose** : Affiche l'aide d'utilisation du client
- **Paramètre** : Aucun
- **Retour** : void
- **Actions** : Affiche la syntaxe d'appel et les paramètres

## Fin du header (lignes 53-54)
```c
#endif
```
Fermeture de la protection d'inclusion.

## Architecture et Design

### Séparation des responsabilités
1. **Connexion** : `create`, `run`
2. **Communication** : `handle_input`, `handle_server`, `send_cmd`
3. **Parsing** : `parse_args`, `validate_format`
4. **Traitement** : `process_input_subs`, `process_input_context`
5. **Utilitaires** : `usage`, `validate_flag`

### État client
La structure maintient :
- **État réseau** : `fd`, `buf`
- **État authentification** : `logged`, `uuid`, `username`
- **État navigation** : `team_uuid`, `channel_uuid`, `thread_uuid`
- **État parsing** : `pending_list_type`

### Flux de données typique
```
User Input → handle_input → parse_args → process_input_* → send_cmd → Server
Server Response → handle_server → buf → parse JSON → Update state
```

## Conclusion

Ce header définit une architecture client complète avec :
- **Gestion réseau robuste** avec buffering
- **Parsing intelligent** des commandes utilisateur
- **Maintien d'état** pour les commandes contextuelles
- **Interface propre** entre les différentes couches

La structure est conçue pour être :
- **Modulaire** : Chaque fonction a une responsabilité claire
- **Extensible** : Facile d'ajouter de nouvelles commandes
- **Robuste** : Gestion des erreurs et validation des entrées
