# Carte Interactive — Implémentation

## Architecture

### Composants (6 fichiers)

| Fichier | Rôle |
|---------|------|
| `src/components/SearchBar.jsx` | Barre de recherche avec résultats (expand à plein écran au focus) |
| `src/components/LayerTabs.jsx` | Onglets de couches : signalements, panneaux, zones, heatmap, analyse |
| `src/components/MapMarkers.jsx` | Rendu des markers (signalements, panneaux), polygones (zones), heatmap |
| `src/components/FilterBar.jsx` | Filtres par type/statut pour signalements et panneaux |
| `src/components/DetailModal.jsx` | Modale détaillée (signalement / panneau / zone) |
| `src/components/MapOptions.jsx` | Bouton de bascule carte standard ↔ satellite |

### Styles

- `src/styles/CarteInteractive.styles.js` — tous les styles extraits de l'écran original (258 lignes → 0 dans l'écran)

### Écran principal

- `src/screens/CarteInteractive.jsx` — de 905 lignes → ~130 lignes, orchestre tous les sous-composants

### Dépendances externes

- **Carte** : `react-native-maps` (Leaflet via mock sur le web)
- **Icônes** : émojis uniquement (pas de librairie d'icônes)
- **API** : `http://localhost:4000/api/v1/carte/*`

---

## Fonctionnalités

1. **Recherche** — panneaux et zones avec autocomplete, recentrage sur résultat
2. **Couches** — signalements, panneaux publicitaires, zones, heatmap (basculables par onglets)
3. **Filtres** — par type de signalement, type de panneau, statut de panneau
4. **Modale détail** — informations complètes avec image pour chaque type d'objet
5. **Sélecteur de ville** — filtre les données par ville
6. **Analyse ville** — vue d'analyse dédiée
7. **Type de carte** — standard (OSM) / satellite

---

## Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React Native | 0.76.x | Framework mobile |
| Vite | 5.x | Dev serveur web (port 8080) |
| Tailwind CSS | 4.3.1 | Styles utilitaires (web) |
| NativeWind | 5.0.0-preview.4 | Styles utilitaires (natif) |
| react-native-css | 3.0.7 | Moteur CSS → RN |
| react-native-web | 0.21.x | Pont RN → DOM |
| react-native-maps | 1.18.x | Carte (Leaflet mocké sur web) |

---

## Ce qui reste à faire

- [ ] Migrer les styles `StyleSheet` → classes Tailwind (`className`)
- [ ] Ajouter un thème personnalisé Tailwind (couleurs, espacements)
- [ ] Tests
- [ ] Gestion d'erreur API
- [ ] Pull-to-refresh
- [ ] Pagination des résultats
