# Cycle Jour / Nuit — Guide d'implémentation

Ce document décrit, partie par partie du projet, comment ajouter un cycle
**jour / nuit** dans le monde Zappy. Il s'appuie sur l'architecture actuelle
(rendu OpenGL via `zappy_gui`, protocole figé côté `zappy_server`, IA dans
`zappy_ai`).

---

## 1. Vue d'ensemble et choix de conception

### 1.1 Où vit la feature ?

Le cycle jour/nuit est **purement visuel** : il modifie l'éclairage, la
couleur du ciel et l'ambiance. Il n'a **aucun impact sur les règles du jeu**.

- **`zappy_server`** : le protocole Zappy est **figé**. Le serveur ne connaît
  pas de notion de jour/nuit ; il n'expose que `freq` (vitesse des actions) via
  `sgt`/`sst`. → **Aucune modification obligatoire.**
- **`zappy_ai`** : l'IA ne reçoit aucune information de jour/nuit (protocole
  figé) et **ne doit pas** en dépendre. → **Aucune modification.**
- **`zappy_gui`** : c'est **ici** que tout se passe (horloge, éclairage, ciel,
  shaders, HUD).

### 1.2 Deux stratégies pour l'horloge

| Stratégie | Source du temps | Synchro multi-GUI | Changement serveur | Reco |
|-----------|-----------------|-------------------|--------------------|------|
| **A. Horloge locale** | `sceneTime` (déjà accumulé dans `RenderThread`) | Non | Aucun | ✅ Simple |
| **B. Horloge murale partagée** | `std::chrono` (epoch) | Oui (sans réseau) | Aucun | ✅ Si plusieurs GUI |
| **C. Synchro serveur** | tick/temps serveur | Oui | Protocole non-standard | ⚠️ Déconseillé (conformité Epitech) |

> Recommandation : commencer par **A**. Passer à **B** seulement si vous lancez
> plusieurs GUI qui doivent afficher la même heure. **C** casse la conformité
> au sujet et n'apporte rien de plus que **B** pour l'affichage.

---

## 2. Partie GUI — cœur de l'implémentation

### 2.1 Nouveau module `DayNightCycle`

Créer `zappy_gui/include/renderer/DayNightCycle.hpp` :

```cpp
#pragma once
#include <glm/glm.hpp>

// Calcule l'état d'éclairage du monde en fonction d'une phase [0,1).
// phase 0.0 = minuit, 0.25 = aube, 0.5 = midi, 0.75 = crépuscule.
class DayNightCycle {
public:
    struct Lighting {
        glm::vec3 sunDir;      // direction de la lumière (normalisée)
        glm::vec3 lightColor;  // couleur/intensité du soleil ou de la lune
        glm::vec3 skyColor;    // couleur de fond (horizon) pour glClearColor
        float     ambient;     // terme ambiant [0..1]
        float     nightFactor; // 0 = plein jour, 1 = pleine nuit
    };

    explicit DayNightCycle(float cycleSeconds = 120.f)
        : _cycleSeconds(cycleSeconds) {}

    void  update(float dt);            // stratégie A (horloge locale)
    void  syncToWallClock();           // stratégie B (horloge murale partagée)
    void  setPhase(float p) { _phase = p - std::floor(p); }
    float phase() const     { return _phase; }

    Lighting compute() const;          // dérive l'éclairage de la phase

private:
    float _cycleSeconds;
    float _phase = 0.30f;              // démarre un peu après l'aube
};
```

Créer `zappy_gui/src/renderer/DayNightCycle.cpp` :

