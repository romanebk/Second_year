/*
** EPITECH PROJECT, 2026
** server_utils.c
** File description:
** Add and remove clients from server
*/

#include "../include/myftp.h"

void add_client(server_t *server, int fd)
{
    int slot = -1;

    for (int i = 0; i < MAX_CLIENTS; i++) {
        if (server->clients[i].ctrl_fd == -1) {
            slot = i;
            break;
        }
    }
    if (slot == -1) {
        fprintf(stderr, "Erreur: nombre maximum de clients atteints\n");
        close(fd);
        return;
    }
    client_init(&server->clients[slot], fd, server->root_path);
    server->fds[server->nfds].fd = fd;
    server->fds[server->nfds].events = POLLIN;
    server->nfds++;
    printf("Client connecté sur le fd %d (slot %d)\n", fd, slot);
    client_queue_response(&server->clients[slot], FTP_220);
}

void remove_client(server_t *server, int i)
{
    int fd = server->clients[i].ctrl_fd;

    if (server->clients[i].data_fd != -1) {
        close(server->clients[i].data_fd);
        server->clients[i].data_fd = -1;
    }
    if (server->clients[i].data_listen_fd != -1) {
        close(server->clients[i].data_listen_fd);
        server->clients[i].data_listen_fd = -1;
    }
    close(fd);
    printf("Client déconnecté (fd %d)\n", fd);
    memset(&server->clients[i], 0, sizeof(client_t));
    server->clients[i].ctrl_fd = -1;
    server->clients[i].data_fd = -1;
    server->clients[i].data_listen_fd = -1;
    for (int j = 1; j < server->nfds; j++) {
        if (server->fds[j].fd == fd) {
            for (int k = j; k < server->nfds - 1; k++)
                server->fds[k] = server->fds[k + 1];
            server->nfds--;
            break;
        }
    }
}