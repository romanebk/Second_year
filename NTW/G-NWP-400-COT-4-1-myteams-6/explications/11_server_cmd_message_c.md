# Analyse détaillée de `src/server/cmd_message.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_message
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les commandes liées aux messages privés.

## Inclusion (ligne 8)
```c
#include "../../include/server.h"
```
- **Ligne 8** : Inclusion du header principal du serveur.

## Fonction utilitaire de validation (lignes 10-21)
```c
static int check_auth(client_t *client, int arg_count, int expected)
{
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return 0;
    }
    if (arg_count != expected) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return 0;
    }
    return 1;
}
```

### Analyse détaillée
- **Ligne 10** : `static` - fonction locale à ce fichier
- **Paramètres** :
  - `client` : Client effectuant l'action
  - `arg_count` : Nombre d'arguments reçus
  - `expected` : Nombre d'arguments attendus
- **Lignes 12-15** : Vérification d'authentification
  - **Code 401** : Not logged in
- **Lignes 16-19** : Validation du nombre d'arguments
  - **Code 400** : Bad Request si mauvais nombre
- **Ligne 20** : Retour 1 si tout est valide

### Pourquoi cette fonction ?
- **Combinaison** : Vérifie authentification ET arguments en un appel
- **Réutilisabilité** : Utilisée par SEND et MESSAGES
- **Simplicité** : Réduit le code dupliqué

## Fonction utilitaire de slot libre (lignes 23-32)
```c
static message_t *get_free_slot(server_t *server)
{
    int i = 0;

    for (i = 0; i < MAX_MESSAGES; i++) {
        if (server->messages[i].sender_uuid[0] == '\0')
            return &server->messages[i];
    }
    return NULL;
}
```

### Analyse détaillée
- **Ligne 23** : `static` - fonction locale à ce fichier
- **Paramètre** : `server` - Structure serveur
- **Lignes 27-30** : Recherche linéaire d'un slot libre
  - **Condition** : `sender_uuid[0] == '\0'` indique un slot vide
  - **Retour** : Pointeur vers le slot trouvé
- **Ligne 31** : Retour NULL si aucun slot trouvé

### Pourquoi cette implémentation ?
- **Gestion mémoire** : Utilise un tableau statique avec slots réutilisables
- **Marquage** : Un sender_uuid vide indique un slot disponible
- **Simplicité** : Pas de malloc/free, gestion par index

## Fonction utilitaire d'échange (lignes 34-40)
```c
static int is_exchange(message_t *msg, const char *a, const char *b)
{
    return (strcmp(msg->sender_uuid, a) == 0 &&
        strcmp(msg->receiver_uuid, b) == 0) ||
        (strcmp(msg->sender_uuid, b) == 0 &&
        strcmp(msg->receiver_uuid, a) == 0);
}
```

### Analyse détaillée
- **Ligne 34** : `static` - fonction locale à ce fichier
- **Paramètres** :
  - `msg` : Message à vérifier
  - `a`, `b` : Deux UUIDs d'utilisateurs
- **Logique** : Vérifie si le message est un échange entre a et b
  - **Cas 1** : a est expéditeur ET b est destinataire
  - **Cas 2** : b est expéditeur ET a est destinataire
- **Retour** : 1 si c'est un échange entre les deux utilisateurs

### Pourquoi cette fonction ?
- **Symétrie** : Les messages privés sont bidirectionnels
- **Conversation** : Permet de récupérer toute une conversation
- **Efficacité** : Une seule fonction pour les deux directions

## Fonction utilitaire de notification (lignes 42-54)
```c
static void notify_receiver(server_t *server, client_t *sender,
    const char *receiver_uuid, const char *body)
{
    char event[BUF_SIZE] = {0};
    client_t *target = find_client_by_uuid(server, receiver_uuid);

    if (!target)
        return;
    snprintf(event, BUF_SIZE,
        "706 {\"uuid\":\"%s\",\"body\":\"%s\"}\r\n",
        sender->user->uuid, body);
    write(target->fd, event, strlen(event));
}
```

