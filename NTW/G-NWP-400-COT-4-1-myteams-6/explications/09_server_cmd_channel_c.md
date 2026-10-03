# Analyse détaillée de `src/server/cmd_channel.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_channel
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les commandes liées aux canaux.

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
- **Cohérence** : Même message d'erreur que dans cmd_team.c
- **Simplicité** : Rend le code des commandes plus lisible

## Fonction utilitaire de vérification d'abonnement (lignes 19-31)
```c
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
- **Ligne 19** : `static` - fonction locale à ce fichier
- **Paramètres** :
  - `client` : Client effectuant l'action
  - `server` : Structure serveur
  - `team_uuid` : UUID de l'équipe à vérifier
- **Ligne 22** : Vérifie que l'équipe existe
  - **Code 404** : Not Found si l'équipe n'existe pas
- **Ligne 26** : Vérifie que l'utilisateur est abonné à l'équipe
  - **Code 403** : Forbidden si pas abonné
- **Ligne 30** : Retourne 1 si toutes les vérifications réussissent

### Pourquoi cette fonction ?
- **Sécurité** : Double validation (existence + abonnement)
- **Contrôle d'accès** : Seuls les abonnés peuvent opérer sur les canaux
- **Réutilisabilité** : Utilisée par CHANNELS et CREATE_CHANNEL

## Commande CHANNELS (lignes 33-59)
```c
void myteams_server_cmd_channels(client_t *client, char **args,
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
    if (!require_sub(client, server, args[0]))
        return;
    for (i = 0; i < server->channel_count; i++) {
        if (strcmp(server->channels[i].team_uuid, args[0]) != 0)
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"name\":\"%s\","
            "\"description\":\"%s\"}\r\n",
            server->channels[i].uuid,
            server->channels[i].name,
            server->channels[i].description);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of channels list.\r\n", 27);
}
```

### Analyse détaillée
- **Ligne 39** : Vérification d'authentification
- **Lignes 41-44** : Validation des arguments (exactement 1 UUID d'équipe)
- **Ligne 45** : Vérification d'abonnement à l'équipe
- **Lignes 47-57** : Boucle sur tous les canaux
  - **Ligne 48** : Filtre par équipe (uniquement les canaux de cette équipe)
  - **Code 210** : Information canal
  - **Format JSON** : UUID, nom, description
- **Ligne 58** : Marqueur de fin de liste (code 211)

### Pourquoi cette implémentation ?
- **Contrôle d'accès** : Seuls les abonnés peuvent voir les canaux
- **Filtrage** : Affiche uniquement les canaux de l'équipe spécifiée
- **Sécurité** : Double validation (auth + abonnement)

## Commande CHANNEL (lignes 61-83)
```c
void myteams_server_cmd_channel(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    channel_t *ch = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    ch = find_channel_by_uuid(server, args[0]);
    if (!ch) {
        write(client->fd, "404 Channel not found.\r\n", 24);
        return;
    }
    snprintf(line, BUF_SIZE,
        "214 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"description\":\"%s\"}\r\n",
        ch->uuid, ch->name, ch->description);
    write(client->fd, line, strlen(line));
}
```

### Analyse détaillée
- **Ligne 67** : Vérification d'authentification
- **Lignes 69-72** : Validation des arguments (exactement 1 UUID de canal)
- **Lignes 73-77** : Recherche du canal par UUID
  - **Code 404** : Not Found si le canal n'existe pas
- **Lignes 78-82** : Construction de la réponse
  - **Code 214** : Information canal spécifique
  - **Format JSON** : UUID, nom, description

### Pourquoi cette implémentation ?
- **Précision** : Informations détaillées sur un canal spécifique
- **Pas de vérification d'abonnement** : Si on connaît l'UUID, on peut accéder aux infos
- **Simplicité** : Pas de validation complexe pour la lecture d'informations

## Commande CREATE_CHANNEL (lignes 85-122)
```c
void myteams_server_cmd_create_channel(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    channel_t *ch = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 3) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[1]) > MAX_NAME_LENGTH ||
        strlen(args[2]) > MAX_DESC_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (server->channel_count >= MAX_CHANNELS) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    ch = &server->channels[server->channel_count];
    generate_uuid(ch->uuid);
    strncpy(ch->team_uuid, args[0], UUID_LEN);
    strncpy(ch->name, args[1], MAX_NAME_LENGTH);
    strncpy(ch->description, args[2], MAX_DESC_LENGTH);
    server->channel_count++;
    server_event_channel_created(args[0], ch->uuid, ch->name);
    snprintf(line, BUF_SIZE, "200 Channel created: %s\r\n", ch->uuid);
    write(client->fd, line, strlen(line));
    snprintf(line, BUF_SIZE,
        "703 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"description\":\"%s\",\"team_uuid\":\"%s\"}\r\n",
        ch->uuid, ch->name, ch->description, ch->team_uuid);
    broadcast_team(server, args[0], line, client->fd);
}
```

### Analyse détaillée ligne par ligne

#### **Lignes 91-96** : Validation de base
- **Authentification** : Doit être connecté
- **Arguments** : Exactement 3 arguments (team_uuid, nom, description)

#### **Lignes 97-101** : Validation des longueurs
- **args[0]** : team_uuid (pas de validation de longueur, UUID standard)
- **args[1]** : nom du canal (≤ MAX_NAME_LENGTH)
- **args[2]** : description (≤ MAX_DESC_LENGTH)
- **Code 413** : Payload Too Large si trop long

#### **Ligne 102** : Vérification d'abonnement
- **`require_sub()`** : Vérifie que l'utilisateur est abonné à l'équipe
- **Sécurité** : Seuls les abonnés peuvent créer des canaux

#### **Lignes 104-107** : Capacité serveur
- **Vérification** : Si nombre maximum de canaux atteint
- **Code 500** : Server Internal Error (capacité dépassée)

#### **Lignes 108-113** : Création du canal
- **Ligne 108** : Pointeur vers le prochain slot disponible
- **Ligne 109** : Génération d'un UUID unique pour le canal
- **Ligne 110** : Association à l'équipe parente
- **Lignes 111-112** : Copie sécurisée du nom et de la description
- **Ligne 113** : Incrémentation du compteur de canaux

#### **Ligne 114** : Logging système
- **`server_event_channel_created()`** : Journalisation de la création
- **Arguments** : team_uuid, channel_uuid, channel_name

#### **Lignes 115-116** : Confirmation au créateur
- **Code 200** : OK (création réussie)
- **Format** : "200 Channel created: uuid"

#### **Lignes 117-121** : Notification aux membres de l'équipe
- **Code 703** : Événement de création de canal
- **`broadcast_team()`** : Envoie uniquement aux abonnés de l'équipe
- **Format JSON** : Informations complètes du nouveau canal

### Pourquoi cette implémentation ?
- **Contrôle d'accès strict** : Authentification + abonnement requis
- **Validation complète** : Longueurs, capacité, existence
- **Notification ciblée** : Seuls les membres de l'équipe sont notifiés
- **Traçabilité** : Logging système pour audit

## Architecture des commandes canal

### Hiérarchie et dépendances
```
TEAM (parent) → CHANNELS → CREATE_CHANNEL → CHANNEL
      ↓              ↓              ↓           ↓
   abonnement    listage       création     infos