```cpp
#include "renderer/DayNightCycle.hpp"
#include <chrono>
#include <cmath>

static glm::vec3 lerp3(const glm::vec3 &a, const glm::vec3 &b, float t) {
    return a + (b - a) * t;
}

void DayNightCycle::update(float dt) {
    _phase += dt / _cycleSeconds;
    _phase -= std::floor(_phase);      // wrap dans [0,1)
}

void DayNightCycle::syncToWallClock() {
    // Toutes les GUI calculent la même phase sans échanger de données.
    using namespace std::chrono;
    double secs = duration<double>(
        system_clock::now().time_since_epoch()).count();
    _phase = static_cast<float>(std::fmod(secs / _cycleSeconds, 1.0));
}

DayNightCycle::Lighting DayNightCycle::compute() const {
    const float TWO_PI = 6.28318530718f;

    // Hauteur du soleil : +1 à midi (phase 0.5), -1 à minuit (phase 0.0)
    float ang        = _phase * TWO_PI - 1.57079632679f; // -pi/2
    float sunHeight  = std::sin(ang);
    float sunAzimuth = std::cos(ang);

    Lighting L;
    L.sunDir = glm::normalize(glm::vec3(sunAzimuth * 0.6f,
                                        std::max(sunHeight, -0.9f),
                                        0.5f));

    // dayFactor : 0 la nuit, 1 le jour, transition douce au lever/coucher
    float dayFactor   = glm::clamp((sunHeight + 0.15f) / 0.4f, 0.f, 1.f);
    L.nightFactor     = 1.f - dayFactor;

    // Teinte chaude proche de l'horizon (aube/crépuscule)
    float horizon     = 1.f - glm::clamp(std::abs(sunHeight) / 0.25f, 0.f, 1.f);

    glm::vec3 dayLight   (1.00f, 0.97f, 0.90f);
    glm::vec3 sunsetLight(1.00f, 0.55f, 0.30f);
    glm::vec3 nightLight (0.35f, 0.45f, 0.75f);  // clair de lune bleuté

    L.lightColor = lerp3(nightLight,
                         lerp3(dayLight, sunsetLight, horizon),
                         dayFactor);

    glm::vec3 skyDay   (0.45f, 0.65f, 0.95f);
    glm::vec3 skySunset(0.85f, 0.45f, 0.30f);
    glm::vec3 skyNight (0.03f, 0.04f, 0.10f);    // ~ glClearColor actuel

    L.skyColor = lerp3(skyNight,
                       lerp3(skyDay, skySunset, horizon),
                       dayFactor);

    L.ambient = 0.08f + dayFactor * 0.27f;       // 0.08 nuit → 0.35 jour
    return L;
}
```

> N'oubliez pas d'ajouter `src/renderer/DayNightCycle.cpp` aux sources compilées
> (il est automatiquement pris si votre `zappy_gui/Makefile` globbe `src/**`,
> sinon ajoutez-le à la liste `SRC`).

### 2.2 Intégration dans `RenderThread`

Fichier : `zappy_gui/src/renderer/RenderThread.cpp`.

1. **Inclure et instancier** le cycle :

```cpp
#include "renderer/DayNightCycle.hpp"
// ...
DayNightCycle dayNight(120.f);   // cycle complet de 2 minutes
```

2. **Chaque frame**, juste après `sceneTime += dt;` :

```cpp
dayNight.update(dt);                       // stratégie A
// dayNight.syncToWallClock();             // stratégie B (à la place)
DayNightCycle::Lighting day = dayNight.compute();
```

3. **Remplacer la couleur de fond fixe** (actuellement
   `glClearColor(0.06f, 0.07f, 0.13f, 1.f);`) :

```cpp
glClearColor(day.skyColor.r, day.skyColor.g, day.skyColor.b, 1.f);
```

4. **Envoyer les uniformes d'éclairage à chaque shader** avant de dessiner.
   Une petite lambda évite la duplication :

```cpp
auto applyDayNight = [&](Shader &sh) {
    sh.use();
    sh.setVec3 ("lightDir",    day.sunDir);
    sh.setVec3 ("lightColor",  day.lightColor);
    sh.setFloat("ambient",     day.ambient);
    sh.setFloat("nightFactor", day.nightFactor);
};

applyDayNight(tileShader);
applyDayNight(objectShader);
applyDayNight(playerShader);
```

Placez ces appels juste avant les blocs `tileShader.use(); ...`,
`resourceRenderer.draw(...)` et `entityRenderer.draw(...)` existants (l'appel
`use()` est idempotent, mais regroupez si vous voulez éviter les changements de
programme superflus).

### 2.3 Modifications des shaders

Les shaders utilisent aujourd'hui une lumière **codée en dur**. Il faut la
remplacer par les uniformes envoyés ci-dessus.

#### `assets/shaders/tile.frag`

Ajouter les uniformes en tête :