### Analyse détaillée
- **Ligne 42** : `static` - fonction locale à ce fichier
- **Paramètres** :
  - `server` : Structure serveur
  - `sender` : Client qui envoie le message
  - `receiver_uuid` : UUID du destinataire
  - `body` : Corps du message
- **Ligne 46** : Recherche du client destinataire
- **Lignes 48-49** : Si le destinataire n'est pas connecté, ignore
- **Lignes 50-53** : Construction et envoi de l'événement
  - **Code 706** : Événement de message privé reçu
  - **Format JSON** : UUID de l'expéditeur et corps du message

### Pourquoi cette implémentation ?
- **Temps réel** : Notification immédiate si le destinataire est connecté
- **Silencieux** : Pas d'erreur si le destinataire est déconnecté
- **Simplicité** : Message perdu si destinataire offline (stocké pour MESSAGES)

## Commande SEND (lignes 56-80)
```c
void myteams_server_cmd_send(client_t *client, char **args,
    int arg_count, server_t *server)
{
    message_t *slot = NULL;

    if (!check_auth(client, arg_count, 2))
        return;
    if (!find_user_by_uuid(server, args[0])) {
        write(client->fd, "404 User not found.\r\n", 21);
        return;
    }
    slot = get_free_slot(server);
    if (!slot) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    strncpy(slot->sender_uuid, client->user->uuid, UUID_LEN);
    strncpy(slot->receiver_uuid, args[0], UUID_LEN);
    strncpy(slot->body, args[1], MAX_BODY_LENGTH);
    slot->timestamp = time(NULL);
    server_event_private_message_sended(client->user->uuid,
        args[0], args[1]);
    write(client->fd, "217 Message sent.\r\n", 19);
    notify_receiver(server, client, args[0], args[1]);
}
```

### Analyse détaillée ligne par ligne

#### **Ligne 61** : Validation combinée
- **`check_auth()`** : Vérifie authentification ET arg_count = 2
- **Arguments attendus** : receiver_uuid, message_body

#### **Lignes 63-66** : Validation du destinataire
- **`find_user_by_uuid()`** : Vérifie que l'utilisateur destinataire existe
- **Code 404** : Not Found si l'utilisateur n'existe pas

#### **Lignes 67-71** : Gestion de la capacité
- **`get_free_slot()`** : Recherche un slot disponible pour le message
- **Code 500** : Server Internal Error si plus de place

#### **Lignes 72-75** : Création du message
- **Ligne 72** : Enregistrement de l'expéditeur (UUID de l'utilisateur connecté)
- **Ligne 73** : Enregistrement du destinataire
- **Ligne 74** : Copie sécurisée du corps du message
- **Ligne 75** : Horodatage du message

#### **Lignes 76-77** : Logging système
- **`server_event_private_message_sended()`** : Journalisation de l'envoi
- **Arguments** : sender_uuid, receiver_uuid, message_body

#### **Ligne 78** : Confirmation à l'expéditeur
- **Code 217** : Information sur le message envoyé
- **Format** : "217 Message sent."

#### **Ligne 79** : Notification temps réel
- **`notify_receiver()`** : Envoie le message au destinataire si connecté

### Pourquoi cette implémentation ?
- **Validation complète** : Destinataire doit exister
- **Stockage** : Message sauvegardé même si destinataire offline
- **Notification** : Livraison immédiate si possible
- **Traçabilité** : Logging pour audit et debugging

## Commande MESSAGES (lignes 82-107)
```c
void myteams_server_cmd_messages(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    if (!check_auth(client, arg_count, 1))
        return;
    if (!find_user_by_uuid(server, args[0])) {
        write(client->fd, "404 User not found.\r\n", 21);
        return;
    }
    for (i = 0; i < server->message_count; i++) {
        if (!is_exchange(&server->messages[i],
            client->user->uuid, args[0]))
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"sender\":\"%s\",\"body\":\"%s\","
            "\"timestamp\":%ld}\r\n",
            server->messages[i].sender_uuid,
            server->messages[i].body,
            (long)server->messages[i].timestamp);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of messages.\r\n", 22);
}
```

