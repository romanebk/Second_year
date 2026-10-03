# Architecture Decision Records (ADRs)

Ce dossier contient les décisions d'architecture pour le projet raytracer.

## Qu'est-ce qu'un ADR ?

Un ADR (Architecture Decision Record) est un document qui capture une décision architecturale importante, expliquant :
- **Pourquoi** la décision a été prise
- **Quelles** alternatives ont été considérées
- **Quelles** sont les conséquences

## Format des ADR

Chaque ADR suit le format [Michael Nygard](https://github.com/joelparkerhenderson/architecture_decision_record) :

```
# ADR-XXX: [Titre]

## Status
[Proposed/Accepted/Deprecated/Superseded]

## Context
[Description du contexte et du problème]

## Decision
[La décision prise]

## Consequences
[Conséquences positives et négatives]
```

## Liste des ADR

| ADR | Titre | Status | Date |
|-----|--------|---------|-------|
| ADR-001 | Choix du langage C++20 | Accepted | 2026-05-12 |
| ADR-002 | Utilisation de libconfig++ | Accepted | 2026-05-12 |
| ADR-003 | Architecture modulaire avec interfaces | Accepted | 2026-05-12 |
| ADR-004 | Multithreading pour le rendu | Accepted | 2026-05-12 |
| ADR-005 | Smart pointers pour gestion mémoire | Accepted | 2026-05-12 |
| ADR-006 | Format de sortie PPM | Accepted | 2026-05-12 |
| ADR-007 | Patterns Factory/Builder/Composite | Accepted | 2026-05-12 |

---

*Pour ajouter un nouvel ADR, copiez le template ci-dessous et suivez le format établi.*
