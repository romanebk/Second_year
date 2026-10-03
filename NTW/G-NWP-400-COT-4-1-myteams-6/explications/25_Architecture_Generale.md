# Architecture Générale du Projet MyTeams

## Vue d'ensemble

MyTeams est un système de messagerie d'équipe complet implémentant une architecture client-serveur avec des fonctionnalités de collaboration en temps réel. Le projet suit les standards EPITECH et utilise une approche modulaire avec une séparation claire des responsabilités.

## Architecture Globale

### Structure du projet
```
myteams/
├── include/           # Headers partagés
│   ├── server.h      # Structures et fonctions serveur
│   ├── client.h      # Structures et fonctions client
│   └── utils.h       # Utilitaires communs
├── src/
│   ├── server/       # Code source serveur (10 fichiers)
│   └── client/       # Code source client (8 fichiers)
├── libs/
│   └── myteams/      # Bibliothèque de logging
│       ├── logging_server.h
│       ├── logging_client.h
│       └── libmyteams.so
├── explications/     # Documentation détaillée
└── Makefile         # Système de build
```

### Flux de communication
```
Client CLI ←→ Réseau TCP/IP ←→ Serveur ←→ Persistance (fichier)
     ↓              ↓              ↓           ↓
   Interface     Protocole      Logique      Stockage
  utilisateur    MyTeams       métier       binaire
```

## Architecture Serveur

### Composants principaux

#### 1. Point d'entrée (`main.c`)
- **Validation des arguments** : Port et options
- **Initialisation** : Socket, signaux, structure serveur
- **Lancement** : Boucle principale du serveur

#### 2. Gestion réseau (`network.c`)
- **Multiplexage E/S** : `poll()` pour gérer multiples clients
- **Connexions** : Accepte et initialise les clients
- **Buffers** : Gère la communication réseau
- **Signaux** : Gestion propre de l'arrêt

#### 3. Dispatch des commandes (`commands.c`)
- **Parsing** : Extraction des arguments avec gestion des guillemets
- **Routing** : Table de correspondance commande → fonction
- **Contexte** : Commandes contextuelles (USE, CREATE, LIST, INFO)

#### 4. Modules de commandes
- **`cmd_user.c`** : LOGIN, LOGOUT, USERS, USER, HELP, QUIT
- **`cmd_team.c`** : TEAMS, TEAM, CREATE_TEAM, SUBSCRIBE, UNSUBSCRIBE, SUBSCRIBED
- **`cmd_channel.c`** : CHANNELS, CHANNEL, CREATE_CHANNEL
- **`cmd_thread.c`** : THREADS, THREAD, CREATE_THREAD, COMMENTS, CREATE_COMMENT
- **`cmd_message.c`** : SEND, MESSAGES

#### 5. Utilitaires (`data.c`, `save.c`)
- **Recherche** : Find par UUID/nom pour toutes les entités
- **Broadcast** : Diffusion globale et ciblée par équipe
- **Persistance** : Sauvegarde/chargement binaire

### Structures de données

#### Hiérarchie des entités
```
user_t → team_t → channel_t → thread_t → comment_t
  ↓        ↓          ↓          ↓          ↓
utilisateur  équipe      canal    discussion   réponse
```

#### Structures principales
```c
// Utilisateur
user_t {
    char uuid[UUID_LEN];     // Identifiant unique
    char name[MAX_NAME_LEN]; // Nom d'utilisateur
    bool is_logged_in;       // État de connexion
}

// Équipe
team_t {
    char uuid[UUID_LEN];           // Identifiant unique
    char name[MAX_NAME_LENGTH];    // Nom de l'équipe
    char description[MAX_DESC_LEN]; // Description
    char creator_uuid[UUID_LEN];   // UUID du créateur
}

// Client connecté
client_t {
    int fd;                      // Socket du client
    user_t *user;                // Utilisateur associé
    buffer_t buf;                // Buffer de communication
    char team_uuid[UUID_LEN];    // Contexte d'équipe
    char channel_uuid[UUID_LEN]; // Contexte de canal
    char thread_uuid[UUID_LEN];  // Contexte de discussion
}
```

