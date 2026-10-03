# Analyse détaillée de `src/client/response.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** response
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant la logique de traitement des réponses serveur.

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
- **Ligne 9** : Header des utilitaires (JSON, buffer)
- **Ligne 10** : Entrées/sorties standard (potentiellement pour debugging)
- **Ligne 11** : Fonctions standard C (malloc, free, exit)
- **Ligne 12** : Manipulation de chaînes (sscanf, strstr, strcmp)

### Pourquoi ces inclusions ?
- **client.h** : Définit les structures client et les fonctions d'affichage
- **utils.h** : Utilitaires pour le parsing JSON et la gestion des buffers
- **stdio.h/stdlib.h/string.h** : Pour la manipulation des réponses serveur

## Fonctions d'affichage de listes (lignes 14-88)

### Affichage d'utilisateur (lignes 14-24)
```c
static void print_list_user(char *json)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    int status = 0;

    myteams_json_extract_str(json, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(json, "name", name, 33);
    status = (int)myteams_json_extract_long(json, "is_connected");
    client_print_users(uuid, name, status);
}
```

### Analyse détaillée
- **Ligne 14** : Fonction statique pour afficher un utilisateur dans une liste
- **Paramètre** : `json` - Chaîne JSON avec les données utilisateur
- **Lignes 20-22** : Extraction des données du JSON
  - **UUID** : Identifiant unique de l'utilisateur
  - **name** : Nom d'utilisateur (max 32 caractères + '\0')
  - **is_connected** : État de connexion (booléen converti en int)
- **Ligne 23** : Appel à la fonction d'affichage client

### Affichage d'équipe (lignes 26-36)
```c
static void print_list_team(char *json)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    char desc[256] = {0};

    myteams_json_extract_str(json, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(json, "name", name, 33);
    myteams_json_extract_str(json, "description", desc, 256);
    client_print_teams(uuid, name, desc);
}
```

### Analyse détaillée
- **Ligne 26** : Fonction pour afficher une équipe dans une liste
- **Lignes 32-34** : Extraction des données
  - **UUID** : Identifiant unique de l'équipe
  - **name** : Nom de l'équipe
  - **description** : Description de l'équipe (max 255 + '\0')

### Affichage de canal (lignes 38-48)
```c
static void print_list_channel(char *json)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    char desc[256] = {0};

    myteams_json_extract_str(json, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(json, "name", name, 33);
    myteams_json_extract_str(json, "description", desc, 256);
    client_team_print_channels(uuid, name, desc);
}
```

### Analyse détaillée
- **Ligne 38** : Fonction pour afficher un canal dans une liste
- **Ligne 47** : Appel à `client_team_print_channels` (note: préfixe "team_" spécifique)

### Affichage de discussion (lignes 50-64)
```c
static void print_list_thread(char *json)
{
    char uuid[UUID_LEN] = {0};
    char creator[UUID_LEN] = {0};
    char title[33] = {0};
    char body[513] = {0};
    long ts = 0;

    myteams_json_extract_str(json, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(json, "creator", creator, UUID_LEN);
    myteams_json_extract_str(json, "title", title, 33);
    myteams_json_extract_str(json, "body", body, 513);
    ts = myteams_json_extract_long(json, "timestamp");
    client_channel_print_threads(uuid, creator, (time_t)ts, title, body);
}
```

### Analyse détaillée
- **Ligne 50** : Fonction pour afficher une discussion dans une liste
- **Lignes 58-62** : Extraction des données
  - **creator** : UUID du créateur
  - **title** : Titre de la discussion
  - **body** : Corps du message initial
  - **timestamp** : Horodatage de création
- **Ligne 63** : Appel avec conversion `long` vers `time_t`

### Affichage de commentaire (lignes 66-76)
```c
static void print_list_comment(client_t *c, char *json)
{
    char creator[UUID_LEN] = {0};
    char body[513] = {0};
    long ts = 0;

    myteams_json_extract_str(json, "creator", creator, UUID_LEN);
    myteams_json_extract_str(json, "body", body, 513);
    ts = myteams_json_extract_long(json, "timestamp");
    client_thread_print_replies(c->thread_uuid, creator, (time_t)ts, body);
}
```

### Analyse détaillée
- **Ligne 66** : Fonction pour afficher un commentaire dans une liste
- **Paramètre** : `c` - Structure client (pour le contexte thread_uuid)
- **Ligne 75** : Appel avec `c->thread_uuid` comme contexte

