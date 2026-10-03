# Analyse détaillée de `src/server/data.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** data
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les fonctions de gestion des données.

## Inclusion (ligne 8)
```c
#include "../../include/server.h"
```
- **Ligne 8** : Inclusion du header principal du serveur.

## Génération d'UUID (lignes 10-16)
```c
void generate_uuid(char *dest)
{
    uuid_t raw;

    uuid_generate_random(raw);
    uuid_unparse_lower(raw, dest);
}
```

### Analyse détaillée
- **Ligne 10** : Fonction pour générer un UUID unique
- **Paramètre** : `dest` - Buffer de destination (doit faire UUID_LEN = 37)
- **Ligne 12** : Déclaration d'un UUID brut (binaire)
- **Ligne 14** : `uuid_generate_random()` - Génère un UUID aléatoire
- **Ligne 15** : `uuid_unparse_lower()` - Convertit l'UUID en chaîne minuscule

### Pourquoi cette implémentation ?
- **Unicité** : UUID aléatoires garantissent l'unicité
- **Standard** : Format UUID standard (8-4-4-4-12)
- **Minuscules** : Cohérence dans tout le système
- **Performance** : Utilisation de la bibliothèque uuid standard

### Bibliothèque UUID
- **uuid_t** : Type opaque pour l'UUID binaire
- **uuid_generate_random()** : Génération cryptographiquement sécurisée
- **uuid_unparse_lower()** : Conversion en chaîne lisible

## Recherche d'utilisateur par UUID (lignes 18-27)
```c
user_t *find_user_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < server->user_count; i++) {
        if (strcmp(server->users[i].uuid, uuid) == 0)
            return &server->users[i];
    }
    return NULL;
}
```

### Analyse détaillée
- **Ligne 18** : Recherche un utilisateur par son UUID
- **Paramètres** :
  - `server` : Structure serveur contenant les utilisateurs
  - `uuid` : UUID à rechercher
- **Lignes 22-25** : Boucle sur tous les utilisateurs
  - **`strcmp()`** : Comparaison exacte des UUIDs
  - **Retour** : Pointeur vers l'utilisateur trouvé
- **Ligne 26** : Retour NULL si non trouvé

### Pourquoi cette implémentation ?
- **Performance** : Recherche linéaire suffisante pour MAX_USERS = 100
- **Simplicité** : Pas de structures complexes (hachage, arbre)
- **Fiabilité** : Recherche exhaustive garantissant la justesse

## Recherche d'utilisateur par nom (lignes 29-38)
```c
user_t *find_user_by_name(server_t *server, const char *name)
{
    int i = 0;

    for (i = 0; i < server->user_count; i++) {
        if (strcmp(server->users[i].name, name) == 0)
            return &server->users[i];
    }
    return NULL;
}
```

### Analyse détaillée
- **Ligne 29** : Recherche un utilisateur par son nom
- **Paramètres** :
  - `server` : Structure serveur
  - `name` : Nom d'utilisateur à rechercher
- **Lignes 33-36** : Boucle sur tous les utilisateurs
  - **`strcmp()`** : Comparaison exacte des noms
  - **Retour** : Pointeur vers l'utilisateur trouvé
- **Ligne 37** : Retour NULL si non trouvé

### Pourquoi cette implémentation ?
- **Login** : Utilisé pour la commande LOGIN (auto-création)
- **Unicité** : Les noms doivent être uniques dans le système
- **Performance** : Recherche linéaire acceptable pour petit nombre d'utilisateurs

## Recherche d'équipe par UUID (lignes 40-49)
```c
team_t *find_team_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < server->team_count; i++) {
        if (strcmp(server->teams[i].uuid, uuid) == 0)
            return &server->teams[i];
    }
    return NULL;
}
```

### Analyse détaillée
- **Ligne 40** : Recherche une équipe par son UUID
- **Paramètres** : `server`, `uuid`
- **Lignes 44-47** : Boucle sur toutes les équipes
- **Ligne 48** : Retour NULL si non trouvé

### Pourquoi cette implémentation ?
- **Accès direct** : UUID permet un accès fiable aux équipes
- **Validation** : Utilisé pour vérifier l'existence des équipes
- **Cohérence** : Même pattern que les autres fonctions de recherche

## Recherche de canal par UUID (lignes 51-60)
```c
channel_t *find_channel_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < server->channel_count; i++) {
        if (strcmp(server->channels[i].uuid, uuid) == 0)
            return &server->channels[i];
    }
    return NULL;
}
```

### Analyse détaillée
- **Ligne 51** : Recherche un canal par son UUID
- **Lignes 55-58** : Boucle sur tous les canaux
- **Ligne 59** : Retour NULL si non trouvé

