/*
** EPITECH PROJECT, 2026
** client_write.c
** File description:
** Buffered write to client via poll
*/

#include "../include/myftp.h"

void client_queue_response(client_t *client, const char *msg)
{
    int msg_len = strlen(msg);
    int available = BUF_SIZE - client->write_len;

    if (msg_len > available) {
        fprintf(stderr, "Error: write buffer full for fd %d\n", client->ctrl_fd);
        return;
    }
    memcpy(client->write_buf + client->write_len, msg, msg_len);
    client->write_len = client->write_len + msg_len;
}

void client_write(client_t *client)
{
    ssize_t nbr_octets_ecrit;
    int espace_restant = client->write_len - client->write_pos;

    if (espace_restant <= 0)
        return;
    nbr_octets_ecrit = write(client->ctrl_fd, client->write_buf + client->write_pos, espace_restant);
    if (nbr_octets_ecrit == -1) {
        perror("Erreur lors de l'écriture");
        return;
    }
    client->write_pos = client->write_pos + nbr_octets_ecrit;
    if (client->write_pos >= client->write_len) {
        client->write_len = 0;
        client->write_pos = 0;
        memset(client->write_buf, 0, BUF_SIZE);
    }
}