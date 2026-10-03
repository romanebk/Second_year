# Analyse détaillée de `src/client/context.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** context
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant la logique de traitement contextuel des commandes client.

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
- **Ligne 9** : Header des utilitaires (potentiellement pour des fonctions futures)
- **Ligne 10** : Entrées/sorties standard (potentiellement pour des affichages)
- **Ligne 11** : Fonctions standard C (potentiellement pour allocations futures)
- **Ligne 12** : Manipulation de chaînes (strncmp, strcmp)

### Pourquoi ces inclusions ?
- **client.h** : Définit les structures client_t et les signatures de fonctions
- **utils.h** : Utilitaires potentiels pour le traitement
- **stdio.h/stdlib.h/string.h** : Pour la manipulation des commandes et contextes

## Fonction de traitement des abonnements (lignes 14-29)
```c
void myteams_client_process_input_subs(client_t *c, char *input, int n, char *arg1)
{
    if (strncmp(input, "/subscribe ", 11) == 0 && n >= 1) {
        myteams_client_send_cmd(c, "SUBSCRIBE \"%s\"", arg1);
    } else if (strncmp(input, "/subscribed", 11) == 0) {
        if (n == 0) {
            c->pending_list_type = 2;
            myteams_client_send_cmd(c, "SUBSCRIBED");
        } else {
            c->pending_list_type = 1;
            myteams_client_send_cmd(c, "SUBSCRIBED \"%s\"", arg1);
        }
    } else if (strncmp(input, "/unsubscribe ", 13) == 0 && n >= 1) {
        myteams_client_send_cmd(c, "UNSUBSCRIBE \"%s\"", arg1);
    }
}
```

### Analyse détaillée
- **Ligne 14** : Fonction pour traiter les commandes d'abonnement
- **Paramètres** :
  - `c` : Structure client
  - `input` : Commande complète entrée par l'utilisateur
  - `n` : Nombre d'arguments parsés
  - `arg1` : Premier argument extrait

#### **Commande SUBSCRIBE (lignes 16-17)**
- **`strncmp(input, "/subscribe ", 11) == 0`** : Vérifie le préfixe "/subscribe "
- **`n >= 1`** : Vérifie qu'au moins un argument est fourni
- **`myteams_client_send_cmd(c, "SUBSCRIBE \"%s\"", arg1)`** : Envoie au serveur
  - **Format** : SUBSCRIBE avec UUID de l'équipe entre guillemets
  - **Exemple** : `/subscribe "team_uuid"` → `SUBSCRIBE "team_uuid"`

#### **Commande SUBSCRIBED (lignes 18-25)**
- **`strncmp(input, "/subscribed", 11) == 0`** : Vérifie le préfixe "/subscribed"
- **Logique duale** : Deux comportements selon la présence d'arguments

##### **Cas 1 : Sans arguments (lignes 19-21)**
- **`n == 0`** : Aucun argument fourni
- **`c->pending_list_type = 2`** : Marque qu'on attend une liste d'équipes
- **`myteams_client_send_cmd(c, "SUBSCRIBED")`** : Demande les équipes de l'utilisateur

##### **Cas 2 : Avec argument (lignes 22-24)**
- **`else`** : Au moins un argument fourni
- **`c->pending_list_type = 1`** : Marque qu'on attend une liste d'utilisateurs
- **`myteams_client_send_cmd(c, "SUBSCRIBED \"%s\"", arg1)`** : Demande les abonnés d'une équipe

#### **Commande UNSUBSCRIBE (lignes 26-27)**
- **`strncmp(input, "/unsubscribe ", 13) == 0`** : Vérifie le préfixe "/unsubscribe "
- **`n >= 1`** : Vérifie qu'au moins un argument est fourni
- **`myteams_client_send_cmd(c, "UNSUBSCRIBE \"%s\"", arg1)`** : Envoie la demande de désabonnement

