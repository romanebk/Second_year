# Analyse détaillée de `src/server/save.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** save
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les fonctions de persistance des données.

## Inclusion (ligne 8)
```c
#include "../../include/server.h"
```
- **Ligne 8** : Inclusion du header principal du serveur.

## Constante de fichier (ligne 10)
```c
#define SAVE_FILE "myteams_save.dat"
```

### Analyse détaillée
- **Ligne 10** : Définition du nom du fichier de sauvegarde
- **Nom** : `myteams_save.dat` - Extension .dat pour fichier de données binaires
- **Localisation** : Fichier dans le répertoire courant du serveur

### Pourquoi cette constante ?
- **Centralisation** : Un seul endroit pour modifier le nom du fichier
- **Clarté** : Nom explicite du fichier de sauvegarde
- **Standard** : Extension .dat pour les fichiers de données binaires

## Fonction de sauvegarde (lignes 12-35)
```c
int save_server(server_t *server)
{
    FILE *f = fopen(SAVE_FILE, "wb");

    if (!f)
        return 84;
    fwrite(&server->user_count, sizeof(int), 1, f);
    fwrite(server->users, sizeof(user_t), server->user_count, f);
    fwrite(&server->team_count, sizeof(int), 1, f);
    fwrite(server->teams, sizeof(team_t), server->team_count, f);
    fwrite(&server->channel_count, sizeof(int), 1, f);
    fwrite(server->channels, sizeof(channel_t), server->channel_count, f);
    fwrite(&server->thread_count, sizeof(int), 1, f);
    fwrite(server->threads, sizeof(thread_t), server->thread_count, f);
    fwrite(&server->comment_count, sizeof(int), 1, f);
    fwrite(server->comments, sizeof(comment_t), server->comment_count, f);
    fwrite(&server->message_count, sizeof(int), 1, f);
    fwrite(server->messages, sizeof(message_t), server->message_count, f);
    fwrite(&server->subscription_count, sizeof(int), 1, f);
    fwrite(server->subscriptions, sizeof(subscription_t),
        server->subscription_count, f);
    fclose(f);
    return 0;
}
```

### Analyse détaillée ligne par ligne

#### **Ligne 14** : Ouverture du fichier
- **`fopen()`** : Ouverture du fichier en mode écriture binaire
- **`"wb"`** : Write Binary - écrase le fichier s'il existe
- **Pourquoi binaire ?** : Structures C directement sérialisables

#### **Lignes 16-17** : Gestion d'erreur
- **`!f`** : Si l'ouverture échoue (permissions, disque plein, etc.)
- **`return 84`** : Code d'erreur EPITECH standard

#### **Pattern de sauvegarde (lignes 18-32)**
Chaque type de données suit le même pattern :
```c
fwrite(&count, sizeof(int), 1, f);           // Nombre d'éléments
fwrite(array, sizeof(type), count, f);        // Tableau d'éléments
```

#### **Ligne 18-19** : Utilisateurs
- **`user_count`** : Nombre d'utilisateurs enregistrés
- **`users[]`** : Tableau des structures user_t

#### **Ligne 20-21** : Équipes
- **`team_count`** : Nombre d'équipes créées
- **`teams[]`** : Tableau des structures team_t

#### **Ligne 22-23** : Canaux
- **`channel_count`** : Nombre de canaux créés
- **`channels[]`** : Tableau des structures channel_t

#### **Ligne 24-25** : Discussions
- **`thread_count`** : Nombre de discussions créées
- **`threads[]`** : Tableau des structures thread_t

#### **Ligne 26-27** : Commentaires
- **`comment_count`** : Nombre de commentaires postés
- **`comments[]`** : Tableau des structures comment_t

#### **Ligne 28-29** : Messages privés
- **`message_count`** : Nombre de messages envoyés
- **`messages[]`** : Tableau des structures message_t

#### **Ligne 30-32** : Abonnements
- **`subscription_count`** : Nombre d'abonnements actifs
- **`subscriptions[]`** : Tableau des structures subscription_t

#### **Ligne 33** : Fermeture du fichier
- **`fclose()`** : Libère le descripteur de fichier et force l'écriture

#### **Ligne 34** : Succès
- **`return 0`** : Sauvegarde réussie

