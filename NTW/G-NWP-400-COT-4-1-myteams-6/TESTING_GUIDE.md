# Guide de Test - MyTeams

Ce guide explique comment compiler, lancer et tester le projet MyTeams.

## Compilation

### Nettoyage et compilation complète
```bash
make fclean  # Nettoie tous les fichiers objets et binaires
make         # Compile le serveur et le client
```

### Vérification des binaires
```bash
ls -la myteams_server myteams_cli
```

## Lancement du Serveur

### Démarrage du serveur
```bash
LD_LIBRARY_PATH=libs/myteams ./myteams_server 4242
```

Le serveur va :
- Écouter sur le port 4242
- Afficher les événements de connexion
- Charger les données sauvegardées si elles existent

### Arrêt du serveur
```bash
Ctrl+C  # Arrêt propre du serveur avec sauvegarde automatique
```

## Lancement du Client

### Connexion au serveur
```bash
LD_LIBRARY_PATH=libs/myteams ./myteams_cli 127.0.0.1 4242
```

### Aide du client
```bash
/help  # Affiche l'aide détaillée des commandes
```

## Scénario de Test Complet

### Étape 1: Premier utilisateur (Alice)
```bash
# Terminal 1 - Lancer le serveur
LD_LIBRARY_PATH=libs/myteams ./myteams_server 4242

# Terminal 2 - Premier client (Alice)
LD_LIBRARY_PATH=libs/myteams ./myteams_cli 127.0.0.1 4242
/login "alice"
/users  # Devrait voir alice
/help   # Vérifier l'aide détaillée
```

### Étape 2: Deuxième utilisateur (Bob)
```bash
# Terminal 3 - Deuxième client (Bob)
LD_LIBRARY_PATH=libs/myteams ./myteams_cli 127.0.0.1 4242
/login "bob"
/users  # Devrait voir alice et bob
```

### Étape 3: Test de messagerie privée
```bash
# Depuis le terminal Alice
/send "UUID_DE_BOB" "Hello Bob!"
/messages "UUID_DE_BOB"

# Depuis le terminal Bob (message reçu automatiquement)
/send "UUID_DE_ALICE" "Hi Alice!"
```

### Étape 4: Test des équipes
```bash
# Alice crée une équipe
/create "DevTeam" "Development team for our project"
/teams  # Devrait voir DevTeam
/team "UUID_DE_DEVTEAM"

# Bob s'abonne à l'équipe
/subscribe "UUID_DE_DEVTEAM"
/subscribed  # Devrait voir DevTeam
/subscribed "UUID_DE_DEVTEAM"  # Devrait voir alice et bob
```

### Étape 5: Test des canaux
```bash
# Alice (contexte équipe déjà défini)
/create "general" "General discussion channel"
/list  # Devrait voir le canal general
/use "UUID_DE_DEVTEAM" "UUID_DU_CANAL"
/info  # Devrait montrer les infos du canal
```

### Étape 6: Test des discussions
```bash
# Alice (contexte canal défini)
/create "Welcome thread" "Welcome to our team!"
/list  # Devrait voir la discussion
/use "UUID_DE_DEVTEAM" "UUID_DU_CANAL" "UUID_DE_LA_DISCUSSION"
/info  # Devrait montrer les infos de la discussion
```

### Étape 7: Test des commentaires
```bash
# Alice (contexte discussion défini)
/create "Welcome everyone! Glad to be here :)"
/list  # Devrait voir les commentaires

# Bob peut aussi commenter
/use "UUID_DE_DEVTEAM" "UUID_DU_CANAL" "UUID_DE_LA_DISCUSSION"
/create "Thanks for creating this team!"
```

## Commandes de Test Spécifiques

### Test de navigation contextuelle
```bash
# Réinitialiser le contexte
/use

# Définir contexte équipe
/use "UUID_DE_DEVTEAM"

# Définir contexte canal
/use "UUID_DE_DEVTEAM" "UUID_DU_CANAL"

# Définir contexte discussion complet
/use "UUID_DE_DEVTEAM" "UUID_DU_CANAL" "UUID_DE_LA_DISCUSSION"
```

