# Analyse détaillée de `src/client/utils.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** utils
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant les fonctions utilitaires du client.

## Inclusions (lignes 8-12)
```c
#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
```

### Analyse détaillée
- **Ligne 8** : Header principal du client avec les structures
- **Ligne 9** : Header des utilitaires avec les déclarations de fonctions
- **Ligne 10** : Entrées/sorties standard (snprintf)
- **Ligne 11** : Fonctions standard C (malloc, free, strtol)
- **Ligne 12** : Manipulation de chaînes (memset, memcpy, strchr, strstr)

### Pourquoi ces inclusions ?
- **client.h/utils.h** : Définit les structures et signatures des fonctions
- **stdio.h** : Pour snprintf dans les fonctions JSON
- **stdlib.h** : Pour allocation mémoire et conversion numérique
- **string.h** : Pour manipulation des buffers et parsing JSON

## Fonctions de gestion de buffer

### Initialisation du buffer (lignes 14-18)
```c
void myteams_buffer_init(buffer_t *buf)
{
    memset(buf->data, 0, BUF_SIZE);
    buf->len = 0;
}
```

### Analyse détaillée
- **Ligne 14** : Fonction pour initialiser un buffer à un état vide
- **Paramètre** : `buf` - Pointeur vers la structure buffer_t
- **Ligne 16** : `memset(buf->data, 0, BUF_SIZE)` : Met tout le tableau à zéro
- **Ligne 17** : `buf->len = 0` : Initialise la longueur à zéro

### Pourquoi cette implémentation ?
- **Propreté** : État connu et reproductible
- **Sécurité** : Pas de données résiduelles
- **Standard** : Initialisation complète de la structure

### Ajout de données au buffer (lignes 20-29)
```c
void myteams_buffer_append(buffer_t *buf, const char *src, int len)
{
    int space = BUF_SIZE - buf->len - 1;

    if (len > space)
        len = space;
    memcpy(buf->data + buf->len, src, len);
    buf->len += len;
    buf->data[buf->len] = '\0';
}
```

### Analyse détaillée
- **Ligne 20** : Fonction pour ajouter des données au buffer
- **Paramètres** :
  - `buf` : Buffer destination
  - `src` : Source des données à ajouter
  - `len` : Longueur des données à ajouter

#### **Ligne 22** : Calcul de l'espace disponible
- **`BUF_SIZE - buf->len - 1`** : Espace restant en conservant 1 octet pour '\0'
- **Pourquoi -1 ?** : Garantit de la place pour le terminateur nul

#### **Lignes 24-25** : Protection contre le débordement
- **`if (len > space)`** : Si plus de données que d'espace disponible
- **`len = space`** : Limite la longueur à l'espace disponible

#### **Ligne 26** : Copie des données
- **`memcpy(buf->data + buf->len, src, len)`** : Copie à la position actuelle
- **Performance** : memcpy est optimisé pour les copies de mémoire

#### **Ligne 27** : Mise à jour de la longueur
- **`buf->len += len`** : Incrémente la longueur du buffer

#### **Ligne 28** : Terminaison nulle
- **`buf->data[buf->len] = '\0'`** : Assure la terminaison de la chaîne

### Pourquoi cette implémentation ?
- **Sécurité** : Protection contre les buffer overflows
- **Performance** : Utilise memcpy optimisé
- **Propreté** : Maintient toujours une chaîne C valide

### Extraction d'une ligne (lignes 31-51)
```c
char *myteams_buffer_get_line(buffer_t *buf)
{
    char *newline = memchr(buf->data, '\n', buf->len);
    char *line = NULL;
    int line_len = 0;

    if (!newline)
        return NULL;
    line_len = newline - buf->data;
    line = malloc(line_len + 1);
    if (!line)
        return NULL;
    memcpy(line, buf->data, line_len);
    line[line_len] = '\0';
    if (line_len > 0 && line[line_len - 1] == '\r')
        line[line_len - 1] = '\0';
    buf->len -= (line_len + 1);
    memmove(buf->data, newline + 1, buf->len);
    buf->data[buf->len] = '\0';
    return line;
}
```

### Analyse détaillée
- **Ligne 31** : Fonction pour extraire une ligne complète du buffer
- **Paramètre** : `buf` - Buffer contenant les données
- **Retour** : Pointeur vers la ligne extraite (malloc) ou NULL

#### **Ligne 33** : Recherche du newline
- **`memchr(buf->data, '\n', buf->len)`** : Cherche '\n' dans les données
- **Avantage** : memchr est plus rapide que strchr pour les données binaires

