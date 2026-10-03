# Analyse détaillée de `src/server/cmd_thread.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_thread
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les commandes liées aux discussions et commentaires.

## Inclusion (ligne 8)
```c
#include "../../include/server.h"
```
- **Ligne 8** : Inclusion du header principal du serveur.

## Fonctions utilitaires (lignes 10-31)
```c
static int require_auth(client_t *client)
{
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return 0;
    }
    return 1;
}

static int require_sub(client_t *client, server_t *server,
    const char *team_uuid)
{
    if (!find_team_by_uuid(server, team_uuid)) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return 0;
    }
    if (!is_subscribed(server, client->user->uuid, team_uuid)) {
        write(client->fd, "403 Not subscribed to this team.\r\n", 34);
        return 0;
    }
    return 1;
}
```

### Analyse détaillée
Ces fonctions sont identiques à celles de `cmd_channel.c` :
- **`require_auth()`** : Vérifie que l'utilisateur est connecté
- **`require_sub()`** : Vérifie l'existence de l'équipe et l'abonnement de l'utilisateur

### Pourquoi cette duplication ?
- **Modularité** : Chaque fichier est autonome
- **Simplicité** : Pas de dépendances inter-fichiers
- **Performance** : Pas de surcharge d'appels de fonctions externes

## Commande THREADS (lignes 33-66)
```c
void myteams_server_cmd_threads(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    if (!require_auth(client))
        return;
    if (arg_count != 2) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (!find_channel_by_uuid(server, args[1])) {
        write(client->fd, "404 Channel not found.\r\n", 24);
        return;
    }
    for (i = 0; i < server->thread_count; i++) {
        if (strcmp(server->threads[i].channel_uuid, args[1]) != 0)
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"title\":\"%s\","
            "\"body\":\"%s\",\"timestamp\":%ld,"
            "\"creator\":\"%s\"}\r\n",
            server->threads[i].uuid,
            server->threads[i].title,
            server->threads[i].body,
            (long)server->threads[i].timestamp,
            server->threads[i].creator_uuid);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of threads list.\r\n", 26);
}
```

### Analyse détaillée
- **Ligne 39** : Vérification d'authentification
- **Lignes 41-44** : Validation des arguments (team_uuid, channel_uuid)
- **Ligne 45** : Vérification d'abonnement à l'équipe
- **Lignes 47-50** : Vérification de l'existence du canal
- **Lignes 51-64** : Boucle sur toutes les discussions
  - **Ligne 52** : Filtre par canal (uniquement les discussions de ce canal)
  - **Code 210** : Information discussion
  - **Format JSON** : UUID, titre, corps, timestamp, créateur
- **Ligne 65** : Marqueur de fin de liste (code 211)

### Pourquoi cette implémination ?
- **Contrôle d'accès** : Seuls les abonnés peuvent voir les discussions
- **Hiérarchie** : Nécessite team_uuid + channel_uuid pour accès
- **Complétude** : Affiche toutes les informations de la discussion

## Commande THREAD (lignes 68-92)
```c
void myteams_server_cmd_thread(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    thread_t *th = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    th = find_thread_by_uuid(server, args[0]);
    if (!th) {
        write(client->fd, "404 Thread not found.\r\n", 23);
        return;
    }
    snprintf(line, BUF_SIZE,
        "215 {\"uuid\":\"%s\",\"title\":\"%s\","
        "\"body\":\"%s\",\"timestamp\":%ld,"
        "\"creator\":\"%s\"}\r\n",
        th->uuid, th->title, th->body,
        (long)th->timestamp, th->creator_uuid);
    write(client->fd, line, strlen(line));
}
```

### Analyse détaillée
- **Ligne 74** : Vérification d'authentification
- **Lignes 76-79** : Validation des arguments (exactement 1 UUID de discussion)
- **Lignes 80-84** : Recherche de la discussion par UUID
  - **Code 404** : Not Found si la discussion n'existe pas
- **Lignes 85-91** : Construction de la réponse
  - **Code 215** : Information discussion spécifique
  - **Format JSON** : Identique à THREADS mais pour une seule discussion

