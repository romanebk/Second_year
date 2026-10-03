# Analyse détaillée de `libs/myteams/logging_server.h`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, XXXX
** NWP_myteams_XXXX
** File description:
** a file containing libs functions that should be called in myteams_server
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les fonctions de logging pour le serveur.

## Protection d'inclusion (lignes 8-9)
```c
#ifndef LIB_MYTEAMS_LOGGING_SERVER_H
#define LIB_MYTEAMS_LOGGING_SERVER_H
```
- **Ligne 8** : Protection contre les inclusions multiples
- **Ligne 9** : Définition du guard pour éviter les inclusions futures

## Commentaire architectural (lignes 11-13)
```c
/*
** As the server never initialize an action all function here are called events
*/
```
- **Ligne 12** : Commentaire important expliquant la philosophie du logging
- **Concept** : Le serveur ne fait qu'initier des actions, les fonctions de logging sont des "événements"

## Événements de création

### Création d'équipe (lignes 15-27)
```c
/**
** @brief Must be called when a new team is created
** @param team_uuid The id of the team that was created
** @param team_name The name of the team that was created
** @param user_uuid The id of the user who created the new team
**
** Commands:
** /create "team_name" "team_description"
**/
int server_event_team_created(
    char const *team_uuid,
    char const *team_name,
    char const *user_uuid);
```

### Analyse détaillée
- **Purpose** : Logging de la création d'une nouvelle équipe
- **Paramètres** :
  - `team_uuid` : UUID de l'équipe créée
  - `team_name` : Nom de l'équipe
  - `user_uuid` : UUID du créateur
- **Commande associée** : `/create "team_name" "team_description"`
- **Retour** : int (probablement 0 pour succès, erreur pour échec)

### Création de canal (lignes 29-41)
```c
/**
** @brief Must be called when a new channel is created
** @param team_uuid The id of the team this channel is in
** @param channel_uuid The id of the created channel
** @param channel_name The name of the new channel
**
** Commands:
** /create "channel_name" "channel_description"
**/
int server_event_channel_created(
    char const *team_uuid,
    char const *channel_uuid,
    char const *channel_name);
```

### Analyse détaillée
- **Purpose** : Logging de la création d'un nouveau canal
- **Paramètres** :
  - `team_uuid` : UUID de l'équipe parente
  - `channel_uuid` : UUID du canal créé
  - `channel_name` : Nom du canal
- **Commande associée** : `/create "channel_name" "channel_description"`

### Création de discussion (lignes 43-59)
```c
/**
** @brief Must be called when a new thread is created
** @param channel_uuid The id of the channel this thread was created in
** @param thread_uuid The id of the created thread
** @param user_uuid The id of the user who created the thread
** @param thread_title The title of the created thread
** @param thread_body The body of the created thread
**
** Commands:
** /create "thread_title" "thread_body"
**/
int server_event_thread_created(
    char const *channel_uuid,
    char const *thread_uuid,
    char const *user_uuid,
    char const *thread_title,
    char const *thread_body);
```

### Analyse détaillée
- **Purpose** : Logging de la création d'une nouvelle discussion
- **Paramètres** :
  - `channel_uuid` : UUID du canal parent
  - `thread_uuid` : UUID de la discussion créée
  - `user_uuid` : UUID du créateur
  - `thread_title` : Titre de la discussion
  - `thread_body** : Corps du message initial
- **Commande associée** : `/create "thread_title" "thread_body"`

### Création de réponse/commentaire (lignes 61-73)
```c
/**
** @brief Must be called when a new reply is created in a thread
** @param thread_uuid The id of the thread this message was created in
** @param user_uuid The id of the user who created the reply
** @param reply_body The body of the created reply
**
** Commands:
** /create "reply_body"
**/
int server_event_reply_created(
    char const *thread_uuid,
    char const *user_uuid,
    char const *reply_body);
