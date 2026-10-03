/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_team
*/

#include "../../include/server.h"

static int require_auth(client_t *client)
{
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return 0;
    }
    return 1;
}

void myteams_server_cmd_teams(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    (void)args;
    (void)arg_count;
    if (!require_auth(client))
        return;
    for (i = 0; i < server->team_count; i++) {
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"name\":\"%s\","
            "\"description\":\"%s\"}\r\n",
            server->teams[i].uuid,
            server->teams[i].name,
            server->teams[i].description);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of teams list.\r\n", 24);
}

void myteams_server_cmd_team(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    team_t *t = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    t = find_team_by_uuid(server, args[0]);
    if (!t) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return;
    }
    snprintf(line, BUF_SIZE,
        "213 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"description\":\"%s\",\"creator\":\"%s\"}\r\n",
        t->uuid, t->name, t->description, t->creator_uuid);
    write(client->fd, line, strlen(line));
}

void myteams_server_cmd_create_team(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    team_t *t = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 2) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[0]) > MAX_NAME_LENGTH ||
        strlen(args[1]) > MAX_DESC_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    if (server->team_count >= MAX_TEAMS) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    t = &server->teams[server->team_count];
    generate_uuid(t->uuid);
    strncpy(t->name, args[0], MAX_NAME_LENGTH);
    strncpy(t->description, args[1], MAX_DESC_LENGTH);
    strncpy(t->creator_uuid, client->user->uuid, UUID_LEN);
    server->team_count++;
    server_event_team_created(t->uuid, t->name, client->user->uuid);
    snprintf(line, BUF_SIZE, "200 Team created: %s\r\n", t->uuid);
    write(client->fd, line, strlen(line));
    snprintf(line, BUF_SIZE,
        "702 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"description\":\"%s\"}\r\n",
        t->uuid, t->name, t->description);
    broadcast_all(server, line, client->fd);
}

void myteams_server_cmd_subscribe(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    subscription_t *sub = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (!find_team_by_uuid(server, args[0])) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return;
    }
    if (is_subscribed(server, client->user->uuid, args[0])) {
        write(client->fd, "409 Already subscribed.\r\n", 25);
        return;
    }
    sub = &server->subscriptions[server->subscription_count];
    strncpy(sub->user_uuid, client->user->uuid, UUID_LEN);
    strncpy(sub->team_uuid, args[0], UUID_LEN);
    server->subscription_count++;
    server_event_user_subscribed(args[0], client->user->uuid);
    snprintf(line, BUF_SIZE, "218 Subscribed to team %s\r\n", args[0]);
    write(client->fd, line, strlen(line));
    snprintf(line, BUF_SIZE,
        "707 {\"uuid\":\"%s\",\"team_uuid\":\"%s\"}\r\n",
        client->user->uuid, args[0]);
    broadcast_team(server, args[0], line, client->fd);
}

void myteams_server_cmd_unsubscribe(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (!find_team_by_uuid(server, args[0])) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return;
    }
    if (!is_subscribed(server, client->user->uuid, args[0])) {
        write(client->fd, "403 Not subscribed.\r\n", 21);
        return;
    }
    for (i = 0; i < server->subscription_count; i++) {
        if (strcmp(server->subscriptions[i].user_uuid,
            client->user->uuid) == 0 &&
            strcmp(server->subscriptions[i].team_uuid, args[0]) == 0) {
            server->subscriptions[i] =
                server->subscriptions[--server->subscription_count];
            break;
        }
    }
    server_event_user_unsubscribed(args[0], client->user->uuid);
    snprintf(line, BUF_SIZE,
        "708 {\"uuid\":\"%s\",\"team_uuid\":\"%s\"}\r\n",
        client->user->uuid, args[0]);
    broadcast_team(server, args[0], line, client->fd);
    snprintf(line, BUF_SIZE,
        "219 Unsubscribed from team %s\r\n", args[0]);
    write(client->fd, line, strlen(line));
}

void myteams_server_cmd_subscribed(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    team_t *t = NULL;
    int i = 0;

    if (!require_auth(client))
        return;
    if (arg_count == 0) {
        for (i = 0; i < server->subscription_count; i++) {
            if (strcmp(server->subscriptions[i].user_uuid,
                client->user->uuid) != 0)
                continue;
            t = find_team_by_uuid(server,
                server->subscriptions[i].team_uuid);
            if (!t)
                continue;
            snprintf(line, BUF_SIZE,
                "210 {\"uuid\":\"%s\",\"name\":\"%s\","
                "\"description\":\"%s\"}\r\n",
                t->uuid, t->name, t->description);
            write(client->fd, line, strlen(line));
        }
        write(client->fd, "211 End of subscribed teams.\r\n", 30);
        return;
    }
    if (!find_team_by_uuid(server, args[0])) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return;
    }
    for (i = 0; i < server->subscription_count; i++) {
        if (strcmp(server->subscriptions[i].team_uuid, args[0]) != 0)
            continue;
        user_t *u = find_user_by_uuid(server,
            server->subscriptions[i].user_uuid);
        if (!u)
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"name\":\"%s\"}\r\n",
            u->uuid, u->name);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of subscribers.\r\n", 25);
}