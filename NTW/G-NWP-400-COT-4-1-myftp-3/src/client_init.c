/*
** EPITECH PROJECT, 2026
** client_init.c
** File description:
** Client initialization
*/

#include "../include/myftp.h"

void client_init(client_t *client, int fd, char *root)
{
    memset(client, 0, sizeof(client_t));

    client->ctrl_fd = fd;
    client->auth    = AUTH_NONE;
    client->data_fd = -1;
    client->data_listen_fd = -1;
    client->data_mode = MODE_NONE;
    client->data_port = -1;

    strncpy(client->cwd, root, FTP_PATH_MAX - 1);

    memset(client->read_buf, 0, BUF_SIZE);
    memset(client->write_buf, 0, BUF_SIZE);
    client->read_len  = 0;
    client->write_len = 0;
    client->write_pos = 0;
}
