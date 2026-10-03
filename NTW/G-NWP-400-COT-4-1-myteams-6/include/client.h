/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams-21
** File description:
** client
*/

#ifndef CLIENT_H_
#define CLIENT_H_

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <signal.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <fcntl.h>
#include <poll.h>
#include "../libs/myteams/logging_client.h"
#include "utils.h"

typedef struct client_s {
    int fd;
    bool logged;
    char uuid[UUID_LEN];
    char username[33];
    char team_uuid[UUID_LEN];
    char channel_uuid[UUID_LEN];
    char thread_uuid[UUID_LEN];
    buffer_t buf;
    int pending_list_type;
} client_t;

client_t *myteams_client_create(const char *ip, int port);
void myteams_client_run(client_t *client);

void myteams_client_handle_input(client_t *client, char *input);
void myteams_client_handle_server(client_t *client);
void myteams_client_send_cmd(client_t *client, const char *fmt, ...);

int myteams_client_parse_args(const char *input, char *arg1, char *arg2, char *arg3);
int myteams_client_validate_format(const char *input);

void myteams_client_process_input_subs(client_t *client, char *input, int n, char *arg1);
void myteams_client_process_input_context(client_t *client, char *input, int n, char *arg1, char *arg2, char *arg3);

void myteams_client_usage(void);
void myteams_client_show_help(void);

#endif