### Pourquoi cette implémentation ?
- **Flexibilité** : SUBSCRIBED a deux usages (mes équipes vs abonnés d'une équipe)
- **État** : pending_list_type permet de savoir comment interpréter la réponse
- **Cohérence** : Mapping direct entre commandes client et serveur

## Fonction de traitement contextuel (lignes 31-79)
```c
void myteams_client_process_input_context(client_t *c, char *input,
    int n, char *arg1, char *arg2, char *arg3)
{
    if (strncmp(input, "/use ", 5) == 0) {
        myteams_client_send_cmd(c, "USE %s %s %s",
            arg1[0] ? arg1 : "none",
            arg2[0] ? arg2 : "none",
            arg3[0] ? arg3 : "none");
    } else if (strcmp(input, "/use") == 0) {
        myteams_client_send_cmd(c, "USE");
    } else if (strncmp(input, "/create ", 8) == 0) {
        if (c->team_uuid[0] == '\0' && n >= 2)
            myteams_client_send_cmd(c, "CREATE_TEAM \"%s\" \"%s\"", arg1, arg2);
        else if (c->channel_uuid[0] == '\0' && n >= 2)
            myteams_client_send_cmd(c, "CREATE_CHANNEL \"%s\" \"%s\" \"%s\"",
                c->team_uuid, arg1, arg2);
        else if (c->thread_uuid[0] == '\0' && n >= 2)
            myteams_client_send_cmd(c, "CREATE_THREAD \"%s\" \"%s\" \"%s\" \"%s\"",
                c->team_uuid, c->channel_uuid, arg1, arg2);
        else if (n >= 1)
            myteams_client_send_cmd(c, "CREATE_COMMENT \"%s\" \"%s\" \"%s\" \"%s\"",
                c->team_uuid, c->channel_uuid, c->thread_uuid, arg1);
    } else if (strcmp(input, "/list") == 0) {
        if (c->team_uuid[0] == '\0') {
            c->pending_list_type = 2;
            myteams_client_send_cmd(c, "TEAMS");
        } else if (c->channel_uuid[0] == '\0') {
            c->pending_list_type = 3;
            myteams_client_send_cmd(c, "CHANNELS \"%s\"", c->team_uuid);
        } else if (c->thread_uuid[0] == '\0') {
            c->pending_list_type = 4;
            myteams_client_send_cmd(c, "THREADS \"%s\" \"%s\"",
                c->team_uuid, c->channel_uuid);
        } else {
            c->pending_list_type = 5;
            myteams_client_send_cmd(c, "COMMENTS \"%s\" \"%s\" \"%s\"",
                c->team_uuid, c->channel_uuid, c->thread_uuid);
        }
    } else if (strcmp(input, "/info") == 0) {
        if (c->team_uuid[0] == '\0')
            myteams_client_send_cmd(c, "USER \"%s\"", c->uuid);
        else if (c->channel_uuid[0] == '\0')
            myteams_client_send_cmd(c, "TEAM \"%s\"", c->team_uuid);
        else if (c->thread_uuid[0] == '\0')
            myteams_client_send_cmd(c, "CHANNEL \"%s\"", c->channel_uuid);
        else
            myteams_client_send_cmd(c, "THREAD \"%s\"", c->thread_uuid);
    }
}
```

### Analyse détaillée

#### **Commande USE (lignes 34-40)**
- **Cas avec arguments (lignes 34-38)** :
  - **`strncmp(input, "/use ", 5) == 0`** : Préfixe "/use "
  - **Logique ternaire** : `arg1[0] ? arg1 : "none"` pour chaque argument
  - **"none"** : Valeur par défaut si l'argument est vide
  - **Exemples** :
    - `/use "team"` → `USE "team" none none`
    - `/use "team" "channel"` → `USE "team" "channel" none`
    - `/use "team" "channel" "thread"` → `USE "team" "channel" "thread"`

- **Cas sans arguments (lignes 39-40)** :
  - **`strcmp(input, "/use") == 0`** : Commande "/use" exacte
  - **`myteams_client_send_cmd(c, "USE")`** : Réinitialise le contexte

#### **Commande CREATE (lignes 41-52)**
- **Logique contextuelle** : Le type d'élément créé dépend du contexte actuel

##### **Création d'équipe (lignes 42-43)**
- **`c->team_uuid[0] == '\0'`** : Pas de contexte équipe
- **`n >= 2`** : Au moins nom et description
- **`CREATE_TEAM`** : Crée une nouvelle équipe

##### **Création de canal (lignes 44-46)**
- **`c->channel_uuid[0] == '\0'`** : Contexte équipe mais pas de canal
- **`n >= 2`** : Au moins nom et description
- **`CREATE_CHANNEL`** : Crée un canal dans l'équipe actuelle
- **Arguments** : team_uuid (contexte), nom, description

##### **Création de discussion (lignes 47-49)**
- **`c->thread_uuid[0] == '\0'`** : Contexte canal mais pas de discussion
- **`n >= 2`** : Au moins titre et corps
- **`CREATE_THREAD`** : Crée une discussion dans le canal actuel
- **Arguments** : team_uuid, channel_uuid (contexte), titre, corps

##### **Création de commentaire (lignes 50-52)**
- **`else`** : Contexte discussion complet
- **`n >= 1`** : Au moins le corps du commentaire
- **`CREATE_COMMENT`** : Crée un commentaire dans la discussion actuelle
- **Arguments** : team_uuid, channel_uuid, thread_uuid (contexte), corps

#### **Commande LIST (lignes 53-68)**
- **Logique contextuelle** : Liste selon le contexte actuel

##### **Liste des équipes (lignes 54-56)**
- **`c->team_uuid[0] == '\0'`** : Pas de contexte équipe
- **`c->pending_list_type = 2`** : Marque réponse comme liste d'équipes
- **`TEAMS`** : Demande toutes les équipes

##### **Liste des canaux (lignes 57-59)**
- **`c->channel_uuid[0] == '\0'`** : Contexte équipe mais pas de canal
- **`c->pending_list_type = 3`** : Marque réponse comme liste de canaux
- **`CHANNELS`** : Demande les canaux de l'équipe actuelle

##### **Liste des discussions (lignes 60-63)**
- **`c->thread_uuid[0] == '\0'`** : Contexte canal mais pas de discussion
- **`c->pending_list_type = 4`** : Marque réponse comme liste de discussions
- **`THREADS`** : Demande les discussions du canal actuel

##### **Liste des commentaires (lignes 64-67)**
- **`else`** : Contexte discussion complet
- **`c->pending_list_type = 5`** : Marque réponse comme liste de commentaires
- **`COMMENTS`** : Demande les commentaires de la discussion actuelle

#### **Commande INFO (lignes 69-78)**
- **Logique contextuelle** : Informations selon le contexte actuel

##### **Infos utilisateur (lignes 70-71)**
- **`c->team_uuid[0] == '\0'`** : Pas de contexte équipe
- **`USER`** : Demande les informations de l'utilisateur actuel

##### **Infos équipe (lignes 72-73)**
- **`c->channel_uuid[0] == '\0'`** : Contexte équipe mais pas de canal
- **`TEAM`** : Demande les informations de l'équipe actuelle

##### **Infos canal (lignes 74-75)**
- **`c->thread_uuid[0] == '\0'`** : Contexte canal mais pas de discussion
- **`CHANNEL`** : Demande les informations du canal actuel

##### **Infos discussion (lignes 76-77)**
- **`else`** : Contexte discussion complet
- **`THREAD`** : Demande les informations de la discussion actuelle

## Architecture contextuelle

### Hiérarchie des contextes
```
Pas de contexte → Équipe → Canal → Discussion → Commentaire
      ↓              ↓        ↓         ↓           ↓
   USER          TEAM    CHANNEL   THREAD     (pas de INFO)
   TEAMS        CHANNELS  THREADS  COMMENTS
   CREATE_TEAM  CREATE_  CREATE_   CREATE_
                CHANNEL  THREAD    COMMENT
```

### État du client
- **`c->team_uuid`** : UUID de l'équipe sélectionnée (vide si aucune)
- **`c->channel_uuid`** : UUID du canal sélectionné (vide si aucun)
- **`c->thread_uuid`** : UUID de la discussion sélectionnée (vide si aucune)
- **`c->uuid`** : UUID de l'utilisateur connecté

### Types de listes en attente
- **1** : Liste d'utilisateurs
- **2** : Liste d'équipes
- **3** : Liste de canaux
- **4** : Liste de discussions
- **5** : Liste de commentaires
- **6** : Liste de messages privés

### Mapping contextuel

#### **Commande CREATE**
```bash
# Contexte vide
/create "team_name" "description" → CREATE_TEAM

# Contexte équipe
/create "channel_name" "description" → CREATE_CHANNEL

# Contexte canal
/create "thread_title" "body" → CREATE_THREAD

# Contexte discussion
/create "comment_body" → CREATE_COMMENT
```

#### **Commande LIST**
```bash
# Contexte vide
/list → TEAMS

# Contexte équipe
/list → CHANNELS "team_uuid"

# Contexte canal
/list → THREADS "team_uuid" "channel_uuid"

# Contexte discussion
/list → COMMENTS "team_uuid" "channel_uuid" "thread_uuid"
```

#### **Commande INFO**
```bash
# Contexte vide
/info → USER "user_uuid"

# Contexte équipe
/info → TEAM "team_uuid"

# Contexte canal
/info → CHANNEL "channel_uuid"

# Contexte discussion
/info → THREAD "thread_uuid"
```

## Sécurité et Validation

### Validation des contextes
- **Vérification des UUID** : `c->xxx_uuid[0] == '\0'` pour vérifier si vide
- **Validation des arguments** : `n >= X` pour vérifier le nombre minimum
- **Ordre logique** : Contexte vérifié du plus général au plus spécifique

### Protection contre les erreurs
- **Cascades logiques** : if/else if garantit un seul chemin
- **Arguments par défaut** : "none" pour USE si arguments manquants
- **État cohérent** : Le contexte ne peut être que partiellement défini

## Performance et Optimisations

### Efficacité du contexte
- **Vérification simple** : Test du premier caractère pour UUID vide
- **Cascade logique** : Évaluation court-circuitée
- **Mapping direct** : Pas de transformation complexe

### Gestion d'état
- **Local** : État stocké dans la structure client
- **Persistant** : Contexte maintenu entre les commandes
- **Réinitialisable** : `/use` seul vide tout le contexte

## Extensibilité et Maintenance

### Ajout de niveaux de contexte
- **Simple** : Ajouter un niveau dans la hiérarchie
- **Logique** : Ajouter un else if dans chaque commande contextuelle
- **Cohérent** : Suivre le pattern existant

### Ajout de commandes
- **Contextuelles** : Ajouter dans `myteams_client_process_input_context`
- **Non-contextuelles** : Ajouter dans `myteams_client_handle_input`
- **Spécialisées** : Créer une nouvelle fonction de traitement

## Conclusion

Ce fichier implémente un système contextuel sophistiqué avec :
- **Navigation hiérarchique** intuitive dans la structure des données
- **Commandes intelligentes** qui s'adaptent au contexte courant
- **Gestion d'état** cohérente et persistante
- **Mapping logique** entre interface utilisateur et protocole serveur
- **Extensibilité** pour ajouter de nouveaux niveaux ou commandes

L'approche contextuelle rend l'interface utilisateur très intuitive et naturelle, permettant une navigation fluide dans la structure complexe de teams → channels → threads → comments.
