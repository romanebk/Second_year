# Documentation - Couche Réseau Zappy AI

## Vue d'ensemble

Cette partie du projet fournit toute l'infrastructure de communication avec le serveur Zappy. Le cerveau (logique de décision) peut se concentrer sur la stratégie sans se soucier du réseau.

## Fichiers

- **`reseau.py`** : Couche bas niveau (socket, protocole, parsing)
- **`navigation.py`** : Utilitaires de déplacement et perception
- **`zappy_ai.py`** : Point d'entrée du programme
- **`test_navigation.py`** : Tests unitaires (35 tests ✓)
- **`test_integration.py`** : Tests avec serveur réel

## Architecture

```
zappy_ai.py (point d'entrée)
    ↓
Cerveau (à implémenter)
    ↓
Navigateur (navigation.py)
    ↓
Reseau (reseau.py)
    ↓
Serveur Zappy
```

---

## API `reseau.py`

### Classe `Reseau`

#### Initialisation
```python
reseau = Reseau(host, port, team, timeout_connexion=5.0)
```
- Connecte au serveur
- Fait le handshake automatiquement
- Lève `ReseauException` si échec

#### Attributs importants
```python
reseau.places           # int : places restantes dans l'équipe
reseau.taille           # (int, int) : taille de la carte (x, y)
reseau.slots_disponibles # int : slots libres dans la file (max 10)
```

#### Envoyer des commandes
```python
# Vérifier si on peut envoyer
if reseau.peut_envoyer():
    reseau.envoyer_commande("Forward")
    reseau.envoyer_commande("Take", "linemate")
    reseau.envoyer_commande("Set", "food")

# Recevoir la réponse (bloquant)
reponse = reseau.recevoir_reponse()  # "ok", "ko", ou données
```

**Commandes disponibles** :
- Déplacement : `Forward`, `Left`, `Right`
- Vision : `Look`, `Inventory`
- Manipulation : `Take object`, `Set object`
- Social : `Broadcast text`, `Incantation`, `Fork`, `Eject`
- Info : `Connect_nbr`

#### Parsing des réponses
```python
# Inventaire : "[food 5, linemate 2]" → dict
inventaire = reseau.parser_inventaire(reponse)
# {'food': 5, 'linemate': 2, ...}

# Vision : "[player, food, ]" → liste
vision = reseau.parse_vision(reponse)
# [['player'], ['food'], []]

# Broadcast : "message 3, hello" → (direction, texte) 
direction, texte = reseau.parse_broadcast(reponse)
# (3, "hello")

# Eject : "eject: 5" → direction
direction = reseau.parse_eject(reponse)
# 5
```

#### Messages asynchrones
Le serveur peut envoyer des broadcasts/ejects à tout moment. Ils sont automatiquement bufferisés.

```python
# Récupérer les messages en attente (non bloquant)
messages = reseau.relever_messages_async(timeout=0.1)
# [('broadcast', (3, "besoin aide")), ('eject', 5)]

for type_msg, data in messages:
    if type_msg == "broadcast":
        direction, texte = data
        # Réagir au broadcast
    elif type_msg == "eject":
        direction = data
        # On s'est fait éjecter
```

#### Gestion de la mort
```python
try:
    # ... jouer ...
except JoueurMortException:
    print("Le joueur est mort")

# Ou vérifier manuellement
if reseau.est_vivant():
    # continuer à jouer
```

#### Fermeture
```python
reseau.fermer()  # Ferme proprement la connexion
```

---

## API `navigation.py`

### Parsing avancé du Look

```python
from navigation import parser_look, cases_contenant

# Look enrichi avec positions relatives
vue = parser_look("[player food, linemate, , sibur]")
# [
#   {'index': 0, 'rel': (0, 0), 'objets': ['player', 'food']},
#   {'index': 1, 'rel': (-1, 1), 'objets': ['linemate']},
#   {'index': 2, 'rel': (0, 1), 'objets': []},
#   {'index': 3, 'rel': (1, 1), 'objets': ['sibur']}
# ]

# Trouver toutes les cases avec un objet
cases_food = cases_contenant(vue, "food")
# [{'index': 0, 'rel': (0, 0), 'objets': ['player', 'food']}]
```