### Test des listes selon le contexte
```bash
# Pas de contexte
/list  → teams
/info  → user info

# Contexte équipe
/list  → channels
/info  → team info

# Contexte canal
/list  → threads
/info  → channel info

# Contexte discussion
/list  → comments
/info  → thread info
```

### Test des erreurs
```bash
# Essayer de se connecter avec un utilisateur qui n'existe pas
/user "uuid-inexistant"

# Essayer de s'abonner à une équipe inexistante
/subscribe "uuid-inexistant"

# Essayer de créer sans être connecté
# (déconnexion puis tentative de création)
/logout
/create "test" "test"  # Devrait donner une erreur
```

## Test de Persistance

### Sauvegarde automatique
```bash
# 1. Créer des données (utilisateurs, équipes, etc.)
# 2. Arrêter le serveur avec Ctrl+C
# 3. Relancer le serveur
LD_LIBRARY_PATH=libs/myteams ./myteams_server 4242
# 4. Les données devraient être restaurées
```

### Vérification du fichier de sauvegarde
```bash
ls -la myteams_save.dat
```

## Test de Charge (Optionnel)

### Multiple clients simultanés
```bash
# Ouvrir plusieurs terminaux
for i in {1..5}; do
  gnome-terminal -- bash -c 'LD_LIBRARY_PATH=libs/myteams ./myteams_cli 127.0.0.1 4242' &
done
```

### Test de messages simultanés
```bash
# Depuis plusieurs clients, envoyer des messages en même temps
# pour tester la gestion concurrente
```

## Débogage

### Vérification des logs serveur
Le serveur affiche les événements en temps réel :
- Connexions/déconnexions
- Créations d'équipes/canaux/discussions
- Messages privés
- Erreurs

### Test des commandes invalides
```bash
# Commandes avec syntaxe incorrecte
/login  # Sans argument
/send   # Sans arguments
/create  # Sans contexte approprié

# Commandes avec arguments invalides
/send "uuid-inexistant" "test"
/use "uuid-inexistant"
```

### Vérification des UUIDs
Les UUIDs sont au format : `12345678-1234-1234-1234-123456789abc`
```bash
# Obtenir l'UUID d'un utilisateur
/users  # Copier l'UUID affiché
```

## Problèmes Courants

### "Connection refused"
- Vérifier que le serveur est lancé
- Vérifier que le port est correct (4242)
- Vérifier l'adresse IP (127.0.0.1 pour local)

### "Command not found"
- Vérifier que les binaires sont compilés
- Vérifier les permissions d'exécution

### "Invalid quotes"
- Utiliser des guillemets autour des arguments avec espaces
- Exemple : `/login "user name"` et non `/login user name`

### "Unauthorized"
- S'assurer d'être connecté avec `/login`
- S'assurer d'être abonné à l'équipe pour les opérations d'équipe

## Script de Test Automatisé (Optionnel)

Créer un fichier `test_script.sh` :
```bash
#!/bin/bash

echo "=== Test MyTeams ==="

# Lancer le serveur en arrière-plan
LD_LIBRARY_PATH=libs/myteams ./myteams_server 4242 &
SERVER_PID=$!

sleep 2

# Lancer un client test
echo "/login \"testuser\"" | LD_LIBRARY_PATH=libs/myteams ./myteams_cli 127.0.0.1 4242

# Arrêter le serveur
kill $SERVER_PID

echo "Test terminé"
```

Rendre exécutable :
```bash
chmod +x test_script.sh
./test_script.sh
```

## Checklist de Test

- [ ] Compilation réussie sans erreurs
- [ ] Serveur démarre sur le port spécifié
- [ ] Client se connecte au serveur
- [ ] Login/logout fonctionnent
- [ ] Création d'équipe fonctionne
- [ ] Abonnement/désabonnement fonctionnent
- [ ] Création de canal fonctionne
- [ ] Création de discussion fonctionne
- [ ] Création de commentaire fonctionne
- [ ] Messagerie privée fonctionne
- [ ] Navigation contextuelle fonctionne
- [ ] Commandes d'erreur gérées correctement
- [ ] Persistance des données fonctionne
- [ ] Aide détaillée s'affiche correctement

Ce guide couvre tous les aspects du test du projet MyTeams. Adaptez les scénarios selon vos besoins spécifiques !
