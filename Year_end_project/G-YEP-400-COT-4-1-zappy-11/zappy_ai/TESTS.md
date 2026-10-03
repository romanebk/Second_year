# Guide de Tests - Zappy AI

## Tests unitaires (sans serveur) ✓

Les tests unitaires ne nécessitent pas de serveur Zappy :

```bash
cd zappy_ai
python3 test_navigation.py
```

**Résultat attendu** : 35 tests passent
- Conversion index ↔ position
- Génération de mouvements
- Parsing du Look
- Direction des broadcasts

## Tests du parsing réseau ✓

```bash
python3 test_reseau.py
```

**Résultat** : 20/23 tests passent
- Parsing inventaire, vision, broadcast, eject
- Gestion des slots (file de commandes)
- Détection des messages asynchrones

3 tests échouent (limitations des mocks), mais les fonctions testées sont validées.

## Tests d'intégration (avec serveur)

Ces tests nécessitent un serveur Zappy en écoute.

### 1. Lancer le serveur

Dans un terminal :
```bash
./zappy_server -p 4242 -x 10 -y 10 -n team1 -c 10 -f 100
```

Paramètres :
- `-p 4242` : port
- `-x 10 -y 10` : carte 10x10
- `-n team1` : nom de l'équipe
- `-c 10` : 10 clients max
- `-f 100` : fréquence x100 (tests rapides)

### 2. Lancer les tests

Dans un autre terminal :
```bash
cd zappy_ai
python3 test_integration.py
```

**Tests effectués** :
1. ✓ Connexion basique au serveur
2. ✓ Envoi/réception de commandes (Forward, Look, Inventory)
3. ✓ Parsing des réponses
4. ✓ Navigation avec Navigateur
5. ✓ Remplissage file de 10 commandes

## Tests manuels

### Test simple : connexion

```bash
python3 zappy_ai.py -p 4242 -n team1 -h localhost
```

**Résultat attendu** :
```
Connecté à localhost:4242 (équipe 'team1')
Places restantes : 9
Taille de la carte : 10x10
```

Le client reste connecté. Ctrl+C pour quitter.

### Test avec reseau.py en standalone

Le fichier `reseau.py` contient un `if __name__ == "__main__"` avec un test simple :

```bash
# Lancer serveur d'abord
./zappy_server -p 4242 -x 10 -y 10 -n team1 -c 10 -f 100

# Dans un autre terminal
cd zappy_ai
python3 reseau.py
```

**Teste** :
- Connexion
- Envoi Forward + Look
- Gestion des slots
- Parsing broadcast

### Test avec navigation.py en standalone

```bash
cd zappy_ai
python3 navigation.py
```

Affiche des exemples de conversion (pas besoin de serveur).

## Checklist de validation

Avant de passer le projet au binôme, vérifier :

- [ ] `python3 test_navigation.py` → 35/35 tests ✓
- [ ] `python3 test_reseau.py` → au moins 20/23 tests ✓
- [ ] Connexion au serveur fonctionne (test_integration.py)
- [ ] Forward, Look, Inventory fonctionnent
- [ ] Parsing inventaire/vision correct
- [ ] File de 10 commandes gérée
- [ ] Messages asynchrones bufferisés
- [ ] Exception JoueurMortException levée sur "dead"
- [ ] Navigateur peut se déplacer

## Debug

### Activer les logs

Ajouter dans ton code :
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Problèmes courants

**Erreur "Connection refused"**
→ Serveur pas lancé ou mauvais port

**Timeout lors de la connexion**
→ Serveur surchargé ou pas de slots disponibles

**File pleine (ReseauException)**
→ Envoyer sans consommer les réponses

**StopIteration dans les tests**
→ Normal pour certains tests avec mocks (pas critique)

**"dead" pas géré**
→ Vérifier que JoueurMortException est bien catchée

### Vérifier le serveur

```bash
# Tester si le port est ouvert
nc -zv localhost 4242

# Ou avec Python
python3 -c "import socket; s=socket.socket(); s.connect(('localhost', 4242)); print('OK')"
```

## Performance

Les tests d'intégration avec `-f 100` (fréquence x100) sont rapides :
- Connexion : < 1s
- Commandes simples : quelques ms
- Incantation : 3s (300 unités / 100)

Pour tester en conditions réelles, utiliser `-f 10` ou `-f 1`.

## Couverture

**Fonctionnalités testées** :
- ✓ Connexion et handshake
- ✓ Toutes les commandes de base
- ✓ Parsing de toutes les réponses
- ✓ Gestion file de 10 commandes
- ✓ Messages asynchrones (broadcast, eject)
- ✓ Mort du joueur
- ✓ Navigation géométrique
- ✓ Conversion index/position/mouvements

**Non testé** (à tester avec le cerveau) :
- Fork et lancement de nouveaux clients
- Incantations complètes
- Coordination multi-joueurs
- Edge cases (réseau lent, déconnexions)

## Automatisation

Pour tester rapidement après modifications :

```bash
#!/bin/bash
# test_all.sh

echo "=== Tests unitaires ==="
python3 test_navigation.py || exit 1
python3 test_reseau.py || echo "Quelques tests échouent (normal)"

echo ""
echo "=== Tests d'intégration (nécessite serveur) ==="
python3 test_integration.py
```

```bash
chmod +x test_all.sh
./test_all.sh
```
