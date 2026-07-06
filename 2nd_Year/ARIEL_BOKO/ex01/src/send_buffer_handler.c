/*
** EPITECH PROJECT, 2026
** gestion de buffer
** File description:
** buffer
*/

#include "../include/server.h"

void handle_send_buffer(client_t *client,
    struct pollfd *poll_fds)
{
    int bytes_written = write(client->fd, client->send_buffer,
    client->send_buffer_size);

    if (bytes_written < 0) {
        perror("Write error");
        return;
    }
    if (bytes_written < client->send_buffer_size) {
        memmove(client->send_buffer, client->send_buffer + bytes_written,
        client->send_buffer_size - bytes_written);
        client->send_buffer_size -= bytes_written;
    } else {
        client->send_buffer_size = 0;
        poll_fds->events &= ~POLLOUT;
    }
}
