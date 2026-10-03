/*
** EPITECH PROJECT, 2026
** data_passive.c
** File description:
** Passive mode data socket
*/

#include "../include/myftp.h"

int data_passive_open(client_t *client)
{
    int fd;
    int opt = 1;
    struct sockaddr_in addr;
    socklen_t len = sizeof(addr);

    fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd == -1) {
        perror("socket data");
        return -1;
    }
    setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = 0;
    addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(fd, (struct sockaddr *)&addr, sizeof(addr)) == -1) {
        perror("bind data");
        close(fd);
        return -1;
    }
    if (listen(fd, 1) == -1) {
        perror("listen data");
        close(fd);
        return -1;
    }
    if (getsockname(fd, (struct sockaddr *)&addr, &len) == -1) {
        perror("getsockname data");
        close(fd);
        return -1;
    }
    client->data_listen_fd = fd;
    client->data_port = ntohs(addr.sin_port);
    client->data_mode = MODE_PASSIVE;
    return 0;
}