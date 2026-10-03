/*
** EPITECH PROJECT, 2026
** gestion des clients
** File description:
** function
*/

#include "../include/server.h"

int handle_client(client_t *client,
    struct pollfd *poll_fds)
{
    (void)poll_fds;
    int bytes_read = read(client->fd, client->buffer + client->buffer_size,
    MAX_MESSAGE_SIZE - client->buffer_size);

    if (bytes_read <= 0)
        return -1;
    client->buffer_size = client->buffer_size + bytes_read;
    return 0;
}