### Affichage de message privé (lignes 78-88)
```c
static void print_list_message(char *json)
{
    char sender[UUID_LEN] = {0};
    char body[513] = {0};
    long ts = 0;

    myteams_json_extract_str(json, "sender", sender, UUID_LEN);
    myteams_json_extract_str(json, "body", body, 513);
    ts = myteams_json_extract_long(json, "timestamp");
    client_private_message_print_messages(sender, (time_t)ts, body);
}
```

### Analyse détaillée
- **Ligne 78** : Fonction pour afficher un message privé dans une liste
- **Lignes 84-86** : Extraction des données
  - **sender** : UUID de l'expéditeur
  - **body** : Corps du message
  - **timestamp** : Horodatage

## Fonction de traitement des listes (lignes 90-104)
```c
static void process_list_data(client_t *c, char *json)
{
    if (c->pending_list_type == 1)
        print_list_user(json);
    else if (c->pending_list_type == 2)
        print_list_team(json);
    else if (c->pending_list_type == 3)
        print_list_channel(json);
    else if (c->pending_list_type == 4)
        print_list_thread(json);
    else if (c->pending_list_type == 5)
        print_list_comment(c, json);
    else if (c->pending_list_type == 6)
        print_list_message(json);
}
```

### Analyse détaillée
- **Ligne 90** : Fonction pour router les données de liste vers le bon affichage
- **Paramètres** : `c` - client, `json` - données à afficher
- **Logique** : Route selon `pending_list_type` défini dans les commandes

### Mapping des types de listes
- **1** : Utilisateurs → `print_list_user()`
- **2** : Équipes → `print_list_team()`
- **3** : Canaux → `print_list_channel()`
- **4** : Discussions → `print_list_thread()`
- **5** : Commentaires → `print_list_comment()`
- **6** : Messages privés → `print_list_message()`

## Fonction de traitement d'authentification (lignes 106-129)
```c
static void process_auth(client_t *c, int code, char *p)
{
    char t[UUID_LEN] = {0};
    char ch[UUID_LEN] = {0};
    char th[UUID_LEN] = {0};

    if (code == 202) {
        sscanf(p, "%36s \"%32[^\"]\"", c->uuid, c->username);
        c->logged = true;
        client_event_logged_in(c->uuid, c->username);
        return;
    }
    if (code == 203) {
        client_event_logged_out(c->uuid, c->username);
        close(c->fd);
        exit(0);
    }
    if (code == 220) {
        sscanf(p, "%s %s %s", t, ch, th);
        strncpy(c->team_uuid, strcmp(t, "none") ? t : "", UUID_LEN);
        strncpy(c->channel_uuid, strcmp(ch, "none") ? ch : "", UUID_LEN);
        strncpy(c->thread_uuid, strcmp(th, "none") ? th : "", UUID_LEN);
    }
}
```

### Analyse détaillée

#### **Login réussi (lignes 112-117)**
- **Code 202** : Login accepté
- **`sscanf(p, "%36s \"%32[^\"]\"", c->uuid, c->username)`** : Parse UUID et username
- **`c->logged = true`** : Marque le client comme authentifié
- **`client_event_logged_in()`** : Notifie l'événement de login

#### **Logout (lignes 118-122)**
- **Code 203** : Logout réussi
- **`client_event_logged_out()`** : Notifie l'événement de logout
- **`close(c->fd)`** : Ferme la connexion
- **`exit(0)`** : Termine le programme

#### **Mise à jour du contexte (lignes 123-128)**
- **Code 220** : Contexte mis à jour
- **`sscanf(p, "%s %s %s", t, ch, th)`** : Parse les trois UUIDs
- **Logique ternaire** : `strcmp(t, "none") ? t : ""` pour gérer "none"
- **`strncpy()`** : Copie les UUIDs dans le contexte client

## Fonction de traitement des informations (lignes 131-162)
```c
static void process_info(int code, char *p)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    char desc[256] = {0};
    char creator[UUID_LEN] = {0};
    char title[33] = {0};
    char body[513] = {0};
    long ts = 0;

    myteams_json_extract_str(p, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(p, "name", name, 33);
    if (code == 212) {
        client_print_user(uuid, name,
            (int)myteams_json_extract_long(p, "is_connected"));
        return;
    }
    myteams_json_extract_str(p, "description", desc, 256);
    if (code == 213) {
        client_print_team(uuid, name, desc);
        return;
    }
    if (code == 214) {
        client_print_channel(uuid, name, desc);
        return;
    }
    myteams_json_extract_str(p, "creator", creator, UUID_LEN);
    myteams_json_extract_str(p, "title", title, 33);
    myteams_json_extract_str(p, "body", body, 513);
    ts = myteams_json_extract_long(p, "timestamp");
    client_print_thread(uuid, creator, (time_t)ts, title, body);
}
```