#### **Lignes 37-38** : Vérification
- **`if (!newline)`** : Si pas de newline trouvé
- **`return NULL`** : Pas de ligne complète disponible

#### **Ligne 39** : Calcul de la longueur
- **`line_len = newline - buf->data`** : Distance jusqu'au newline

#### **Lignes 40-42** : Allocation mémoire
- **`malloc(line_len + 1)`** : Alloue pour la ligne + '\0'
- **`if (!line)`** : Vérification de l'allocation
- **`return NULL`** : Échec d'allocation

#### **Lignes 43-44** : Copie de la ligne
- **`memcpy(line, buf->data, line_len)`** : Copie les données
- **`line[line_len] = '\0'`** : Termine la chaîne

#### **Lignes 45-46** : Gestion du \r\n
- **`if (line_len > 0 && line[line_len - 1] == '\r')`** : Vérifie \r avant \n
- **`line[line_len - 1] = '\0'` : Supprime le \r si présent

#### **Lignes 47-49** : Mise à jour du buffer
- **`buf->len -= (line_len + 1)`** : Réduit la longueur (ligne + \n)
- **`memmove(buf->data, newline + 1, buf->len)`** : Déplace les données restantes
- **`buf->data[buf->len] = '\0'`** : Termine la chaîne restante

#### **Ligne 50** : Retour de la ligne
- **`return line`** : Retourne la ligne allouée (caller doit free)

### Pourquoi cette implémentation ?
- **Robustesse** : Gère les terminaisons \r\n et \n
- **Performance** : Utilise memchr et memmove optimisés
- **Sécurité** : Allocation mémoire contrôlée
- **Propreté** : Maintient l'état cohérent du buffer

## Fonctions de parsing JSON

### Extraction de chaîne JSON (lignes 53-86)
```c
void myteams_json_extract_str(const char *json, const char *key,
    char *dest, int dest_size)
{
    char search[64] = {0};
    const char *pos = NULL;
    const char *start = NULL;
    const char *end = NULL;
    int len = 0;

    snprintf(search, sizeof(search), "\"%s\":", key);
    pos = strstr(json, search);
    if (!pos) {
        dest[0] = '\0';
        return;
    }
    pos += strlen(search);
    while (*pos == ' ')
        pos++;
    if (*pos != '"') {
        dest[0] = '\0';
        return;
    }
    start = pos + 1;
    end = strchr(start, '"');
    if (!end) {
        dest[0] = '\0';
        return;
    }
    len = end - start;
    if (len >= dest_size)
        len = dest_size - 1;
    memcpy(dest, start, len);
    dest[len] = '\0';
}
```

### Analyse détaillée
- **Ligne 53** : Fonction pour extraire une valeur chaîne d'un JSON
- **Paramètres** :
  - `json` : Chaîne JSON source
  - `key` : Clé à rechercher
  - `dest` : Buffer destination
  - `dest_size` : Taille du buffer destination

#### **Ligne 56** : Construction du pattern de recherche
- **`snprintf(search, sizeof(search), "\"%s\":", key)`** : Crée `"key":`
- **Exemple** : key="name" → search=`"name":`

#### **Lignes 63-67** : Recherche de la clé
- **`pos = strstr(json, search)`** : Cherche le pattern dans le JSON
- **`if (!pos)`** : Si clé non trouvée
- **`dest[0] = '\0'`** : Retourne une chaîne vide

#### **Lignes 68-70** : Saut des espaces
- **`while (*pos == ' ')`** : Saute les espaces après ":"
- **`pos++`** : Avance le pointeur

#### **Lignes 71-74** : Vérification du guillemet
- **`if (*pos != '"')`** : Doit commencer par un guillemet
- **`dest[0] = '\0'`** : Erreur de format

#### **Ligne 75** : Début de la valeur
- **`start = pos + 1`** : Position après le guillemet ouvrant

#### **Lignes 76-79** : Recherche de la fin
- **`end = strchr(start, '"')`** : Cherche le guillemet fermant
- **`if (!end)`** : Si pas de guillemet fermant
- **`dest[0] = '\0'`** : Erreur de format

#### **Lignes 81-83** : Calcul et limitation de la longueur
- **`len = end - start`** : Longueur de la valeur
- **`if (len >= dest_size)`** : Protection contre le débordement
- **`len = dest_size - 1`** : Limite à la taille du buffer

