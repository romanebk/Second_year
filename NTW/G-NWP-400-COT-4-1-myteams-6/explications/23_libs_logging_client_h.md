# Analyse détaillée de `libs/myteams/logging_client.h`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, XXXX
** NWP_myteams_XXXX
** File description:
** a file containing libs functions that should be called in myteams_cli
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les fonctions de logging pour le client.

## Protection d'inclusion (lignes 8-9)
```c
#ifndef LIB_MYTEAMS_LOGGING_CLIENT_H
#define LIB_MYTEAMS_LOGGING_CLIENT_H
```
- **Ligne 8** : Protection contre les inclusions multiples
- **Ligne 9** : Définition du guard

## Inclusion de time.h (ligne 11)
```c
#include <time.h>
```
- **Ligne 11** : Inclusion pour les types temporels (time_t)

## Documentation architecturale (lignes 13-38)

### Distinction Événements vs Réponses (lignes 13-23)
```c
/*
** The functions that have event in their name are called when you receive
** something from the server, when it is not you who initiated the action.
**
** The other functions are called in response to one of your action.
**
** Ex: I received a private message (I did nothing to do so) so the function
** to call is one with event in it's name.
** Ex: I asked the server to join a team (I initiated this action) so the
** function to call is one that does not have event in it's name.
*/
```

### Analyse détaillée
- **Fonctions avec "event"** : Réception d'événements non initiés par le client
- **Fonctions sans "event"** : Réponses aux actions initiées par le client
- **Exemple 1** : Message privé reçu → `client_event_private_message_received()`
- **Exemple 2** : Abonnement réussi → `client_print_subscribed()`

### Règles de permissions (lignes 25-38)
```c
/*
** To receive teams related events you MUST be logged in
*/

/*
** To receive team related events you MUST be subscribed to the team
** Ex: to receive client_event_thread_reply_received you must be subscribed to
** the team, that have the channel, that have the thread, that got the new reply
*/

/*
** To get team information or team modifications (list threads, create reply...)
** you MUST be subscribed to the team.
*/
```

### Analyse détaillée
- **Login requis** : Pour les événements globaux (teams)
- **Abonnement requis** : Pour les événements spécifiques à une équipe
- **Hiérarchie** : Team → Channel → Thread pour les permissions

## Événements (fonctions avec "event")

### Login/Logout utilisateur (lignes 40-60)
```c
/**
** @brief Must be called when a user successfully login to the server (/login).
** When you log in (/login) you should also receive from the server this event.
** @param user_uuid The id of the user who logged in
** @param user_name The name of the user who logged in
**
** Commands:
** /login "user_name"
**/
int client_event_logged_in(char const *user_uuid, const char *user_name);

/**
** @brief Must be called when a user logged out (/logout or lost connexion).
** When you log out (/logout) you should also receive the event before quitting.
** @param user_uuid The id of the user who logged out
** @param user_name The name of the user who logged out
**
** Commands:
** /logout
**/
int client_event_logged_out(char const *user_uuid, const char *user_name);
```

### Analyse détaillée
- **client_event_logged_in()** : Notification de connexion d'un utilisateur
- **client_event_logged_out()** : Notification de déconnexion
- **Bidirectionnel** : Reçu pour soi-même ET pour les autres utilisateurs

### Message privé reçu (lignes 62-72)
```c
/**
** @brief Must be called when the current logged user receives a private message
** @param user_uuid The id of the user that sent the private message
** @param message_body The body of the private message
**
** Commands:
** /send "user_uuid" "message_body"
**/
int client_event_private_message_received(
    char const *user_uuid,
    char const *message_body);
```

### Analyse détaillée
- **Réception uniquement** : Pour les messages reçus (pas envoyés)
- **Notification temps réel** : Message reçu immédiatement

### Réponse reçue (lignes 74-88)
```c
/**
** @brief Must be called when a new reply is posted in a thread
** @param team_uuid The id of the team this reply is in
** @param thread_uuid The id of the thread this reply is in
** @param user_uuid The id of the user that created the reply
** @param reply_body The reply body
**
** Commands:
** /create "reply_body"
**/
int client_event_thread_reply_received(
    char const *team_uuid,
    char const *thread_uuid,
    char const *user_uuid,
    char const *reply_body);
```

