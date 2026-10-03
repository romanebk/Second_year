# Analyse détaillée de `src/client/parser.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** parser
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les fonctions de parsing des commandes client.

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
- **Ligne 10** : Entrées/sorties standard (printf pour les messages d'erreur)
- **Ligne 11** : Fonctions standard C (potentiellement pour allocations futures)
- **Ligne 12** : Manipulation de chaînes (strncmp, strchr)

### Pourquoi ces inclusions ?
- **client.h** : Définit les signatures des fonctions de parsing
- **utils.h** : Utilitaires potentiels pour le traitement
- **stdio.h** : Pour afficher les messages d'erreur de formatage
- **stdlib.h/string.h** : Pour la manipulation des chaînes

## Fonction de parsing d'arguments (lignes 14-22)
```c
int myteams_client_parse_args(const char *input, char *arg1, char *arg2, char *arg3)
{
    arg1[0] = '\0';
    arg2[0] = '\0';
    arg3[0] = '\0';
    return sscanf(input,
        "%*s \"%511[^\"]\" \"%511[^\"]\" \"%511[^\"]\"",
        arg1, arg2, arg3);
}
```

### Analyse détaillée
- **Ligne 14** : Fonction pour extraire les arguments d'une commande
- **Paramètres** :
  - `input` : Chaîne de commande complète (ex: `/send "uuid" "message"`)
  - `arg1/arg2/arg3` : Buffers pour stocker les arguments extraits
- **Retour** : Nombre d'arguments extraits (0-3)

#### **Lignes 16-18** : Initialisation des buffers
- **`arg1[0] = '\0'`** : Initialise chaque buffer à une chaîne vide
- **Pourquoi ?** : Garantit un état propre même si aucun argument n'est trouvé

#### **Lignes 19-21** : Parsing avec sscanf
- **`sscanf()`** : Fonction C de parsing formaté
- **Format string détaillé** :
  - **`%*s`** : Ignore le premier mot (la commande comme `/send`)
    - **`*`** : Suppression de l'assignation
    - **`s`** : Lit une chaîne jusqu'à l'espace
  - **`" \"%511[^\"]\"`** : Premier argument entre guillemets
    - **`"`** : Attend un guillemet ouvrant
    - **`%511[^\"]`** : Lit jusqu'à 511 caractères qui ne sont pas des guillemets
    - **`"`** : Attend un guillemet fermant
  - **Répétition** : Même pattern pour arg2 et arg3

#### **Ligne 21** : Retour du nombre d'arguments
- **sscanf retourne** : Le nombre de conversions réussies

### Pourquoi cette implémentation ?
- **Simplicité** : Utilise sscanf puissant et éprouvé
- **Robustesse** : Limite la taille des arguments (511 + '\0')
- **Flexibilité** : Gère de 0 à 3 arguments automatiquement
- **Standard** : sscanf est une fonction C standard et fiable

### Exemples de parsing
```
"/send \"uuid\" \"message\"" → arg1="uuid", arg2="message", arg3="" → retour 2
"/login \"username\"" → arg1="username", arg2="", arg3="" → retour 1
"/logout" → arg1="", arg2="", arg3="" → retour 0
```

## Fonction de validation du format (lignes 24-38)
```c
int myteams_client_validate_format(const char *input)
{
    if (strncmp(input, "/help", 5) == 0 ||
        strncmp(input, "/logout", 7) == 0 ||
        strncmp(input, "/list", 5) == 0 ||
        strncmp(input, "/info", 5) == 0 ||
        strncmp(input, "/use", 4) == 0 ||
        strncmp(input, "/subscribed", 11) == 0)
        return 1;
    if (strchr(input, '"') == NULL) {
        printf("Error: Missing or invalid quotes.\n");
        return 0;
    }
    return 1;
}
```

### Analyse détaillée
- **Ligne 24** : Fonction pour valider le format des commandes
- **Paramètre** : `input` - Chaîne de commande à valider
- **Retour** : 1 si valide, 0 si invalide

#### **Lignes 26-31** : Commandes sans guillemets requis
- **Liste blanche** : Commandes qui ne nécessitent pas d'arguments entre guillemets
- **`/help`** : Aide (aucun argument)
- **`/logout`** : Déconnexion (aucun argument)
- **`/list`** : Listage contextuel (arguments contextuels)
- **`/info`** : Informations contextuelles (arguments contextuels)
- **`/use`** : Définition de contexte (arguments contextuels)
- **`/subscribed`** : Listage des abonnements (argument optionnel)

#### **Pourquoi ces commandes ?**
- **Pas d'arguments fixes** : Ces commandes peuvent avoir différents nombres d'arguments
- **Contexte** : Le nombre d'arguments dépend du contexte actuel
- **Flexibilité** : Permet `/use`, `/use "team"`, `/use "team" "channel"`, etc.

#### **Lignes 33-36** : Validation des guillemets
- **`strchr(input, '"') == NULL`** : Cherche un guillemet dans la chaîne
- **Si aucun guillemet** : Affiche un message d'erreur
- **Message** : "Error: Missing or invalid quotes."
- **Retour 0** : Format invalide

#### **Ligne 37** : Validation réussie
- **`return 1`** : Si la commande passe les validations

### Pourquoi cette logique de validation ?
- **User-friendly** : Message d'erreur clair pour les guillemets manquants
- **Flexibilité** : Permet les commandes contextuelles avec nombres d'arguments variables
- **Sécurité** : Empêche les commandes mal formatées d'atteindre le parser
- **Cohérence** : Uniformise l'expérience utilisateur

### Exemples de validation
```
"/help" → valide (pas de guillemets requis)
"/send uuid message" → invalide (guillemets manquants)
"/send \"uuid\" \"message\"" → valide
"/use" → valide (commande contextuelle)
```

## Architecture du parsing

### Flux de traitement
```
Commande utilisateur → validate_format() → parse_args() → traitement
        ↓                      ↓               ↓
    validation           extraction      exécution
```

### Stratégie de parsing

#### **1. Validation préalable**
- **Commandes spéciales** : Listées explicitement
- **Guillemets** : Requis pour les autres commandes
- **Messages d'erreur** : Clairs et informatifs

#### **2. Extraction d'arguments**
- **sscanf** : Puissant et flexible
- **Limites** : Protection contre les débordements
- **Général** : Gère automatiquement 0-3 arguments

#### **3. État propre**
- **Initialisation** : Buffers vidés avant parsing
- **Retour** : Nombre d'arguments pour logique conditionnelle

### Sécurité et Robustesse

#### **Protection contre les débordements**
- **`%511[^\"]`** : Limite les arguments à 511 caractères
- **Buffer size** : 512 octets avec espace pour '\0'
- **sscanf** : Fonction sécurisée avec limites explicites

#### **Validation stricte**
- **Guillemets** : Vérification obligatoire pour la plupart des commandes
- **Commandes valides** : Liste blanche des exceptions
- **Messages d'erreur** : Information utilisateur en cas de problème

#### **Gestion d'erreurs**
- **Retour 0** : Signale un format invalide
- **Messages clairs** : Aide l'utilisateur à corriger sa commande
- **Non-bloquant** : Le client continue de fonctionner

### Performance et Optimisations

#### **Efficacité du parsing**
- **sscanf** : Optimisé par le compilateur
- **Un seul passage** : Toute la logique en une seule fonction
- **Early validation** : Évite le parsing si format invalide

#### **Gestion mémoire**
- **Stack allocation** : Buffers sur la pile (pas de malloc)
- **Taille fixe** : Prévisible et performante
- **Initialisation** : Propre et sécurisée

### Extensibilité et Maintenance

#### **Ajout de commandes**
- **Simple** : Ajouter à la liste blanche dans validate_format()
- **Consistant** : Suivre le pattern existant
- **Documenté** : Code auto-documenté

#### **Maintenance**
- **Centralisé** : Toute la logique de parsing en un seul fichier
- **Modulaire** : Fonctions indépendantes et réutilisables
- **Testable** : Facile à tester unitairement

### Cas d'usage et exemples

#### **Commandes simples**
```bash
# Format correct
/login "username"
/send "user_uuid" "Hello world"

# Format incorrect
/login username          # Erreur: guillemets manquants
/send uuid message       # Erreur: guillemets manquants
```

#### **Commandes contextuelles**
```bash
# Formats valides (pas de validation stricte des guillemets)
/use
/use "team_uuid"
/use "team_uuid" "channel_uuid"
/list
/info
```

#### **Commandes sans arguments**
```bash
# Formats valides
/help
/logout
```

### Limitations et considérations

#### **sscanf limitations**
- **Complexité** : Format strings peuvent devenir complexes
- **Erreurs** : Difficile à déboguer les problèmes de format
- **Flexibilité** : Moins flexible que du parsing manuel

#### **Validation limitée**
- **Guillemets** : Vérification basique (présence, non appariement)
- **Arguments** : Pas de validation du contenu des arguments
- **Commandes** : Liste blanche statique

#### **Améliorations possibles**
- **Appariement des guillemets** : Vérifier qu'ils sont par paires
- **Échappement** : Gérer les guillemets échappés dans les arguments
- **Commandes dynamiques** : Validation plus flexible du nombre d'arguments

## Conclusion

Ce fichier implémente un système de parsing robuste et efficace avec :
- **Parsing sécurisé** utilisant sscanf avec des limites explicites
- **Validation intelligente** distinguant les commandes contextuelles
- **Protection contre les débordements** avec des tailles de buffer fixes
- **Messages d'erreur clairs** pour aider l'utilisateur
- **Architecture simple** et maintenable pour l'évolution future

L'approche mixte (liste blanche pour commandes contextuelles + validation de guillemets) offre un bon équilibre entre flexibilité et sécurité pour une interface utilisateur en ligne de commande.