```

### Analyse détaillée
- **Purpose** : Logging de la création d'une nouvelle réponse
- **Paramètres** :
  - `thread_uuid` : UUID de la discussion parente
  - `user_uuid` : UUID de l'auteur
  - `reply_body` : Corps de la réponse
- **Commande associée** : `/create "reply_body"`

## Événements d'abonnement

### Abonnement utilisateur (lignes 75-83)
```c
/**
** @brief Must be called when a user subscribe to a team
** @param team_uuid The id of the subscribed team
** @param user_uuid The id of the subscribed user
**
** Commands:
** /subscribe "team_uuid"
**/
int server_event_user_subscribed(char const *team_uuid, char const *user_uuid);
```

### Analyse détaillée
- **Purpose** : Logging de l'abonnement d'un utilisateur à une équipe
- **Paramètres** :
  - `team_uuid` : UUID de l'équipe
  - `user_uuid` : UUID de l'utilisateur
- **Commande associée** : `/subscribe "team_uuid"`

### Désabonnement utilisateur (lignes 85-93)
```c
/**
** @brief Must be called when a user unsubscribe from a team
** @param team_uuid The id of the unsubscribed team
** @param user_uuid The id of the unsubscribed user
**
** Commands:
** /unsubscribe "team_uuid"
**/
int server_event_user_unsubscribed(char const *team_uuid, char const *user_uuid);
```

### Analyse détaillée
- **Purpose** : Logging du désabonnement d'une équipe
- **Paramètres** :
  - `team_uuid` : UUID de l'équipe
  - `user_uuid` : UUID de l'utilisateur
- **Commande associée** : `/unsubscribe "team_uuid"`

## Événements utilisateur

### Création utilisateur (lignes 95-103)
```c
/**
** @brief Must be called when a user didn't existed in save and was created
** @param user_uuid The id of the user that was created
** @param user_name The name of the user that was created
**
** Commands:
** /login "user_name"
**/
int server_event_user_created(char const *user_uuid, char const *user_name);
```

### Analyse détaillée
- **Purpose** : Logging de la création d'un nouvel utilisateur
- **Note importante** : Uniquement quand l'utilisateur n'existait pas dans la sauvegarde
- **Paramètres** :
  - `user_uuid` : UUID de l'utilisateur créé
  - `user_name` : Nom de l'utilisateur
- **Commande associée** : `/login "user_name"`

### Chargement utilisateur (lignes 105-115)
```c
/**
** @brief Must be called when a user was loaded from the save file
** Should be called at the start of the server once per user loaded
** It should display all users that were saved
** @param user_uuid The id of the saved user
** @param user_name The name of the saved user
**
** Commands:
** None, should be used at server start
**/
int server_event_user_loaded(char const *user_uuid, char const *user_name);
```

### Analyse détaillée
- **Purpose** : Logging du chargement d'un utilisateur depuis la sauvegarde
- **Timing** : Appelé au démarrage du serveur pour chaque utilisateur chargé
- **Paramètres** :
  - `user_uuid` : UUID de l'utilisateur chargé
  - `user_name` : Nom de l'utilisateur chargé
- **Commande associée** : Aucune (utilisé au démarrage)

### Login utilisateur (lignes 117-124)
```c
/**
** @brief Must be called when a user logged in
** @param user_uuid The id of the user that logged in
**
** Commands:
** /login
**/
int server_event_user_logged_in(char const *user_uuid);
```

### Analyse détaillée
- **Purpose** : Logging de la connexion d'un utilisateur
- **Note** : Différent de la création (utilisateur existant qui se connecte)
- **Paramètres** :
  - `user_uuid` : UUID de l'utilisateur qui se connecte
- **Commande associée** : `/login`

### Logout utilisateur (lignes 126-134)
```c
/**
** @brief Must be called when a user logged out
** @param user_uuid The id of the user that logged out
**
** Commands:
** /logout
** When a user lost connexion to the server
**/
int server_event_user_logged_out(char const *user_uuid);
```

### Analyse détaillée
- **Purpose** : Logging de la déconnexion d'un utilisateur
- **Note** : Appelé pour logout explicite et perte de connexion
- **Paramètres** :
  - `user_uuid` : UUID de l'utilisateur qui se déconnecte
- **Commande associée** : `/logout`

## Événements de messagerie

### Message privé envoyé (lignes 136-148)
```c
/**
** @brief Must be called when a private message was sent between users
** @param sender_uuid The id of the user that sent the message
** @param receiver_uuid The if of the user that receive the message
** @param message_body The message body
**
** Commands:
** /send "user_uuid" "message_body"
**/
int server_event_private_message_sended(
    char const *sender_uuid,
    char const *receiver_uuid,
    char const *message_body);
