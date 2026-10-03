# Pitch Projet FTP - Questions Réponses

## Présentation du projet
**Nom**: myFTP - Serveur FTP en C
**Objectif**: Implémenter un serveur FTP complet et conforme à la RFC 959
**Technologies**: C, sockets TCP, multiplexage avec poll()

---

## Questions techniques fréquentes

### Q: Quelle est l'architecture de votre serveur FTP ?
**R**: Architecture client-serveur classique avec:
- Socket d'écoute pour les connexions
- Multiplexage I/O avec poll() pour gérer plusieurs clients
- Séparation connexion contrôle/données
- Gestion des états d'authentification par client

### Q: Comment gérez-vous l'authentification ?
**R**: Double-phase:
1. `USER` → stocke username, passe état AUTH_USER, envoie 331
2. `PASS` → vérifie si username = "Anonymous", envoie 230 ou 530

### Q: Comment fonctionne la navigation virtuelle ?
**R**: Chaque client a un `cwd` virtuel:
- Pas de `chdir()` sur le processus serveur
- Résolution avec `realpath()` et validation
- Confinement dans la racine du serveur
- Mises à jour sûres des chemins

### Q: Comment gérez-vous les transferts de données ?
**R**: Deux modes supportés:
- **Passif (PASV)**: Serveur écoute sur port aléatoire
- **Actif (PORT)**: Client donne IP/port, serveur se connecte
- Socket séparé pour les données, contrôle reste sur socket principal

### Q: Quelles commandes FTP avez-vous implémentées ?
**R**: 
- **Auth**: USER, PASS
- **Navigation**: PWD, CWD, CDUP
- **Transfert**: PASV, PORT, LIST, RETR, STOR
- **Utilitaires**: HELP, NOOP, SYST, TYPE, QUIT

### Q: Quelles recherches avez-vous effectuées ?
**R**: Recherche approfondie sur:
- **RFC 959**: Spécification complète du protocole FTP
- **Sockets Berkeley**: Programmation réseau TCP/IP en C
- **Multiplexage I/O**: Étude de poll() vs select() vs epoll()
- **Gestion buffers**: Non-bloquant et EAGAIN/EWOULDBLOCK
- **Sécurité système**: realpath(), confinement chroot()
- **Patterns serveur**: Architecture event-driven et state machines
- **Tests automatisés**: Protocoles de test FTP et validation

### Q: Comment assurez-vous la sécurité ?
**R**: 
- Validation des chemins avec `realpath()`
- Confinement dans répertoire racine
- Vérifications permissions (F_OK, X_OK, R_OK)
- Pas d'exécution de commandes système non contrôlées

### Q: Comment gérez-vous les erreurs ?
**R**: 
- Messages RFC 959 standards (500, 550, etc.)
- Logging des erreurs côté serveur
- Réponses structurées au client
- Gestion des déconnexions abruptes

### Q: Quelles sont les difficultés rencontrées ?
**R**: 
- Gestion correcte des buffers et EAGAIN/EWOULDBLOCK
- Synchronisation connexions contrôle/données
- Parsing robuste des commandes FTP
- Gestion des timeouts et ressources

### Q: Comment testez-vous votre serveur ?
**R**: 
- Tests unitaires par commande
- Tests avec telnet/nc
- Tests automatisés avec scénarios FTP
- Validation conformité RFC 959

---

## Démonstration rapide

```bash
# Démarrage serveur
./myftp 4242 /tmp/ftp_root

# Session client
telnet localhost 4242
> USER Anonymous
> PASS 
> PWD
> CWD subdir
> LIST
> QUIT
```

## Points forts du projet
- **Conformité RFC**: Messages et comportement standards
- **Robustesse**: Gestion erreurs et ressources
- **Sécurité**: Confinement et validation
- **Performance**: Multiplexage efficace
- **Complétude**: Toutes commandes FTP essentielles

---

## Pistes d'amélioration
- Support SSL/TLS
- Gestion utilisateurs multiples
- Configuration fichier
- Logs détaillés
- Tests charge
