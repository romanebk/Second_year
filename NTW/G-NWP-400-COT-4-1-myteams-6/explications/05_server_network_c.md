# Analyse détaillée de `src/server/network.c`

## Header EPITECH (lignes 1-6)
```c
/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** network
*/
```
- **Lignes 1-6** : Header standard EPITECH identifiant ce fichier comme contenant la logique réseau du serveur.

## Inclusion (ligne 8)
```c
#include "../../include/server.h"
```
- **Ligne 8** : Inclusion du header principal du serveur.

## Variable globale pour gestion des signaux (ligne 10)
```c
volatile sig_atomic_t keep_running = 1;
```
### Analyse détaillée
- **`volatile`** : Indique au compilateur que cette variable peut être modifiée par des signaux
- **`sig_atomic_t`** : Type garanti atomique pour les accès dans les handlers de signaux
- **`keep_running`** : Booléen contrôlant la boucle principale du serveur
- **Valeur initiale** : 1 (serveur doit continuer de tourner)

### Pourquoi cette variable ?
- **Sécurité** : Évite les race conditions entre le signal handler et la boucle principale
- **Standard** : `sig_atomic_t` est le type correct pour les variables modifiées par des signaux
- **Portabilité** : Garantit un comportement défini sur toutes les plateformes

## Handler de signal (lignes 12-16)
```c
void myteams_server_signal_handler(int signum)
{
    (void)signum;
    keep_running = 0;
}
```
### Analyse détaillée
- **Ligne 12** : Signature du handler de signal (standard POSIX)
- **Ligne 14** : `(void)signum` - Supprime l'avertissement "unused parameter"
- **Ligne 15** : Met `keep_running` à 0 pour arrêter la boucle principale

### Pourquoi cette implémentation ?
- **Simplicité** : Juste arrêter proprement le serveur
- **Propreté** : Permet la fermeture ordonnée des connexions
- **Standard** : Handler SIGINT typique pour les serveurs

## Initialisation client (lignes 18-27)
```c
void myteams_server_init_client(client_t *c)
{
    c->fd = -1;
    c->buf_len = 0;
    c->user = NULL;
    memset(c->buffer, 0, BUFFER_SIZE);
    memset(c->team_uuid, 0, UUID_LEN);
    memset(c->channel_uuid, 0, UUID_LEN);
    memset(c->thread_uuid, 0, UUID_LEN);
}
```
### Analyse détaillée
- **Ligne 20** : `fd = -1` - Indique que le client n'est pas connecté
- **Ligne 21** : `buf_len = 0` - Buffer vide
- **Ligne 22** : `user = NULL` - Aucun utilisateur authentifié
- **Lignes 23-26** : `memset()` pour nettoyer tous les buffers et UUIDs

### Pourquoi cette initialisation ?
- **Sécurité** : Évite les données résiduelles entre clients
- **Propreté** : État connu et reproductible
- **Débogage** : Facilite l'identification de problèmes

## Initialisation poll (lignes 29-39)
```c
static void init_poll(server_t *server, struct pollfd *fds)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        fds[i].fd = -1;
        fds[i].events = POLLIN;
        myteams_server_init_client(&server->clients[i]);
    }
    fds[0].fd = server->fd;
}
```
### Analyse détaillée
- **Ligne 29** : `static` - fonction locale à ce fichier
- **Ligne 33** : Boucle sur tous les slots clients possibles
- **Ligne 34** : `fd = -1` - Slot non utilisé
- **Ligne 35** : `events = POLLIN` - Intéressé par les données entrantes
- **Ligne 36** : Initialise la structure client correspondante
- **Ligne 38** : `fds[0]` est spécial : c'est le socket d'écoute du serveur

### Pourquoi poll() ?
- **Efficacité** : Gère multiples clients sans threads
- **Scalabilité** : Un seul thread pour toutes les connexions
- **Simplicité** : Pas de synchronisation complexe

## Configuration socket (lignes 41-46)
```c
void myteams_server_configure(server_t *server, socket_config_t *sock)
{
    sock->addr.sin_family = AF_INET;
    sock->addr.sin_port = htons(server->port);
    sock->addr.sin_addr.s_addr = INADDR_ANY;
}
```
### Analyse détaillée
- **Ligne 43** : `AF_INET` - Famille d'adresses IPv4
- **Ligne 44** : `htons()` - Convertit le port en network byte order
- **Ligne 45** : `INADDR_ANY` - Écoute sur toutes les interfaces réseau

### Pourquoi ces valeurs ?
- **AF_INET** : Standard pour les réseaux TCP/IP modernes
- **htons()** : Essentiel pour l'interopérabilité entre architectures
- **INADDR_ANY** : Permet les connexions locales et distantes

## Initialisation serveur (lignes 48-64)
```c
int myteams_server_init(server_t *server, socket_config_t *sock)
{
    int opt = 1;

    server->fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server->fd < 0)
        return 84;
    setsockopt(server->fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    myteams_server_configure(server, sock);
    if (bind(server->fd, (struct sockaddr *)&sock->addr,
        sizeof(sock->addr)) < 0)
        return 84;
    if (listen(server->fd, SOMAXCONN) < 0)
        return 84;
    load_server(server);
    return 0;
}
```
### Analyse détaillée ligne par ligne