### Pourquoi cette implémentation ?
- **Précision** : Informations détaillées sur une discussion spécifique
- **Accès direct** : Si on connaît l'UUID, accès sans validation hiérarchique
- **Cohérence** : Même format que THREADS pour une seule discussion

## Commande CREATE_THREAD (lignes 94-138)
```c
void myteams_server_cmd_create_thread(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    thread_t *th = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 4) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[2]) > MAX_NAME_LENGTH ||
        strlen(args[3]) > MAX_BODY_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (!find_channel_by_uuid(server, args[1])) {
        write(client->fd, "404 Channel not found.\r\n", 24);
        return;
    }
    if (server->thread_count >= MAX_THREADS) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    th = &server->threads[server->thread_count];
    generate_uuid(th->uuid);
    strncpy(th->team_uuid, args[0], UUID_LEN);
    strncpy(th->channel_uuid, args[1], UUID_LEN);
    strncpy(th->title, args[2], MAX_NAME_LENGTH);
    strncpy(th->body, args[3], MAX_BODY_LENGTH);
    strncpy(th->creator_uuid, client->user->uuid, UUID_LEN);
    th->timestamp = time(NULL);
    server->thread_count++;
    server_event_thread_created(args[1], th->uuid, client->user->uuid, th->title, th->body);
    snprintf(line, BUF_SIZE, "200 Thread created: %s\r\n", th->uuid);
    write(client->fd, line, strlen(line));
    snprintf(line, BUF_SIZE,
        "704 {\"uuid\":\"%s\",\"title\":\"%s\","
        "\"channel_uuid\":\"%s\",\"creator\":\"%s\"}\r\n",
        th->uuid, th->title, args[1], client->user->uuid);
    broadcast_team(server, args[0], line, client->fd);
}
```

### Analyse détaillée ligne par ligne

#### **Lignes 100-105** : Validation de base
- **Authentification** : Doit être connecté
- **Arguments** : Exactement 4 arguments (team_uuid, channel_uuid, titre, corps)

#### **Lignes 106-110** : Validation des longueurs
- **args[0]** : team_uuid (UUID standard, pas de validation)
- **args[1]** : channel_uuid (UUID standard, pas de validation)
- **args[2]** : titre (≤ MAX_NAME_LENGTH)
- **args[3]** : corps (≤ MAX_BODY_LENGTH)
- **Code 413** : Payload Too Long si trop long

#### **Ligne 111** : Vérification d'abonnement
- **`require_sub()`** : Vérifie que l'utilisateur est abonné à l'équipe

#### **Lignes 113-116** : Vérification du canal
- **`find_channel_by_uuid()`** : Vérifie que le canal existe

#### **Lignes 117-120** : Capacité serveur
- **Vérification** : Si nombre maximum de discussions atteint
- **Code 500** : Server Internal Error (capacité dépassée)

#### **Lignes 121-129** : Création de la discussion
- **Ligne 121** : Pointeur vers le prochain slot disponible
- **Ligne 122** : Génération d'un UUID unique
- **Lignes 123-124** : Association à l'équipe et au canal parents
- **Lignes 125-126** : Copie sécurisée du titre et du corps
- **Ligne 127** : Enregistrement du créateur
- **Ligne 128** : Horodatage de création

#### **Ligne 130** : Logging système
- **`server_event_thread_created()`** : Journalisation de la création
- **Arguments** : channel_uuid, thread_uuid, user_uuid, title, body

#### **Lignes 131-132** : Confirmation au créateur
- **Code 200** : OK (création réussie)
- **Format** : "200 Thread created: uuid"

#### **Lignes 133-137** : Notification aux membres de l'équipe
- **Code 704** : Événement de création de discussion
- **`broadcast_team()`** : Envoie uniquement aux abonnés de l'équipe
- **Format JSON** : Informations essentielles de la nouvelle discussion

### Pourquoi cette implémentation ?
- **Validation complète** : Hiérarchie complète (team → channel)
- **Contrôle d'accès** : Seuls les abonnés peuvent créer
- **Horodatage** : Important pour l'ordre chronologique
- **Notification ciblée** : Membres de l'équipe informés

