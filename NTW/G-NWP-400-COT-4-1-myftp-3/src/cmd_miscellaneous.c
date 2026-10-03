/*
** EPITECH PROJECT, 2026
** cmd_misc.c
** File description:
** Misc commands + dispatch
*/

#include "../include/myftp.h"

void cmd_noop(client_t *client)
{
    client_queue_response(client, FTP_200);
}

void cmd_quit(client_t *client)
{
    int fd = client->ctrl_fd;

    client_queue_response(client, FTP_221);
    client_write(client);
    close(fd);
    client->ctrl_fd = -1;
}

void dispatch_command(server_t *srv, client_t *client, char *cmd, char *arg)
{
    if (strcmp(cmd, "USER") == 0) {
        cmd_user(client, arg);
        return;
    }
    if (strcmp(cmd, "PASS") == 0) {
        cmd_pass(client, arg);
        return;
    }
    if (strcmp(cmd, "QUIT") == 0) {
        cmd_quit(client);
        return;
    }
    if (client->auth != AUTH_OK) {
        client_queue_response(client, FTP_530);
        return;
    }
    if (strcmp(cmd, "PWD")  == 0) {
        cmd_pwd(client);
        return;
    }
    if (strcmp(cmd, "CWD")  == 0) {
        cmd_cwd(srv, client, arg);
        return;
    }
    if (strcmp(cmd, "CDUP") == 0) {
        cmd_cdup(srv, client);
        return;
    }
    if (strcmp(cmd, "PASV") == 0) {
        cmd_pasv(srv, client);
        return;
    }
    if (strcmp(cmd, "PORT") == 0) {
        cmd_port(client, arg);
        return;
    }
    if (strcmp(cmd, "HELP") == 0) {
        cmd_help(client, arg);
        return;
    }
    if (strcmp(cmd, "LIST") == 0) {
        cmd_list(srv, client, arg);
        return;
    }
    if (strcmp(cmd, "RETR") == 0) {
        cmd_retr(srv, client, arg);
        return;
    }
    if (strcmp(cmd, "STOR") == 0) {
        cmd_stor(srv, client, arg);
        return;
    }
    if (strcmp(cmd, "NOOP") == 0) {
        cmd_noop(client);
        return;
    }
    client_queue_response(client, FTP_500);
}