### Analyse détaillée

#### **Extraction de base (lignes 141-142)**
- **UUID** et **name** : Extraits pour tous les types

#### **Code 212 - Utilisateur (lignes 143-147)**
- **`client_print_user()`** : Affiche les informations utilisateur
- **`is_connected`** : État de connexion

#### **Code 213 - Équipe (lignes 148-152)**
- **Extraction description** : Ajoutée pour les équipes
- **`client_print_team()`** : Affiche les informations équipe

#### **Code 214 - Canal (lignes 153-157)**
- **`client_print_channel()`** : Affiche les informations canal

#### **Code 215 - Discussion (lignes 158-161)**
- **Extraction complète** : creator, title, body, timestamp
- **`client_print_thread()`** : Affiche les informations discussion

## Fonction de traitement des erreurs (lignes 164-184)
```c
static void process_error(int code, char *p)
{
    if (code == 400 || code == 401) {
        client_error_unauthorized();
        return;
    }
    if (code == 409) {
        client_error_already_exist();
        return;
    }
    if (code != 404 || !p)
        return;
    if (strstr(p, "Team"))
        client_error_unknown_team(p + strlen("Team "));
    else if (strstr(p, "Channel"))
        client_error_unknown_channel(p + strlen("Channel "));
    else if (strstr(p, "Thread"))
        client_error_unknown_thread(p + strlen("Thread "));
    else if (strstr(p, "User"))
        client_error_unknown_user(p + strlen("User "));
}
```

### Analyse détaillée

#### **Erreurs générales (lignes 166-173)**
- **400/401** : Non autorisé → `client_error_unauthorized()`
- **409** : Conflit (existe déjà) → `client_error_already_exist()`

#### **Erreurs 404 - Non trouvé (lignes 174-183)**
- **Vérification** : `code != 404 || !p` pour éviter les erreurs
- **Parsing du message** : Cherche le type d'entité dans le message
- **Appels spécifiques** : Fonctions d'erreur pour chaque type

## Fonction de traitement des événements (lignes 186-212)
```c
static void process_event(int code, char *p)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    char desc[256] = {0};
    char body[513] = {0};

    myteams_json_extract_str(p, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(p, "name", name, 33);
    if (code == 700) {
        client_event_logged_in(uuid, name);
        return;
    }
    if (code == 701) {
        client_event_logged_out(uuid, name);
        return;
    }
    if (code == 702) {
        myteams_json_extract_str(p, "description", desc, 256);
        client_event_team_created(uuid, name, desc);
        return;
    }
    if (code == 706) {
        myteams_json_extract_str(p, "body", body, 513);
        client_event_private_message_received(uuid, body);
    }
}
```

### Analyse détaillée

#### **Extraction de base (lignes 193-194)**
- **UUID** et **name** : Extraits pour la plupart des événements

#### **Code 700 - Login utilisateur (lignes 195-198)**
- **`client_event_logged_in()`** : Notifie qu'un utilisateur s'est connecté

#### **Code 701 - Logout utilisateur (lignes 199-202)**
- **`client_event_logged_out()`** : Notifie qu'un utilisateur s'est déconnecté

#### **Code 702 - Création équipe (lignes 203-207)**
- **Extraction description** : Ajoutée pour les équipes
- **`client_event_team_created()`** : Notifie la création d'équipe

#### **Code 706 - Message privé reçu (lignes 208-211)**
- **Extraction body** : Corps du message
- **`client_event_private_message_received()`** : Notifie la réception

## Fonction de dispatch des réponses (lignes 214-228)
```c
static void dispatch_response(client_t *c, int code, char *payload)
{
    if (code == 210 && strstr(payload, "{"))
        process_list_data(c, payload);
    else if (code == 211)
        c->pending_list_type = 0;
    else if (code >= 202 && code <= 220)
        process_auth(c, code, payload);
    else if (code >= 212 && code <= 215)
        process_info(code, payload);
    else if (code >= 400 && code <= 409)
        process_error(code, payload);
    else if (code >= 700 && code <= 706)
        process_event(code, payload);
}
```

### Analyse détaillée

#### **Listes (lignes 216-217)**
- **Code 210** : Données de liste + vérification JSON
- **`process_list_data()`** : Route vers le bon affichage