```

### Analyse détaillée
- **Purpose** : Logging de l'envoi d'un message privé
- **Paramètres** :
  - `sender_uuid` : UUID de l'expéditeur
  - `receiver_uuid` : UUID du destinataire
  - `message_body` : Corps du message
- **Commande associée** : `/send "user_uuid" "message_body"`

## Architecture du système de logging

### Catégories d'événements

#### **1. Événements de création**
- `server_event_team_created()` : Création d'équipe
- `server_event_channel_created()` : Création de canal
- `server_event_thread_created()` : Création de discussion
- `server_event_reply_created()` : Création de réponse

#### **2. Événements d'abonnement**
- `server_event_user_subscribed()` : Abonnement à équipe
- `server_event_user_unsubscribed()` : Désabonnement

#### **3. Événements utilisateur**
- `server_event_user_created()` : Création d'utilisateur
- `server_event_user_loaded()` : Chargement depuis sauvegarde
- `server_event_user_logged_in()` : Connexion
- `server_event_user_logged_out()` : Déconnexion

#### **4. Événements de messagerie**
- `server_event_private_message_sended()` : Message privé

### Philosophie de design

#### **Événements vs Actions**
- **Serveur** : Initie des actions (création, envoi, etc.)
- **Logging** : Enregistre ces actions comme des événements
- **Client** : Peut écouter ces événements pour mise à jour UI

#### **Timing des appels**
- **Création** : Immédiatement après l'action réussie
- **Chargement** : Au démarrage du serveur
- **Connexion/Déconnexion** : Après validation de l'action

### Conventions de nommage

#### **Pattern uniforme**
```
server_event_<entity>_<action>(<params>)
```

#### **Entités**
- `team` : Équipes
- `channel` : Canaux
- `thread` : Discussions
- `user` : Utilisateurs
- `reply` : Réponses (commentaires)
- `private_message` : Messages privés

#### **Actions**
- `created` : Création
- `subscribed` / `unsubscribed` : Abonnement
- `loaded` : Chargement
- `logged_in` / `logged_out` : Connexion
- `sended` : Envoi (note: faute de frappe pour "sent")

### Paramètres et types

#### **Types de paramètres**
- `char const *` : Chaînes constantes (UUIDs, noms, corps)
- `int` : Retour (probablement 0 pour succès)

#### **UUIDs systématiques**
- Chaque événement inclut les UUIDs concernés
- Permet l'identification unique et fiable
- Essentiel pour la traçabilité

#### **Noms et corps**
- Inclus pour l'affichage utilisateur
- Utiles pour le logging et debugging

### Intégration avec le serveur

#### **Points d'appel**
- **Après validation** : Une fois l'action validée
- **Avant réponse** : Avant d'envoyer la réponse au client
- **Dans les commandes** : Directement dans les fonctions de commandes

#### **Exemple d'intégration**
```c
// Dans cmd_team.c, après création réussie
server_event_team_created(t->uuid, t->name, client->user->uuid);
```

### Utilité pour le débogage

#### **Traçabilité**
- Chaque action est loggée avec ses participants
- Permet de suivre l'historique des actions
- Essentiel pour diagnostiquer les problèmes

#### **Audit**
- Enregistre qui a fait quoi et quand
- Permet l'analyse de l'utilisation du système
- Utile pour la sécurité

#### **Monitoring**
- Peut être connecté à un système de monitoring
- Permet de suivre l'activité du serveur
- Utile pour les métriques d'utilisation

## Conclusion

Ce header définit un système complet de logging serveur avec :
- **Événements structurés** pour toutes les actions importantes
- **Interface cohérente** avec des conventions de nommage uniformes
- **Documentation détaillée** avec les commandes associées
- **Architecture événementielle** adaptée au système client-serveur
- **Traçabilité complète** pour le débogage et l'audit

Le système permet une surveillance complète de toutes les activités du serveur tout en maintenant une interface simple et cohérente pour les développeurs.
