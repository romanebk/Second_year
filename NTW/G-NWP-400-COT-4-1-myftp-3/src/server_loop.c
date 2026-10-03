/*
** EPITECH PROJECT, 2026
** server_loop.c
** File description:
** Main poll loop
*/

#include "../include/myftp.h"

int find_client_index(server_t *server, int fd)
{
    for (int i = 0; i < MAX_CLIENTS; i++) {
        if (server->clients[i].ctrl_fd == fd)
            return i;
    }
    return -1;
}

void update_poll_events(server_t *server)
{
    for (int i = 1; i < server->nfds; i++) {
        int idx = find_client_index(server, server->fds[i].fd);
        if (idx == -1)
            continue;
        server->fds[i].events = POLLIN;
        if (server->clients[idx].write_len > 0)
            server->fds[i].events = server->fds[i].events | POLLOUT;
    }
}

void handle_new_connection(server_t *server)
{
    struct sockaddr_in addr;
    socklen_t addrlen = sizeof(addr);
    int new_fd;

    new_fd = accept(server->listen_fd, (struct sockaddr *)&addr, &addrlen);
    if (new_fd == -1) {
        perror("accept");
        return;
    }
    printf("Nouvelle connexion de %s:%d\n", inet_ntoa(addr.sin_addr), ntohs(addr.sin_port));
    add_client(server, new_fd);
}

int handle_client_event(server_t *server, int i)
{
    int fd  = server->fds[i].fd;
    int idx = find_client_index(server, fd);

    if (idx == -1)
        return 0;
    if (server->fds[i].revents & POLLIN) {
        client_read(server, &server->clients[idx]);
        if (server->clients[idx].ctrl_fd == -1) {
            printf("Client fd %d disconnecté\n", fd);
            return 1;
        }
    }
    if (server->fds[i].revents & POLLOUT) {
        client_write(&server->clients[idx]);
    }
    if (server->fds[i].revents & (POLLHUP | POLLERR)) {
        printf("Client fd %d déconnecté\n", fd);
        remove_client(server, idx);
        return 1;
    }
    return 0;
}

void server_loop(server_t *server)
{
    int ret;

    while (1) {
        waitpid(-1, NULL, WNOHANG);
        update_poll_events(server);
        ret = poll(server->fds, server->nfds, -1);
        if (ret == -1) {
            perror("poll");
            return;
        }
        if (server->fds[0].revents & POLLIN)
            handle_new_connection(server);
        for (int i = server->nfds - 1; i >= 1; i--) {
            if (server->fds[i].revents != 0)
                handle_client_event(server, i);
        }
    }
}