```

### Cycle de vie d'un canal
```
CREATE_CHANNEL → [CHANNEL] → [THREADS] → [suppression implicite]
       ↓            ↓           ↓              ↓
    création      infos     discussions   fin de vie
```

### Contrôle d'accès
- **Lecture** : CHANNEL n'exige pas d'abonnement (accès public aux infos)
- **Listage** : CHANNELS exige l'abonnement à l'équipe
- **Création** : CREATE_CHANNEL exige l'abonnement à l'équipe

### Codes de réponse spécifiques
- **200** : Channel created
- **210** : Channel information
- **211** : End of channels list
- **214** : Channel detailed information
- **403** : Not subscribed to this team
- **404** : Channel not found

### Événements système
- **703** : Channel created (team broadcast)
- **server_event_channel_created()** : Logging création

## Sécurité et Validation

1. **Authentification** : Toutes les commandes nécessitent d'être connecté
2. **Abonnement** : CHANNELS et CREATE_CHANNEL exigent l'abonnement
3. **Existence** : Vérification que les équipes existent
4. **Capacité** : Limite sur le nombre de canaux créés
5. **Bounds checking** : Validation des longueurs de noms et descriptions

## Performance et Optimisations

1. **Tableaux statiques** : Pas d'allocation dynamique
2. **Filtrage efficace** : Comparaison directe d'UUIDs
3. **Broadcast ciblé** : `broadcast_team()` pour les événements canal
4. **Réutilisation** : `require_auth()` et `require_sub()` évitent la duplication

## Conception et Architecture

### Séparation des responsabilités
- **`require_auth()`** : Validation de l'identité
- **`require_sub()`** : Validation des permissions
- **Commandes** : Logique métier spécifique

### Modèle de permissions
- **Lecture publique** : Les informations de canal sont accessibles à tous
- **Écriture privée** : Création et listage réservés aux abonnés
- **Hiérarchie claire** : Canal → Équipe → Utilisateur

### Gestion des erreurs
- **Codes HTTP standard** : Cohérence avec le reste du protocole
- **Messages explicites** : Erreurs claires pour l'utilisateur
- **Validation précoce** : Vérifications avant toute modification

## Conclusion

Ce fichier implémente un système de gestion de canaux robuste avec :
- **Contrôle d'accès** basé sur les abonnements aux équipes
- **Validation stricte** à tous les niveaux
- **Notifications ciblées** aux membres concernés
- **Architecture cohérente** avec le reste du système
- **Performance** avec structures statiques et algorithmes optimisés

La distinction entre accès public (CHANNEL) et accès privé (CHANNELS, CREATE_CHANNEL) est une décision de conception intéressante qui équilibre transparence et sécurité.