### Géométrie

Le repère est **relatif au joueur** :
- **dy** = devant (le joueur regarde vers les dy croissants)
- **dx** = droite (+) ou gauche (-)

```
        (-2,2) (-1,2) (0,2) (1,2) (2,2)    ← rangée 2
               (-1,1) (0,1) (1,1)           ← rangée 1
                      (0,0)                 ← joueur (regarde ↑)
```

### Conversion index ↔ position

```python
from navigation import index_vers_position, index_vers_mouvements

# Index de case → position relative
pos = index_vers_position(5)  # (-1, 2)

# Index de case → mouvements pour y aller
mouvements = index_vers_mouvements(5)
# ["Forward", "Forward", "Left", "Forward"]
```

### Broadcast → mouvements

```python
from navigation import broadcast_vers_mouvements

# Direction K (0-8) → mouvements pour se rapprocher
mouvements = broadcast_vers_mouvements(3)  # gauche
# ["Left", "Forward"]
```

**Directions broadcast** :
```
    2   1   8
    3   0   7     0 = sur place, 1 = devant, puis sens anti-horaire
    4   5   6
```

### Classe `Navigateur`

Exécute réellement les déplacements via le réseau.

```python
from navigation import Navigateur

navigateur = Navigateur(reseau)

# Regarder (Look enrichi)
vue = navigateur.regarder()

# Aller à une case du Look
navigateur.aller_a_case(5)  # Va à la case d'indice 5

# Se rapprocher d'un broadcast
navigateur.aller_vers_broadcast(3)  # Fait un pas vers la gauche

# Exécuter une séquence manuelle
navigateur.executer(["Forward", "Left", "Forward"])
```

---

## Exemple d'utilisation complète

```python
#!/usr/bin/env python3
from reseau import Reseau, JoueurMortException, ReseauException
from navigation import Navigateur, cases_contenant

def exemple_collecte_food(reseau):
    """Exemple : chercher et collecter de la nourriture"""
    navigateur = Navigateur(reseau)
    
    while reseau.est_vivant():
        # Regarder autour
        vue = navigateur.regarder()
        
        # Chercher food
        cases_food = cases_contenant(vue, "food")
        
        if cases_food:
            # Aller à la première case avec food
            case = cases_food[0]
            print(f"Food trouvée en case {case['index']}")
            navigateur.aller_a_case(case['index'])
            
            # Ramasser
            reseau.envoyer_commande("Take", "food")
            reponse = reseau.recevoir_reponse()
            print(f"Take food: {reponse}")
            
            # Vérifier inventaire
            reseau.envoyer_commande("Inventory")
            inv_str = reseau.recevoir_reponse()
            inv = reseau.parser_inventaire(inv_str)
            print(f"Food en stock: {inv.get('food', 0)}")
        else:
            # Pas de food visible, avancer
            reseau.envoyer_commande("Forward")
            reseau.recevoir_reponse()

def main():
    try:
        reseau = Reseau("localhost", 4242, "team1")
        exemple_collecte_food(reseau)
    except JoueurMortException:
        print("Mort du joueur")
    except ReseauException as e:
        print(f"Erreur réseau: {e}")
    finally:
        reseau.fermer()

if __name__ == "__main__":
    main()
```

---

## Gestion robuste de la file de commandes

Le serveur accepte **max 10 commandes** en tampon. Pour éviter de bloquer :

```python
# Méthode 1 : Vérifier avant d'envoyer
while reseau.est_vivant():
    if reseau.peut_envoyer():
        reseau.envoyer_commande("Look")
    else:
        # File pleine, consommer une réponse
        reseau.recevoir_reponse()

# Méthode 2 : Envoyer puis consommer immédiatement
reseau.envoyer_commande("Look")
reponse = reseau.recevoir_reponse()

# Méthode 3 : Batch avec vidage
for _ in range(5):
    reseau.envoyer_commande("Forward")

# Consommer les 5 réponses
for _ in range(5):
    reseau.recevoir_reponse()
```