#### **Fin de liste (lignes 218-219)**
- **Code 211** : Fin de liste
- **`c->pending_list_type = 0`** : Réinitialise l'état

#### **Authentification (lignes 220-221)**
- **Codes 202-220** : Login, logout, contexte
- **`process_auth()`** : Traite les états d'authentification

#### **Informations (lignes 222-223)**
- **Codes 212-215** : USER, TEAM, CHANNEL, THREAD
- **`process_info()`** : Traite les affichages d'informations

#### **Erreurs (lignes 224-225)**
- **Codes 400-409** : Erreurs client
- **`process_error()`** : Traite les messages d'erreur

#### **Événements (lignes 226-227)**
- **Codes 700-706** : Événements serveur
- **`process_event()`** : Traite les notifications

## Fonction principale de traitement serveur (lignes 230-251)
```c
void myteams_client_handle_server(client_t *c)
{
    char tmp[BUF_SIZE];
    int r = read(c->fd, tmp, BUF_SIZE);
    char *line = NULL;
    char *payload = NULL;

    if (r <= 0) {
        close(c->fd);
        exit(0);
    }
    myteams_buffer_append(&c->buf, tmp, r);
    line = myteams_buffer_get_line(&c->buf);
    while (line) {
        payload = line + 4;
        while (*payload == ' ')
            payload++;
        dispatch_response(c, atoi(line), payload);
        free(line);
        line = myteams_buffer_get_line(&c->buf);
    }
}
```

### Analyse détaillée

#### **Lecture des données (lignes 233-234)**
- **`read(c->fd, tmp, BUF_SIZE)`** : Lit depuis le socket
- **`r <= 0`** : Si déconnexion ou erreur

#### **Gestion de déconnexion (lignes 237-240)**
- **`close(c->fd)`** : Ferme le socket
- **`exit(0)`** : Termine le programme

#### **Bufferisation (lignes 241-242)**
- **`myteams_buffer_append()`** : Ajoute les données au buffer
- **`myteams_buffer_get_line()`** : Extrait une ligne complète

#### **Traitement des lignes (lignes 243-250)**
- **Boucle while** : Traite toutes les lignes disponibles
- **`payload = line + 4`** : Saute le code de réponse (3 chiffres + espace)
- **`while (*payload == ' ')`** : Saute les espaces supplémentaires
- **`dispatch_response()`** : Route la réponse
- **`free(line)`** : Libère la mémoire allouée par get_line

## Architecture de traitement des réponses

### Flux de traitement
```
Socket → read() → buffer → get_line() → dispatch_response() → traitement spécifique
   ↓        ↓        ↓          ↓              ↓                    ↓
données   lecture   bufferisation   parsing       routing           affichage
brutes   réseau    accumulation   extraction   logique            utilisateur
```

### Catégories de réponses

#### **1. Listes (210-211)**
- **210** : Données de liste (JSON) → affichage selon type
- **211** : Fin de liste → réinitialisation état

#### **2. Authentification (202-220)**
- **202** : Login réussi → mise à jour état client
- **203** : Logout → fermeture programme
- **220** : Contexte mis à jour → mise à jour UUIDs

#### **3. Informations (212-215)**
- **212** : USER → affichage utilisateur
- **213** : TEAM → affichage équipe
- **214** : CHANNEL → affichage canal
- **215** : THREAD → affichage discussion

#### **4. Erreurs (400-409)**
- **400/401** : Non autorisé → message générique
- **404** : Non trouvé → message spécifique
- **409** : Conflit → message d'existence

#### **5. Événements (700-706)**
- **700-701** : Login/logout utilisateur
- **702** : Création équipe
- **706** : Message privé reçu

### Gestion d'état

#### **pending_list_type**
- **Utilisé** : Pour router les affichages de liste
- **Réinitialisé** : À la fin de chaque liste (code 211)
- **Persistant** : Entre la commande et la réponse

#### **État client**
- **logged** : État d'authentification
- **uuid/username** : Informations utilisateur
- **team_uuid/channel_uuid/thread_uuid** : Contexte de navigation

## Conclusion

Ce fichier implémente un système complet de traitement des réponses avec :
- **Parsing JSON** robuste pour extraire les données
- **Routing intelligent** des réponses selon les codes
- **Gestion d'état** cohérente pour le contexte et les listes
- **Affichage structuré** avec des fonctions spécialisées
- **Gestion des erreurs** détaillée et contextuelle
- **Notification d'événements** en temps réel

L'architecture en couches (dispatch → traitement spécialisé → affichage) rend le code maintenable et extensible tout en gérant la complexité du protocole serveur.
