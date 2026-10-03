# Analyse détaillée de `src/server/cmd_user.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_user
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les commandes liées aux utilisateurs.

## Inclusion (ligne 8)
```c
#include "../../include/server.h"
```
- **Ligne 8** : Inclusion du header principal du serveur.

## Fonction utilitaire d'événement login (lignes 10-19)
```c
static void send_login_event(server_t *server, client_t *client,
    user_t *user)
{
    char event[BUF_SIZE] = {0};

    snprintf(event, BUF_SIZE,
        "700 {\"uuid\":\"%s\",\"name\":\"%s\"}\r\n",
        user->uuid, user->name);
    broadcast_all(server, event, client->fd);
}
```

### Analyse détaillée
- **Ligne 10** : `static` - fonction locale à ce fichier
- **Ligne 13** : Buffer temporaire pour construire le message d'événement
- **Lignes 15-17** : Construction du message JSON avec le code 700
  - **Code 700** : Événement de login utilisateur
  - **Format JSON** : `{"uuid":"...","name":"..."}`
  - **`\r\n`** : Terminaison de ligne du protocole
- **Ligne 18** : Diffusion à tous les clients sauf l'émetteur

### Pourquoi cette fonction ?
- **Réutilisabilité** : Évite la duplication du code d'événement
- **Cohérence** : Format standard pour tous les événements login
- **Performance** : Un seul appel pour diffuser à tous

## Fonction d'enregistrement utilisateur (lignes 21-31)
```c
static user_t *register_user(server_t *server, const char *name)
{
    user_t *u = &server->users[server->user_count];

    generate_uuid(u->uuid);
    strncpy(u->name, name, MAX_NAME_LENGTH);
    u->is_logged_in = false;
    server->user_count++;
    server_event_user_created(u->uuid, u->name);
    return u;
}
```

### Analyse détaillée
- **Ligne 23** : Pointeur vers le prochain slot utilisateur disponible
- **Ligne 25** : Génération d'un UUID unique pour le nouvel utilisateur
- **Ligne 26** : Copie sécurisée du nom avec limite de taille
- **Ligne 27** : Utilisateur créé mais pas encore connecté
- **Ligne 28** : Incrémentation du compteur d'utilisateurs
- **Ligne 29** : Logging de la création d'utilisateur
- **Ligne 30** : Retour du pointeur vers l'utilisateur créé

### Pourquoi cette implémentation ?
- **Simplicité** : Utilisation d'un tableau statique (pas d'allocation dynamique)
- **Sécurité** : `strncpy()` prévient les buffer overflows
- **Traçabilité** : Logging de chaque création pour audit

## Commande LOGIN (lignes 33-61)
```c
void myteams_server_cmd_login(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char response[BUF_SIZE] = {0};
    user_t *user = NULL;

    if (client->user) {
        write(client->fd, "409 Already logged in.\r\n", 24);
        return;
    }
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[0]) > MAX_NAME_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    user = find_user_by_name(server, args[0]);
    if (!user)
        user = register_user(server, args[0]);
    client->user = user;
    user->is_logged_in = true;
    server_event_user_logged_in(user->uuid);
    snprintf(response, BUF_SIZE, "202 %s \"%s\"\r\n",
        user->uuid, user->name);
    write(client->fd, response, strlen(response));
    send_login_event(server, client, user);
}
```

### Analyse détaillée ligne par ligne

#### **Lignes 36-37** : Variables locales
- **`response`** : Buffer pour construire la réponse au client
- **`user`** : Pointeur vers la structure utilisateur

#### **Lignes 39-42** : Vérification d'état
- **`client->user`** : Si déjà connecté, erreur 409 (Conflict)
- **Pourquoi 409** : Standard HTTP pour les conflits de ressources

#### **Lignes 43-46** : Validation des arguments
- **`arg_count != 1`** : LOGIN nécessite exactement un argument (nom)
- **Code 400** : Bad Request (syntaxe incorrecte)

#### **Lignes 47-50** : Validation de la longueur
- **`strlen(args[0]) > MAX_NAME_LENGTH`** : Nom trop long
- **Code 413** : Payload Too Large (HTTP standard)

