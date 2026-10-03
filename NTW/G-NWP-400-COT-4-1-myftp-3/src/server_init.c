/*
** EPITECH PROJECT, 2026
** server_init.c
** File description:
** Server socket creation and initialization
*/

#include "../include/myftp.h"

int create_socket(void)
{
    int fd;
    int opt = 1;

    fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd == -1) {
        perror("socket");
        return -1;
    }
    if (setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) == -1) {
        perror("setsockopt");
        close(fd);
        return -1;
    }
    return fd;
}

int bind_socket(int fd, int port)
{
    struct sockaddr_in addr;

    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = INADDR_ANY;
    if (bind(fd, (struct sockaddr *)&addr, sizeof(addr)) == -1) {
        perror("bind");
        return -1;
    }
    return 0;
}

int server_init(server_t *server, int port, char *path)
{
    memset(server, 0, sizeof(server_t));

    for (int i = 0; i < MAX_CLIENTS; i++) {
        server->clients[i].ctrl_fd       = -1;
        server->clients[i].data_fd       = -1;
        server->clients[i].data_listen_fd = -1;
    }
    server->listen_fd = create_socket();
    if (server->listen_fd == -1)
        return -1;
    if (bind_socket(server->listen_fd, port) == -1) {
        close(server->listen_fd);
        return -1;
    }
    if (listen(server->listen_fd, BACKLOG) == -1) {
        perror("listen");
        close(server->listen_fd);
        return -1;
    }
    strncpy(server->root_path, path, FTP_PATH_MAX - 1);
    server->fds[0].fd = server->listen_fd;
    server->fds[0].events = POLLIN;
    server->nfds = 1;
    //printf("Server listening on port %d\n", port);
    //printf("Root path: %s\n", server->root_path);
    return 0;
}
