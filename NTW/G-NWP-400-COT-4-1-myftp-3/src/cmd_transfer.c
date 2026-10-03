/*
** EPITECH PROJECT, 2026
** cmd_transfer.c
** File description:
** PASV, PORT, RETR, STOR commands
*/

#include "../include/myftp.h"

void cmd_pasv(server_t *srv, client_t *client)
{
    struct sockaddr_in  ctrl_addr;
    socklen_t len = sizeof(ctrl_addr);
    char response[64];
    unsigned char  *ip;
    int port1;
    int port2;

    (void)srv;

    if (client->data_listen_fd != -1) {
        close(client->data_listen_fd);
        client->data_listen_fd = -1;
    }
    if (client->data_fd != -1) {
        close(client->data_fd);
        client->data_fd = -1;
    }

    if (data_passive_open(client) == -1) {
        client_queue_response(client, FTP_425);
        return;
    }

    if (getsockname(client->ctrl_fd, (struct sockaddr *)&ctrl_addr, &len) == -1) {
        client_queue_response(client, FTP_425);
        return;
    }

    ip = (unsigned char *)&ctrl_addr.sin_addr.s_addr;

    port1 = client->data_port / 256;
    port2 = client->data_port % 256;

    snprintf(response, sizeof(response), "227 Entering Passive Mode (%d,%d,%d,%d,%d,%d)\r\n",
             ip[0], ip[1], ip[2], ip[3], port1, port2);

    client_queue_response(client, response);
}

void cmd_port(client_t *client, char *arg)
{
    (void)arg;
    client_queue_response(client, FTP_502);
}

void cmd_retr(server_t *srv, client_t *client, char *arg)
{
    (void)srv;
    (void)arg;
    client_queue_response(client, FTP_502);
}

void cmd_stor(server_t *srv, client_t *client, char *arg)
{
    (void)srv;
    (void)arg;
    client_queue_response(client, FTP_502);
}