### Cycle de vie d'une requête
```
Client → Socket → read() → buffer → process_buffer() → dispatch() → cmd_*() → response → write() → Client
   ↓        ↓        ↓         ↓              ↓            ↓           ↓           ↓
commande  réseau   lecture  parsing        routing     exécution   résultat   envoi
```

## Architecture Client

### Composants principaux

#### 1. Point d'entrée (`main.c`)
- **Validation** : Arguments IP/port
- **Connexion** : Création du socket et connexion au serveur
- **Lancement** : Boucle principale du client

#### 2. Réseau (`network.c`)
- **Connexion** : Socket TCP avec gestion d'erreurs
- **Multiplexage** : `poll()` pour stdin et socket serveur
- **Boucle** : Gère entrée utilisateur et réponses serveur

#### 3. Interface utilisateur (`commands.c`, `parser.c`)
- **Parsing** : Extraction d'arguments avec guillemets
- **Validation** : Format des commandes et arguments
- **Mapping** : Commandes utilisateur → protocole serveur

#### 4. Contexte (`context.c`)
- **Navigation** : Commandes USE, CREATE, LIST, INFO
- **Abonnements** : SUBSCRIBE, UNSUBSCRIBE, SUBSCRIBED
- **Intelligence** : Comportement selon le contexte courant

#### 5. Communication (`packet.c`, `response.c`)
- **Envoi** : Construction de paquets avec formatage printf-like
- **Réception** : Parsing des réponses JSON et dispatch
- **Affichage** : Interface utilisateur via fonctions de logging

#### 6. Utilitaires (`utils.c`)
- **Buffers** : Gestion des buffers réseau
- **JSON** : Parsing simple des réponses serveur

### État du client
```c
client_t {
    int fd;                      // Socket serveur
    bool logged;                 // État d'authentification
    char uuid[UUID_LEN];         // UUID de l'utilisateur
    char username[33];            // Nom d'utilisateur
    char team_uuid[UUID_LEN];    // Contexte d'équipe
    char channel_uuid[UUID_LEN]; // Contexte de canal
    char thread_uuid[UUID_LEN];  // Contexte de discussion
    buffer_t buf;                // Buffer réseau
    int pending_list_type;        // Type de liste attendue
}
```

### Navigation contextuelle
```
Pas de contexte → USE "team" → USE "team" "channel" → USE "team" "channel" "thread"
       ↓                ↓                    ↓                         ↓
    USER             TEAM                 CHANNEL                   THREAD
   /info           /info               /info                     /info
   TEAMS          CHANNELS            THREADS                   COMMENTS
 CREATE_TEAM    CREATE_CHANNEL      CREATE_THREAD            CREATE_COMMENT
```

## Protocole de Communication

### Format des messages
```
<code> <payload>\r\n
```

### Codes de réponse
- **200-219** : Succès et informations
- **400-409** : Erreurs client
- **700-706** : Événements serveur

### Exemples de communication
```
Client: LOGIN "username"
Serveur: 202 user_uuid "username"

Client: SEND "user_uuid" "Hello"
Serveur: 217 Message sent.

Client: LIST
Serveur: 210 {"uuid":"...","name":"..."}\r\n211 End of list.
```

## Système de Logging

### Architecture événementielle
```
Action serveur → server_event_*() → logging → client_event_*() → UI utilisateur
```

### Types d'événements
- **Création** : team_created, channel_created, thread_created, reply_created
- **Utilisateur** : user_created, user_logged_in, user_logged_out
- **Abonnement** : user_subscribed, user_unsubscribed
- **Messagerie** : private_message_sended, private_message_received

### Séparation événements/réponses
- **Événements** : Reçus passivement (autres utilisateurs)
- **Réponses** : Initiées par le client (ses propres actions)