### Analyse détaillée
- **Notification de nouvelle réponse** : Dans une discussion suivie
- **Contexte complet** : Inclut team_uuid pour la permission

### Équipe créée (lignes 90-103)
```c
/**
** @brief Must be called when a new team is created
** Every logged user should receive this event (the creator of the team too)
** @param team_uuid The id of the created team
** @param team_name The name of the created team
** @param team_description The description of the created team
**
** Commands:
** /create "team_name" "team_description"
**/
int client_event_team_created(
    char const *team_uuid,
    char const *team_name,
    char const *team_description);
```

### Analyse détaillée
- **Global** : Tous les utilisateurs connectés reçoivent cet événement
- **Créateur inclus** : Même le créateur reçoit l'événement

### Canal créé (lignes 105-117)
```c
/**
** @brief Must be called when a channel is created inside of a team
** @param channel_uuid The id of the created channel
** @param channel_name The name of the created channel
** @param channel_description The description of the created channel
**
** Commands:
** /create "channel_name" "channel_description"
**/
int client_event_channel_created(
    char const *channel_uuid,
    char const *channel_name,
    char const *channel_description);
```

### Analyse détaillée
- **Abonnés uniquement** : Seuls les abonnés à l'équipe reçoivent cet événement

### Discussion créée (lignes 119-135)
```c
/**
** @brief Must be called when a thread is created inside of a channel
** @param thread_uuid The id of the created thread
** @param user_uuid The id of the user who created the thread
** @param thread_timestamp The unix timestamp of the thread creation
** @param thread_title The title of the created thread
** @param thread_body The body of the created thread
**
** Commands:
** /create "thread_title" "thread_body"
**/
int client_event_thread_created(
    char const *thread_uuid,
    char const *user_uuid,
    time_t thread_timestamp,
    char const *thread_title,
    char const *thread_body);
```

### Analyse détaillée
- **Timestamp inclus** : Pour l'ordre chronologique
- **Abonnés uniquement** : Seuls les abonnés à l'équipe reçoivent

## Fonctions d'affichage de listes (sans "event")

### Liste d'utilisateurs (lignes 137-154)
```c
/**
** @brief Must be called when you requested a list of users from the server
** ex: asking the subscribed users to a team / the list of users in a domain
** This function should be called once per user in the list
** This function should be called even if the list only has one entry
** @param user_uuid The id of a user
** @param user_name The name of a user
** @param user_status The status of a user (0: not connected; 1: connected)
** user_status is NOT the number of simultaneous connexion of a user
**
** Commands:
** /users
** /subscribed "team_uuid"
**/
int client_print_users(
    char const *user_uuid,
    char const *user_name,
    int user_status);
```

### Analyse détaillée
- **Appel par utilisateur** : Une fois par utilisateur dans la liste
- **Status binaire** : 0 = déconnecté, 1 = connecté
- **Multiple usages** : Liste globale ou abonnés d'équipe

### Liste d'équipes (lignes 156-172)
```c
/**
** @brief Must be called when you requested a list of teams from the server
** ex: asking the teams you are subscribed to or the available teams in a domain
** This function should be called once per team in the list
** This function should be called even if the list only has one entry
** @param team_uuid The id of a team
** @param team_name The name of a team
** @param team_description The description of a team
**
** Commands:
** /list
** /subscribed
**/
int client_print_teams(
    char const *team_uuid,
    char const *team_name,
    char const *team_description);
```

### Analyse détaillée
- **Contexte dépendant** : Équipes disponibles ou équipes abonnées

### Liste de canaux (lignes 174-189)
```c
/**
** @brief Must be called when you requested a list of channels from the server
** ex: asking the channels in a team
** This function should be called one per channel in the list
** This function should be called even if the list only has one entry
** @param channel_uuid The id of a channel
** @param channel_name The name of a channel
** @param channel_description The description of a channel
**
** Commands:
** /list
**/
int client_team_print_channels(
    char const *channel_uuid,
    char const *channel_name,
    char const *channel_description);
```

