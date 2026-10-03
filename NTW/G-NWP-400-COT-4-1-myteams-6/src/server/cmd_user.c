/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_user
*/

#include "../../include/server.h"

static void send_login_event(server_t *server, client_t *client,
    user_t *user)
{
    char event[BUF_SIZE] = {0};

    snprintf(event, BUF_SIZE,
        "700 {\"uuid\":\"%s\",\"name\":\"%s\"}\r\n",
        user->uuid, user->name);
    broadcast_all(server, event, client->fd);
}

static user_t *register_user(server_t *server, const char *name)
{
    user_t *u = &server->users[server->user_count];

    generate_uuid(u->uuid);
    strncpy(u->name, name, MAX_NAME_LENGTH);
    u->is_logged_in = false;
    server->user_count++;
    server_event_user_created(u->uuid, u->name);
    return u;
}

void myteams_server_cmd_login(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char response[BUF_SIZE] = {0};
    user_t *user = NULL;

    if (client->user) {
        write(client->fd, "409 Already logged in.\r\n", 24);
        return;
    }
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[0]) > MAX_NAME_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    user = find_user_by_name(server, args[0]);
    if (!user)
        user = register_user(server, args[0]);
    client->user = user;
    user->is_logged_in = true;
    server_event_user_logged_in(user->uuid);
    snprintf(response, BUF_SIZE, "202 %s \"%s\"\r\n",
        user->uuid, user->name);
    write(client->fd, response, strlen(response));
    send_login_event(server, client, user);
}

void myteams_server_cmd_logout(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char event[BUF_SIZE] = {0};

    (void)args;
    (void)arg_count;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    server_event_user_logged_out(client->user->uuid);
    client->user->is_logged_in = false;
    snprintf(event, BUF_SIZE,
        "701 {\"uuid\":\"%s\",\"name\":\"%s\"}\r\n",
        client->user->uuid, client->user->name);
    broadcast_all(server, event, client->fd);
    write(client->fd, "203 Logged out.\r\n", 17);
    client->user = NULL;
}

void myteams_server_cmd_users(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    (void)args;
    (void)arg_count;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    for (i = 0; i < server->user_count; i++) {
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"name\":\"%s\","
            "\"is_connected\":%d}\r\n",
            server->users[i].uuid,
            server->users[i].name,
            server->users[i].is_logged_in ? 1 : 0);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of users list.\r\n", 24);
}

void myteams_server_cmd_user(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    user_t *u = NULL;

    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    u = find_user_by_uuid(server, args[0]);
    if (!u) {
        write(client->fd, "404 User not found.\r\n", 21);
        return;
    }
    snprintf(line, BUF_SIZE,
        "212 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"is_connected\":%d}\r\n",
        u->uuid, u->name, u->is_logged_in ? 1 : 0);
    write(client->fd, line, strlen(line));
}

void myteams_server_cmd_help(client_t *client, char **args,
    int arg_count, server_t *server)
{
    (void)args;
    (void)arg_count;
    (void)server;
    write(client->fd,
        "200 LOGIN LOGOUT USERS USER TEAMS TEAM CREATE_TEAM"
        " SUBSCRIBE UNSUBSCRIBE SUBSCRIBED CHANNELS CHANNEL"
        " CREATE_CHANNEL THREADS THREAD CREATE_THREAD"
        " COMMENTS CREATE_COMMENT SEND MESSAGES"
        " USE CREATE LIST INFO HELP QUIT\r\n", 185);
}

void myteams_server_cmd_quit(client_t *client, char **args,
    int arg_count, server_t *server)
{
    (void)args;
    (void)arg_count;
    if (client->user)
        myteams_server_cmd_logout(client, NULL, 0, server);
    else
        write(client->fd, "203 Goodbye.\r\n", 14);
    close(client->fd);
    client->fd = -1;
}