### Analyse détaillée
- **Ligne 88** : Validation combinée (authentification + arg_count = 1)
- **Lignes 90-93** : Validation de l'existence de l'utilisateur cible
- **Lignes 94-105** : Boucle sur tous les messages
  - **Ligne 95** : `is_exchange()` - Filtre les messages entre les deux utilisateurs
  - **Code 210** : Information message
  - **Format JSON** : expéditeur, corps, timestamp
- **Ligne 106** : Marqueur de fin de liste (code 211)

### Pourquoi cette implémentation ?
- **Conversation complète** : Affiche TOUS les messages entre les deux utilisateurs
- **Bidirectionnel** : Inclut les messages envoyés ET reçus
- **Chronologique** : Les messages sont dans l'ordre de création (tableau)
- **Cohérence** : Même format JSON que les autres listages

## Architecture des messages privés

### Cycle de vie d'un message
```
SEND → [stockage] → [notification] → MESSAGES → [lecture]
  ↓        ↓           ↓            ↓          ↓
envoi   sauvegarde   temps réel    listage   affichage
```

### Modèle de conversation
- **Bidirectionnel** : Une conversation entre deux utilisateurs
- **Persistant** : Messages stockés même si destinataire offline
- **Temps réel** : Notification immédiate si possible
- **Historique** : Récupération complète de la conversation

### Gestion de la mémoire
- **Tableau statique** : `messages[MAX_MESSAGES]`
- **Slots réutilisables** : Marqués par `sender_uuid[0] == '\0'`
- **Capacité limitée** : Protection contre les débordements

### Codes de réponse spécifiques
- **210** : Message information
- **211** : End of messages list
- **217** : Message sent
- **404** : User not found
- **500** : Server full (messages)

### Événements système
- **706** : Private message received (notification destinataire)
- **server_event_private_message_sended()** : Logging envoi

## Sécurité et Validation

1. **Authentification** : Toutes les commandes nécessitent d'être connecté
2. **Existence** : Vérification que les destinataires existent
3. **Capacité** : Limite sur le nombre de messages stockés
4. **Bounds checking** : Validation de la longueur des corps de messages
5. **Contrôle d'accès** : On ne peut voir que ses propres conversations

## Performance et Optimisations

1. **Tableau statique** : Pas d'allocation dynamique
2. **Recherche linéaire** : Suffisante pour MAX_MESSAGES = 1000
3. **Slots réutilisables** : Gestion mémoire efficace
4. **Notification ciblée** : Un seul destinataire notifié
5. **Filtrage efficace** : `is_exchange()` pour les conversations

## Conception et Architecture

### Modèle de communication
- **Un-à-un** : Messages privés entre deux utilisateurs uniquement
- **Asynchrone** : Messages stockés si destinataire offline
- **Temps réel** : Notification immédiate si destinataire connecté
- **Persistant** : Historique complet conservé

### Gestion des états
- **Connecté/Déconnecté** : Notification uniquement si connecté
- **Stockage** : Messages persistants indépendamment de l'état
- **Récupération** : Historique complet disponible à tout moment

### Sécurité des conversations
- **Isolation** : Chaque conversation est privée
- **Accès** : Seuls les participants peuvent voir les messages
- **Validation** : Destinataire doit exister pour éviter les messages orphelins

## Conclusion

Ce fichier implémente un système de messagerie privée robuste avec :
- **Communication un-à-un** sécurisée et isolée
- **Stockage persistant** des messages avec horodatage
- **Notification temps réel** si le destinataire est connecté
- **Récupération complète** de l'historique des conversations
- **Gestion mémoire efficace** avec slots réutilisables
- **Validation stricte** à tous les niveaux

L'approche bidirectionnelle avec `is_exchange()` permet une gestion naturelle des conversations où chaque participant peut voir tous les messages échangés, indépendamment de qui les a envoyés.