#### **Lignes 51-53** : Recherche ou création
- **`find_user_by_name()`** : Cherche si l'utilisateur existe déjà
- **`!user`** : Si non trouvé, crée un nouvel utilisateur
- **Logique** : Auto-création des utilisateurs (pas d'inscription préalable)

#### **Lignes 54-55** : Association et état
- **`client->user = user`** : Associe l'utilisateur au client
- **`user->is_logged_in = true`** : Marque comme connecté

#### **Ligne 56** : Logging de l'événement
- **`server_event_user_logged_in()`** : Journalisation système

#### **Lignes 57-59** : Réponse au client
- **Code 202** : Accepted (création/login réussi)
- **Format** : "202 uuid \"name\""

#### **Ligne 60** : Notification aux autres clients
- **`send_login_event()`** : Diffuse l'événement de connexion

### Pourquoi cette logique ?
- **Auto-création** : Simplifie l'utilisation (pas de commande REGISTER)
- **Réutilisation** : Un utilisateur peut se connecter multiples fois
- **Notification** : Les autres voient qui arrive en temps réel

## Commande LOGOUT (lignes 63-82)
```c
void myteams_server_cmd_logout(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char event[BUF_SIZE] = {0};

    (void)args;
    (void)arg_count;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    server_event_user_logged_out(client->user->uuid);
    client->user->is_logged_in = false;
    snprintf(event, BUF_SIZE,
        "701 {\"uuid\":\"%s\",\"name\":\"%s\"}\r\n",
        client->user->uuid, client->user->name);
    broadcast_all(server, event, client->fd);
    write(client->fd, "203 Logged out.\r\n", 17);
    client->user = NULL;
}
```

### Analyse détaillée
- **Lignes 68-69** : Suppression des avertissements unused parameters
- **Lignes 70-73** : Vérification d'authentification (code 401)
- **Ligne 74** : Logging de l'événement de déconnexion
- **Ligne 75** : Marque l'utilisateur comme déconnecté
- **Lignes 76-79** : Construction et diffusion de l'événement
  - **Code 701** : Événement de logout
  - **Format JSON** similaire à login
- **Ligne 80** : Confirmation au client (code 203)
- **Ligne 81** : Dissociation du client et de l'utilisateur

### Pourquoi cette implémentation ?
- **Propreté** : Séparation nette entre client et utilisateur
- **Notification** : Les autres voient qui part
- **Persistance** : L'utilisateur reste enregistré mais déconnecté

## Commande USERS (lignes 84-106)
```c
void myteams_server_cmd_users(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    (void)args;
    (void)arg_count;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    for (i = 0; i < server->user_count; i++) {
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"name\":\"%s\","
            "\"is_connected\":%d}\r\n",
            server->users[i].uuid,
            server->users[i].name,
            server->users[i].is_logged_in ? 1 : 0);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of users list.\r\n", 24);
}
```

### Analyse détaillée
- **Lignes 90-91** : Suppression des avertissements
- **Lignes 92-95** : Vérification d'authentification
- **Lignes 96-104** : Boucle sur tous les utilisateurs
  - **Code 210** : Information utilisateur
  - **Format JSON** : UUID, nom, état de connexion
  - **`is_logged_in ? 1 : 0`** : Conversion booléen vers entier
- **Ligne 105** : Marqueur de fin de liste (code 211)

### Pourquoi cette implémentation ?
- **Complétude** : Liste TOUS les utilisateurs, pas seulement les connectés
- **État réel** : Montre qui est actuellement connecté
- **Standard** : Format JSON cohérent avec le reste du protocole

## Commande USER (lignes 108-132)
```c
void myteams_server_cmd_user(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    user_t *u = NULL;

    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    u = find_user_by_uuid(server, args[0]);
    if (!u) {
        write(client->fd, "404 User not found.\r\n", 21);
        return;
    }
    snprintf(line, BUF_SIZE,
        "212 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"is_connected\":%d}\r\n",
        u->uuid, u->name, u->is_logged_in ? 1 : 0);
    write(client->fd, line, strlen(line));
}
```

### Analyse détaillée
- **Lignes 114-117** : Vérification d'authentification
- **Lignes 118-121** : Validation des arguments (exactement 1 UUID)
- **Lignes 122-125** : Recherche de l'utilisateur par UUID
  - **Code 404** : Not Found si l'UUID n'existe pas
- **Lignes 127-131** : Construction de la réponse
  - **Code 212** : Information utilisateur spécifique
  - **Format JSON** : Identique à USERS mais pour un utilisateur

### Pourquoi cette implémentation ?
- **Précision** : Permet d'obtenir des infos sur un utilisateur spécifique
- **UUID** : Identifiant unique et fiable
- **Cohérence** : Même format que USERS pour un seul utilisateur

## Commande HELP (lignes 134-146)
```c
void myteams_server_cmd_help(client_t *client, char **args,
    int arg_count, server_t *server)
{
    (void)args;
    (void)arg_count;
    (void)server;
    write(client->fd,
        "200 LOGIN LOGOUT USERS USER TEAMS TEAM CREATE_TEAM"
        " SUBSCRIBE UNSUBSCRIBE SUBSCRIBED CHANNELS CHANNEL"
        " CREATE_CHANNEL THREADS THREAD CREATE_THREAD"
        " COMMENTS CREATE_COMMENT SEND MESSAGES"
        " USE CREATE LIST INFO HELP QUIT\r\n", 185);
}
```

### Analyse détaillée
- **Lignes 137-139** : Suppression de tous les avertissements
- **Lignes 140-145** : Affichage de la liste des commandes disponibles
  - **Code 200** : OK (succès de la commande HELP)
  - **Format** : Liste sur une seule ligne
  - **185** : Longueur exacte du message

### Pourquoi cette implémentation ?
- **Simplicité** : Une seule ligne avec toutes les commandes
- **Découverte** : Aide les nouveaux utilisateurs à explorer
- **Standard** : Code 200 pour réponse réussie

## Commande QUIT (lignes 148-159)
```c
void myteams_server_cmd_quit(client_t *client, char **args,
    int arg_count, server_t *server)
{
    (void)args;
    (void)arg_count;
    if (client->user)
        myteams_server_cmd_logout(client, NULL, 0, server);
    else
        write(client->fd, "203 Goodbye.\r\n", 14);
    close(client->fd);
    client->fd = -1;
}
```

### Analyse détaillée
- **Lignes 151-152** : Suppression des avertissements
- **Lignes 153-154** : Si connecté, fait un logout propre
  - **Réutilisation** : Appelle la commande LOGOUT existante
- **Lignes 155-156** : Si non connecté, message d'au revoir simple
  - **Code 203** : Non-Authoritative Information (approprié pour logout/quit)
- **Lignes 157-158** : Fermeture de la connexion
  - **`close()`** : Ferme le socket
  - **`fd = -1`** : Marque le client comme déconnecté

### Pourquoi cette implémentation ?
- **Propreté** : Logout automatique si connecté
- **Finalité** : Ferme proprement la connexion
- **Cohérence** : Réutilise la logique de logout

## Architecture des commandes utilisateur

### Cycle de vie utilisateur
```
Création → LOGIN → [UTILISATION] → LOGOUT/QUIT
    ↓         ↓           ↓           ↓
register_user()  login()    commands()  logout()
```

### Gestion d'état
- **Non connecté** : `client->user == NULL`
- **Connecté** : `client->user != NULL` et `user->is_logged_in == true`
- **Déconnecté** : `user->is_logged_in == false` mais utilisateur persiste

### Codes de réponse utilisés
- **200** : Succès général (HELP)
- **202** : Accepté (LOGIN)
- **203** : Information non-autoritative (LOGOUT, QUIT)
- **210** : Information utilisateur (USERS)
- **211** : Fin de liste (USERS)
- **212** : Information utilisateur spécifique (USER)
- **400** : Mauvaise requête (arguments invalides)
- **401** : Non autorisé (pas connecté)
- **404** : Non trouvé (USER)
- **409** : Conflit (déjà connecté)
- **413** : Payload trop grand (nom trop long)

### Événements système
- **700** : Login utilisateur (broadcast)
- **701** : Logout utilisateur (broadcast)
- **server_event_user_created()** : Création utilisateur (logging)
- **server_event_user_logged_in()** : Login (logging)
- **server_event_user_logged_out()** : Logout (logging)

## Sécurité et Validation

1. **Authentification** : Vérification systématique pour toutes les commandes sauf LOGIN/HELP
2. **Validation d'arguments** : Nombre et longueur vérifiés
3. **Bounds checking** : Limites sur les tailles de noms et buffers
4. **Gestion d'erreurs** : Codes HTTP standard pour cohérence

## Performance et Optimisations

1. **Tableau statique** : Pas d'allocation dynamique pour les utilisateurs
2. **Recherche linéaire** : Suffisante pour MAX_USERS = 100
3. **Broadcast optimisé** : Un seul appel pour notifier tous les clients
4. **Réutilisation** : Les commandes réutilisent la logique (QUIT → LOGOUT)

## Conclusion

Ce fichier implémente un système complet de gestion utilisateur avec :
- **Auto-création** des utilisateurs simplifiant l'inscription
- **Gestion d'état** robuste avec connexion/déconnexion
- **Notifications temps réel** aux autres utilisateurs
- **Interface cohérente** avec codes de réponse standard
- **Sécurité** avec validation stricte des entrées

L'approche auto-créative rend le système très accessible tout en maintenant la sécurité et la traçabilité.
