# Guides Pratiques

Ce dossier contient les guides pratiques pour l'utilisation et la maintenance du projet raytracer.

## Index des Guides

### [Runbook d'Opérations](runbook/README.md)
Guide complet des procédures standards pour :
- Installation initiale et dépendances
- Compilation et build (debug/release)
- Exécution et tests (performance, mémoire)
- Dépannage (compilation, exécution, visualisation)
- Déploiement et packaging
- Maintenance et monitoring

### [Guide de Contribution](../../CONTRIBUTING.md)
Guide complet pour contribuer au projet :
- Guidelines de code et style
- Architecture et patterns de design
- Développement et testing
- Processus de review et release

---

## Navigation Rapide

### Pour les Développeurs
- **Nouveau développeur ?** → [Runbook Installation](runbook/README.md#installation-initiale)
- **Ajouter une primitive ?** → [Architecture ADR-003](../../docs/architecture/adr/003-modular-architecture.md)
- **Problème de build ?** → [Runbook Dépannage](runbook/README.md#dépannage)
- **Contribuer au code ?** → [Guide de Contribution](../../CONTRIBUTING.md)

### Pour les Utilisateurs
- **Comment utiliser ?** → [README.md Utilisation](../../README.md#-utilisation)
- **Créer des scènes ?** → [README.md Format Scènes](../../README.md#-format-des-fichiers-de-scène)
- **Problèmes courants ?** → [Runbook Dépannage](runbook/README.md#dépannage)

### Pour les Opérateurs
- **Déploiement production ?** → [Runbook Déploiement](runbook/README.md#déploiement)
- **Monitoring ?** → [Runbook Maintenance](runbook/README.md#maintenance)
- **Urgences ?** → [Runbook Procédures d'Urgence](runbook/README.md#procédures-durgence)

---

## Ressources Connexes

### Documentation Technique
- [Architecture Overview](../architecture/README.md)
- [Documentation Technique](../architecture/DOCUMENTATION.md)
- [Architecture Decision Records](../architecture/adr/README.md)

### API et Exemples
- [Scènes de Test](../../scenes/)
- [Exemples d'Utilisation](../../README.md#-utilisation)

### Outils et Utilitaires
- [Makefile Commands](../../README.md#-makefile)
- [Visualisation PPM](../../README.md#-visualiser-les-images)

---

## Checklists Opérationnelles

- [ ] Code suit les conventions de style
- [ ] Tests unitaires passent
- [ ] Documentation mise à jour
- [ ] Pas de fuites mémoire (Valgrind)
- [ ] Performance acceptable

- [ ] Version incrémentée
- [ ] Changelog mis à jour
- [ ] Tag créé
- [ ] Documentation complète
- [ ] Tests de régression passent

- [ ] Dépendances installées
- [ ] Binaires testés
- [ ] Permissions correctes
- [ ] Configuration validée
- [ ] Monitoring en place

---

*Guides maintenus par l'équipe raytracer Epitech G-OOP-400*
