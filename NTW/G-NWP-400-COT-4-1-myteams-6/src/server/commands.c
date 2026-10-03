/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** commands
*/

#include "../../include/server.h"

static const command_t command_map[] = {
    {"LOGIN",           &myteams_server_cmd_login},
    {"LOGOUT",          &myteams_server_cmd_logout},
    {"HELP",            &myteams_server_cmd_help},
    {"QUIT",            &myteams_server_cmd_quit},
    {"USERS",           &myteams_server_cmd_users},
    {"USER",            &myteams_server_cmd_user},
    {"TEAMS",           &myteams_server_cmd_teams},
    {"TEAM",            &myteams_server_cmd_team},
    {"CREATE_TEAM",     &myteams_server_cmd_create_team},
    {"SUBSCRIBE",       &myteams_server_cmd_subscribe},
    {"UNSUBSCRIBE",     &myteams_server_cmd_unsubscribe},
    {"SUBSCRIBED",      &myteams_server_cmd_subscribed},
    {"CHANNELS",        &myteams_server_cmd_channels},
    {"CHANNEL",         &myteams_server_cmd_channel},
    {"CREATE_CHANNEL",  &myteams_server_cmd_create_channel},
    {"THREADS",         &myteams_server_cmd_threads},
    {"THREAD",          &myteams_server_cmd_thread},
    {"CREATE_THREAD",   &myteams_server_cmd_create_thread},
    {"COMMENTS",        &myteams_server_cmd_comments},
    {"CREATE_COMMENT",  &myteams_server_cmd_create_comment},
    {"SEND",            &myteams_server_cmd_send},
    {"MESSAGES",        &myteams_server_cmd_messages},
    {"USE",             &myteams_server_cmd_use},
    {"CREATE",          &myteams_server_cmd_create},
    {"LIST",            &myteams_server_cmd_list},
    {"INFO",            &myteams_server_cmd_info},
    {NULL,              NULL}
};

static int extract_args(char *line, char **args, int max)
{
    int count = 0;
    int i = 0;

    while (line[i] && count < max) {
        while (line[i] == ' ' || line[i] == '\t')
            i++;
        if (!line[i])
            break;
        if (line[i] != '"')
            return -1;
        i++;
        args[count++] = &line[i];
        while (line[i] && line[i] != '"')
            i++;
        if (!line[i])
            return -1;
        line[i++] = '\0';
    }
    return count;
}

static void dispatch(client_t *client, server_t *server,
    char *cmd, char *args_str)
{
    char *args[10] = {0};
    int arg_count = extract_args(args_str, args, 10);
    int i = 0;

    if (arg_count == -1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    for (i = 0; command_map[i].name != NULL; i++) {
        if (strcasecmp(cmd, command_map[i].name) == 0) {
            command_map[i].func(client, args, arg_count, server);
            return;
        }
    }
    write(client->fd, "501 Unknown command.\r\n", 22);
}

void myteams_server_execute_command(client_t *client, char *buffer, server_t *server)
{
    char *rest = buffer;
    char *cmd = strsep(&rest, " \t\r\n");

    if (!cmd || strlen(cmd) == 0)
        return;
    dispatch(client, server, cmd, rest ? rest : "");
}

void myteams_server_cmd_use(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};

    (void)server;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    memset(client->team_uuid, 0, UUID_LEN);
    memset(client->channel_uuid, 0, UUID_LEN);
    memset(client->thread_uuid, 0, UUID_LEN);
    if (arg_count >= 1)
        strncpy(client->team_uuid, args[0], UUID_LEN);
    if (arg_count >= 2)
        strncpy(client->channel_uuid, args[1], UUID_LEN);
    if (arg_count >= 3)
        strncpy(client->thread_uuid, args[2], UUID_LEN);
    snprintf(line, BUF_SIZE, "220 %s %s %s\r\n",
        client->team_uuid[0] ? client->team_uuid : "none",
        client->channel_uuid[0] ? client->channel_uuid : "none",
        client->thread_uuid[0] ? client->thread_uuid : "none");
    write(client->fd, line, strlen(line));
}

void myteams_server_cmd_create(client_t *client, char **args,
    int arg_count, server_t *server)
{
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    if (!client->team_uuid[0]) {
        char *a[] = {args[0], args[1]};
        myteams_server_cmd_create_team(client, a, arg_count, server);
        return;
    }
    if (!client->channel_uuid[0]) {
        char *a[] = {client->team_uuid, args[0], args[1]};
        myteams_server_cmd_create_channel(client, a, 3, server);
        return;
    }
    if (!client->thread_uuid[0]) {
        char *a[] = {client->team_uuid,
            client->channel_uuid, args[0], args[1]};
        myteams_server_cmd_create_thread(client, a, 4, server);
        return;
    }
    char *a[] = {client->team_uuid, client->channel_uuid,
        client->thread_uuid, args[0]};
    myteams_server_cmd_create_comment(client, a, 4, server);
}

void myteams_server_cmd_list(client_t *client, char **args,
    int arg_count, server_t *server)
{
    (void)args;
    (void)arg_count;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    if (!client->team_uuid[0]) {
        myteams_server_cmd_teams(client, NULL, 0, server);
        return;
    }
    if (!client->channel_uuid[0]) {
        char *a[] = {client->team_uuid};
        myteams_server_cmd_channels(client, a, 1, server);
        return;
    }
    if (!client->thread_uuid[0]) {
        char *a[] = {client->team_uuid, client->channel_uuid};
        myteams_server_cmd_threads(client, a, 2, server);
        return;
    }
    char *a[] = {client->team_uuid,
        client->channel_uuid, client->thread_uuid};
    myteams_server_cmd_comments(client, a, 3, server);
}

void myteams_server_cmd_info(client_t *client, char **args,
    int arg_count, server_t *server)
{
    (void)args;
    (void)arg_count;
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return;
    }
    if (!client->team_uuid[0]) {
        char *a[] = {client->user->uuid};
        myteams_server_cmd_user(client, a, 1, server);
        return;
    }
    if (!client->channel_uuid[0]) {
        char *a[] = {client->team_uuid};
        myteams_server_cmd_team(client, a, 1, server);
        return;
    }
    if (!client->thread_uuid[0]) {
        char *a[] = {client->channel_uuid};
        myteams_server_cmd_channel(client, a, 1, server);
        return;
    }
    char *a[] = {client->thread_uuid};
    myteams_server_cmd_thread(client, a, 1, server);
}