#### **Ligne 52** : Création du socket
- **`AF_INET`** : IPv4
- **`SOCK_STREAM`** : TCP (fiable, orienté connexion)
- **`0`** : Protocol auto-sélectionné (TCP pour AF_INET+SOCK_STREAM)

#### **Lignes 53-54** : Vérification de la création
- **`server->fd < 0`** : Erreur de création du socket
- **`return 84`** : Code d'erreur EPITECH

#### **Ligne 55** : Option SO_REUSEADDR
- **`SO_REUSEADDR`** : Permet la réutilisation immédiate du port
- **Pourquoi ?** : Évite "Address already in use" après redémarrage rapide

#### **Ligne 56** : Configuration de l'adresse
- Appelle la fonction précédente pour configurer la structure sockaddr

#### **Lignes 57-59** : Bind du socket
- **`bind()`** : Associe le socket à l'adresse/port
- **`sizeof(sock->addr)`** : Taille de la structure d'adresse
- **Vérification** : Erreur si bind échoue

#### **Lignes 60-61** : Mise en écoute
- **`listen()`** : Met le socket en mode écoute
- **`SOMAXCONN`** : Taille maximale de la queue de connexions
- **Vérification** : Erreur si listen échoue

#### **Ligne 62** : Chargement des données sauvegardées
- **`load_server()`** : Restaure l'état depuis le fichier de sauvegarde

#### **Ligne 63** : Succès
- **`return 0`** : Initialisation réussie

## Acceptation client (lignes 66-86)
```c
static void accept_client(server_t *server, struct pollfd *fds)
{
    struct sockaddr_in addr;
    socklen_t len = sizeof(addr);
    int fd = accept(server->fd, (struct sockaddr *)&addr, &len);
    int i = 0;

    if (fd < 0)
        return;
    for (i = 1; i < MAX_CLIENTS; i++) {
        if (fds[i].fd != -1)
            continue;
        fds[i].fd = fd;
        fds[i].events = POLLIN;
        server->clients[i].fd = fd;
        write(fd, "201 Connected to MyTeams server.\r\n", 34);
        return;
    }
    write(fd, "500 Server full.\r\n", 18);
    close(fd);
}
```
### Analyse détaillée
- **Ligne 70** : `accept()` - Accepte une nouvelle connexion
- **Ligne 73** : Vérifie si l'acceptation a réussi
- **Ligne 75** : Recherche un slot libre (commence à 1, 0 = serveur)
- **Ligne 76** : Continue si le slot est déjà utilisé
- **Lignes 78-81** : Configure le slot trouvé et envoie le message de bienvenue
- **Lignes 84-85** : Si aucun slot libre, refuse la connexion

### Pourquoi cette gestion ?
- **Efficacité** : Recherche linéaire simple pour petit MAX_CLIENTS
- **Propreté** : Message d'erreur explicite si serveur plein
- **Standard** : Code 201 pour connexion réussie

## Traitement du buffer (lignes 88-107)
```c
static void process_buffer(client_t *client, server_t *server)
{
    char *end = strstr(client->buffer, "\r\n");
    char *cmd = NULL;
    int len = 0;

    while (end) {
        *end = '\0';
        cmd = strdup(client->buffer);
        if (cmd) {
            myteams_server_execute_command(client, cmd, server);
            free(cmd);
        }
        len = (end - client->buffer) + 2;
        client->buf_len -= len;
        memmove(client->buffer, end + 2, client->buf_len);
        client->buffer[client->buf_len] = '\0';
        end = strstr(client->buffer, "\r\n");
    }
}
```
### Analyse détaillée
- **Ligne 90** : Recherche la fin de commande (`\r\n`)
- **Ligne 94** : Boucle tant qu'il y a des commandes complètes
- **Ligne 95** : Remplace `\r\n` par `\0` pour terminer la chaîne
- **Ligne 96** : Duplique la commande (pour éviter les modifications)
- **Lignes 97-100** : Exécute la commande et libère la mémoire
- **Ligne 101** : Calcule la longueur de la commande traitée
- **Ligne 102** : Met à jour la longueur du buffer
- **Ligne 103** : Déplace les données restantes au début
- **Ligne 104** : Assure la terminaison nulle
- **Ligne 105** : Cherche la prochaine commande

### Pourquoi cette implémentation ?
- **Robustesse** : Gère multiples commandes dans un seul paquet
- **Efficacité** : Utilise `memmove()` pour les déplacements de mémoire
- **Sécurité** : `strdup()` évite les corruptions de mémoire