### Pourquoi cette implémentation ?
- **Hiérarchie** : Accès aux canaux pour validation et listage
- **Navigation** : Utilisé dans les commandes contextuelles
- **Standard** : Pattern cohérent avec les autres recherches

## Recherche de discussion par UUID (lignes 62-71)
```c
thread_t *find_thread_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < server->thread_count; i++) {
        if (strcmp(server->threads[i].uuid, uuid) == 0)
            return &server->threads[i];
    }
    return NULL;
}
```

### Analyse détaillée
- **Ligne 62** : Recherche une discussion par son UUID
- **Lignes 66-69** : Boucle sur toutes les discussions
- **Ligne 70** : Retour NULL si non trouvé

### Pourquoi cette implémentation ?
- **Accès direct** : UUID permet l'accès aux discussions
- **Validation** : Vérification de l'existence des discussions
- **Cohérence** : Pattern uniforme dans tout le système

## Vérification d'abonnement (lignes 73-84)
```c
int is_subscribed(server_t *server, const char *user_uuid,
    const char *team_uuid)
{
    int i = 0;

    for (i = 0; i < server->subscription_count; i++) {
        if (strcmp(server->subscriptions[i].user_uuid, user_uuid) == 0 &&
            strcmp(server->subscriptions[i].team_uuid, team_uuid) == 0)
            return 1;
    }
    return 0;
}
```

### Analyse détaillée
- **Ligne 73** : Vérifie si un utilisateur est abonné à une équipe
- **Paramètres** :
  - `server` : Structure serveur
  - `user_uuid` : UUID de l'utilisateur
  - `team_uuid` : UUID de l'équipe
- **Lignes 78-81** : Boucle sur tous les abonnements
  - **Double condition** : Vérifie utilisateur ET équipe
  - **Retour 1** : Si abonnement trouvé
- **Ligne 83** : Retour 0 si non trouvé

### Pourquoi cette implémentation ?
- **Contrôle d'accès** : Essentiel pour la sécurité du système
- **Permissions** : Détermine qui peut opérer sur les équipes
- **Simplicité** : Recherche linéaire suffisante pour MAX_SUBSCRIPTIONS = 1000

## Recherche de client par UUID (lignes 86-97)
```c
client_t *find_client_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        if (server->clients[i].fd != -1 &&
            server->clients[i].user != NULL &&
            strcmp(server->clients[i].user->uuid, uuid) == 0)
            return &server->clients[i];
    }
    return NULL;
}
```

### Analyse détaillée
- **Ligne 86** : Recherche un client connecté par UUID d'utilisateur
- **Paramètres** : `server`, `uuid`
- **Lignes 90-94** : Boucle sur tous les clients possibles
  - **`fd != -1`** : Client connecté
  - **`user != NULL`** : Client authentifié
  - **`strcmp()`** : Comparaison de l'UUID utilisateur
- **Ligne 95** : Retour NULL si non trouvé

### Pourquoi cette implémentation ?
- **Notification** : Utilisé pour les messages privés temps réel
- **Validation** : Vérifie si un utilisateur est actuellement connecté
- **Performance** : Recherche sur MAX_CLIENTS = 1000 (acceptable)

## Broadcast à tous les clients (lignes 99-109)
```c
void broadcast_all(server_t *server, const char *msg, int exclude_fd)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        if (server->clients[i].fd != -1 &&
            server->clients[i].user != NULL &&
            server->clients[i].fd != exclude_fd)
            write(server->clients[i].fd, msg, strlen(msg));
    }
}
```

### Analyse détaillée
- **Ligne 99** : Envoie un message à tous les clients connectés
- **Paramètres** :
  - `server` : Structure serveur
  - `msg` : Message à diffuser
  - `exclude_fd` : File descriptor à exclure (expéditeur)
- **Lignes 103-108** : Boucle sur tous les clients
  - **`fd != -1`** : Client connecté
  - **`user != NULL`** : Client authentifié
  - **`fd != exclude_fd`** : N'envoie pas à l'expéditeur
- **Ligne 107** : Envoie le message au client

### Pourquoi cette implémentation ?
- **Notifications globales** : Événements serveur (login/logout)
- **Exclusion** : L'expéditeur ne reçoit pas sa propre notification
- **Efficacité** : Un seul appel pour tous les clients

## Broadcast aux membres d'équipe (lignes 111-125)
```c
void broadcast_team(server_t *server, const char *team_uuid,
    const char *msg, int exclude_fd)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        if (server->clients[i].fd == -1 ||
            server->clients[i].user == NULL ||
            server->clients[i].fd == exclude_fd)
            continue;
        if (is_subscribed(server,
            server->clients[i].user->uuid, team_uuid))
            write(server->clients[i].fd, msg, strlen(msg));
    }
}
```