#### **Lignes 84-85** : Copie et terminaison
- **`memcpy(dest, start, len)`** : Copie la valeur
- **`dest[len] = '\0'`** : Termine la chaîne

### Pourquoi cette implémentation ?
- **Simplicité** : Parsing JSON basique mais efficace
- **Sécurité** : Protection contre les débordements
- **Robustesse** : Gestion des erreurs de format
- **Performance** : Utilise strstr et strchr optimisés

### Extraction numérique JSON (lignes 88-101)
```c
long myteams_json_extract_long(const char *json, const char *key)
{
    char search[64] = {0};
    const char *pos = NULL;

    snprintf(search, sizeof(search), "\"%s\":", key);
    pos = strstr(json, search);
    if (!pos)
        return -1;
    pos += strlen(search);
    while (*pos == ' ' || *pos == ':' || *pos == '\t')
        pos++;
    return strtol(pos, NULL, 10);
}
```

### Analyse détaillée
- **Ligne 88** : Fonction pour extraire une valeur numérique d'un JSON
- **Paramètres** : `json`, `key`
- **Retour** : Valeur numérique ou -1 si erreur

#### **Lignes 93-97** : Recherche de la clé
- **Même pattern** : Construction et recherche comme la fonction précédente
- **`if (!pos)`** : Si clé non trouvée
- **`return -1`** : Code d'erreur

#### **Lignes 98-99** : Saut des séparateurs
- **`while (*pos == ' ' || *pos == ':' || *pos == '\t')`** : Saute espaces, deux-points, tabulations
- **`pos++`** : Avance le pointeur

#### **Ligne 100** : Conversion numérique
- **`strtol(pos, NULL, 10)`** : Convertit en entier base 10
- **NULL** : Pas besoin de stocker le pointeur de fin
- **Base 10** : Décimal standard

### Pourquoi cette implémentation ?
- **Simplicité** : Utilise strtol standard et fiable
- **Flexibilité** : Gère différents séparateurs
- **Standard** : strtol gère les signes et espaces

## Architecture des utilitaires

### Gestion de buffer

#### **Cycle de vie**
```
init() → append() → get_line() → [répéter]
   ↓        ↓          ↓
vide    ajouter    extraire
```

#### **Caractéristiques**
- **Taille fixe** : BUF_SIZE = 4096
- **Circulaire** : Les données sont déplacées après extraction
- **Sécurisé** : Protection contre les débordements
- **Efficace** : Utilise memcpy et memmove optimisés

### Parsing JSON

#### **Limitations**
- **Simple** : Pas de parsing hiérarchique
- **Basique** : Gère uniquement les clés de premier niveau
- **Rapide** : Utilise des recherches de chaînes simples

#### **Robustesse**
- **Validation** : Vérifie la présence des guillemets
- **Protection** : Limite les tailles de copie
- **Erreurs** : Retourne des valeurs par défaut (vide, -1)

## Sécurité et Performance

### Sécurité
- **Bounds checking** : Protection contre les débordements de buffer
- **Validation** : Vérification des formats JSON
- **Allocation** : Vérification des malloc/strtol

### Performance
- **memcpy/memmove** : Fonctions optimisées par le compilateur
- **strstr/strchr** : Recherche de chaînes efficace
- **Évite les allocations** : Buffer sur la pile pour les temporaires

## Cas d'usage et exemples

### Buffer management
```c
buffer_t buf;
myteams_buffer_init(&buf);

// Ajout de données partielles
myteams_buffer_append(&buf, "Hello ", 6);
myteams_buffer_append(&buf, "World\n", 6);

// Extraction de ligne
char *line = myteams_buffer_get_line(&buf); // "Hello World"
free(line);
```

### JSON parsing
```c
char json[] = "{\"uuid\":\"1234\",\"name\":\"test\",\"count\":42}";

char uuid[UUID_LEN];
char name[33];
long count;

myteams_json_extract_str(json, "uuid", uuid, UUID_LEN); // "1234"
myteams_json_extract_str(json, "name", name, 33);       // "test"
count = myteams_json_extract_long(json, "count");     // 42
```

## Conclusion

Ce fichier implémente des utilitaires essentiels avec :
- **Gestion de buffer robuste** pour la communication réseau
- **Parsing JSON simple mais efficace** pour les réponses serveur
- **Protection contre les débordements** à tous les niveaux
- **Performance optimisée** avec des fonctions standard C
- **Architecture modulaire** et réutilisable

Ces utilitaires fournissent les fondations nécessaires pour une communication client-serveur fiable et efficace, tout en maintenant la simplicité et la performance.
