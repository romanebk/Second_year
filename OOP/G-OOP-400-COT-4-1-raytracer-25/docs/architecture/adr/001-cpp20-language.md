# ADR-001: Choix du langage C++20

## Status
Accepted

## Context
Pour le projet raytracer Epitech G-OOP-400, nous devions choisir un langage de programmation qui offre :
- Performance élevée pour les calculs mathématiques intensifs
- Support pour la programmation orientée objet
- Gestion mémoire manuelle et automatique
- Support pour le multithreading
- Bon écosystème de bibliothèques

## Alternatives considérées

### C
- **Avantages** : Performance maximale, contrôle total mémoire
- **Inconvénients** : Pas de support natif POO, gestion complexe des structures

### Rust
- **Avantages** : Sécurité mémoire, performance moderne
- **Inconvénients** : Courbe d'apprentissage abrupte, écosystème moins mature

### C++17
- **Avantages** : Support large, standard stable
- **Inconvénients** : Pas de concepts, ranges, ou autres features C++20

### C++20
- **Avantages** : Features modernes (concepts, ranges), compatibilité C++17
- **Inconvénients** : Support compilateur moins universel

## Decision
Nous avons choisi **C++20** pour les raisons suivantes :

1. **Performance** : Compilé en natif, idéal pour calculs 3D
2. **POO mature** : Support complet des classes, héritage, polymorphisme
3. **Smart pointers** : `std::unique_ptr`, `std::shared_ptr` pour gestion mémoire
4. **Multithreading** : `std::thread`, `std::mutex`, `std::async`
5. **Features C++20** : Concepts pour templates plus sûrs, ranges pour algorithmes
6. **Compatibilité** : Code C++17 compatible si nécessaire

## Consequences

### Positives
- Performance optimale pour le raytracing
- Gestion mémoire sécurisée avec smart pointers
- Support natif multithreading
- Code moderne et maintenable
- Large écosystème de bibliothèques (libconfig++, SFML)

### Négatives
- Compilation plus lente que C
- Courbe d'apprentissage plus abrupte que Rust
- Nécessite gestion manuelle des dépendances

### Mitigations
- Utilisation de CMake/Makefile pour gestion dépendances
- Documentation complète des patterns utilisés
- Tests automatisés pour validation

---

*Decision prise le 12 mai 2026*