### Pourquoi cette implémentation ?
- **Simplicité** : Sérialisation binaire directe des structures
- **Performance** : Écriture en une seule opération par type
- **Complétude** : Sauvegarde de toutes les données du serveur
- **Atomicité** : Fichier écrasé en une seule fois

## Fonction de chargement (lignes 37-60)
```c
int load_server(server_t *server)
{
    FILE *f = fopen(SAVE_FILE, "rb");

    if (!f)
        return 0;
    fread(&server->user_count, sizeof(int), 1, f);
    fread(server->users, sizeof(user_t), server->user_count, f);
    fread(&server->team_count, sizeof(int), 1, f);
    fread(server->teams, sizeof(team_t), server->team_count, f);
    fread(&server->channel_count, sizeof(int), 1, f);
    fread(server->channels, sizeof(channel_t), server->channel_count, f);
    fread(&server->thread_count, sizeof(int), 1, f);
    fread(server->threads, sizeof(thread_t), server->thread_count, f);
    fread(&server->comment_count, sizeof(int), 1, f);
    fread(server->comments, sizeof(comment_t), server->comment_count, f);
    fread(&server->message_count, sizeof(int), 1, f);
    fread(server->messages, sizeof(message_t), server->message_count, f);
    fread(&server->subscription_count, sizeof(int), 1, f);
    fread(server->subscriptions, sizeof(subscription_t),
        server->subscription_count, f);
    fclose(f);
    return 0;
}
```

### Analyse détaillée ligne par ligne

#### **Ligne 39** : Ouverture du fichier
- **`fopen()`** : Ouverture du fichier en mode lecture binaire
- **`"rb"`** : Read Binary - lecture des données binaires

#### **Lignes 41-42** : Gestion d'erreur
- **`!f`** : Si le fichier n'existe pas ou ne peut être ouvert
- **`return 0`** : Pas d'erreur - premier démarrage du serveur

#### **Pattern de chargement (lignes 43-57)**
Chaque type de données suit le même pattern :
```c
fread(&count, sizeof(int), 1, f);           // Nombre d'éléments
fread(array, sizeof(type), count, f);        // Tableau d'éléments
```

#### **Ligne 43-44** : Utilisateurs
- **`user_count`** : Nombre d'utilisateurs à charger
- **`users[]`** : Tableau des structures user_t

#### **Ligne 45-46** : Équipes
- **`team_count`** : Nombre d'équipes à charger
- **`teams[]`** : Tableau des structures team_t

#### **Ligne 47-48** : Canaux
- **`channel_count`** : Nombre de canaux à charger
- **`channels[]`** : Tableau des structures channel_t

#### **Ligne 49-50** : Discussions
- **`thread_count`** : Nombre de discussions à charger
- **`threads[]`** : Tableau des structures thread_t

#### **Ligne 51-52** : Commentaires
- **`comment_count`** : Nombre de commentaires à charger
- **`comments[]`** : Tableau des structures comment_t

#### **Ligne 53-54** : Messages privés
- **`message_count`** : Nombre de messages à charger
- **`messages[]`** : Tableau des structures message_t

#### **Ligne 55-57** : Abonnements
- **`subscription_count`** : Nombre d'abonnements à charger
- **`subscriptions[]`** : Tableau des structures subscription_t

#### **Ligne 58** : Fermeture du fichier
- **`fclose()`** : Libère le descripteur de fichier

#### **Ligne 59** : Succès
- **`return 0`** : Chargement réussi

### Pourquoi cette implémentation ?
- **Symétrie** : Pattern inverse de la sauvegarde
- **Simplicité** : Lecture binaire directe dans les structures
- **Robustesse** : Pas d'erreur si fichier inexistant (premier démarrage)
- **Performance** : Lecture en une seule opération par type

## Architecture de persistance

### Format de fichier binaire

#### **Structure du fichier**
```
[ user_count ][ users... ][ team_count ][ teams... ]
[ channel_count ][ channels... ][ thread_count ][ threads... ]
[ comment_count ][ comments... ][ message_count ][ messages... ]
[ subscription_count ][ subscriptions... ]
```

#### **Pattern par type**
```
[count: 4 bytes][array: count * sizeof(type) bytes]
```