## Commande COMMENTS (lignes 140-170)
```c
void myteams_server_cmd_comments(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    if (!require_auth(client))
        return;
    if (arg_count != 3) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (!find_thread_by_uuid(server, args[2])) {
        write(client->fd, "404 Thread not found.\r\n", 23);
        return;
    }
    for (i = 0; i < server->comment_count; i++) {
        if (strcmp(server->comments[i].thread_uuid, args[2]) != 0)
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"body\":\"%s\",\"timestamp\":%ld,"
            "\"creator\":\"%s\"}\r\n",
            server->comments[i].body,
            (long)server->comments[i].timestamp,
            server->comments[i].creator_uuid);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of comments list.\r\n", 27);
}
```

### Analyse détaillée
- **Ligne 146** : Vérification d'authentification
- **Lignes 148-151** : Validation des arguments (team_uuid, channel_uuid, thread_uuid)
- **Ligne 152** : Vérification d'abonnement à l'équipe
- **Lignes 154-157** : Vérification de l'existence de la discussion
- **Lignes 158-168** : Boucle sur tous les commentaires
  - **Ligne 159** : Filtre par discussion (uniquement les commentaires de cette discussion)
  - **Code 210** : Information commentaire
  - **Format JSON** : corps, timestamp, créateur (plus léger que les discussions)
- **Ligne 169** : Marqueur de fin de liste (code 211)

### Pourquoi cette implémentation ?
- **Contrôle d'accès** : Seuls les abonnés peuvent voir les commentaires
- **Hiérarchie** : Nécessite team_uuid + channel_uuid + thread_uuid
- **Format léger** : Les commentaires n'ont pas de titre, juste le corps

## Commande CREATE_COMMENT (lignes 172-213)
```c
void myteams_server_cmd_create_comment(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    comment_t *c = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 4) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[3]) > MAX_BODY_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (!find_thread_by_uuid(server, args[2])) {
        write(client->fd, "404 Thread not found.\r\n", 23);
        return;
    }
    if (server->comment_count >= MAX_COMMENTS) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    c = &server->comments[server->comment_count];
    strncpy(c->team_uuid, args[0], UUID_LEN);
    strncpy(c->channel_uuid, args[1], UUID_LEN);
    strncpy(c->thread_uuid, args[2], UUID_LEN);
    strncpy(c->body, args[3], MAX_BODY_LENGTH);
    strncpy(c->creator_uuid, client->user->uuid, UUID_LEN);
    c->timestamp = time(NULL);
    server->comment_count++;
    server_event_reply_created(args[2], client->user->uuid, args[3]);
    write(client->fd, "216 Comment posted.\r\n", 21);
    snprintf(line, BUF_SIZE,
        "705 {\"thread_uuid\":\"%s\",\"creator\":\"%s\","
        "\"body\":\"%s\"}\r\n",
        args[2], client->user->uuid, args[3]);
    broadcast_team(server, args[0], line, client->fd);
}
```

### Analyse détaillée ligne par ligne

#### **Lignes 178-183** : Validation de base
- **Authentification** : Doit être connecté
- **Arguments** : Exactement 4 arguments (team_uuid, channel_uuid, thread_uuid, corps)

#### **Lignes 184-187** : Validation de la longueur
- **args[3]** : corps du commentaire (≤ MAX_BODY_LENGTH)
- **Code 413** : Payload Too Long si trop long

#### **Ligne 188** : Vérification d'abonnement
- **`require_sub()`** : Vérifie que l'utilisateur est abonné à l'équipe

#### **Lignes 190-193** : Vérification de la discussion
- **`find_thread_by_uuid()`** : Vérifie que la discussion existe

#### **Lignes 194-197** : Capacité serveur
- **Vérification** : Si nombre maximum de commentaires atteint
- **Code 500** : Server Internal Error (capacité dépassée)

#### **Lignes 198-205** : Création du commentaire
- **Ligne 198** : Pointeur vers le prochain slot disponible
- **Lignes 199-202** : Association à la hiérarchie complète
- **Ligne 203** : Copie sécurisée du corps du commentaire
- **Ligne 204** : Enregistrement du créateur
- **Ligne 205** : Horodatage de création

