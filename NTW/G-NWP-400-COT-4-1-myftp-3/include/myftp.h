/*
** EPITECH PROJECT, 2026
** myftp.hpp
** File description:
** create a server socket
*/
#ifndef MYFTP_H
#define MYFTP_H

#include <sys/socket.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <dirent.h>
#include <limits.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <poll.h>

#define MAX_CLIENTS     128 //qui est la taille maximal de connexion (le somaxconn)
#define BACKLOG         10 //qui est la taille maximal de la file d'attente (le backlog)
#define BUF_SIZE        4096 //qui est la taille maximal du buffer (le bufsize)
#define FTP_PATH_MAX    1024 //qui est la taille maximal du chemin (le pathmax)

#define FTP_150 "150 File status okay; about to open data connection.\r\n"

#define FTP_200 "200 Command okay.\r\n"
#define FTP_214 "214 Help message.\r\n"
#define FTP_220 "220 Service ready for new user.\r\n"
#define FTP_221 "221 Service closing control connection.\r\n"
#define FTP_226 "226 Closing data connection.\r\n"
#define FTP_230 "230 User logged in, proceed.\r\n"
#define FTP_250 "250 Requested file action okay, completed.\r\n"
#define FTP_257 "257 \"PATHNAME\" created.\r\n"

#define FTP_331 "331 User name okay, need password.\r\n"

#define FTP_425 "425 Can't open data connection.\r\n"
#define FTP_426 "426 Connection closed; transfer aborted.\r\n"

#define FTP_500 "500 Syntax error, command unrecognized.\r\n"
#define FTP_501 "501 Syntax error in parameters or arguments.\r\n"
#define FTP_502 "502 Command not implemented.\r\n"
#define FTP_530 "530 Not logged in.\r\n"
#define FTP_550 "550 Requested action not taken.\r\n"
#define FTP_553 "553 Requested action not taken.\r\n"

typedef enum auth_state_s {
    AUTH_NONE,      // pas encore de USER
    AUTH_USER,      // USER reçu, attente PASS
    AUTH_OK         // authentifié
}   auth_state_t;

typedef enum data_mode_s {
    MODE_NONE,
    MODE_PASSIVE,
    MODE_ACTIVE
}   data_mode_t;

typedef struct client_s {
    // Contrôle

    int ctrl_fd;
    // Auth
    
    auth_state_t auth;
    char username[32];
    // Navigation
    
    char cwd[FTP_PATH_MAX];
    // Buffers I/O
    
    char read_buf[BUF_SIZE];
    int read_len;
    char write_buf[BUF_SIZE];
    int write_len;
    int write_pos;
    // Data connection
    data_mode_t data_mode;
    int data_listen_fd;  // PASV : socket en attente
    int data_fd;         // socket DATA connecté
    char data_ip[16];     // PORT : ip du client
    int data_port;       // PORT : port du client
}   client_t;

typedef struct server_s {
    int listen_fd;
    char root_path[FTP_PATH_MAX];
    client_t clients[MAX_CLIENTS];
    struct pollfd fds[MAX_CLIENTS + 1];
    int nfds;
}   server_t;

/* ─────────────────────────────────────────
**  PROTOTYPES — SERVER
** ───────────────────────────────────────── */

int server_init(server_t *server, int port, char *path);
void server_loop(server_t *server);
void add_client(server_t *server, int fd);
void remove_client(server_t *server, int i);

/* ─────────────────────────────────────────
**  PROTOTYPES — CLIENT
** ───────────────────────────────────────── */

void client_init(client_t *client, int fd, char *root);
void client_read(server_t *server, client_t *client);
void client_write(client_t *client);
void client_queue_response(client_t *client, const char *msg);

/* ─────────────────────────────────────────
**  PROTOTYPES — COMMANDS
** ───────────────────────────────────────── */

void dispatch_command(server_t *server, client_t *client, char *cmd, char *arg);

// Auth
void cmd_user(client_t *client, char *arg);
void cmd_pass(client_t *client, char *arg);

// Navigation
void cmd_help(client_t *client, char *arg);
void cmd_pwd(client_t *client);
void cmd_cwd(server_t *server, client_t *client, char *arg);
void cmd_cdup(server_t *server, client_t *client);

// Transfert
void cmd_pasv(server_t *server, client_t *client);
void cmd_port(client_t *client, char *arg);
void cmd_retr(server_t *server, client_t *client, char *arg);
void cmd_stor(server_t *server, client_t *client, char *arg);
void cmd_list(server_t *server, client_t *client, char *arg);

// Misc
void cmd_quit(client_t *client);
void cmd_noop(client_t *client);

/* ─────────────────────────────────────────
**  PROTOTYPES — DATA
** ───────────────────────────────────────── */

int data_passive_open(client_t *client);
int data_active_connect(client_t *client);
void data_send_file(client_t *client, int file_fd);
void data_recv_file(client_t *client, int file_fd);

#endif /* MYFTP_H */