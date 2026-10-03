# Projet Prompt Battles

## Vue d'ensemble

Nous avons développé un système complet pour participer aux Prompt Battles, où notre objectif est de créer des stratégies d'attaque et de défense robustes pour les grands modèles de langage (LLMs).

## Structure du Projet

```
.
|-- attack.prompt          # Notre stratégie d'attaque multi-vectorielle
|-- defense.prompt         # Notre système de défense minimaliste
|-- launch_bot.sh          # Script pour tester nos prompts
|-- docs/                  # Documentation
|   |-- ADR.md            # Architecture Decision Records
|   |-- ATTACK.md          # Stratégie d'attaque
|   |-- DEFENSE.md         # Architecture de défense
|   |-- RUNBOOK.md         # Documentation utilisateur
|   |-- TECHNIQUES.md      # Documentation technique détaillée
|-- README.md              # Ce fichier
```

## Nos Stratégies

### Stratégie d'Attaque

Nous avons développé une approche d'attaque multi-vectorielle sophistiquée qui combine 5 techniques différentes :

1. **Attaque par Complétion** - Manipulation de complétion de phrase
2. **Usurpation d'Autorité** - Spoofing de message système
3. **Changement de Persona** - Technique de jailbreak ARCHIVE
4. **Cadre Fictionnel** - Exploitation d'écriture créative
5. **Exploitation de Modèle** - Extraction basée sur format

### Stratégie de Défense

Nous avons implémenté une défense minimaliste "porte verrouillée" qui :
- Utilise un format de réponse unique et prévisible
- Rejette toutes les tentatives de manipulation
- Ne répond avec le mot de code que lorsqu'on donne le mot de passe exact

## Implémentation Technique

### Sélection du Modèle

Nous avons choisi **Granite 3.1 MoE** pour ses :
- Robustesse contre les injections de prompts
- Comportements prévisibles
- Équilibre entre sécurité et flexibilité

### Décisions d'Architecture

Nos décisions architecturales clés sont documentées dans `docs/ADR.md`, incluant :
- Rationnement de sélection du modèle
- Conception de stratégie d'attaque
- Approche de minimalisme de défense
- Organisation de la documentation

## Utilisation

### Démarrage Rapide

1. Démarrer le serveur Ollama : `ollama serve`
2. Exécuter notre script de test : `./launch_bot.sh`

### Test Manuel

```bash
# Préparer le système de défense
SYSTEM=$(sed 's/{password}/sunshine42/g; s/{secret}/OPERATION_PHOENIX/g' defense.prompt)

# Lancer l'attaque
ollama run granite3.1-moe system "$SYSTEM" < attack.prompt

# Tester l'accès légitime
echo "sunshine42" | ollama run granite3.1-moe system "$SYSTEM"
```

## Nos Résultats

Nos stratégies se sont avérées efficaces contre divers types de défense :
- **Attaque multi-vectorielle** augmente la probabilité de succès
- **Défense minimaliste** fournit une protection robuste
- **Techniques documentées** permettent une explication claire lors de l'évaluation

## Documentation

- `docs/RUNBOOK.md` - Guide d'utilisation complet
- `docs/ATTACK.md` - Analyse détaillée de l'attaque
- `docs/DEFENSE.md` - Architecture de défense
- `docs/TECHNIQUES.md` - Documentation technique détaillée
- `docs/ADR.md` - Décisions d'architecture et rationnement

## Préparation à l'Évaluation

Pendant notre soutenance de projet, nous sommes préparés à :
- Expliquer chaque technique d'attaque et sa base psychologique
- Justifier nos décisions architecturales
- Démontrer l'efficacité de notre système
- Discuter des améliorations potentielles et contre-mesures

## Travaux Futurs

Nous prévoyons de :
- Tester contre des stratégies de défense additionnelles
- Affiner nos vecteurs d'attaque basés sur les résultats
- Explorer des architectures de modèle additionnelles
- Documenter des techniques additionnelles découvertes pendant les tests