### Analyse détaillée
- **Préfixe "team_"** : Spécifique au contexte d'équipe

### Liste de discussions (lignes 191-210)
```c
/**
** @brief Must be called when you requested a list of threads from the server
** ex: asking the threads in a channel
** This function should be called one per thread in the list
** This function should be called even if the list only has one entry
** @param thread_uuid The id of a thread
** @param user_uuid The id of the user who created a thread
** @param thread_timestamp The unix timestamp of a thread creation
** @param thread_title The title of a thread
** @param thread_body The body of a thread
**
** Commands:
** /list
**/
int client_channel_print_threads(
    char const *thread_uuid,
    char const *user_uuid,
    time_t thread_timestamp,
    char const *thread_title,
    char const *thread_body);
```

### Analyse détaillée
- **Préfixe "channel_"** : Spécifique au contexte de canal
- **Informations complètes** : Inclut créateur et timestamp

### Liste de réponses (lignes 212-229)
```c
/**
** @brief Must be called when you requested a list of replies from the server
** ex: asking the replies in a thread
** This function should be called one per reply in the list
** This function should be called even if the list only has one entry
** @param thread_uuid The id of the thread a reply belongs to
** @param user_uuid The id of the user who created a reply
** @param reply_timestamp The unix timestamp of a reply creation
** @param reply_body The body of a reply
**
** Commands:
** /list
**/
int client_thread_print_replies(
    char const *thread_uuid,
    char const *user_uuid,
    time_t reply_timestamp,
    char const *reply_body);
```

### Analyse détaillée
- **Préfixe "thread_"** : Spécifique au contexte de discussion
- **Contexte thread_uuid** : Pour savoir à quelle discussion appartient la réponse

### Liste de messages privés (lignes 231-246)
```c
/**
** @brief Must be called when you requested a list of private messages
** ex: asking the private messages with a user
** This function should be called one per private  message in the list
** This function should be called even if the list only has one entry
** @param sender_uuid The id of the user who sent a private message
** @param message_timestamp The unix timestamp of a private message creation
** @param message_body The content of a private message
**
** Commands:
** /messages "user_uuid"
**/
int client_private_message_print_messages(
    char const *sender_uuid,
    time_t message_timestamp,
    char const *message_body);
```

### Analyse détaillée
- **Préfixe "private_message_"** : Spécifique aux messages privés
- **Conversation complète** : Messages envoyés ET reçus

## Fonctions d'erreur

### Erreur équipe inconnue (lignes 248-263)
```c
/**
** @brief Must be called when the user try to do an action
** with a team that does not exist (list channels, subscribe, etc...)
** @param team_uuid The id that was given and does not exist
**
** Commands:
** /subscribe "team_uuid"
** /unsubscribe "team_uuid"
** /subscribed "team_uuid"
** /list
** /create "channel_name" "channel_description"
** /create "thread_title" "thread_body"
** /create "reply_body"
** /info
**/
int client_error_unknown_team(char const *team_uuid);
```

### Analyse détaillée
- **UUID invalide** : L'équipe spécifiée n'existe pas
- **Commandes affectées** : Toutes les commandes qui nécessitent une équipe

### Erreur canal inconnu (lignes 265-276)
```c
/**
** @brief Must be called when the user try to do an action
** with a channel that does not exist (list threads, create thread, etc...)
** @param channel_uuid The id that was given and does not exist
**
** Commands:
** /list
** /create "thread_title" "thread_body"
** /create "reply_body"
** /info
**/
int client_error_unknown_channel(char const *channel_uuid);
```

### Analyse détaillée
- **UUID invalide** : Le canal spécifié n'existe pas

### Erreur discussion inconnue (lignes 278-288)
```c
/**
** @brief Must be called when the user try to do an action
** with a thread that does not exist (list replies, create reply, etc...)
** @param thread_uuid The id that was given and does not exist
**
** Commands:
** /list
** /create "reply_body"
** /info
**/
int client_error_unknown_thread(char const *thread_uuid);
```

