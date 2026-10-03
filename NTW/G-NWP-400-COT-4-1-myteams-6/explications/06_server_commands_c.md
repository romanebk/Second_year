# Analyse détaillée de `src/server/commands.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** commands
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant la logique de gestion des commandes.

## Inclusion (ligne 8)
```c
#include "../../include/server.h"
```
- **Ligne 8** : Inclusion du header principal du serveur.

## Table de commandes (lignes 10-38)
```c
static const command_t command_map[] = {
    {"LOGIN",           &myteams_server_cmd_login},
    {"LOGOUT",          &myteams_server_cmd_logout},
    {"HELP",            &myteams_server_cmd_help},
    {"QUIT",            &myteams_server_cmd_quit},
    {"USERS",           &myteams_server_cmd_users},
    {"USER",            &myteams_server_cmd_user},
    {"TEAMS",           &myteams_server_cmd_teams},
    {"TEAM",            &myteams_server_cmd_team},
    {"CREATE_TEAM",     &myteams_server_cmd_create_team},
    {"SUBSCRIBE",       &myteams_server_cmd_subscribe},
    {"UNSUBSCRIBE",     &myteams_server_cmd_unsubscribe},
    {"SUBSCRIBED",      &myteams_server_cmd_subscribed},
    {"CHANNELS",        &myteams_server_cmd_channels},
    {"CHANNEL",         &myteams_server_cmd_channel},
    {"CREATE_CHANNEL",  &myteams_server_cmd_create_channel},
    {"THREADS",         &myteams_server_cmd_threads},
    {"THREAD",          &myteams_server_cmd_thread},
    {"CREATE_THREAD",   &myteams_server_cmd_create_thread},
    {"COMMENTS",        &myteams_server_cmd_comments},
    {"CREATE_COMMENT",  &myteams_server_cmd_create_comment},
    {"SEND",            &myteams_server_cmd_send},
    {"MESSAGES",        &myteams_server_cmd_messages},
    {"USE",             &myteams_server_cmd_use},
    {"CREATE",          &myteams_server_cmd_create},
    {"LIST",            &myteams_server_cmd_list},
    {"INFO",            &myteams_server_cmd_info},
    {NULL,              NULL}
};
```

### Analyse détaillée
- **Ligne 10** : `static const` - Tableau statique constant visible uniquement dans ce fichier
- **Structure** : Tableau de structures `command_t` avec nom et pointeur de fonction
- **Organisation** : Commandes groupées par catégorie :
  - **Authentification** : LOGIN, LOGOUT, HELP, QUIT
  - **Utilisateurs** : USERS, USER
  - **Équipes** : TEAMS, TEAM, CREATE_TEAM, SUBSCRIBE, UNSUBSCRIBE, SUBSCRIBED
  - **Canaux** : CHANNELS, CHANNEL, CREATE_CHANNEL
  - **Discussions** : THREADS, THREAD, CREATE_THREAD, COMMENTS, CREATE_COMMENT
  - **Messages** : SEND, MESSAGES
  - **Contexte** : USE, CREATE, LIST, INFO
- **Ligne 37** : Terminateur `{NULL, NULL}` pour marquer la fin du tableau

### Pourquoi cette architecture ?
- **Extensibilité** : Facile d'ajouter de nouvelles commandes
- **Performance** : Recherche linéaire simple pour un nombre modéré de commandes
- **Clarté** : Toutes les commandes définies en un seul endroit
- **Type safety** : Pointeurs de fonctions typés

## Extraction d'arguments (lignes 40-61)
```c
static int extract_args(char *line, char **args, int max)
{
    int count = 0;
    int i = 0;

    while (line[i] && count < max) {
        while (line[i] == ' ' || line[i] == '\t')
            i++;
        if (!line[i])
            break;
        if (line[i] != '"')
            return -1;
        i++;
        args[count++] = &line[i];
        while (line[i] && line[i] != '"')
            i++;
        if (!line[i])
            return -1;
        line[i++] = '\0';
    }
    return count;
}
```

### Analyse détaillée ligne par ligne

#### **Ligne 40** : Signature
- **`static`** : Fonction locale à ce fichier
- **`line`** : Ligne de commande à parser
- **`args`** : Tableau pour stocker les pointeurs vers les arguments
- **`max`** : Nombre maximum d'arguments à extraire
- **Retour** : Nombre d'arguments extraits ou -1 si erreur