### Analyse détaillée
- **Ligne 111** : Envoie un message aux membres d'une équipe
- **Paramètres** :
  - `server` : Structure serveur
  - `team_uuid` : UUID de l'équipe cible
  - `msg` : Message à diffuser
  - `exclude_fd` : File descriptor à exclure
- **Lignes 116-120** : Filtrage rapide des clients invalides
  - **`fd == -1`** : Client déconnecté
  - **`user == NULL`** : Client non authentifié
  - **`fd == exclude_fd`** : Exclusion de l'expéditeur
- **Lignes 121-123** : Vérification d'abonnement et envoi
  - **`is_subscribed()`** : Vérifie si le client est membre de l'équipe
  - **`write()`** : Envoie le message

### Pourquoi cette implémentation ?
- **Notifications ciblées** : Événements d'équipe uniquement aux membres
- **Contrôle d'accès** : Seuls les abonnés reçoivent les notifications
- **Efficacité** : Filtrage rapide avant vérification d'abonnement

## Architecture des fonctions de données

### Catégories de fonctions

#### **1. Génération d'identifiants**
- `generate_uuid()` : Création d'UUID uniques

#### **2. Recherche par UUID**
- `find_user_by_uuid()`
- `find_team_by_uuid()`
- `find_channel_by_uuid()`
- `find_thread_by_uuid()`

#### **3. Recherche par nom**
- `find_user_by_name()` : Pour le login

#### **4. Vérification d'état**
- `is_subscribed()` : Permissions d'équipe
- `find_client_by_uuid()` : État de connexion

#### **5. Communication**
- `broadcast_all()` : Diffusion globale
- `broadcast_team()` : Diffusion ciblée

### Patterns de conception

#### **Recherche linéaire**
Toutes les fonctions de recherche utilisent une recherche linéaire :
```c
for (i = 0; i < count; i++) {
    if (strcmp(array[i].uuid, target_uuid) == 0)
        return &array[i];
}
return NULL;
```

#### **Validation multiple**
Les fonctions de broadcast vérifient toujours :
1. **Connexion** : `fd != -1`
2. **Authentification** : `user != NULL`
3. **Exclusion** : `fd != exclude_fd`

#### **Retour cohérent**
- **Succès** : Pointeur vers la structure trouvée
- **Échec** : NULL (permet des tests simples)

### Performance et Optimisations

#### **Complexité algorithmique**
- **Recherche** : O(n) avec n = MAX_* (100-1000)
- **Broadcast** : O(m) avec m = MAX_CLIENTS (1000)
- **Abonnement** : O(k) avec k = MAX_SUBSCRIPTIONS (1000)

#### **Pourquoi acceptable ?**
- **Petites tailles** : 100-1000 éléments maximum
- **Opérations peu fréquentes** : Recherche uniquement sur commandes
- **Simplicité** : Code simple et maintenable
- **Mémoire** : Pas d'allocation dynamique

#### **Optimisations possibles**
- **Tables de hachage** : Pour plus de 10000 éléments
- **Indexation** : Pour recherches fréquentes
- **Cache** : Pour les recherches répétées

### Sécurité et Validation

#### **Contrôle d'accès**
- **`is_subscribed()`** : Vérification des permissions
- **Validation d'existence** : Toutes les recherches retournent NULL si non trouvé

#### **Isolation**
- **Broadcast ciblé** : Seuls les membres concernés reçoivent
- **Exclusion d'expéditeur** : Évite les boucles de notification

#### **Robustesse**
- **Vérification d'état** : Connexion et authentification
- **Gestion d'erreurs** : Retours NULL pour les cas invalides

### Cohérence du système

#### **UUID comme clé primaire**
- **Unicité garantie** : UUID aléatoires
- **Accès direct** : Recherche par UUID partout
- **Standard** : Format universel

#### **Modèle de permissions**
- **Abonnement** : Base du contrôle d'accès
- **Équipe** : Unité de permission
- **Hiérarchie** : Team → Channel → Thread

#### **Communication**
- **Broadcast global** : Événements système
- **Broadcast ciblé** : Événements d'équipe
- **Exclusion** : Évite les auto-notifications

## Conclusion

Ce fichier implémente la couche d'accès aux données du serveur avec :
- **Génération fiable** d'identifiants uniques
- **Recherche efficace** pour tous les types d'entités
- **Contrôle d'accès** basé sur les abonnements
- **Communication ciblée** pour les notifications
- **Architecture cohérente** avec des patterns réutilisables
- **Performance acceptable** pour les tailles prévues

La simplicité de l'implémentation (recherche linéaire, tableaux statiques) est appropriée pour les besoins du système tout en restant facile à maintenir et à déboguer.