### Analyse détaillée
- **UUID invalide** : La discussion spécifiée n'existe pas

### Erreur utilisateur inconnu (lignes 290-300)
```c
/**
** @brief Must be called when the user try to do an action
** with a user that does not exist (send private message, /user)
** @param user_uuid The id that was given and does not exist
**
** Commands:
** /send "user_uuid" "message_body"
** /user "user_uuid"
** /messages "user_uuid"
**/
int client_error_unknown_user(char const *user_uuid);
```

### Analyse détaillée
- **UUID invalide** : L'utilisateur spécifié n'existe pas

### Erreur non autorisé (lignes 302-311)
```c
/**
** @brief Must be called when the user try to do an action he is not allowed
** to perform.
** Ex: create a thread in a team he is not subscribed
** Ex: create a team when he is not logged in
**
** Commands:
** Everything except /login
**/
int client_error_unauthorized(void);
```

### Analyse détaillée
- **Permissions insuffisantes** : Action non autorisée
- **Exemples** : Non connecté, non abonné, etc.

### Erreur déjà existant (lignes 313-324)
```c
/**
** @brief Must be called when the user try to do an action and the resource
** already exist.
** Ex: create a team with a name that already exist
** This error based itself on the name/title of the object created
**
** Commands:
** /create "team_name" "team_description"
** /create "channel_name" "channel_description"
** /create "thread_title" "thread_body"
**/
int client_error_already_exist(void);
```

### Analyse détaillée
- **Conflit de noms** : Ressource avec même nom/titre existe déjà
- **Basé sur le nom** : Pas sur l'UUID

## Fonctions d'affichage d'informations individuelles

### Utilisateur (lignes 326-340)
```c
/**
** @brief Must be called when you requested an individual user
** ex: get the current logged user, get information about a user
** @param user_uuid The id of the user
** @param user_name The name of the user
** @param user_status The status of the user (0: not connected; 1: connected)
**
** Commands:
** /user "user_uuid"
** /info
**/
int client_print_user(
    char const *user_uuid,
    char const *user_name,
    int user_status);
```

### Équipe (lignes 342-355)
```c
/**
** @brief Must be called when you requested an individual team
** ex: get the current used team
** @param team_uuid The id of the team
** @param team_name The name of the team
** @param team_description The description of the team
**
** Commands:
** /info
**/
int client_print_team(
    char const *team_uuid,
    char const *team_name,
    char const *team_description);
```

### Canal (lignes 357-370)
```c
/**
** @brief Must be called when you requested an individual channel
** ex: get the current used channel
** @param channel_uuid The id of the channel
** @param channel_name The name of the channel
** @param channel_description The description of the channel
**
** Commands:
** /info
**/
int client_print_channel(
    char const *channel_uuid,
    char const *channel_name,
    char const *channel_description);
```

### Discussion (lignes 372-389)
```c
/**
** @brief Must be called when you requested an individual thread
** ex: get the current used thread
** @param thread_uuid The id of the thread
** @param user_uuid The id of the user who created the thread
** @param thread_timestamp The unix timestamp of the creation of the thread
** @param thread_title The title of the thread
** @param thread_body The body of the thread
**
** Commands:
** /info
**/
int client_print_thread(
    char const *thread_uuid,
    char const *user_uuid,
    time_t thread_timestamp,
    char const *thread_title,
    char const *thread_body);
```

## Fonctions de confirmation de création

### Équipe créée (lignes 391-403)
```c
/**
** @brief Must be called when you create a team successfully
** @param team_uuid The id of the team that was created
** @param team_name The name of the team that was created
** @param team_description The description of the team that was created
**
** Commands:
** /create "team_name" "team_description"
**/
int client_print_team_created(
    char const *team_uuid,
    char const *team_name,
    char const *team_description);
```

### Canal créé (lignes 405-417)
```c
/**
** @brief Must be called when you create channel successfully
** @param channel_uuid The id of the channel that was created
** @param channel_name The name of the channel that was created
** @param channel_description The description of the channel that was created
**
** Commands:
** /create "channel_name" "channel_description"
**/
int client_print_channel_created(
    char const *channel_uuid,
    char const *channel_name,
    char const *channel_description);
```

