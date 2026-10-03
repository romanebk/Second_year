# ADR-006: Format de sortie PPM
## Status
# ADR-006: Format de sortie PPM
Accepted

## Context
Pour le projet raytracer, nous devions choisir un format de sortie d'image. Le cahier des charges spécifie :
- "No GUI, output to a PPM file"
- Format simple pour éviter dépendances complexes
- Compatible avec les outils de visualisation standards

- **Avantages** : Format standard, compression disponible
- **Inconvénients** : En-têtes complexes, gestion des couleurs spécifique

### PNG avec libpng

### JPEG avec libjpeg

### PPM (Portable Pixmap)

### Format personnalisé

## Decision
### Spécification du format
```
P3                    # Magic number (ASCII)
width height            # Dimensions
255                   # Valeur maximale RGB
R G B                  # Pixel 1
R G B                  # Pixel 2
...
```

### Implementation
```cpp
void Renderer::saveAsPPM(const std::string& filename) {
    std::ofstream file(filename);
    
    file << "P3\n";
    file << _width << " " << _height << "\n";
    file << "255\n";
    
    for (int y = 0; y < _height; y++) {
        for (int x = 0; x < _width; x++) {
            Vector3& c = _pixels[y * _width + x];
            file << (int)c.x << " " << (int)c.y << " " << (int)c.z << "\n";
        }
    }
}
```

## Consequences

### Positives
- **Zéro dépendance** : Pas de bibliothèque externe requise
- **Simplicité** : Format ASCII lisible et debuggable
- **Standard** : Supporté par ImageMagick, feh, eog, etc.
- **Éducationnel** : Format parfait pour comprendre les images numériques
- **Limitations** : Pas de transparence, pas de compression

- **Streaming** : Écriture ligne par ligne pour limiter mémoire

display screenshot.ppm

# Avec feh (léger)
feh screenshot.ppm

# Avec eog (GNOME)
eog screenshot.ppm

# Conversion vers PNG
convert screenshot.ppm screenshot.png
```

### Tailles typiques
| Résolution | Taille PPM | Taille PNG équivalent |
|------------|-------------|-------------------|
| 800x600    | ~1.4MB      | ~200KB            |
| 1920x1080  | ~6.2MB      | ~800KB            |
| 4K (3840x2160) | ~25MB     | ~3MB              |

---

*Decision prise le 12 mai 2026*
