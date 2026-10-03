/*
** EPITECH PROJECT, 2026
** cmd_auth.c
** File description:
** USER and PASS commands
*/

#include "../include/myftp.h"

void cmd_user(client_t *client, char *arg)
{
    strncpy(client->username, arg, 31);
    client->username[31] = '\0';
    client->auth = AUTH_USER;
    client_queue_response(client, FTP_331);
}

void cmd_pass(client_t *client, char *arg)
{
    (void)arg;
    if (client->auth == AUTH_USER) {
        if (strcmp(client->username, "Anonymous") == 0) {
            client->auth = AUTH_OK;
            client_queue_response(client, FTP_230);
        } else {
            client->auth = AUTH_NONE;
            client_queue_response(client, FTP_530);
        }
    } else {
        client_queue_response(client, FTP_530);
    }
}