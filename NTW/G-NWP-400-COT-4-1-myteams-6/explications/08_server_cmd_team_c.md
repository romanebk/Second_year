# Analyse détaillée de `src/server/cmd_team.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_team
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les commandes liées aux équipes.

## Inclusion (ligne 8)
```c
#include "../../include/server.h"
```
- **Ligne 8** : Inclusion du header principal du serveur.

## Fonction utilitaire d'authentification (lignes 10-17)
```c
static int require_auth(client_t *client)
{
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return 0;
    }
    return 1;
}
```

### Analyse détaillée
- **Ligne 10** : `static` - fonction locale à ce fichier
- **Ligne 12** : Vérifie si le client a un utilisateur associé
- **Ligne 13** : Si non authentifié, envoie erreur 401
- **Ligne 14** : Retourne 0 (échec de l'authentification)
- **Ligne 16** : Retourne 1 (authentification réussie)

### Pourquoi cette fonction ?
- **Réutilisabilité** : Évite la duplication du code de vérification
- **Cohérence** : Même message d'erreur partout
- **Simplicité** : Rend le code des commandes plus lisible

## Commande TEAMS (lignes 19-39)
```c
void myteams_server_cmd_teams(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    (void)args;
    (void)arg_count;
    if (!require_auth(client))
        return;
    for (i = 0; i < server->team_count; i++) {
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"name\":\"%s\","
            "\"description\":\"%s\"}\r\n",
            server->teams[i].uuid,
            server->teams[i].name,
            server->teams[i].description);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of teams list.\r\n", 24);
}
```

### Analyse détaillée
- **Lignes 25-26** : Suppression des avertissements (aucun argument requis)
- **Ligne 27** : Vérification d'authentification
- **Lignes 29-37** : Boucle sur toutes les équipes existantes
  - **Code 210** : Information équipe
  - **Format JSON** : UUID, nom, description
  - **`\r\n`** : Terminaison de ligne du protocole
- **Ligne 38** : Marqueur de fin de liste (code 211)

### Pourquoi cette implémentation ?
- **Complétude** : Liste TOUTES les équipes visibles
- **Standard** : Format JSON cohérent avec le reste
- **Pagination implicite** : Client gère la réception des multiples lignes

## Commande TEAM (lignes 41-63)
```c
void myteams_server_cmd_team(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    team_t *t = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    t = find_team_by_uuid(server, args[0]);
    if (!t) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return;
    }
    snprintf(line, BUF_SIZE,
        "213 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"description\":\"%s\",\"creator\":\"%s\"}\r\n",
        t->uuid, t->name, t->description, t->creator_uuid);
    write(client->fd, line, strlen(line));
}
```

### Analyse détaillée
- **Ligne 47** : Vérification d'authentification
- **Lignes 49-52** : Validation des arguments (exactement 1 UUID)
- **Lignes 53-57** : Recherche de l'équipe par UUID
  - **Code 404** : Not Found si l'équipe n'existe pas
- **Lignes 58-62** : Construction de la réponse
  - **Code 213** : Information équipe détaillée
  - **Format JSON** : Inclut le créateur en plus des infos de base

### Pourquoi cette implémentation ?
- **Précision** : Informations détaillées sur une équipe spécifique
- **Créateur** : Important pour savoir qui a créé l'équipe
- **UUID** : Identification fiable et unique

## Commande CREATE_TEAM (lignes 65-100)
```c
void myteams_server_cmd_create_team(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    team_t *t = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 2) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[0]) > MAX_NAME_LENGTH ||
        strlen(args[1]) > MAX_DESC_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    if (server->team_count >= MAX_TEAMS) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    t = &server->teams[server->team_count];
    generate_uuid(t->uuid);
    strncpy(t->name, args[0], MAX_NAME_LENGTH);
    strncpy(t->description, args[1], MAX_DESC_LENGTH);
    strncpy(t->creator_uuid, client->user->uuid, UUID_LEN);
    server->team_count++;
    server_event_team_created(t->uuid, t->name, client->user->uuid);
    snprintf(line, BUF_SIZE, "200 Team created: %s\r\n", t->uuid);
    write(client->fd, line, strlen(line));
    snprintf(line, BUF_SIZE,
        "702 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"description\":\"%s\"}\r\n",
        t->uuid, t->name, t->description);
    broadcast_all(server, line, client->fd);
}
```

### Analyse détaillée ligne par ligne

#### **Lignes 71-76** : Validation de base
- **Authentification** : Doit être connecté
- **Arguments** : Exactement 2 arguments (nom, description)

#### **Lignes 77-81** : Validation des longueurs
- **Nom** : Doit faire ≤ MAX_NAME_LENGTH (32)
- **Description** : Doit faire ≤ MAX_DESC_LENGTH (255)
- **Code 413** : Payload Too Large si trop long

#### **Lignes 82-85** : Capacité serveur
- **Vérification** : Si nombre maximum d'équipes atteint
- **Code 500** : Server Internal Error (capacité dépassée)

#### **Lignes 86-91** : Création de l'équipe
- **Ligne 86** : Pointeur vers le prochain slot disponible
- **Ligne 87** : Génération d'un UUID unique
- **Lignes 88-90** : Copie sécurisée des informations
- **Ligne 91** : Incrémentation du compteur d'équipes

#### **Ligne 92** : Logging système
- **`server_event_team_created()`** : Journalisation de la création

#### **Lignes 93-94** : Confirmation au créateur
- **Code 200** : OK (création réussie)
- **Format** : "200 Team created: uuid"

#### **Lignes 95-99** : Notification aux autres
- **Code 702** : Événement de création d'équipe
- **Broadcast** : Envoie à tous sauf au créateur
- **Format JSON** : Informations de la nouvelle équipe

### Pourquoi cette implémentation ?
- **Validation stricte** : Prévient les abus et erreurs
- **Capacité limitée** : Évite les débordements mémoire
- **Notification temps réel** : Les autres voient les nouvelles équipes
- **Traçabilité** : Créateur enregistré pour audit

## Commande SUBSCRIBE (lignes 102-133)
```c
void myteams_server_cmd_subscribe(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    subscription_t *sub = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (!find_team_by_uuid(server, args[0])) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return;
    }
    if (is_subscribed(server, client->user->uuid, args[0])) {
        write(client->fd, "409 Already subscribed.\r\n", 25);
        return;
    }
    sub = &server->subscriptions[server->subscription_count];
    strncpy(sub->user_uuid, client->user->uuid, UUID_LEN);
    strncpy(sub->team_uuid, args[0], UUID_LEN);
    server->subscription_count++;
    server_event_user_subscribed(args[0], client->user->uuid);
    snprintf(line, BUF_SIZE, "218 Subscribed to team %s\r\n", args[0]);
    write(client->fd, line, strlen(line));
    snprintf(line, BUF_SIZE,
        "707 {\"uuid\":\"%s\",\"team_uuid\":\"%s\"}\r\n",
        client->user->uuid, args[0]);
    broadcast_team(server, args[0], line, client->fd);
}
```

### Analyse détaillée
- **Lignes 108-112** : Validation de base
- **Lignes 114-117** : Vérification de l'existence de l'équipe
- **Lignes 118-121** : Vérification si déjà abonné
  - **Code 409** : Conflict si déjà abonné
- **Lignes 122-125** : Création de l'abonnement
- **Ligne 126** : Logging de l'événement
- **Lignes 127-128** : Confirmation à l'utilisateur
  - **Code 218** : Information sur l'abonnement
- **Lignes 129-132** : Notification aux membres de l'équipe
  - **Code 707** : Événement d'abonnement
  - **`broadcast_team()`** : Envoie uniquement aux abonnés de l'équipe

### Pourquoi cette implémentation ?
- **Contrôle d'accès** : Vérifie l'existence de l'équipe
- **Unicité** : Empêche les abonnements multiples
- **Notification ciblée** : Seuls les membres de l'équipe sont notifiés

## Commande UNSUBSCRIBE (lignes 135-172)
```c
void myteams_server_cmd_unsubscribe(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (!find_team_by_uuid(server, args[0])) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return;
    }
    if (!is_subscribed(server, client->user->uuid, args[0])) {
        write(client->fd, "403 Not subscribed.\r\n", 21);
        return;
    }
    for (i = 0; i < server->subscription_count; i++) {
        if (strcmp(server->subscriptions[i].user_uuid,
            client->user->uuid) == 0 &&
            strcmp(server->subscriptions[i].team_uuid, args[0]) == 0) {
            server->subscriptions[i] =
                server->subscriptions[--server->subscription_count];
            break;
        }
    }
    server_event_user_unsubscribed(args[0], client->user->uuid);
    snprintf(line, BUF_SIZE,
        "708 {\"uuid\":\"%s\",\"team_uuid\":\"%s\"}\r\n",
        client->user->uuid, args[0]);
    broadcast_team(server, args[0], line, client->fd);
    snprintf(line, BUF_SIZE,
        "219 Unsubscribed from team %s\r\n", args[0]);
    write(client->fd, line, strlen(line));
}
```

### Analyse détaillée
- **Lignes 141-146** : Validation de base
- **Lignes 147-150** : Vérification de l'existence de l'équipe
- **Lignes 151-154** : Vérification si abonné
  - **Code 403** : Forbidden si pas abonné
- **Lignes 155-162** : Suppression de l'abonnement
  - **Recherche linéaire** : Trouve l'abonnement à supprimer
  - **Optimisation** : Remplace le dernier élément et décrémente le compteur
- **Ligne 164** : Logging de l'événement
- **Lignes 165-168** : Notification aux membres de l'équipe
  - **Code 708** : Événement de désabonnement
- **Lignes 169-171** : Confirmation à l'utilisateur
  - **Code 219** : Information sur le désabonnement

### Pourquoi cette implémentation ?
- **Sécurité** : Vérifie que l'utilisateur est bien abonné
- **Efficacité** : Suppression en O(1) avec déplacement du dernier élément
- **Notification** : Les membres voient qui part

## Commande SUBSCRIBED (lignes 174-218)
```c
void myteams_server_cmd_subscribed(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    team_t *t = NULL;
    int i = 0;

    if (!require_auth(client))
        return;
    if (arg_count == 0) {
        for (i = 0; i < server->subscription_count; i++) {
            if (strcmp(server->subscriptions[i].user_uuid,
                client->user->uuid) != 0)
                continue;
            t = find_team_by_uuid(server,
                server->subscriptions[i].team_uuid);
            if (!t)
                continue;
            snprintf(line, BUF_SIZE,
                "210 {\"uuid\":\"%s\",\"name\":\"%s\","
                "\"description\":\"%s\"}\r\n",
                t->uuid, t->name, t->description);
            write(client->fd, line, strlen(line));
        }
        write(client->fd, "211 End of subscribed teams.\r\n", 30);
        return;
    }
    if (!find_team_by_uuid(server, args[0])) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return;
    }
    for (i = 0; i < server->subscription_count; i++) {
        if (strcmp(server->subscriptions[i].team_uuid, args[0]) != 0)
            continue;
        user_t *u = find_user_by_uuid(server,
            server->subscriptions[i].user_uuid);
        if (!u)
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"name\":\"%s\"}\r\n",
            u->uuid, u->name);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of subscribers.\r\n", 25);
}
```

### Analyse détaillée

#### **Cas 1 : Sans argument (lignes 183-199)**
- **`arg_count == 0`** : Liste les équipes de l'utilisateur
- **Logique** : Parcourt tous les abonnements, filtre par utilisateur
- **Résultat** : Liste des équipes où l'utilisateur est abonné
- **Code 211** : "End of subscribed teams"

#### **Cas 2 : Avec argument (lignes 200-218)**
- **Validation** : Vérifie que l'équipe existe
- **Logique** : Parcourt tous les abonnements, filtre par équipe
- **Résultat** : Liste des abonnés de l'équipe spécifiée
- **Code 211** : "End of subscribers"

### Pourquoi cette double fonctionnalité ?
- **Flexibilité** : Une commande pour deux usages courants
- **Intuitif** : Sans argument = mes équipes, avec argument = qui est dans cette équipe
- **Efficacité** : Réutilise la même structure de données

## Architecture des commandes équipe

### Cycle de vie d'une équipe
```
CREATE_TEAM → [SUBSCRIBE] → [UTILISATION] → UNSUBSCRIBE
      ↓            ↓           ↓            ↓
   création    abonnement   navigation   départ
```

### Gestion des abonnements
- **Structure** : Tableau de `subscription_t` avec user_uuid + team_uuid
- **Recherche** : Fonction `is_subscribed()` pour vérifier l'abonnement
- **Suppression** : Optimisée avec déplacement du dernier élément

### Codes de réponse spécifiques
- **200** : Team created
- **210** : Team information
- **211** : End of list (utilisés pour différentes listes)
- **213** : Team detailed information
- **218** : Subscribed confirmation
- **219** : Unsubscribed confirmation
- **403** : Not subscribed (UNSUBSCRIBE)
- **409** : Already subscribed (SUBSCRIBE)

### Événements système
- **702** : Team created (broadcast)
- **707** : User subscribed (team broadcast)
- **708** : User unsubscribed (team broadcast)
- **server_event_team_created()** : Logging création
- **server_event_user_subscribed()** : Logging abonnement
- **server_event_user_unsubscribed()** : Logging désabonnement

## Sécurité et Validation

1. **Authentification** : Toutes les commandes nécessitent d'être connecté
2. **Existence** : Vérification que les équipes existent avant abonnement
3. **Unicité** : Empêche les abonnements multiples
4. **Capacité** : Limite sur le nombre d'équipes créées
5. **Bounds checking** : Validation des longueurs de noms et descriptions

## Performance et Optimisations

1. **Tableaux statiques** : Pas d'allocation dynamique
2. **Suppression optimisée** : O(1) pour UNSUBSCRIBE
3. **Broadcast ciblé** : `broadcast_team()` pour les événements équipe
4. **Réutilisation** : `require_auth()` évite la duplication

## Conclusion

Ce fichier implémente un système complet de gestion d'équipes avec :
- **Création** d'équipes avec validation stricte
- **Gestion des abonnements** avec notifications ciblées
- **Listage flexible** (équipes personnelles ou abonnés)
- **Sécurité** à chaque niveau avec validation appropriée
- **Performance** avec structures statiques et algorithmes optimisés

L'approche double de SUBSCRIBED (mes équipes vs abonnés d'une équipe) rend l'interface très intuitive et efficace.
