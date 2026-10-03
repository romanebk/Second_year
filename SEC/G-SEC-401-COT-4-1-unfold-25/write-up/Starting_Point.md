# Bug bounty - Write-up (Starting Point)

# Analyse du Challenge ECORP - Premier Défi

## Étape 1 : Analyse du fichier PDF

Après une analyse initiale du fichier `ECORP-Flyer.pdf` à l'aide d'outils comme `exiftool`, `pdfinfo` et `pdfimages`, j'ai identifié du contenu embarqué intéressant.

Plus précisément, la commande suivante m'a permis d'extraire les images présentes dans le PDF :

```bash
pdfimages -all ECORP-Flyer.pdf image
```

## Étape 2 : Extraction des images

Cette commande a généré plusieurs images (`image-000.jpg`, `image-001.png`, etc.).

En analysant l'image `image-004.jpg`, j'ai découvert une URL cachée :
```
/challenge-draft-do-not-use
```

## Étape 3 : Reconstruction de l'URL

En combinant cette information avec le domaine principal :
```
https://ecorp.cyber.epitest.eu/
```

J'ai obtenu l'URL complète suivante :
```
https://ecorp.cyber.epitest.eu/challenge-draft-do-not-use
```

## Étape 4 : Accès au challenge

Cette URL m'a redirigé vers une page contenant des informations sensibles :

| Paramètre | Valeur |
|-----------|--------|
| **Host** | `ecorp.cyber.epitest.eu` |
| **User** | `intern` |
| **Password** | `EC0rp1sGr34t` |
| **BypassFlag** | `EPI{7H3_r34l_5h0W_I5_4b0u7_70_B3GIn}` |

---

**Mission accomplie** : Le challenge a été résolu grâce à l'analyse de contenu embarqué dans un fichier PDF.

---

## Analyse de la Vulnérabilité

### Nom de la vulnérabilité
**Divulgation d'informations**

### Description technique
Des informations sensibles ont été dissimulées dans une image incluse dans un fichier PDF.
Cette technique de stéganographie permet de cacher des données sans qu'elles soient visibles immédiatement à l'analyse classique du document.

### Conséquences de cette vulnérabilité

#### Impact sur la sécurité
- **Divulgation d'informations** (URL internes, credentials)
- **Accès non autorisé** aux systèmes internes
- **Exposition de données sensibles**
- **Risque réputationnel** pour l'entreprise

#### Scénarios d'attaque possibles
- **Reconnaissance** : Découverte de chemins et services internes
- **Collecte d'informations** : Obtention de credentials valides
- **Accès initial** : Point d'entrée pour des attaques plus complexes
- **Ingénierie sociale** : Utilisation des informations collectées

---

## Mesures de correction et prévention

### Corrections immédiates
- **Analyse systématique** des fichiers avant publication
- **Suppression des métadonnées** et contenus cachés
- **Validation des documents** par des outils spécialisés

### Mesures de sécurité à long terme

#### Bonnes pratiques de développement
- **Utilisation d'outils de détection** (binwalk, strings, exiftool)
- **Mise en place de procédures de validation** des documents
- **Formation des équipes** aux risques de stéganographie

#### Sécurité documentaire
- **Politique de publication** avec validation obligatoire
- **Systèmes de détection** automatique de contenus cachés
- **Audit régulier** des documents publiés
- **Chiffrement** des informations sensibles au lieu de les cacher

---

## Bonnes pratiques générales

### A faire
- **Analyser tous les fichiers** avant publication
- **Utiliser des outils de détection** de stéganographie
- **Mettre en place des audits de sécurité** documentaire
- **Former les équipes** aux risques de contenus cachés

### A éviter
- **Publier des documents sans vérification**
- **Négliger les métadonnées** et contenus embarqués
- **Faire confiance aux fichiers** provenant de sources externes
- **Ignorer les contenus cachés** dans les documents

---

**Leçon apprise** :
Même des éléments apparemment inoffensifs (comme un PDF) peuvent cacher des vulnérabilités critiques.
La sécurité repose sur **l'analyse rigoureuse des documents** et **la vigilance constante contre les contenus cachés**.