## Persistance des Données

### Format de sauvegarde
```
Fichier binaire : myteams_save.dat
Structure séquentielle :
[count][array][count][array]...
```

### Données persistées
- **Utilisateurs** : UUID, nom, état de connexion
- **Équipes** : UUID, nom, description, créateur
- **Canaux** : UUID, nom, description, équipe parente
- **Discussions** : UUID, titre, corps, créateur, timestamp
- **Commentaires** : Corps, créateur, timestamp, hiérarchie
- **Messages** : Expéditeur, destinataire, corps, timestamp
- **Abonnements** : UUID utilisateur, UUID équipe

### Cycle de persistance
```
Démarrage → load_server() → restauration état → [exécution] → save_server() → Arrêt
```

## Sécurité et Permissions

### Modèle de permissions
```
Non connecté → Connecté → Abonné à équipe → Dans canal → Dans discussion
      ↓            ↓          ↓              ↓           ↓
    LOGIN       Toutes     Équipe         Canal      Discussion
   (aucune)    (lecture)   (écriture)    (écriture)  (écriture)
```

### Contrôle d'accès
- **Authentification** : LOGIN requis pour la plupart des actions
- **Abonnement** : Requis pour les opérations d'équipe
- **Contexte** : Validation de la hiérarchie pour les créations
- **Validation** : UUID et formats vérifiés

### Gestion d'erreurs
- **Codes HTTP standard** : 400, 401, 403, 404, 409, 500
- **Messages explicites** : Pour aider l'utilisateur
- **Validation stricte** : Bounds checking et format validation

## Performance et Optimisations

### Serveur
- **Multiplexage** : `poll()` pour gérer 1000+ clients
- **Tableaux statiques** : Pas d'allocation dynamique
- **Broadcast optimisé** : Diffusion ciblée par équipe
- **Recherche linéaire** : Suffisante pour MAX_* = 100-1000

### Client
- **Non-bloquant** : `poll()` pour interface réactive
- **Bufferisation** : Gestion efficace des données réseau
- **Parsing JSON** : Simple mais performant
- **Contexte local** : État maintenu côté client

### Réseau
- **TCP fiable** : Garantit l'ordre et la livraison
- **Protocole simple** : Texte avec délimiteurs \r\n
- **Compression** : Non implémentée (priorité à la simplicité)

## Extensibilité et Maintenance

### Architecture modulaire
- **Séparation claire** : Serveur vs Client vs Utilitaires
- **Fonctions spécialisées** : Un fichier par type de commande
- **Interface standard** : Protocole bien défini

### Ajout de fonctionnalités
- **Commandes** : Ajouter à la table de dispatch
- **Entités** : Étendre les structures et fonctions de recherche
- **Événements** : Ajouter aux bibliothèques de logging

### Maintenance
- **Code documenté** : Headers et commentaires détaillés
- **Tests unitaires** : Non présents (limitation EPITECH)
- **Debug** : Symboles de debug inclus (-g3)

## Conclusion

L'architecture MyTeams présente une conception robuste et bien pensée :

### Points forts
- **Modularité** : Séparation claire des responsabilités
- **Sécurité** : Modèle de permissions hiérarchique
- **Performance** : Optimisations appropriées pour la taille du projet
- **Extensibilité** : Architecture facile à faire évoluer
- **Robustesse** : Gestion complète des erreurs et cas limites

### Compromis
- **Simplicité vs Performance** : Algorithmes linéaires vs complexes
- **Debug vs Release** : Priorité au développement
- **Fonctionnalités vs Complexité** : Feature set complet mais gérable

### Adéquation EPITECH
- **Standards** : Respect des conventions de codage
- **Autonomie** : Pas de dépendances externes complexes
- **Apprentissage** : Architecture pédagogique et compréhensible

Cette architecture fournit une base solide pour un système de messagerie d'équipe complet tout en restant accessible pour un projet académique.
