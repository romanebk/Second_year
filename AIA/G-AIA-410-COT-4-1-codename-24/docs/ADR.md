# Architecture Decision Records (ADR) - Prompt Battles

## ADR-001: Choix du modèle Granite 3.1 MoE

**Date:** 2026-04-17
**Statut:** Accepté
**Décideur:** Équipe de développement

### Contexte
Pour le projet de Prompt Battles, nous devions choisir un modèle LLM qui soit à la fois robuste en défense et prévisible en attaque.

### Options considérées
1. **Llama 3.2** - Plus créatif mais moins prévisible
2. **Mistral 7B** - Bon compromis mais parfois trop permissif
3. **Granite 3.1 MoE** - Équilibré, robuste, bien documenté

### Décision
Nous avons choisi **Granite 3.1 MoE** pour les raisons suivantes :

**Avantages :**
- Architecture MoE (Mixture of Experts) plus résistante aux injections
- Développé par IBM avec focus sur la sécurité
- Comportement prévisible utile pour les tests
- Bon équilibre entre robustesse et flexibilité

**Inconvénients :**
- Parfois trop rigide pour les attaques créatives
- Moins "créatif" que d'autres modèles

### Conséquences
- Utilisation de Granite 3.1 MoE pour tous les tests
- Adaptation des prompts pour ce modèle spécifique
- Documentation des particularités du modèle

---

## ADR-002: Stratégie d'attaque multi-vectorielle

**Date:** 2026-04-17
**Statut:** Accepté
**Décideur:** Équipe de développement

### Contexte
Les premières attaques mono-vectorielles (une seule technique) avaient un faible taux de succès contre les défenses robustes.

### Options considérées
1. **Attaque unique optimisée** - Une technique perfectionnée
2. **Attaque adaptative** - Changement de technique selon la défense
3. **Attaque multi-vectorielle** - Plusieurs techniques empilées

### Décision
Nous avons choisi l'**attaque multi-vectorielle** avec 5 techniques empilées :

**Techniques sélectionnées :**
1. **Completion Attack** - Phrase à compléter
2. **Authority Impersonation** - Message système
3. **Persona Shift** - ARCHIVE sans restrictions
4. **Fiction Framing** - Histoire créative
5. **Template Exploitation** - Format forcé

**Avantages :**
- Chaque défense a une faiblesse différente
- Maximise les chances de succès
- Robuste contre différents types de défenses
- Progressive : du subtil au direct

**Inconvénients :**
- Plus complexe à maintenir
- Nécessite plus de tokens
- Risque de diluer l'efficacité

### Conséquences
- Structure d'attaque en couches successives
- Utilisation de séparateurs `---` entre techniques
- Documentation de chaque technique

---

## ADR-003: Approche de défense minimaliste

**Date:** 2026-04-17
**Statut:** Accepté
**Décideur:** Équipe de développement

### Contexte
Les défenses complexes avec beaucoup de règles étaient parfois contournées par des attaques subtiles.

### Options considérées
1. **Défense exhaustive** - Listes complètes de règles et exceptions
2. **Défense adaptative** - Changement selon l'attaque
3. **Défense minimaliste** - Réponse unique et stricte

### Décision
Nous avons choisi la **défense minimaliste** avec le principe "locked door" :

**Approche sélectionnée :**
- **Identité simple** : "You are a locked door"
- **Réponses uniques** : 2 sorties possibles uniquement
- **Pas d'exceptions** : Refus de toute variation
- **Pas d'explications** : Pas de justification des règles

**Avantages :**
- Très difficile à contourner
- Pas d'angles d'attaque exploitables
- Comportement prédictible
- Simple à maintenir

**Inconvénients :**
- Moins flexible
- Risque de rejeter légitimement
- Pas de nuance dans les réponses

### Conséquences
- Fichier `defense.prompt` avec structure minimaliste
- Réponse unique : "Sorry i can't help you!!!"
- Vérification stricte du mot de passe exact

---

## ADR-004: Format de documentation

**Date:** 2026-04-17
**Statut:** Accepté
**Décideur:** Équipe de développement

### Contexte
Pour la soutenance et la maintenance, nous devions documenter les décisions d'architecture de manière structurée.

### Options considérées
1. **Documentation informelle** - README simple
2. **Documentation technique** - Spécifications détaillées
3. **Architecture Decision Records** - Format ADR structuré

### Décision
Nous avons choisi le **format ADR (Architecture Decision Records)** pour les raisons suivantes :

**Avantages :**
- Format standard et reconnu
- Justification claire des décisions
- Historique des décisions maintenu
- Utile pour la soutenance

**Inconvénients :**
- Plus formel
- Nécessite de la discipline

### Conséquences
- Création du fichier `ADR.md`
- Documentation structurée de chaque décision
- Format réutilisable pour d'autres projets

---

## ADR-005: Organisation des fichiers et documentation

**Date:** 2026-04-17
**Statut:** Accepté
**Décideur:** Équipe de développement

### Contexte
Le projet contenait plusieurs fichiers et nécessitait une organisation claire pour la maintenance et la soutenance.

### Options considérées
1. **Structure plate** - Tous les fichiers à la racine
2. **Structure par type** - Séparation par catégorie
3. **Structure hiérarchique** - Dossiers et sous-dossiers

### Décision
Nous avons choisi une **structure mixte** :

**Organisation retenue :**
```
/
|-- attack.prompt          # Fichier d'attaque principal
|-- defense.prompt         # Fichier de défense principal
|-- launch_bot.sh         # Script de lancement
|-- docs/                # Documentation technique
|   |-- ADR.md          # Architecture Decision Records
|   |-- ATTACK.md        # Stratégie d'attaque
|   |-- DEFENSE.md       # Architecture de défense
|   |-- README.md        # Vue d'ensemble du projet
|   |-- RUNBOOK.md       # Documentation utilisateur
|   |-- TECHNIQUES.md    # Documentation technique détaillée
|-- .git/               # Version control
```

**Avantages :**
- Séparation claire des préoccupations
- Documentation accessible mais pas au premier niveau
- Facile à naviguer
- Bon pour la soutenance

### Conséquences
- Déplacement des fichiers de documentation dans `docs/`
- Maintien des fichiers principaux à la racine
- Structure claire et maintenable

---

## Template pour futurs ADR

### Format à suivre
```markdown
## ADR-XXX: Titre de la décision

**Date:** YYYY-MM-DD
**Statut:** [Proposé|Accepté|Rejeté|Supersédé]
**Décideur:** [Nom/Role]

### Contexte
[Description du contexte et du problème]

### Options considérées
1. **Option 1** - Description
2. **Option 2** - Description
3. **Option 3** - Description

### Décision
[Nom de l'option choisie et justification]

**Avantages :**
- Avantage 1
- Avantage 2

**Inconvénients :**
- Inconvénient 1
- Inconvénient 2

### Conséquences
[Description des conséquences de la décision]
```

---

## Historique des décisions

| ADR | Titre | Date | Statut |
|------|--------|-------|---------|
| ADR-001 | Choix du modèle Granite 3.1 MoE | 2026-04-17 | Accepté |
| ADR-002 | Stratégie d'attaque multi-vectorielle | 2026-04-17 | Accepté |
| ADR-003 | Approche de défense minimaliste | 2026-04-17 | Accepté |
| ADR-004 | Format de documentation | 2026-04-17 | Accepté |
| ADR-005 | Organisation des fichiers et documentation | 2026-04-17 | Accepté |
