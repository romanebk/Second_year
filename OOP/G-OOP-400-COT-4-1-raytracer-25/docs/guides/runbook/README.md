# Runbook d'Opérations

Ce runbook contient les procédures standards pour les opérations courantes du projet raytracer.

## Table des Matières

1. [Installation Initiale](#installation-initiale)
2. [Compilation et Build](#compilation-et-build)
3. [Exécution et Tests](#exécution-et-tests)
4. [Dépannage](#dépannage)
5. [Déploiement](#déploiement)
6. [Maintenance](#maintenance)

---

## Installation Initiale

### Prérequis Système

```bash
# Vérifier la version du système
lsb_release -a

# Vérifier le compilateur
g++ --version
# Doit être ≥ 9.0 pour C++20
```

### Installation Dépendances

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation dépendances de base
sudo apt install -y build-essential cmake git

# Installation dépendances projet
sudo apt install -y libconfig++-dev libconfig9

# Installation outils de visualisation (optionnel)
sudo apt install -y feh imagemagick eog

# Installation outils de développement (optionnel)
sudo apt install -y valgrind gdb
```

### Vérification Installation

```bash
# Vérifier libconfig++
pkg-config --cflags --libs libconfig++

# Vérifier compilation simple
echo '#include <libconfig.h++>' | g++ -x c++ - -E - > /dev/null && echo "OK" || echo "ERROR"
```

---

## Compilation et Build

### Compilation Standard

```bash
# Nettoyage complet
make fclean

# Compilation avec flags par défaut
make

# Vérification exécutable
ls -la raytracer
file raytracer
```

### Compilation Debug

```bash
# Compilation avec symboles de debug
make CXXFLAGS="-g3 -O0 -DDEBUG"

# Vérification symboles
file raytracer
# Doit montrer "not stripped"
```

### Compilation Release

```bash
# Compilation optimisée
make CXXFLAGS="-O3 -DNDEBUG"

# Vérification optimisation
objdump -h raytracer | head -20
```

### Compilation Alternative (si C++20 problèmes)

```bash
# Forcer C++17
sed -i 's/-std=c++20/-std=c++17/' Makefile
make clean && make
```

---

## Exécution et Tests

### Test de Base

```bash
# Test avec scène simple
./raytracer scenes/simple_sphere.cfg

# Vérification fichier généré
ls -la screenshot.ppm
```

### Tests de Régression

```bash
# Script de test automatique
for scene in scenes/*.cfg; do
    echo "Testing $scene..."
    ./raytracer "$scene" || echo "FAILED: $scene"
    mv screenshot.ppm "output_$(basename $scene .cfg).ppm"
done

# Comparaison visuelle
feh output_*.ppm
```

### Tests Performance

```bash
# Benchmark avec time
time ./raytracer scenes/complex_scene.cfg

# Benchmark détaillé
/usr/bin/time -v ./raytracer scenes/complex_scene.cfg
```

### Tests Mémoire

```bash
# Analyse avec Valgrind
valgrind --leak-check=full --show-leak-kinds=all ./raytracer scenes/simple_sphere.cfg

# Vérification fuites
# "definitely lost: 0 bytes" attendu
```

### Tests Multithreading

```bash
# Test avec différentes configurations
export OMP_NUM_THREADS=1
time ./raytracer scenes/complex_scene.cfg

export OMP_NUM_THREADS=4
time ./raytracer scenes/complex_scene.cfg

# Comparaison speedup
```

---

## Dépannage

### Problèmes de Compilation

#### libconfig++ non trouvé
```bash
# Diagnostic
ldconfig -p | grep libconfig

# Solution
sudo apt install -y libconfig++-dev

# Vérification
find /usr -name "*libconfig*" 2>/dev/null
```

#### C++20 non supporté
```bash
# Diagnostic
echo 'int main(){return 0;}' | g++ -std=c++20 -x c++ -

# Solution temporaire
make CXXFLAGS="-std=c++17 -Iinclude"
```

#### Warnings de compilation
```bash
# Compilation stricte
make CXXFLAGS="-Werror -Wall -Wextra -std=c++20"

# Correction progressive par warning
make 2>&1 | grep "warning:" | head -10
```

### Problèmes d'Exécution

#### Erreur de parsing
```bash
# Diagnostic détaillé
./raytracer scenes/problematic.cfg 2>&1 | tee error.log

# Erreurs communes
grep -E "(Données invalides|Erreur Parser)" error.log
```

#### Segmentation fault
```bash
# Debug avec GDB
gdb ./raytracer
(gdb) run scenes/simple_sphere.cfg
(gdb) bt
(gdb) info registers
```

#### Performance lente
```bash
# Profiling avec perf
perf record -g ./raytracer scenes/complex_scene.cfg
perf report

# Analyse des hotspots
perf top -p $(pgrep raytracer)
```

### Problèmes de Visualisation

#### Fichier PPM non visible
```bash
# Vérification format
head -5 screenshot.ppm
# Doit commencer par "P3"

# Conversion test
convert screenshot.ppm test.png && echo "PPM valide" || echo "PPM invalide"
```

#### Visualiseur non disponible
```bash
# Détection automatique
if command -v feh >/dev/null 2>&1; then
    echo "feh disponible"
elif command -v display >/dev/null 2>&1; then
    echo "ImageMagick disponible"
elif command -v eog >/dev/null 2>&1; then
    echo "Eye of GNOME disponible"
else
    echo "Aucun visualiseur trouvé"
    echo "Installer: sudo apt install -y feh"
fi
```

---

## Déploiement

### Création Package

```bash
# Package Debian
mkdir -p package/DEBIAN
echo "Package: raytracer" > package/DEBIAN/control
echo "Version: 1.0.0" >> package/DEBIAN/control
echo "Architecture: amd64" >> package/DEBIAN/control
echo "Depends: libconfig9 (>= 1.5)" >> package/DEBIAN/control

dpkg-deb --build package/
```

### Installation Système

```bash
# Installation locale
sudo dpkg -i raytracer_1.0.0_amd64.deb

# Vérification
dpkg -l | grep raytracer
which raytracer
```

### Configuration PATH

```bash
# Ajout au PATH
echo 'export PATH=$PATH:/opt/raytracer/bin' >> ~/.bashrc
source ~/.bashrc

# Vérification
which raytracer
raytracer --help
```

---

## Maintenance

### Nettoyage Régulier

```bash
# Nettoyage complet
make fclean

# Nettoyage fichiers temporaires
find . -name "*~" -delete
find . -name "*.o" -delete
find . -name "*.ppm" -delete

# Nettoyage git
git clean -fd
```

### Mise à Jour Dépendances

```bash
# Vérification mises à jour
apt list --upgradable

# Mise à jour sécurisée
sudo apt update && sudo apt upgrade -y

# Vérification compatibilité
make clean && make
```

### Sauvegarde

```bash
# Backup code source
git add -A && git commit -m "Backup avant maintenance"
git tag -a "v$(date +%Y%m%d)" -m "Backup $(date)"

# Backup binaires
cp raytracer raytracer.backup.$(date +%Y%m%d)
tar czf raytracer_backup_$(date +%Y%m%d).tar.gz raytracer.* scenes/
```

### Monitoring

```bash
# Surveillance ressources
watch -n 1 'ps aux | grep raytracer'

# Surveillance espace disque
watch -n 5 'df -h .'

# Surveillance performance
top -p $(pgrep raytracer)
```

---

## Procédures d'Urgence

### Corruption Dépôt Git

```bash
# Diagnostic
git status
git log --oneline -10

# Sauvegarde travail courant
git stash push -m "Emergency stash $(date)"

# Reset propre
git reset --hard HEAD
git clean -fd

# Restauration si nécessaire
git stash pop
```

### Build Cassé

```bash
# Diagnostic complet
make clean
make 2>&1 | tee build.log

# Analyse erreurs
grep -E "(error|Error)" build.log | head -20

# Rollback si nécessaire
git checkout HEAD~1 -- Makefile
make clean && make
```

### Performance Dégradée

```bash
# Benchmark rapide
time ./raytracer scenes/simple_sphere.cfg

# Comparaison avec baseline
if [ $? -eq 0 ]; then
    echo "Performance OK"
else
    echo "Performance dégradée - investiguer"
    # Analyse git récent
    git log --oneline -5 --stat
fi
```

---

## Checklists

### Checklist Release
- [ ] Compilation clean sans warnings
- [ ] Tous les tests passent
- [ ] Documentation à jour
- [ ] Numéro version mis à jour
- [ ] Changelog rédigé
- [ ] Tag créé
- [ ] Package testé

### Checklist Déploiement
- [ ] Dépendances installées
- [ ] Binaires testés
- [ ] Permissions correctes
- [ ] PATH configuré
- [ ] Documentation accessible

### Checklist Maintenance
- [ ] Cache nettoyé
- [ ] Logs archivés
- [ ] Sauvegardes effectuées
- [ ] Performance vérifiée
- [ ] Sécurité validée

---

*Runbook maintenu par l'équipe raytracer Epitech G-OOP-400*
