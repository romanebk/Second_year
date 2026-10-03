/*
** EPITECH PROJECT, 2026
** fichier.h
** File description:
** fichier.h
*/

#ifndef SERVER_H
    #define SERVER_H
    #include <stdio.h>
    #include <stdlib.h>
    #include <string.h>
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <poll.h>
    #include <unistd.h>
    #define MAX_CLIENTS 100
    #define MAX_MESSAGE_SIZE 1024

typedef struct {
    int fd;
    char buffer[MAX_MESSAGE_SIZE];
    int buffer_size;
    char send_buffer[MAX_MESSAGE_SIZE];
    int send_buffer_size;
} client_t;

int create_server_socket(int port);
int handle_client(client_t *client, struct pollfd *poll_fds);
void handle_send_buffer(client_t *client,
    struct pollfd *poll_fds);

#endif
