/*
** EPITECH PROJECT, 2026
** creation du serveur
** File description:
** socket
*/

#include "../include/server.h"

static int create_socket(void)
{
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;

    if (server_fd < 0) {
        perror("Socket failed");
        return -1;
    }
    setsockopt(server_fd,SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    return server_fd;
}

int create_server_socket(int port)
{
    int server_fd = create_socket();
    int bind_fd;
    struct sockaddr_in server_addr;

    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(port);
    server_addr.sin_addr.s_addr = INADDR_ANY;
    bind_fd = bind(server_fd, (struct sockaddr *)&server_addr,
    sizeof(server_addr));
    if (bind_fd < 0) {
        perror("bind failed");
        return -1;
    }
    if (listen(server_fd, 3) < 0) {
        perror("listen failed");
        return -1;
    }
    printf("server listening on port %d\n", port);
    return server_fd;
}
