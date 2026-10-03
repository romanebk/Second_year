# Analyse détaillée de `src/client/commands.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** commands
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant la logique de gestion des commandes client.

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
- **Ligne 9** : Header des utilitaires (buffer, JSON)
- **Ligne 10** : Entrées/sorties standard (printf pour l'aide)
- **Ligne 11** : Fonctions standard C (potentiellement pour allocations futures)
- **Ligne 12** : Manipulation de chaînes (strlen, strncmp, strcmp)

### Pourquoi ces inclusions ?
- **client.h** : Définit client_t et les fonctions de traitement
- **utils.h** : Utilitaires pour le parsing et validation
- **stdio.h** : Pour l'affichage de l'aide utilisateur
- **stdlib.h/string.h** : Pour la manipulation des commandes

## Fonction principale de traitement des commandes (lignes 14-53)
```c
void myteams_client_handle_input(client_t *c, char *input)
{
    char arg1[512] = {0};
    char arg2[512] = {0};
    char arg3[512] = {0};
    int n = 0;

    if (strlen(input) == 0)
        return;
    if (!myteams_client_validate_format(input))
        return;
    n = myteams_client_parse_args(input, arg1, arg2, arg3);
    if (strncmp(input, "/login ", 7) == 0 && n >= 1)
        myteams_client_send_cmd(c, "LOGIN \"%s\"", arg1);
    else if (strcmp(input, "/logout") == 0)
        myteams_client_send_cmd(c, "LOGOUT");
    else if (strcmp(input, "/users") == 0) {
        c->pending_list_type = 1;
        myteams_client_send_cmd(c, "USERS");
    } else if (strncmp(input, "/user ", 6) == 0 && n >= 1)
        myteams_client_send_cmd(c, "USER \"%s\"", arg1);
    else if (strncmp(input, "/send ", 6) == 0 && n >= 2)
        myteams_client_send_cmd(c, "SEND \"%s\" \"%s\"", arg1, arg2);
    else if (strncmp(input, "/messages ", 10) == 0 && n >= 1) {
        c->pending_list_type = 6;
        myteams_client_send_cmd(c, "MESSAGES \"%s\"", arg1);
    } else if (strncmp(input, "/subscribe", 10) == 0 ||
        strncmp(input, "/subscribed", 11) == 0 ||
        strncmp(input, "/unsubscribe", 12) == 0)
        myteams_client_process_input_subs(c, input, n, arg1);
    else if (strncmp(input, "/use", 4) == 0 ||
        strncmp(input, "/create ", 8) == 0 ||
        strcmp(input, "/list") == 0 ||
        strcmp(input, "/info") == 0)
        myteams_client_process_input_context(c, input, n, arg1, arg2, arg3);
    else if (strcmp(input, "/help") == 0)
        printf("/login /logout /users /user /send /messages "
            "/subscribe /subscribed /unsubscribe "
            "/use /create /list /info /help\n");
}
```

### Analyse détaillée ligne par ligne

#### **Lignes 16-19** : Variables locales
- **`arg1[512]`**, **`arg2[512]`**, **`arg3[512]** : Buffers pour les arguments parsés
- **Taille 512** : Suffisamment grand pour les arguments (MAX_BODY_LENGTH = 512)
- **Initialisation** : `{0}` pour des buffers propres
- **`n`** : Nombre d'arguments parsés

#### **Ligne 21-22** : Validation d'entrée vide
- **`strlen(input) == 0`** : Si l'utilisateur entre juste Entrée
- **`return`** : Ignore silencieusement les entrées vides

#### **Lignes 23-24** : Validation du format
- **`myteams_client_validate_format(input)`** : Vérifie la syntaxe des guillemets
- **`return`** : Ignore les commandes mal formatées

#### **Ligne 25** : Parsing des arguments
- **`myteams_client_parse_args(input, arg1, arg2, arg3)`** : Extrait les arguments
- **Retour** : Nombre d'arguments trouvés (stocké dans `n`)

#### **Commande LOGIN (lignes 26-27)**
- **`strncmp(input, "/login ", 7) == 0`** : Vérifie le préfixe "/login "
- **`n >= 1`** : Vérifie qu'au moins un argument est fourni
- **`myteams_client_send_cmd(c, "LOGIN \"%s\"", arg1)`** : Envoie au serveur
  - **Format** : LOGIN avec argument entre guillemets
  - **Exemple** : `/login "username"` → `LOGIN "username"`

#### **Commande LOGOUT (lignes 28-29)**
- **`strcmp(input, "/logout") == 0`** : Correspondance exacte
- **`myteams_client_send_cmd(c, "LOGOUT")`** : Envoie sans arguments

#### **Commande USERS (lignes 30-32)**
- **`strcmp(input, "/users") == 0`** : Correspondance exacte
- **`c->pending_list_type = 1`** : Marque qu'on attend une liste d'utilisateurs
- **`myteams_client_send_cmd(c, "USERS")`** : Demande la liste des utilisateurs

#### **Commande USER (lignes 33-34)**
- **`strncmp(input, "/user ", 6) == 0`** : Préfixe "/user "
- **`n >= 1`** : Au moins un argument (UUID utilisateur)
- **`myteams_client_send_cmd(c, "USER \"%s\"", arg1)`** : Demande les infos d'un utilisateur

#### **Commande SEND (lignes 35-36)**
- **`strncmp(input, "/send ", 6) == 0`** : Préfixe "/send "
- **`n >= 2`** : Deux arguments requis (UUID, message)
- **`myteams_client_send_cmd(c, "SEND \"%s\" \"%s\"", arg1, arg2)`** : Envoie un message privé

#### **Commande MESSAGES (lignes 37-39)**
- **`strncmp(input, "/messages ", 10) == 0`** : Préfixe "/messages "
- **`n >= 1`** : Au moins un argument (UUID utilisateur)
- **`c->pending_list_type = 6`** : Marque qu'on attend une liste de messages
- **`myteams_client_send_cmd(c, "MESSAGES \"%s\"", arg1)`** : Demande l'historique des messages

#### **Commandes d'abonnement (lignes 40-43)**
- **Trois commandes** : `/subscribe`, `/subscribed`, `/unsubscribe`
- **`strncmp()`** : Vérifie les préfixes respectifs
- **`myteams_client_process_input_subs(c, input, n, arg1)`** : Délègue le traitement
- **Pourquoi délégation ?** : Logique complexe avec différents nombres d'arguments

#### **Commandes contextuelles (lignes 44-48)**
- **Quatre commandes** : `/use`, `/create`, `/list`, `/info`
- **`strncmp()` ou `strcmp()`** : Selon que la commande prend des arguments
- **`myteams_client_process_input_context()`** : Délègue le traitement contextuel
- **Pourquoi délégation ?** : Logique dépendant du contexte actuel (team/channel/thread)

#### **Commande HELP (lignes 49-52)**
- **`strcmp(input, "/help") == 0`** : Correspondance exacte
- **`printf()`** : Affiche la liste des commandes disponibles
- **Format** : Liste sur une seule ligne pour simplicité

### Architecture des commandes

#### **Catégories de commandes**

##### **1. Commandes simples (directes)**
- **LOGIN** : Authentification avec argument
- **LOGOUT** : Déconnexion sans argument
- **USERS** : Liste des utilisateurs
- **USER** : Infos utilisateur spécifique
- **SEND** : Message privé
- **MESSAGES** : Historique des messages
- **HELP** : Aide

##### **2. Commandes d'abonnement (déléguées)**
- **SUBSCRIBE** : S'abonner à une équipe
- **SUBSCRIBED** : Lister les abonnements
- **UNSUBSCRIBE** : Se désabonner

##### **3. Commandes contextuelles (déléguées)**
- **USE** : Définir le contexte de navigation
- **CREATE** : Créer selon le contexte
- **LIST** : Lister selon le contexte
- **INFO** : Informations selon le contexte

#### **Pattern de traitement**
```c
if (condition && arguments_valides)
    action_directe;
else if (condition)
    delegation_vers_fonction_specialisee;
```

#### **Validation des arguments**
- **strncmp()** : Pour les commandes avec arguments
- **strcmp()** : Pour les commandes sans arguments
- **n >= X** : Vérification du nombre minimum d'arguments

### Gestion des listes en attente

#### **pending_list_type**
- **1** : Liste des utilisateurs (USERS)
- **6** : Liste des messages (MESSAGES)
- **Autres** : Probablement d'autres types dans d'autres fonctions

#### **Pourquoi ce mécanisme ?**
- **État** : Le client sait quel type de réponse attendre
- **Parsing** : Permet un traitement différent selon le type de liste
- **UI** : Affichage approprié selon le contenu

### Mapping client → serveur

#### **Format client**
```
/login "username"
/send "uuid" "message"
/use "team_uuid" "channel_uuid" "thread_uuid"
```

#### **Format serveur**
```
LOGIN "username"
SEND "uuid" "message"
USE "team_uuid" "channel_uuid" "thread_uuid"
```

#### **Pourquoi cette conversion ?**
- **Interface utilisateur** : Plus conviviale avec slash et guillemets
- **Protocole serveur** : Format standardisé et cohérent
- **Abstraction** : Cache la complexité du protocole

### Sécurité et Validation

#### **Validation des entrées**
- **Entrée vide** : Ignorée silencieusement
- **Format** : Validation des guillemets via `myteams_client_validate_format()`
- **Arguments** : Vérification du nombre minimum requis

#### **Protection contre les erreurs**
- **strncmp()** : Évite les débordements de buffer
- **Taille fixe** : Buffers de 512 octets pour les arguments
- **Délégation** : Logique complexe isolée dans d'autres fonctions

### Performance et Optimisations

#### **Efficacité du parsing**
- **strncmp()** : Comparaison rapide des préfixes
- **Un seul parsing** : `myteams_client_parse_args()` appelé une seule fois
- **Early returns** : Sortie rapide pour les cas invalides

#### **Gestion mémoire**
- **Stack allocation** : Buffers sur la pile (pas de malloc)
- **Taille fixe** : Évite les réallocations dynamiques
- **Initialisation propre** : Buffers initialisés à zéro

### Extensibilité et Maintenance

#### **Ajout de commandes**
- **Simple** : Ajouter un else if avec le nouveau préfixe
- **Délégué** : Pour logique complexe, créer une fonction spécialisée
- **Cohérent** : Suivre le pattern existant

#### **Maintenance**
- **Regroupement** : Commandes similaires regroupées
- **Délégation** : Logique complexe isolée
- **Commentaires** : Code auto-documenté par les noms de fonctions

## Conclusion

Ce fichier implémente une interface utilisateur robuste avec :
- **Parsing intelligent** des commandes avec arguments
- **Validation stricte** du format des entrées
- **Mapping cohérent** entre interface client et protocole serveur
- **Gestion d'état** pour les réponses de liste en attente
- **Architecture extensible** pour ajouter de nouvelles commandes
- **Délégation appropriée** pour la logique complexe

L'approche avec délégation pour les commandes complexes permet de garder ce fichier concis tout en gérant des fonctionnalités sophistiquées comme les commandes contextuelles et d'abonnement.
