# Analyse détaillée de `include/utils.h`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2024
** myteams_cli
** File description:
** Buffer and JSON utils
*/
```
- **Lignes 1-6** : Header standard EPITECH. Note : l'année indique 2024 et le nom "myteams_cli" suggère que ce fichier a été initialement créé pour le client puis partagé.

## Protection d'inclusion (lignes 8-9)
```c
#ifndef UTILS_H_
#define UTILS_H_
```
- **Ligne 8** : Protection contre les inclusions multiples du header
- **Ligne 9** : Définition du guard pour éviter les inclusions futures

## Inclusions (lignes 11)
```c
#include <stdlib.h>
```
- **Ligne 11** : Inclusion de la bibliothèque standard C pour les fonctions mémoire (malloc, free, etc.)

## Constantes (lignes 13-14)
```c
#define BUF_SIZE 4096
#define UUID_LEN 37
```
- **Ligne 13** : `BUF_SIZE` définit la taille des buffers de communication (4KB). Cette taille est optimisée pour :
  - Correspondre à une page mémoire standard
  - Éviter les fragmentations mémoire fréquentes
  - Gérer des messages de taille raisonnable
- **Ligne 14** : `UUID_LEN` définit la taille d'un UUID (37 caractères) :
  - 36 caractères pour l'UUID au format standard (8-4-4-4-12)
  - 1 caractère pour le terminateur nul '\0'

## Structure buffer (lignes 16-19)
```c
typedef struct {
    char data[BUF_SIZE];  // Tableau de caractères pour stocker les données
    int len;              // Longueur actuelle des données dans le buffer
} buffer_t;
```
Cette structure représente un buffer circulaire pour la gestion des données réseau :
- **data** : Tableau statique de taille fixe (évite les allocations dynamiques)
- **len** : Compteur de la longueur actuelle pour savoir où insérer les nouvelles données

**Pourquoi cette structure ?**
- **Performance** : Évite les malloc/free fréquents
- **Sécurité** : Taille fixe prévient les buffer overflows
- **Simplicité** : Gestion simple des flux de données

## Déclarations de fonctions buffer (lignes 21-23)
```c
void myteams_buffer_init(buffer_t *buf);
void myteams_buffer_append(buffer_t *buf, const char *src, int len);
char *myteams_buffer_get_line(buffer_t *buf);
```

### `myteams_buffer_init`
- **Purpose** : Initialise un buffer à son état vide
- **Paramètre** : `buf` - Pointeur vers le buffer à initialiser
- **Action** : Met `len` à 0 et nettoie le tableau `data`

### `myteams_buffer_append`
- **Purpose** : Ajoute des données dans le buffer
- **Paramètres** :
  - `buf` : Buffer destination
  - `src` : Source des données à ajouter
  - `len` : Longueur des données à ajouter
- **Action** : Copie `len` octets de `src` vers `buf->data[buf->len]` et met à jour `buf->len`

### `myteams_buffer_get_line`
- **Purpose** : Extrait une ligne complète du buffer
- **Paramètre** : `buf` - Buffer contenant les données
- **Retour** : Pointeur vers la ligne trouvée ou NULL si pas de ligne complète
- **Action** : Cherche '\n' ou '\r\n' dans le buffer, retourne un pointeur vers le début de la ligne

## Déclarations de fonctions JSON (lignes 24-25)
```c
void myteams_json_extract_str(const char *json, const char *key, char *dest, int dest_size);
long myteams_json_extract_long(const char *json, const char *key);
```

### `myteams_json_extract_str`
- **Purpose** : Extrait une valeur chaîne d'un JSON
- **Paramètres** :
  - `json` : Chaîne JSON source
  - `key` : Clé à rechercher
  - `dest` : Buffer destination pour stocker la valeur
  - `dest_size` : Taille du buffer destination
- **Action** : Parse le JSON et copie la valeur associée à `key` dans `dest`

### `myteams_json_extract_long`
- **Purpose** : Extrait une valeur numérique d'un JSON
- **Paramètres** :
  - `json` : Chaîne JSON source
  - `key` : Clé à rechercher
- **Retour** : Valeur numérique trouvée ou 0 si erreur
- **Action** : Parse le JSON et convertit la valeur en long

## Fin du header (lignes 27-28)
```c
#endif
```
Fermeture de la protection d'inclusion.

## Architecture et Conception

### Pourquoi ces utilitaires ?
1. **Abstraction** : Cache la complexité de la manipulation des buffers et JSON
2. **Réutilisabilité** : Fonctions utilisables par client et serveur
3. **Sécurité** : Contrôle des tailles pour éviter les overflows
4. **Performance** : Optimisation mémoire avec buffers statiques

### Flux de données typique
```
Socket → myteams_buffer_append → myteams_buffer_get_line → Parse JSON → myteams_json_extract_*
```

### Gestion des erreurs
- Les fonctions retournent des valeurs par défaut (NULL, 0) en cas d'erreur
- Les tailles sont vérifiées pour prévenir les buffer overflows
- Les buffers ont une taille fixe pour éviter les allocations dynamiques

## Conclusion

Ce header fournit les fondations pour :
- **Communication réseau** : Gestion des flux de données TCP
- **Parsing JSON** : Extraction des données des messages protocolaires
- **Sécurité** : Protection contre les vulnérabilités mémoire

C'est une couche d'abstraction essentielle qui simplifie le développement des protocoles de communication.
