# Design Patterns — IA Zappy

**Auteurs :** Helena & Fresnel  
**Projet :** G-YEP-400 — Zappy AI Client

---

## Introduction

Ce document décrit les patrons de conception (design patterns) mis en œuvre dans le client IA Zappy. L'objectif est de produire un code maintenable, extensible et testable, respectant les principes SOLID.

---

## 1. State Pattern (Machine à États)

**Où :** `cerveau.py` — classe `Brain`, enum `State`  
**Auteur :** Helena

### Description

Le comportement du drone est modélisé comme une **machine à états finis**. Chaque état correspond à un comportement autonome, et les transitions sont gérées par une fonction d'arbitrage centralisée.

```
         food < 25
        ┌─────────────────────────┐
        │                         ▼
   EXPLORE ←─── [defaut] ──── SURVIVE
        │                         │
        │  ressources ok           │ rassasié
        ▼                         ▼
   COLLECT ──── complètes ───► ELEVATE / RALLY
```

### Implémentation

```python
class State(Enum):
    SURVIVE = "survive"
    COLLECT = "collect"
    ELEVATE = "elevate"
    RALLY   = "rally"
    JOIN    = "join"
    REPRODUCE = "reproduce"
    EXPLORE = "explore"
```

La méthode `arbitrate()` évalue les conditions dans un ordre de priorité strict et affecte `self.state`. La méthode `act()` délègue ensuite au bon handler.

### Avantages
- Chaque état est isolé et testable indépendamment
- Ajouter un état = ajouter une méthode + un cas dans `arbitrate()` et `act()`

---

## 2. Model-Controller Pattern

**Où :** `player.py` (Modèle) + `cerveau.py` (Contrôleur)  
**Auteur :** Helena

### Description

Séparation stricte entre les **données** (`Player`) et la **logique** (`Brain`).

| Composant | Rôle |
|-----------|------|
| `Player` | Stocke l'état du drone (inventaire, vision, niveau). Aucune logique. |
| `Brain` | Lit `Player`, décide, envoie des commandes via `network`. |

### Règle d'or
`Player` n'envoie jamais de commande réseau. `Brain` ne stocke jamais de données métier.

```python
# ✓ Correct : le Brain lit le Player
if self.player.is_hungry():
    self.survive()

# ✗ Incorrect : le Player ne devrait pas décider
# self.player.go_eat()  ← antipattern
```

---

## 3. Adapter Pattern

**Où :** `adaptateur.py`  
**Auteur :** Fresnel

### Description

Le `Brain` (Helena) utilise une interface réseau définie (`send()`, `receive_response()`, `poll_messages()`). Le vrai module réseau de Fresnel (`Reseau`) a une API différente. L'**Adaptateur** traduit l'une vers l'autre sans modifier ni l'un ni l'autre.

```
Brain                Adaptateur              Reseau
─────   send(cmd)  ──────────────────────►  envoyer_commande(cmd)
        ◄──────────  receive_response()  ──  recevoir_reponse()
        ◄──────────  poll_messages()     ──  relever_messages_async()
```

### Avantage
Permet de développer et tester `Brain` et `Reseau` indépendamment, puis de les connecter via l'adaptateur sans refactoring.

---

## 4. Strategy Pattern

**Où :** `explore()` dans `cerveau.py`  
**Auteur :** Helena

### Description

La stratégie d'exploration est interchangeable sans modifier la boucle principale. Le choix du mouvement est délégué à un tirage pondéré :

```python
action = random.choices(
    ["Forward", "Left", "Right"],
    weights=[0.8, 0.1, 0.1]
)[0]
```

Cette pondération favorise les longues lignes droites (efficace sur une carte torique) tout en permettant de changer de "couloir" aléatoirement.

### Extension possible
Remplacer `explore()` par une stratégie de spirale ou de couverture systématique sans toucher au reste du code.

---

## 5. Template Method (partiel)

**Où :** `elevate_here()` et `rally()` dans `cerveau.py`  
**Auteur :** Helena / Fresnel

### Description

Les deux méthodes d'élévation partagent un squelette commun :

```
1. ensure_stones_on_tile()   ← Déposer les pierres
2. Vérifier le quorum        ← (rally : attendre les joueurs)
3. incant()                  ← Lancer l'incantation
```

`elevate_here()` est la version solo, `rally()` est la version multi-joueurs. Toutes deux réutilisent `ensure_stones_on_tile()` et `requirements_on_tile()`.

---

## 6. Observer Pattern (simplifié)

**Où :** `process_broadcasts()` dans `cerveau.py`  
**Auteur :** Fresnel

### Description

La méthode `process_broadcasts()` est appelée à chaque tour de boucle. Elle **consomme** les messages asynchrones bufferisés par le réseau et réagit aux broadcasts de type `"rally"`. Elle fait office d'observateur sur la file des événements serveur.

```python
for kind, payload in self.network.poll_messages(0):
    if kind == "broadcast":
        # Réagir au signal d'un coéquipier
```

---

## Synthèse

| Pattern | Fichier | Bénéfice |
|---------|---------|----------|
| **State** | `cerveau.py` | Comportements isolés et priorités claires |
| **Model-Controller** | `player.py` / `cerveau.py` | Séparation des données et de la logique |
| **Adapter** | `adaptateur.py` | Découplage Brain ↔ Reseau |
| **Strategy** | `cerveau.py` (`explore`) | Algorithme d'exploration interchangeable |
| **Template Method** | `cerveau.py` (`elevate`, `rally`) | Réutilisation du squelette d'incantation |
| **Observer** | `cerveau.py` (`process_broadcasts`) | Réaction aux événements asynchrones |