## Gestion client (lignes 109-129)
```c
static void handle_client(int i, struct pollfd *fds, server_t *server)
{
    int space = BUFFER_SIZE - server->clients[i].buf_len - 1;
    ssize_t r = 0;

    if (space <= 0) {
        server->clients[i].buf_len = 0;
        space = BUFFER_SIZE - 1;
    }
    r = read(fds[i].fd,
        server->clients[i].buffer + server->clients[i].buf_len, space);
    if (r <= 0) {
        close(fds[i].fd);
        fds[i].fd = -1;
        myteams_server_init_client(&server->clients[i]);
        return;
    }
    server->clients[i].buf_len += r;
    server->clients[i].buffer[server->clients[i].buf_len] = '\0';
    process_buffer(&server->clients[i], server);
}
```
### Analyse détaillée
- **Ligne 111** : Calcule l'espace disponible dans le buffer
- **Lignes 114-117** : Si buffer plein, le vide (protection contre overflow)
- **Lignes 118-119** : Lit les données du client
- **Lignes 120-124** : Si déconnexion ou erreur, nettoie le slot
- **Lignes 126-127** : Met à jour la longueur et termine la chaîne
- **Ligne 128** : Traite les commandes reçues

### Pourquoi cette gestion ?
- **Sécurité** : Protection contre les buffer overflows
- **Robustesse** : Gère proprement les déconnexions
- **Efficacité** : Lit directement dans le buffer client

## Vérification des événements (lignes 131-143)
```c
static void check_events(server_t *server, struct pollfd *fds)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        if (!(fds[i].revents & POLLIN))
            continue;
        if (i == 0)
            accept_client(server, fds);
        else
            handle_client(i, fds, server);
    }
}
```
### Analyse détaillée
- **Ligne 135** : Boucle sur tous les descripteurs
- **Ligne 136** : Vérifie s'il y a des données à lire
- **Ligne 138** : `i == 0` = socket serveur = nouvelle connexion
- **Ligne 141** : `i > 0` = client existant = données à traiter

### Pourquoi cette séparation ?
- **Clarté** : Logique différente pour serveur vs clients
- **Efficacité** : Un seul appel `poll()` pour tout gérer

## Gestion déconnexion (lignes 145-157)
```c
void myteams_server_handle_disconnection(struct pollfd *fds, client_t *clients, server_t *server)
{
    int i = 0;

    (void)clients;
    save_server(server);
    for (i = 0; i < MAX_CLIENTS; i++) {
        if (fds[i].fd != -1) {
            close(fds[i].fd);
            fds[i].fd = -1;
        }
    }
}
```
### Analyse détaillée
- **Ligne 149** : `(void)clients` - Supprime l'avertissement unused
- **Ligne 150** : Sauvegarde l'état du serveur avant de quitter
- **Lignes 151-156** : Ferme toutes les connexions actives

### Pourquoi cette fonction ?
- **Persistance** : Sauvegarde les données avant arrêt
- **Propreté** : Ferme proprement toutes les connexions
- **Standard** : Arrêt gracieux du serveur

## Boucle principale (lignes 159-175)
```c
int myteams_server_run(server_t *server)
{
    struct pollfd fds[MAX_CLIENTS] = {0};
    int status = 0;

    init_poll(server, fds);
    while (keep_running) {
        status = poll(fds, MAX_CLIENTS, -1);
        if (status < 0)
            break;
        if (status == 0)
            continue;
        check_events(server, fds);
    }
    myteams_server_handle_disconnection(fds, server->clients, server);
    return 0;
}
```
### Analyse détaillée
- **Ligne 161** : Tableau de structures pollfd pour tous les clients
- **Ligne 164** : Initialise les structures poll
- **Ligne 165** : Boucle principale contrôlée par `keep_running`
- **Ligne 166** : `poll()` - Attend les événements (timeout = -1 = infini)
- **Lignes 167-170** : Gère les erreurs et timeouts
- **Ligne 171** : Traite les événements reçus
- **Ligne 173** : Nettoyage à la sortie
- **Ligne 174** : Retour succès

### Pourquoi cette architecture ?
- **Performance** : Un seul thread gère tous les clients
- **Simplicité** : Pas de complexité de synchronisation
- **Robustesse** : Gestion propre des erreurs et arrêts

## Architecture globale

### Flux de données
```
Client → Socket → read() → buffer → process_buffer() → execute_command()
Serveur → execute_command() → write() → Socket → Client
```

### Gestion des événements
```
poll() → check_events() → 
├── i==0 → accept_client() (nouvelle connexion)
└── i>0 → handle_client() (données client)
```

### Cycle de vie
```
init() → run() → [boucle poll()] → handle_disconnection() → exit
```

## Optimisations et Bonnes Pratiques

1. **Poll()** : Efficace pour gérer multiples connexions
2. **Buffers statiques** : Évite les malloc/free fréquents
3. **Gestion d'erreurs** : Propre et explicite
4. **Signal handling** : Arrêt gracieux du serveur
5. **Persistance** : Sauvegarde automatique à l'arrêt

## Conclusion

Ce fichier implémente une couche réseau robuste et efficace avec :
- **Multiplexage E/S** via poll()
- **Gestion bufferisée** des communications
- **Arrêt propre** via signaux
- **Persistance** des données
- **Scalabilité** pour de nombreux clients

L'architecture est conçue pour être performante tout en restant simple et maintenable.