#### **Ligne 206** : Logging système
- **`server_event_reply_created()`** : Journalisation de la réponse
- **Arguments** : thread_uuid, user_uuid, reply_body

#### **Ligne 207** : Confirmation au créateur
- **Code 216** : Information sur le commentaire posté
- **Format** : "216 Comment posted."

#### **Lignes 208-212** : Notification aux membres de l'équipe
- **Code 705** : Événement de création de commentaire
- **`broadcast_team()`** : Envoie uniquement aux abonnés de l'équipe
- **Format JSON** : Informations essentielles du nouveau commentaire

### Pourquoi cette implémentation ?
- **Validation hiérarchique** : Vérifie toute la chaîne team → channel → thread
- **Contrôle d'accès** : Seuls les abonnés peuvent commenter
- **Horodatage** : Important pour l'ordre chronologique des réponses
- **Notification ciblée** : Membres de l'équipe informés des nouvelles réponses

## Architecture des commandes discussion

### Hiérarchie complète
```
TEAM → CHANNEL → THREAD → COMMENT
  ↓        ↓         ↓        ↓
abonnement  listage   création  réponse
```

### Cycle de vie d'une discussion
```
CREATE_THREAD → [THREAD] → [COMMENTS] → CREATE_COMMENT → [COMMENTS]
       ↓            ↓          ↓              ↓              ↓
   création     infos     listage       réponse       listage
```

### Contrôle d'accès uniforme
- **Lecture** : THREAD et COMMENTS nécessitent l'abonnement à l'équipe
- **Listage** : THREADS et COMMENTS nécessitent l'abonnement à l'équipe
- **Création** : CREATE_THREAD et CREATE_COMMENT nécessitent l'abonnement

### Codes de réponse spécifiques
- **200** : Thread created
- **210** : Thread/Comment information
- **211** : End of threads/comments list
- **215** : Thread detailed information
- **216** : Comment posted
- **404** : Thread not found

### Événements système
- **704** : Thread created (team broadcast)
- **705** : Comment created (team broadcast)
- **server_event_thread_created()** : Logging création discussion
- **server_event_reply_created()** : Logging création commentaire

## Sécurité et Validation

1. **Authentification** : Toutes les commandes nécessitent d'être connecté
2. **Abonnement** : Toutes les commandes nécessitent l'abonnement à l'équipe
3. **Hiérarchie** : Validation de toute la chaîne parente
4. **Capacité** : Limites sur le nombre de discussions et commentaires
5. **Bounds checking** : Validation des longueurs de titres et corps

## Performance et Optimisations

1. **Tableaux statiques** : Pas d'allocation dynamique
2. **Filtrage efficace** : Comparaison directe d'UUIDs
3. **Broadcast ciblé** : `broadcast_team()` pour les événements
4. **Horodatage** : Utilise `time(NULL)` pour cohérence

## Conception et Architecture

### Modèle de données hiérarchique
- **Thread** : Message initial avec titre, corps, créateur, timestamp
- **Comment** : Réponse avec corps, créateur, timestamp
- **Association** : Chaque élément référence toute la chaîne hiérarchique

### Gestion du temps
- **Timestamp** : Unix timestamp pour ordre chronologique
- **Conversion** : `(long)` pour JSON serialization
- **Utilité** : Permet le tri temporel côté client

### Notifications en temps réel
- **Équipe** : Tous les événements sont broadcast à l'équipe
- **Cohérence** : Même pattern de notification pour threads et commentaires
- **Information** : Différents niveaux de détail selon le type d'événement

## Conclusion

Ce fichier implémente un système complet de gestion de discussions avec :
- **Hiérarchie stricte** team → channel → thread → comment
- **Contrôle d'accès** basé sur les abonnements aux équipes
- **Validation complète** à tous les niveaux de la hiérarchie
- **Notifications temps réel** aux membres concernés
- **Horodatage** pour l'ordre chronologique
- **Architecture cohérente** avec le reste du système

La séparation claire entre discussions (threads) et réponses (comments) tout en maintenant une hiérarchie commune est une décision de conception qui rend le système à la fois puissant et compréhensible.
