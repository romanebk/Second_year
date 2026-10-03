# Documentation du Raytracer

Bienvenue dans la documentation complète du projet raytracer Epitech G-OOP-400.

## Table des Matières

1. [Architecture](#architecture)
2. [Guides pratiques](#guides-pratiques)
3. [API et exemples](#api-et-exemples)
4. [Contribution](#contribution)
│   │   ├── 004-multithreading-rendering.md
│   │   ├── 005-smart-pointers-memory.md
│   │   ├── 006-ppm-output-format.md
│   │   └── 007-design-patterns.md
│   └── DOCUMENTATION.md      # Documentation technique détaillée
├── api/                         # Documentation API (futur)
├── guides/                       # Guides pratiques
│   ├── README.md               # Index des guides
│   └── runbook/              # Runbook d'opérations
│       └── README.md          # Procédures standards
├── examples/                     # Exemples et tutoriels (futur)
└── images/                       # Diagrammes et illustrations (futur)
```

---

## Architecture (`docs/architecture/`)

### [Architecture Overview](architecture/README.md)
Vue d'ensemble de l'architecture modulaire du raytracer

### [Documentation Technique](architecture/DOCUMENTATION.md)
Documentation détaillée de l'implémentation technique

### [Architecture Decision Records (ADR)](architecture/adr/README.md)
Décisions architecturales avec contexte et alternatives :

- **[ADR-001: Choix du langage C++20](architecture/adr/001-cpp20-language.md)**
- **[ADR-002: Utilisation de libconfig++](architecture/adr/002-libconfig-parser.md)**
- **[ADR-003: Architecture modulaire avec interfaces](architecture/adr/003-modular-architecture.md)**
- **[ADR-004: Multithreading pour le rendu](architecture/adr/004-multithreading-rendering.md)**
- **[ADR-005: Smart pointers pour gestion mémoire](architecture/adr/005-smart-pointers-memory.md)**
- **[ADR-006: Format de sortie PPM](architecture/adr/006-ppm-output-format.md)**
- **[ADR-007: Patterns Factory/Builder/Composite](architecture/adr/007-design-patterns.md)**

---

## Guides (`docs/guides/`)

### [Runbook d'Opérations](guides/runbook/README.md)
Procédures standards pour :

- Installation initiale et dépendances
- Compilation et build (debug/release)
- Exécution et tests (performance, mémoire)
- Dépannage (compilation, exécution, visualisation)
- Déploiement et packaging
- Maintenance et monitoring

### [Guide de Contribution](../CONTRIBUTING.md)
Guide complet pour contribuer au projet

---

## Quick Start

### 1. Installation Rapide
```bash
# Clone et installation
git clone https://github.com/EpitechPGE2-2025/G-OOP-400-COT-4-1-raytracer-25.git
cd G-OOP-400-COT-4-1-raytracer-25
make fclean && make
```

### 2. Premier Test
```bash
# Test avec scène simple
./raytracer scenes/simple_sphere.cfg

# Visualiser le résultat
make view
```

### 3. Documentation Complète
Pour comprendre en détail :
- Lisez [README.md](../README.md) pour une vue d'ensemble
- Consultez [DOCUMENTATION.md](architecture/DOCUMENTATION.md) pour les détails techniques
- Référez-vous aux [ADR](architecture/adr/README.md) pour les décisions d'architecture
- Suivez le [runbook](guides/runbook/README.md) pour les opérations

---

## Navigation Rapide

### Pour les Développeurs
- **Nouveau au projet ?** → [README.md](../README.md)
- **Besoin d'ajouter une primitive ?** → [ADR-003](architecture/adr/003-modular-architecture.md) + [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Problème de compilation ?** → [Runbook Dépannage](guides/runbook/README.md#dépannage)
- **Curieux des choix techniques ?** → [Architecture Decision Records](architecture/adr/README.md)

### Pour les Utilisateurs
- **Comment utiliser le raytracer ?** → [README.md Utilisation](../README.md#-utilisation)
- **Comment créer des scènes ?** → [README.md Format des Scènes](../README.md#-format-des-fichiers-de-scène)
- **Scènes d'exemple ?** → [Scènes de Test](../README.md#-scènes-de-test)

### Pour les Opérateurs
- **Déploiement en production ?** → [Runbook Déploiement](guides/runbook/README.md#déploiement)
- **Monitoring et maintenance ?** → [Runbook Maintenance](guides/runbook/README.md#maintenance)
- **Procédures d'urgence ?** → [Runbook Procédures d'Urgence](guides/runbook/README.md#-procédures-durgence)

---

## Évolution de la Documentation

### v1.0 (2026-05-12)
- ✅ Structure de base créée
- ✅ 7 ADR rédigés
- ✅ Runbook complet
- ✅ Documentation technique
- ✅ Guides de contribution

### Futur (v1.1+)
- Documentation API
- Exemples et tutoriels
- Diagrammes d'architecture
- Guide de performance
- FAQ et troubleshooting

---

## Contribuer à la Documentation

La documentation vit avec le code ! Pour l'améliorer :

1. **Corrections** : Pull requests pour typos, erreurs, clarifications
2. **Ajouts** : Nouveaux guides, exemples, ADR pour nouvelles décisions
3. **Traductions** : Versions dans d'autres langues
4. **Diagrammes** : Illustrations, schémas, flowcharts

### Guidelines
- Utiliser le format Markdown
- Ajouter des liens internes entre les documents
- Maintenir la table des matières à jour
- Tester les exemples de code

---

*Documentation maintenue par l'équipe raytracer Epitech G-OOP-400*