#### **Ligne 45** : Boucle principale
- **Conditions** : Continue tant qu'il y a des caractères et qu'on n'a pas atteint max
- **Pourquoi** : Évite les buffer overflows et gère les lignes incomplètes

#### **Lignes 46-47** : Saut des espaces
- **But** : Ignore les espaces et tabulations entre les arguments
- **Logique** : Avance l'index jusqu'à trouver un non-espace

#### **Lignes 48-49** : Vérification de fin
- **Si fin de ligne** : Sort de la boucle proprement
- **Pourquoi** : Gère les lignes vides ou incomplètes

#### **Lignes 50-51** : Validation du format
- **`line[i] != '"'`** : Les arguments doivent commencer par des guillemets
- **`return -1`** : Erreur de format (mauvaise syntaxe)

#### **Ligne 52** : Saut du guillemet ouvrant
- **`i++`** : Passe au caractère suivant (début de l'argument)

#### **Ligne 53** : Stockage du pointeur
- **`args[count++]`** : Stocke le pointeur vers le début de l'argument
- **Post-incrémentation** : Incrémente le compteur après stockage

#### **Lignes 54-55** : Recherche du guillemet fermant
- **Boucle** : Continue jusqu'à trouver la fin de l'argument
- **Conditions** : Arrête si fin de ligne ou guillemet trouvé

#### **Lignes 56-57** : Validation du guillemet fermant
- **`!line[i]`** : Si pas de guillemet fermant, erreur de syntaxe
- **`return -1`** : Guillemet non fermé = erreur

#### **Ligne 58** : Terminaison de l'argument
- **`line[i++] = '\0'`** : Remplace le guillemet par '\0' pour terminer la chaîne
- **Post-incrémentation** : Passe au caractère suivant pour la prochaine recherche

#### **Ligne 60** : Retour du nombre d'arguments
- **`count`** : Nombre d'arguments extraits avec succès

### Pourquoi ce format ?
- **Standard** : Format avec guillemets comme dans les shells
- **Robustesse** : Gère les espaces dans les arguments
- **Simplicité** : Parsing déterministe sans ambiguïté

## Dispatch des commandes (lignes 63-81)
```c
static void dispatch(client_t *client, server_t *server,
    char *cmd, char *args_str)
{
    char *args[10] = {0};
    int arg_count = extract_args(args_str, args, 10);
    int i = 0;

    if (arg_count == -1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    for (i = 0; command_map[i].name != NULL; i++) {
        if (strcasecmp(cmd, command_map[i].name) == 0) {
            command_map[i].func(client, args, arg_count, server);
            return;
        }
    }
    write(client->fd, "501 Unknown command.\r\n", 22);
}
```

### Analyse détaillée
- **Ligne 66** : Tableau local pour stocker les arguments (max 10)
- **Ligne 67** : Extraction des arguments avec la fonction précédente
- **Lignes 70-72** : Gestion d'erreur de parsing
  - **Code 400** : Bad Request (HTTP standard)
  - **Retour immédiat** : Évite le traitement ultérieur
- **Ligne 74** : Recherche linéaire dans la table de commandes
- **Ligne 75** : `strcasecmp()` - Comparaison insensible à la casse
- **Ligne 76** : Appel de la fonction handler avec les arguments extraits
- **Ligne 77** : Retour immédiat après exécution
- **Ligne 80** : Si commande non trouvée, erreur 501

### Pourquoi cette implémentation ?
- **Flexibilité** : Insensible à la casse (user-friendly)
- **Sécurité** : Validation stricte du format
- **Standard** : Codes d'erreur HTTP pour cohérence
- **Performance** : Recherche linéaire suffisante pour ~25 commandes

## Point d'entrée d'exécution (lignes 83-91)
```c
void myteams_server_execute_command(client_t *client, char *buffer, server_t *server)
{
    char *rest = buffer;
    char *cmd = strsep(&rest, " \t\r\n");

    if (!cmd || strlen(cmd) == 0)
        return;
    dispatch(client, server, cmd, rest ? rest : "");
}
```

### Analyse détaillée
- **Ligne 85** : `rest` pointe vers le début du buffer
- **Ligne 86** : `strsep()` - Sépare la commande des arguments
  - **Délimiteurs** : Espace, tabulation, retour chariot, newline
  - **Effet** : `cmd` pointe vers la commande, `rest` vers le reste
- **Lignes 88-89** : Validation de la commande
  - **`!cmd`** : strsep() a retourné NULL (erreur)
  - **`strlen(cmd) == 0`** : Commande vide
  - **Retour silencieux** : Ignore les lignes vides
- **Ligne 90** : Dispatch avec les arguments restants
  - **`rest ? rest : ""`** : S'assure qu'on ne passe jamais NULL

### Pourquoi strsep() ?
- **Robustesse** : Gère multiples délimiteurs
- **Efficacité** : Modifie la chaîne en place (pas d'allocation)
- **Standard** : Fonction POSIX pour le parsing de chaînes

## Commande USE (lignes 93-117)
```c
void myteams_server_cmd_use(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};

    (void)server;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    memset(client->team_uuid, 0, UUID_LEN);
    memset(client->channel_uuid, 0, UUID_LEN);
    memset(client->thread_uuid, 0, UUID_LEN);
    if (arg_count >= 1)
        strncpy(client->team_uuid, args[0], UUID_LEN);
    if (arg_count >= 2)
        strncpy(client->channel_uuid, args[1], UUID_LEN);
    if (arg_count >= 3)
        strncpy(client->thread_uuid, args[2], UUID_LEN);
    snprintf(line, BUF_SIZE, "220 %s %s %s\r\n",
        client->team_uuid[0] ? client->team_uuid : "none",
        client->channel_uuid[0] ? client->channel_uuid : "none",
        client->thread_uuid[0] ? client->thread_uuid : "none");
    write(client->fd, line, strlen(line));
}
```

### Analyse détaillée
- **Ligne 98** : `(void)server` - Supprime l'avertissement unused parameter
- **Lignes 99-102** : Vérification d'authentification (code 401)
- **Lignes 103-105** : Réinitialisation du contexte (vidage de tous les UUIDs)
- **Lignes 106-111** : Configuration conditionnelle du contexte
  - **`arg_count >= 1`** : Si au moins une équipe spécifiée
  - **`strncpy()`** : Copie sécurisée avec limite de taille
  - **Progressif** : Chaque argument supplémentaire précise le contexte
- **Lignes 112-116** : Génération de la réponse
  - **Code 220** : Contexte mis à jour avec succès
  - **`? :`** : Affiche "none" si l'UUID est vide
  - **Format** : "220 team_uuid channel_uuid thread_uuid"

### Pourquoi cette implémentation ?
- **Contexte hiérarchique** : Team → Channel → Thread
- **Flexibilité** : Peut spécifier 1, 2 ou 3 niveaux de contexte
- **Clarté** : Réponse explicite de l'état actuel

## Commande CREATE (lignes 119-145)
```c
void myteams_server_cmd_create(client_t *client, char **args,
    int arg_count, server_t *server)
{
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    if (!client->team_uuid[0]) {
        char *a[] = {args[0], args[1]};
        myteams_server_cmd_create_team(client, a, arg_count, server);
        return;
    }
    if (!client->channel_uuid[0]) {
        char *a[] = {client->team_uuid, args[0], args[1]};
        myteams_server_cmd_create_channel(client, a, 3, server);
        return;
    }
    if (!client->thread_uuid[0]) {
        char *a[] = {client->team_uuid,
            client->channel_uuid, args[0], args[1]};
        myteams_server_cmd_create_thread(client, a, 4, server);
        return;
    }
    char *a[] = {client->team_uuid, client->channel_uuid,
        client->thread_uuid, args[0]};
    myteams_server_cmd_create_comment(client, a, 4, server);
}
```

### Analyse détaillée
- **Logique contextuelle** : Le type d'élément créé dépend du contexte actuel
- **Ligne 126** : Si pas de contexte équipe → créer une équipe
- **Ligne 132** : Si contexte équipe mais pas canal → créer un canal
- **Ligne 139** : Si contexte canal mais pas discussion → créer une discussion
- **Ligne 144** : Si contexte discussion complet → créer un commentaire

### Pourquoi cette approche ?
- **Intuitif** : Une seule commande CREATE pour tout créer
- **Contextuel** : Le comportement s'adapte à la navigation de l'utilisateur
- **Logique** : Suit la hiérarchie naturelle Team → Channel → Thread → Comment

## Commande LIST (lignes 147-173)
```c
void myteams_server_cmd_list(client_t *client, char **args,
    int arg_count, server_t *server)
{
    (void)args;
    (void)arg_count;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    if (!client->team_uuid[0]) {
        myteams_server_cmd_teams(client, NULL, 0, server);
        return;
    }
    if (!client->channel_uuid[0]) {
        char *a[] = {client->team_uuid};
        myteams_server_cmd_channels(client, a, 1, server);
        return;
    }
    if (!client->thread_uuid[0]) {
        char *a[] = {client->team_uuid, client->channel_uuid};
        myteams_server_cmd_threads(client, a, 2, server);
        return;
    }
    char *a[] = {client->team_uuid,
        client->channel_uuid, client->thread_uuid};
    myteams_server_cmd_comments(client, a, 3, server);
}
```

### Analyse détaillée
- **Logique similaire à CREATE** : Le contenu listé dépend du contexte
- **Ligne 157** : Sans contexte → lister toutes les équipes
- **Ligne 162** : Contexte équipe → lister les canaux de cette équipe
- **Ligne 167** : Contexte canal → lister les discussions de ce canal
- **Ligne 172** : Contexte discussion → lister les commentaires

### Pourquoi cette implémentation ?
- **Cohérence** : Même logique contextuelle que CREATE
- **Efficacité** : Réutilise les commandes de listage spécifiques
- **Intuitif** : LIST montre ce qui est pertinent dans le contexte actuel

## Commande INFO (lignes 175-201)
```c
void myteams_server_cmd_info(client_t *client, char **args,
    int arg_count, server_t *server)
{
    (void)args;
    (void)arg_count;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    if (!client->team_uuid[0]) {
        char *a[] = {client->user->uuid};
        myteams_server_cmd_user(client, a, 1, server);
        return;
    }
    if (!client->channel_uuid[0]) {
        char *a[] = {client->team_uuid};
        myteams_server_cmd_team(client, a, 1, server);
        return;
    }
    if (!client->thread_uuid[0]) {
        char *a[] = {client->channel_uuid};
        myteams_server_cmd_channel(client, a, 1, server);
        return;
    }
    char *a[] = {client->thread_uuid};
    myteams_server_cmd_thread(client, a, 1, server);
}
```

### Analyse détaillée
- **Logique contextuelle** : INFO montre des détails sur l'élément courant
- **Ligne 186** : Sans contexte → infos sur l'utilisateur courant
- **Ligne 191** : Contexte équipe → infos sur cette équipe
- **Ligne 196** : Contexte canal → infos sur ce canal
- **Ligne 200** : Contexte discussion → infos sur cette discussion

### Pourquoi cette approche ?
- **Praticité** : INFO donne toujours des informations pertinentes
- **Navigation** : Permet d'explorer les détails progressivement
- **Cohérence** : Suit la même logique contextuelle que USE/CREATE/LIST

## Architecture globale du système de commandes

### Flux d'exécution
```
Client → buffer → execute_command() → strsep() → dispatch()
→ extract_args() → command_map[] → handler spécifique
```

### Système contextuel
Les commandes USE, CREATE, LIST, INFO forment un système cohérent :
- **USE** : Définit le contexte de navigation
- **CREATE** : Crée selon le contexte
- **LIST** : Liste selon le contexte  
- **INFO** : Détaille selon le contexte

### Hiérarchie des contextes
```
Pas de contexte → Équipe → Canal → Discussion
     ↓              ↓        ↓         ↓
   TEAMS        CHANNELS THREADS  COMMENTS
   USER          TEAM     CHANNEL   THREAD
```

### Validation et sécurité
1. **Authentification** : Vérification systématique du login
2. **Format** : Validation stricte des arguments avec guillemets
3. **Codes d'erreur** : Standards HTTP pour cohérence
4. **Bounds checking** : Limites sur les tailles et nombres d'arguments

## Optimisations et Bonnes Pratiques

1. **Table de commandes statique** : Performance et simplicité
2. **Parsing robuste** : Gestion des erreurs de format
3. **Réutilisation** : Les commandes contextuelles réutilisent les commandes spécifiques
4. **Cohérence** : Même signature pour tous les handlers
5. **Sécurité** : Validation à chaque niveau

## Conclusion

Ce fichier implémente un système de commandes sophistiqué avec :
- **Architecture extensible** via la table de commandes
- **Parsing robuste** des arguments formatés
- **Système contextuel** intuitif pour la navigation
- **Validation stricte** pour la sécurité
- **Réutilisation** intelligente des fonctionnalités

L'approche contextuelle rend l'interface utilisateur très intuitive et cohérente.