```glsl
uniform vec3  lightDir;     // remplace le vec3(0.4,1.0,0.5) codé en dur
uniform vec3  lightColor;
uniform float ambient;
uniform float nightFactor;  // 0 jour → 1 nuit
```

Remplacer le bloc d'éclairage :

```glsl
// AVANT :
// vec3  L     = normalize(vec3(0.4, 1.0, 0.5));
// float light = 0.28 + diff * 0.55;

// APRÈS :
vec3  L     = normalize(lightDir);
vec3  N     = normalize(Normal);
float diff  = max(dot(N, L), 0.0);
float light = ambient + diff * 0.55;
```

Puis teinter la scène par `lightColor` et **renforcer les étoiles la nuit** (la
grille et les micro-étoiles existent déjà dans ce shader) :

```glsl
vec3 color = spaceBase * light * lightColor;
// ...
color += vec3(0.75, 0.88, 1.0) * star * (0.10 + nightFactor * 0.6);
```

#### `assets/shaders/object.frag` et `assets/shaders/player.frag`

Même principe : remplacer leur `lightDir`/ambient codés en dur par les
uniformes, multiplier la composante diffuse par `lightColor`, et **augmenter
l'émissif la nuit** pour que cristaux et lignes lumineuses des aliens
« ressortent » dans le noir :

```glsl
// player.frag / object.frag : émission renforcée la nuit
if (hasEmissive > 0.5) {
    vec3 emis = texture(emissiveTex, UV).rgb;
    color += emis * (1.0 + nightFactor * 1.5);
}
```

> Les vertex shaders (`*.vert`) n'ont rien à changer : `lightDir` est utilisé
> en espace monde dans le fragment shader.

### 2.4 Ciel, soleil/lune et étoiles (optionnel mais conseillé)

- **Dégradé de ciel** : `glClearColor` suffit pour un fond uni. Pour un dégradé
  horizon→zénith, dessinez un quad plein écran **avant** tout (depth test
  désactivé) avec un mini-shader qui interpole `skyColorBottom`→`skyColorTop`.
- **Soleil / lune** : un *billboard* (quad orienté caméra) positionné selon
  `day.sunDir`, avec un disque dégradé. Lune = même billboard quand
  `nightFactor > 0.5`.
- **Étoiles** : déjà présentes dans `tile.frag` ; l'intensification proposée en
  2.3 (`* nightFactor`) les fait apparaître la nuit. Pour un vrai ciel étoilé,
  ajoutez-les dans le shader de skybox.

### 2.5 HUD — indicateur d'heure

Fichier : `zappy_gui/src/renderer/RenderThread.cpp` (méthode `drawOverlay`) ou
`zappy_gui/src/hud/HUD.cpp`.

Afficher la phase de manière lisible (ex. icône ☀/🌙 + pourcentage) :

```cpp
const char* moment =
    (day.nightFactor > 0.75f) ? "Nuit" :
    (day.nightFactor > 0.4f)  ? "Crépuscule" :
    (day.nightFactor > 0.1f)  ? "Aube" : "Jour";
oss << "Cycle   " << moment;
label(oss.str(), 14, 104, 13, {200, 200, 160});
```

Pour passer `day` au HUD, ajoutez-le en paramètre de `drawOverlay`/`HUD::draw`,
ou stockez la dernière `Lighting` dans un membre de `RenderThread`.

---

## 3. Partie Serveur (`zappy_server`)

### 3.1 Cas standard : aucune modification

Le protocole GUI est **figé** (`msz`, `bct`, `tna`, `ppo`, `sgt`, `sst`, etc.).
`sgt`/`sst` ne transportent que `freq` (réciproque de l'unité de temps des
actions), **pas** une heure du monde. Le jour/nuit étant cosmétique, le serveur
**n'a rien à faire**.

### 3.2 Si vous voulez une synchro multi-GUI

Préférez la **stratégie B** (horloge murale `std::chrono`) côté GUI : toutes les
instances calculent la même phase **sans** aucun message réseau. C'est la
solution la plus propre et 100 % conforme au sujet.

### 3.3 Option avancée (déconseillée)

Diffuser une phase depuis le serveur impliquerait une **commande GUI
non-standard** (hors sujet Zappy). Si vous y tenez malgré tout :