### Types de données sauvegardées

#### **1. Données utilisateur**
- **user_count** : Nombre d'utilisateurs
- **users[]** : Structures user_t avec UUID, nom, état

#### **2. Données d'équipe**
- **team_count** : Nombre d'équipes
- **teams[]** : Structures team_t avec UUID, nom, description, créateur

#### **3. Données de canal**
- **channel_count** : Nombre de canaux
- **channels[]** : Structures channel_t avec UUID, nom, description, équipe parente

#### **4. Données de discussion**
- **thread_count** : Nombre de discussions
- **threads[]** : Structures thread_t avec UUID, titre, corps, timestamp, créateur

#### **5. Données de commentaire**
- **comment_count** : Nombre de commentaires
- **comments[]** : Structures comment_t avec corps, timestamp, créateur

#### **6. Données de messagerie**
- **message_count** : Nombre de messages
- **messages[]** : Structures message_t avec expéditeur, destinataire, corps, timestamp

#### **7. Données d'abonnement**
- **subscription_count** : Nombre d'abonnements
- **subscriptions[]** : Structures subscription_t avec utilisateur, équipe

### Cycle de vie de la persistance

#### **Sauvegarde**
```
myteams_server_init() → load_server() → [exécution] → handle_disconnection() → save_server()
```

#### **Chargement**
```
Démarrage serveur → load_server() → [si fichier existe] → restauration état
```

### Avantages de cette approche

#### **Performance**
- **Écriture binaire** : Plus rapide que le texte
- **Opérations groupées** : Un fwrite/fread par type
- **Pas de parsing** : Structures lues directement

#### **Simplicité**
- **Code minimal** : ~50 lignes pour tout le système
- **Pas de parsing** : Format binaire direct
- **Symétrie** : Même pattern pour sauvegarde/chargement

#### **Fiabilité**
- **Atomicité** : Fichier complet écrasé d'un coup
- **Intégrité** : Structures C valides garanties
- **Robustesse** : Gère le premier démarrage (fichier absent)

### Limitations et considérations

#### **Portabilité**
- **Endianness** : Dépendant de l'architecture processeur
- **Taille des types** : Dépendant de la plateforme (int vs long)
- **Structure padding** : Dépendant du compilateur

#### **Versionning**
- **Pas de version** : Fichier incompatible si structures changent
- **Migration** : Nécessite un système de versionnement
- **Compatibilité** : Difficile de faire évoluer le format

#### **Sécurité**
- **Binaire brut** : Pas de chiffrement
- **Lisible** : Les données sont visibles en clair
- **Intégrité** : Pas de checksum ou signature

### Alternatives possibles

#### **Format texte (JSON)**
- **Avantages** : Humainement lisible, portable, versionnable
- **Inconvénients** : Plus lent, parsing complexe, plus volumineux

#### **Base de données (SQLite)**
- **Avantages** : Transactions, requêtes, concurrence
- **Inconvénients** : Dépendance externe, complexité

#### **Format binaire structuré (Protocol Buffers)**
- **Avantages** : Portable, versionnable, efficace
- **Inconvénients** : Dépendance externe, complexité

### Améliorations possibles

#### **Gestion d'erreurs**
- **Vérification des retours** : fwrite/fread peuvent échouer partiellement
- **Checksum** : Vérifier l'intégrité du fichier
- **Backup** : Conserver l'ancien fichier en cas d'échec

#### **Versionning**
- **Magic number** : Identifier le format du fichier
- **Version number** : Gérer les migrations
- **Compatibility** : Supporter les anciens formats

#### **Sécurité**
- **Chiffrement** : Protéger les données sensibles
- **Compression** : Réduire la taille du fichier
- **Signature** : Vérifier l'authenticité

## Conclusion

Ce fichier implémente un système de persistance simple et efficace avec :
- **Sauvegarde binaire** directe des structures C
- **Chargement automatique** au démarrage du serveur
- **Gestion robuste** du premier démarrage
- **Performance** optimisée pour les besoins du système
- **Simplicité** de mise en œuvre et de maintenance

L'approche binaire directe est appropriée pour un projet de cette taille, offrant un bon compromis entre performance et simplicité tout en garantissant la persistance complète de l'état du serveur.
