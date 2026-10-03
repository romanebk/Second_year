/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** data
*/

#include "../../include/server.h"

void generate_uuid(char *dest)
{
    uuid_t raw;

    uuid_generate_random(raw);
    uuid_unparse_lower(raw, dest);
}

user_t *find_user_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < server->user_count; i++) {
        if (strcmp(server->users[i].uuid, uuid) == 0)
            return &server->users[i];
    }
    return NULL;
}

user_t *find_user_by_name(server_t *server, const char *name)
{
    int i = 0;

    for (i = 0; i < server->user_count; i++) {
        if (strcmp(server->users[i].name, name) == 0)
            return &server->users[i];
    }
    return NULL;
}

team_t *find_team_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < server->team_count; i++) {
        if (strcmp(server->teams[i].uuid, uuid) == 0)
            return &server->teams[i];
    }
    return NULL;
}

channel_t *find_channel_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < server->channel_count; i++) {
        if (strcmp(server->channels[i].uuid, uuid) == 0)
            return &server->channels[i];
    }
    return NULL;
}

thread_t *find_thread_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < server->thread_count; i++) {
        if (strcmp(server->threads[i].uuid, uuid) == 0)
            return &server->threads[i];
    }
    return NULL;
}

int is_subscribed(server_t *server, const char *user_uuid,
    const char *team_uuid)
{
    int i = 0;

    for (i = 0; i < server->subscription_count; i++) {
        if (strcmp(server->subscriptions[i].user_uuid, user_uuid) == 0 &&
            strcmp(server->subscriptions[i].team_uuid, team_uuid) == 0)
            return 1;
    }
    return 0;
}

client_t *find_client_by_uuid(server_t *server, const char *uuid)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        if (server->clients[i].fd != -1 &&
            server->clients[i].user != NULL &&
            strcmp(server->clients[i].user->uuid, uuid) == 0)
            return &server->clients[i];
    }
    return NULL;
}

void broadcast_all(server_t *server, const char *msg, int exclude_fd)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        if (server->clients[i].fd != -1 &&
            server->clients[i].user != NULL &&
            server->clients[i].fd != exclude_fd)
            write(server->clients[i].fd, msg, strlen(msg));
    }
}

void broadcast_team(server_t *server, const char *team_uuid,
    const char *msg, int exclude_fd)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        if (server->clients[i].fd == -1 ||
            server->clients[i].user == NULL ||
            server->clients[i].fd == exclude_fd)
            continue;
        if (is_subscribed(server,
            server->clients[i].user->uuid, team_uuid))
            write(server->clients[i].fd, msg, strlen(msg));
    }
}