- ajoutez un message custom optionnel (ex. `dnc <phase>\n`) émis périodiquement
  aux clients GUI, derrière un flag d'activation ;
- côté serveur : un compteur de temps de jeu dans `ServerApp` (vous avez déjà
  `_freq` et la boucle de tick) → `phase = fmod(gameTime / cycleSeconds, 1)` ;
- côté GUI : un handler `dnc` qui appelle `dayNight.setPhase(...)`.

⚠️ À n'utiliser que si l'évaluation l'autorise : cela modifie le protocole.

---

## 4. Partie IA (`zappy_ai`)

**Aucune modification.** L'IA :

- ne reçoit aucune information de jour/nuit (le protocole AI ne la transporte
  pas) ;
- **ne doit pas** faire dépendre sa logique d'un cycle visuel ;
- reste strictement identique, qu'il fasse « jour » ou « nuit » à l'écran.

C'est volontaire : séparer le **rendu** (GUI) de la **logique** (serveur + IA).

---

## 5. Récapitulatif des fichiers

| Partie | Fichier | Action |
|--------|---------|--------|
| GUI | `zappy_gui/include/renderer/DayNightCycle.hpp` | **Créer** (classe horloge + calcul lumière) |
| GUI | `zappy_gui/src/renderer/DayNightCycle.cpp` | **Créer** |
| GUI | `zappy_gui/src/renderer/RenderThread.cpp` | Instancier, `update`, `glClearColor`, envoi uniformes, HUD |
| GUI | `assets/shaders/tile.frag` | Uniformes `lightDir/lightColor/ambient/nightFactor` + étoiles nocturnes |
| GUI | `assets/shaders/object.frag` | Idem + émissif renforcé la nuit |
| GUI | `assets/shaders/player.frag` | Idem + émissif renforcé la nuit |
| GUI | `zappy_gui/src/hud/HUD.cpp` *(ou `drawOverlay`)* | Indicateur d'heure (optionnel) |
| GUI | `zappy_gui/Makefile` | Ajouter `DayNightCycle.cpp` si la liste de sources est explicite |
| Serveur | — | Aucun changement (sauf option 3.3 déconseillée) |
| IA | — | Aucun changement |

---

## 6. Paramètres recommandés (à ajuster)

- **Durée du cycle** : `120 s` pour une démo (jour + nuit en 2 min). Mettez
  `300–600 s` pour un rythme plus posé.
- **Ambient** : `0.08` (nuit) → `0.35` (jour).
- **Couleurs** : voir `compute()` ; ajustez `skyNight` pour qu'il corresponde à
  votre ancien fond `vec3(0.06, 0.07, 0.13)`.
- Exposez idéalement la durée du cycle dans un fichier de config ou via une
  touche clavier (ex. `N` pour accélérer le temps en debug).

---

## 7. Plan d'implémentation par étapes

1. **Shaders** : passer `lightDir`/`ambient` en uniformes (sans rien envoyer
   encore → valeurs par défaut). Vérifier que le rendu est inchangé.
2. **`DayNightCycle`** : créer la classe + `compute()`. Tester `compute()` à
   quelques phases (0.0, 0.25, 0.5, 0.75).
3. **`RenderThread`** : câbler `update`, `glClearColor`, `applyDayNight(...)`.
   → le monde doit maintenant s'assombrir/s'éclaircir cycliquement.
4. **HUD** : afficher l'heure courante.
5. *(option)* Soleil/lune + étoiles nocturnes + dégradé de ciel.
6. *(option)* Synchro multi-GUI via `syncToWallClock()`.

---

## 8. Validation / tests

- **Visuel** : lancer serveur + GUI, observer une transition jour → crépuscule →
  nuit → aube complète sur la durée du cycle.

```bash
./bin/zappy_server -p 4242 -x 20 -y 20 -n team1 team2 -c 5 -f 100 &
./bin/zappy_gui -p 4242 -h localhost
```

- **Continuité** : pas de « saut » de couleur au passage `phase 1.0 → 0.0`.
- **Performance** : le calcul est négligeable (quelques `sin/cos` par frame).
- **Non-régression gameplay** : déplacements, incantations, ressources
  inchangés (le cycle ne touche que le rendu).
- *(stratégie B)* Lancer 2 GUI : elles doivent afficher la **même** heure.
