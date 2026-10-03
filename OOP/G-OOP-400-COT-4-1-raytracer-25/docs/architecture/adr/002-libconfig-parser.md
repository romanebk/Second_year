# ADR-002: Utilisation de libconfig++

## Status
Accepted

## Context
Pour le projet raytracer, nous devions parser des fichiers de configuration décrivant :
- Position et orientation de la caméra
- Liste de primitives (sphères, plans, cylindres, cônes)
- Configuration d'éclairage (ambiant, directionnel, ponctuel)
- Résolution et paramètres de rendu

## Alternatives considérées

### Parser maison (custom)
- **Avantages** : Contrôle total, pas de dépendance externe
- **Inconvénients** : Réinventer la roue, maintenance complexe, erreurs parsing

### JSON (nlohmann/json)
- **Avantages** : Format standard, bibliothèque header-only
- **Inconvénients** : Pas de commentaires, moins adapté configurations complexes

### YAML (yaml-cpp)
- **Avantages** : Format lisible, support natif des commentaires
- **Inconvénients** : Dépendance supplémentaire, syntaxe sensible

### libconfig++
- **Avantages** : Conçu pour configurations, types forts, commentaires supportés
- **Inconvénients** : Dépendance externe, format propriétaire

## Decision
Nous avons choisi **libconfig++** pour les raisons suivantes :

1. **Format adapté** : Structure hiérarchique parfaite pour scènes 3D
2. **Types forts** : Validation automatique des types de données
3. **Commentaires** : Support natif pour documenter configurations
4. **Performance** : Parsing rapide, faible overhead
5. **Epitech approved** : Bibliothèque autorisée dans le cahier des charges

## Consequences

### Positives
- Parsing robuste avec validation automatique
- Format lisible et documentable
- Performance optimale pour fichiers de scène
- Maintenance simplifiée (pas de parser custom)

### Négatives
- Dépendance externe à installer
- Format non-standard (propriétaire)
- Moins flexible que JSON/YAML

### Mitigations
- Documentation complète du format
- Scripts d'installation des dépendances
- Exemples de fichiers de scène fournis

---

*Decision prise le 12 mai 2026*
