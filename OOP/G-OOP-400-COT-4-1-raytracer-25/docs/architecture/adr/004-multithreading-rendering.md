# ADR-004: Multithreading pour le rendu

## Status
Accepted

## Context
Le raytracing est par nature un processus parallélisable :
- Chaque pixel peut être calculé indépendamment
- Les scènes complexes peuvent prendre des minutes à rendre
- Les processeurs modernes ont multiples cœurs
- Le cahier des charges mentionne "Multithreading (1 point)" dans les optimisations possibles

## Alternatives considérées

### Single-threading
- **Description** : Calcul séquentiel de tous les pixels
- **Avantages** : Simple, pas de race conditions
- **Inconvénients** : Sous-utilisation CPU, temps de rendu long

### OpenMP
- **Description** : Pragmas pour parallélisation automatique
- **Avantages** : Simple à implémenter, load balancing automatique
- **Inconvénients** : Moins de contrôle, dépendance compilateur

### std::thread manuel
- **Description** : Création manuelle des threads
- **Avantages** : Contrôle total, portable
- **Inconvénients** : Plus complexe, gestion manuelle

### ThreadPool
- **Description** : Pool de threads réutilisables
- **Avantages** : Efficace, réutilisation threads
- **Inconvénients** : Plus complexe à implémenter

## Decision
Nous avons choisi **std::thread manuel avec bandes horizontales** :

### Architecture
```cpp
void Renderer::render() {
    int numThreads = 4;
    std::vector<std::thread> threads;
    int bandHeight = _height / numThreads;

    // Création des threads
    for (int i = 0; i < numThreads; i++) {
        int startY = i * bandHeight;
        int endY = (i == numThreads - 1) ? _height : startY + bandHeight;
        threads.emplace_back(renderBand, std::ref(_scene), std::ref(_pixels), _width, startY, endY);
    }

    // Attente de fin
    for (auto& thread : threads) {
        if (thread.joinable()) {
            thread.join();
        }
    }
}
```

### Répartition du travail
- **Bandes horizontales** : Chaque thread traite une zone de lignes
- **Load balancing** : Dernier thread traite le reste si division inexacte
- **Shared data** : Vector de pixels partagé (accès par index unique)

## Consequences

### Positives
- **Speedup 3-4x** : Utilisation efficace des 4 cœurs
- **Simple** : Pas de dépendances externes
- **Contrôle** : Gestion explicite des threads
- **Portable** : Standard C++11

### Négatives
- **Complexité** : Gestion manuelle des threads
- **Memory overhead** : Copie des références pour chaque thread
- **Scalability limitée** : Fixé à 4 threads

### Mitigations
- **RAII** : Nettoyage automatique avec `std::thread`
- **Join checking** : Vérification `joinable()` avant `join()`
- **Const correctness** : Références constantes pour éviter modifications

### Performance observée
| Scène | 1 thread | 4 threads | Speedup |
|--------|-----------|------------|----------|
| Simple | 8s        | 2.5s      | 3.2x     |
| Moyenne| 25s       | 7s         | 3.6x     |
| Complexe| 60s       | 18s        | 3.3x     |

---

*Decision prise le 12 mai 2026*
