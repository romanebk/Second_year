/*
** EPITECH PROJECT, 2026
** client_read.c
** File description:
** Read and parse commands from client
*/

#include "../include/myftp.h"

int find_index(server_t *srv, client_t *client)
{
    for (int i = 0; i < MAX_CLIENTS; i++) {
        if (srv->clients[i].ctrl_fd == client->ctrl_fd)
            return i;
    }
    return -1;
}

int find_crlf(char *buf, int len)
{
    for (int i = 0; i < len - 1; i++) {
        if (buf[i] == '\r' && buf[i + 1] == '\n')
            return i;
    }
    return -1;
}

void parse_command(char *line, char *cmd, char *arg)
{
    int i = 0;
    int j = 0;

    while (line[i] && line[i] != ' ') {
        cmd[j] = line[i];
        i++;
        j++;
    }
    cmd[j] = '\0';
    for (int k = 0; cmd[k]; k++) {
        if (cmd[k] >= 'a' && cmd[k] <= 'z')
            cmd[k] -= 32;
    }
    if (line[i] == ' ')
        i++;
    j = 0;
    while (line[i]) {
        arg[j] = line[i];
        i++;
        j++;
    }
    arg[j] = '\0';
}

void process_commands(server_t *srv, client_t *client)
{
    char line[BUF_SIZE];
    char cmd[32];
    char arg[BUF_SIZE];
    int crlf_pos;
    int line_len;
    int restant;

    while (1) {
        crlf_pos = find_crlf(client->read_buf, client->read_len);
        if (crlf_pos == -1)
            break;

        line_len = crlf_pos;
        memcpy(line, client->read_buf, line_len);
        line[line_len] = '\0';

        restant = client->read_len - crlf_pos - 2;
        memmove(client->read_buf, client->read_buf + crlf_pos + 2, restant);
        client->read_len = restant;
        if (line_len > 0) {
            parse_command(line, cmd, arg);
            printf("CMD (fd %d): [%s] ARG: [%s]\n",
                   client->ctrl_fd, cmd, arg);
            dispatch_command(srv, client, cmd, arg);
        }
        if (client->ctrl_fd == -1)
            return;
    }
}

void client_read(server_t *srv, client_t *client)
{
    int n;
    int space_left;
    int idx;

    space_left = BUF_SIZE - client->read_len - 1;
    if (space_left <= 0) {
        fprintf(stderr, "Error: read buffer full for fd %d\n",
                client->ctrl_fd);
        idx = find_index(srv, client);
        if (idx != -1)
            remove_client(srv, idx);
        return;
    }

    n = read(client->ctrl_fd, client->read_buf + client->read_len, space_left);
    if (n <= 0) {
        idx = find_index(srv, client);
        if (idx != -1)
            remove_client(srv, idx);
        return;
    }
    client->read_len += n;
    client->read_buf[client->read_len] = '\0';
    process_commands(srv, client);
}