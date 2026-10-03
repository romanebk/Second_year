# St4ck - Write-up (R3t2func)
---

## Étape 1 : Connexion initiale au système

Je me suis connecté avec les identifiants obtenus lors des challenges précédents :

```bash
ssh guest@ecorp.cyber.epitest.eu -p 60759
```

**Identifiants utilisés :**
- **Utilisateur** : `guest`
- **Mot de passe** : `Ec0rpSuP3rS3cur3P4ss`

---

## Étape 2 : Élévation de privilèges

Après la connexion initiale, j'ai procédé à l'élévation de privilèges en utilisant les comptes internes découverts précédemment :

```bash
su intern
# ou
su junior-dev
```

**Note de sécurité importante** : 
Aucun mot de passe n'a été requis pour ces changements d'utilisateur, ce qui représente une **faille de sécurité critique** dans un environnement de production. Cette absence d'authentification multi-utilisateur pourrait permettre des escalades de privilèges non contrôlées.

---

## Étape 3 : Exploration systématique du système

Une fois les droits élevés obtenus, j'ai mené une exploration complète du système de fichiers à la recherche d'informations sensibles.

**Commande d'exploration utilisée :**
```bash
find / -name "*.txt" -o -name "*.log" -o -name "*flag*" -o -name "*secret*" 2>/dev/null
```

Cette recherche systématique m'a permis de découvrir le fichier `/home/senior-dev/todo.txt` qui contenait des informations particulièrement intéressantes.

---

## Étape 4 : Analyse du fichier todo.txt

L'examen du fichier todo.txt a révélé une liste de tâches administratives avec une information critique :

```bash
cat /home/senior-dev/todo.txt
```

**Contenu du fichier :**
```
TODO – This Week

[x] Review open PRs (focus on security + performance)
[x] Refactor legacy module (reduce cyclomatic complexity)
[ ] Add missing unit tests (edge cases + regressions)
[ ] Check CI pipeline failures and flaky tests

[ ] Update technical documentation (ADR + README)
[x] Validate logging & error with the secret API token EPI{5ENI0R_d0E5N7_mEAN_Le55_pr0ne_70_HACK}
[x] Sync with infra team on upcoming changes
[ ] Reserve time for tech debt (at least 1h)

Notes:
- Keep changes minimal and reviewable
- Prefer clarity over cleverness
```

---

## Étape 5 : Découverte du flag final

**Le flag final a été découvert dans une ligne de todo :**

```
[x] Validate logging & error with the secret API token EPI{5ENI0R_d0E5N7_mEAN_Le55_pr0ne_70_HACK}
```

**Flag obtenu** : `EPI{5ENI0R_d0E5N7_mEAN_Le55_pr0ne_70_HACK}`

Ce flag était dissimulé dans ce qui ressemblait à une note technique sur la validation des logs et des erreurs, utilisant un token API comme prétexte pour cacher l'information.

---

## Résultat du Challenge

**Succès !** Le sixième et dernier challenge a été résolu avec succès en :

1. **Utilisant les accès privilégiés** obtenus lors des challenges précédents
2. **Explorant systématiquement** les fichiers sensibles du système
3. **Découvrant le flag final** caché dans un fichier todo administratif
4. **Obtenant le flag** : `EPI{5ENI0R_d0E5N7_mEAN_Le55_pr0ne_70_HACK}`

---

## Analyse de la Vulnérabilité

### Nom de la vulnérabilité
**Divulgation d'informations par fuite de données administratives**

### Description technique
Le flag final a été découvert dans un fichier de notes administratives (`todo.txt`) qui contenait des informations sensibles en clair. Cette vulnérabilité représente une failure dans la gestion des secrets et des informations critiques au sein de l'organisation.

### Conséquences de cette vulnérabilité

#### Impact sur la sécurité
1. **Divulgation de secrets** : Token API exposé en clair
2. **Perte de confidentialité** : Informations sensibles accessibles
3. **Compromission interne** : Accès non autorisé aux données critiques
4. **Risque de chaîne** : Ce token pourrait donner accès à d'autres systèmes

#### Scénarios d'attaque possibles
- **Reconnaissance interne** : Découverte de secrets et tokens
- **Accès latéral** : Utilisation du token pour accéder à d'autres services
- **Exfiltration de données** : Vol d'informations sensibles
- **Persistance** : Maintien d'accès via les tokens découverts

---

## Mesures de correction et prévention

### Corrections immédiates
1. **Suppression immédiate** des fichiers contenant des secrets
2. **Révocation des tokens** exposés
3. **Audit complet** des fichiers administratifs
4. **Changement des credentials** potentiellement compromis

### Mesures de sécurité à long terme

#### Bonnes pratiques de gestion des secrets
- **Utilisation de gestionnaires de secrets** (Vault, AWS Secrets Manager)
- **Jamais de secrets en clair** dans les fichiers
- **Rotation régulière** des tokens et credentials
- **Principe de moindre privilège** pour l'accès aux informations

#### Sécurité documentaire
- **Chiffrement des notes** contenant des informations sensibles
- **Séparation des environnements** (dev/staging/prod)
- **Audit régulier** des fichiers et documents
- **Formation des équipes** à la gestion des secrets

#### Contrôles d'accès
- **Permissions restrictives** sur les fichiers administratifs
- **Journalisation des accès** aux fichiers sensibles
- **Surveillance** des tentatives d'accès non autorisées
- **Validation des permissions** avant déploiement

---

## Bonnes pratiques générales

### A faire
- **Utiliser des gestionnaires de secrets** pour stocker les tokens
- **Chiffrer toutes les informations** sensibles
- **Mettre en place des audits** réguliers des fichiers
- **Former les équipes** à la sécurité des données

### A éviter
- **Stocker des secrets en clair** dans des fichiers
- **Utiliser des tokens permanents** sans rotation
- **Négliger les permissions** sur les fichiers administratifs
- **Ignorer la gestion** des secrets dans les processus DevOps

---

**Mission accomplie** : Le sixième challenge a été résolu avec succès.

## Résumé du sixième challenge

Ce challenge nous a montré l'importance de :

1. **L'exploration systématique** après obtention de privilèges
2. **La vigilance face aux fuites** de données administratives  
3. **La gestion rigoureuse** des secrets et tokens
4. **L'audit complet** des systèmes même après compromission initiale

**Leçon apprise** :
Même après avoir obtenu un accès privilégié, la découverte d'informations sensibles demande de l'analyse et de la persévérance. La sécurité repose sur **la protection complète des informations** et **la gestion rigoureuse des secrets** à tous les niveaux de l'infrastructure.

---

**Sixième challenge résolu** : Ce défi nous a permis de comprendre l'importance de l'exploration systématique et de la gestion des secrets administratifs. Prêts pour le prochain challenge !






find / -name "*.txt" -o -name "*.log" -o -name "*flag*" -o -name "*secret*" 2>/dev/null
find . -name "*enumerate*" 2>/dev/null
./binaries/enumerate
sudo -l
cat /home/senior-dev/.conspiracy.txt