### Discussion créée (lignes 419-435)
```c
/**
** @brief Must be called when you create a thread successfully
** @param thread_uuid The id of the thread that was created
** @param user_uuid The id of the user who created the thread
** @param thread_timestamp The unix timestamp of the thread creation
** @param thread_title The title of the thread that was created
** @param thread_body The body of the thread that was created
**
** Commands:
** /create "thread_title" "thread_body"
**/
int client_print_thread_created(
    char const *thread_uuid,
    char const *user_uuid,
    time_t thread_timestamp,
    char const *thread_title,
    char const *thread_body);
```

### Réponse créée (lignes 437-451)
```c
/**
** @brief Must be called when you create a reply successfully
** @param thread_uuid The id of the thread this reply was created in
** @param user_uuid The id of the user who created the reply
** @param reply_timestamp The unix timestamp of the created reply
** @param reply_body The body of the reply
**
** Commands:
** /create "reply_body"
**/
int client_print_reply_created(
    char const *thread_uuid,
    char const *user_uuid,
    time_t reply_timestamp,
    char const *reply_body);
```

## Fonctions d'abonnement

### Abonnement réussi (lignes 453-461)
```c
/**
** @brief Must be called when you subscribe to a team successfully
** @param user_uuid The id of the user who subscribed to the team
** @param team_uuid The id of the team the user subscribed to
**
** Commands:
** /subscribe "team_uuid"
**/
int client_print_subscribed(char const *user_uuid, char const *team_uuid);
```

### Désabonnement réussi (lignes 463-471)
```c
/**
** @brief Must be called when you unsubscribe from a team successfully
** @param user_uuid The id of the user who unsubscribed from the team
** @param team_uuid The id of the team the user unsubscribed from
**
** Commands:
** /unsubscribe "team_uuid"
**/
int client_print_unsubscribed(char const *user_uuid, char const *team_uuid);
```

## Architecture et design

### Catégories de fonctions

#### **1. Événements (event_)**
- **Réception passive** : Non initiés par le client
- **Notifications temps réel** : Messages, créations par d'autres
- **Permissions** : Login/abonnement requis

#### **2. Affichage de listes (print_)**
- **Réponses actives** : Initiées par le client
- **Itération** : Appelé une fois par élément
- **Contexte** : Préfixes selon le contexte (team_, channel_, thread_)

#### **3. Erreurs (error_)**
- **Gestion d'erreurs** : Ressources inexistantes, permissions
- **Informations** : UUID invalide pour debugging

#### **4. Informations individuelles (print_)**
- **Réponses spécifiques** : Un seul élément
- **Complètes** : Toutes les informations disponibles

#### **5. Confirmations (print_*_created)**
- **Actions réussies** : Confirmation de création
- **Feedback utilisateur** : Action terminée avec succès

#### **6. Abonnements (print_*)**
- **Actions de groupe** : Subscribe/unsubscribe
- **Feedback** : Confirmation de l'action

### Conventions de nommage

#### **Pattern événementiel**
```
client_event_<entity>_<action>()
```

#### **Pattern d'affichage**
```
client_[context_]print_<entity>[_<action>]()
```

#### **Pattern d'erreur**
```
client_error_<problem>()
```

### Flux de communication

#### **Événements**
```
Action d'un autre → Serveur → client_event_*() → UI
```

#### **Réponses**
```
Commande client → Serveur → client_print_*() → UI
```

#### **Erreurs**
```
Commande invalide → Serveur → client_error_*() → UI
```

## Conclusion

Ce header définit une interface client complète et bien structurée avec :
- **Séparation claire** entre événements et réponses
- **Permissions hiérarchiques** (login → abonnement → contexte)
- **Documentation exhaustive** avec exemples et commandes
- **Interface cohérente** avec des conventions de nommage uniformes
- **Gestion complète** des erreurs et confirmations
- **Support temps réel** pour les notifications

L'architecture événementielle permet une expérience utilisateur réactive et intuitive tout en maintenant une séparation claire entre les actions initiées et les événements reçus.
