# St4ck - Write-up (Ov3rfl0w)

## Étape 1 : Connexion au serveur

Je me suis connecté avec la commande suivante :

```bash
ssh intern@ecorp.cyber.epitest.eu -p 38746
```

**Identifiants utilisés :**
- **Utilisateur** : `intern`
- **Mot de passe** : `EC0rp1sGr34t`

---

## Étape 2 : Recherche du binaire cible

J'ai trouvé le chemin `/opt/intern/access-checker` avec la commande :

```bash
find / -name "access-checker" 2>/dev/null
```

---

## Étape 3 : Analyse du fichier

Je suis allé dans le dossier `/opt/intern/` et ai exécuté la commande `file access-checker` :

```bash
file access-checker
```

**Résultat obtenu :**
```
access-checker: executable, regular file, no read permission
```

**Note** : Le fichier est exécutable mais pas lisible.

---

## Étape 4 : Exécution normale du programme

Je l'ai donc exécuté et j'ai obtenu le résultat suivant :

```
ECorp access checker, please enter your username:
```

Puis j'ai entré `intern` et j'ai obtenu :

```
Valid username 'intern' found
Thank you for using ECorp access checker!
```

---

## Étape 5 : Exploitation de la vulnérabilité (Buffer Overflow)

Étant donné que le challenge est de type **overflow**, j'ai essayé d'exploiter la vulnérabilité en créant un overflow avec un username très long.

**Résultat de l'exploitation :**

```
Scanning /etc/passwd...
Valid username 'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll'll' found
Failsafe disabled, sending data to our internal website...
=> calling http://internal.ecorp.epi?api_key=EPI{W3lC0m3_70_0v3RFL0wZ}
Segmentation fault (core dumped)
```

---

## Résultat du Challenge

**Succès !** Le buffer overflow a permis de :

1. **Désactiver le failsafe** du programme
2. **Exfiltrer une clé API** vers un site interne
3. **Obtenir le flag** : `EPI{W3lC0m3_70_0v3RFL0wZ}`
4. **Provoquer un segmentation fault** confirmant l'exploitation

---

## Analyse de la Vulnérabilité

### Nom de la vulnérabilité
**Buffer Overflow** (Stack-based Overflow)

### Description technique
Un buffer overflow se produit lorsqu'un programme écrit plus de données que la taille prévue d'une zone mémoire. Dans ce cas, le programme `access-checker` ne valide pas la longueur du nom d'utilisateur entré, permettant ainsi d'écraser des zones mémoire adjacentes sur la pile.

### Conséquences de cette vulnérabilité

#### Impact sur la sécurité
1. **Contournement de sécurité** : Désactivation du failsafe du programme
2. **Exfiltration de données** : Envoi d'une clé API vers un site interne
3. **Exécution arbitraire** : Possibilité d'exécuter du code malveillant
4. **Déni de service** : Crash du programme (segmentation fault)

#### Scénarios d'attaque possibles
- **Bypass d'authentification** : Contourner les mécanismes de sécurité
- **Exfiltration de données** : Vol d'informations sensibles
- **Élévation de privilèges** : Obtenir des droits d'accès supérieurs
- **Prise de contrôle** : Compromission complète du système

---

## Mesures de correction et prévention

### Corrections immédiates
1. **Validation des entrées** : Ajouter des contrôles de longueur sur les entrées utilisateur
2. **Remplacement de fonctions dangereuses** : Utiliser `fgets()` au lieu de `gets()`
3. **Patch du programme** : Limiter la taille des buffers acceptés

### Mesures de sécurité à long terme

#### Bonnes pratiques de développement
**Remplacer les fonctions dangereuses :**
- `gets()`, `strcpy()`, `sprintf()`
- `fgets()`, `strncpy()`, `snprintf()`

**Toujours vérifier la taille des entrées utilisateur**
```c
// Exemple de code sécurisé
char username[64];
fgets(username, sizeof(username), stdin);
username[strcspn(username, "\n")] = '\0'; // Remove newline
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
- **Former les développeurs** aux vulnérabilités connues

### A éviter
- **Utiliser des fonctions non sécurisées** comme `gets()`
- **Négliger les contrôles de taille** des buffers
- **Faire confiance aux entrées utilisateur**
- **Ignorer les warnings** du compilateur

---

**Leçon apprise** :
Les buffer overflows restent l'une des vulnérabilités les plus dangereuses en cybersécurité.
Une simple validation d'entrée peut empêcher des compromissions critiques.
La sécurité repose autant sur **la gestion rigoureuse de la mémoire** que sur **la vigilance constante**.