---

## Délais des commandes

Chaque commande prend du temps serveur (dépend de la fréquence `-f`) :

| Commande | Délai (unités) | Exemple @f=100 |
|----------|---------------|----------------|
| Forward, Look, Left, Right | 7 | 0.07s |
| Inventory | 1 | 0.01s |
| Take, Set, Eject | 7 | 0.07s |
| Fork | 42 | 0.42s |
| Incantation | 300 | 3s |

**Important** : Pendant une Incantation (300 unités), le joueur ne peut rien faire !

---

## Tests

### Tests unitaires (sans serveur)
```bash
python3 test_navigation.py
# 35 tests, tous passent ✓
```

### Tests d'intégration (avec serveur)
```bash
# 1. Lancer un serveur Zappy
./zappy_server -p 4242 -x 10 -y 10 -n team1 -c 10 -f 100

# 2. Dans un autre terminal
python3 test_integration.py
```

Tests effectués :
- ✓ Connexion et handshake
- ✓ Envoi/réception de commandes
- ✓ Parsing inventaire/vision
- ✓ Navigation avec Navigateur
- ✓ Remplissage file de 10 commandes

---

## Points d'attention pour le Cerveau

### 1. Survie (priorité absolue)
```python
# Toujours vérifier la nourriture !
reseau.envoyer_commande("Inventory")
inv = reseau.parser_inventaire(reseau.recevoir_reponse())

if inv.get('food', 0) < 10:
    # URGENCE : chercher food
```

### 2. Ne pas bloquer sur la file
```python
# ✗ MAL : peut bloquer si file pleine
for _ in range(20):
    reseau.envoyer_commande("Forward")

# ✓ BIEN : vérifier les slots
while commandes_a_envoyer:
    if reseau.peut_envoyer():
        reseau.envoyer_commande(...)
    else:
        reseau.recevoir_reponse()
```

### 3. Traiter les messages asynchrones
```python
# Régulièrement, vérifier les broadcasts/ejects
messages = reseau.relever_messages_async()
for type_msg, data in messages:
    if type_msg == "broadcast":
        # Coéquipier communique
    elif type_msg == "eject":
        # On s'est fait pousser
```

### 4. Gestion des erreurs
```python
try:
    # Logique du cerveau
    while reseau.est_vivant():
        # ...
except JoueurMortException:
    # Joueur mort
except ReseauException as e:
    # Problème réseau (déconnexion, timeout, etc.)
finally:
    reseau.fermer()
```

---

## Ressources nécessaires par niveau

Pour référence (à implémenter dans le cerveau) :

```python
REQUIREMENTS = {
    1: {"linemate": 1, "players": 1},
    2: {"linemate": 1, "deraumere": 1, "sibur": 1, "players": 2},
    3: {"linemate": 2, "sibur": 1, "phiras": 2, "players": 2},
    4: {"linemate": 1, "deraumere": 1, "sibur": 2, "phiras": 1, "players": 4},
    5: {"linemate": 1, "deraumere": 2, "sibur": 1, "mendiane": 3, "players": 4},
    6: {"linemate": 1, "deraumere": 2, "sibur": 3, "phiras": 1, "players": 6},
    7: {"linemate": 2, "deraumere": 2, "sibur": 2, "mendiane": 2, "phiras": 2, "thystame": 1, "players": 6}
}
```

---

## Point d'intégration dans zappy_ai.py

```python
# zappy_ai.py - ligne ~35

from cerveau import Cerveau  # À implémenter

try:
    Cerveau(reseau).jouer()
except JoueurMortException:
    # ...
```

Le cerveau reçoit un objet `Reseau` déjà connecté et prêt à l'emploi.

---

## Contact

Si questions sur l'API réseau, demande-moi !
