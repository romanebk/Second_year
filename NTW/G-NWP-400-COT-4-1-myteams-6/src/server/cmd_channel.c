/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_channel
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

static int require_sub(client_t *client, server_t *server,
    const char *team_uuid)
{
    if (!find_team_by_uuid(server, team_uuid)) {
        write(client->fd, "404 Team not found.\r\n", 21);
        return 0;
    }
    if (!is_subscribed(server, client->user->uuid, team_uuid)) {
        write(client->fd, "403 Not subscribed to this team.\r\n", 34);
        return 0;
    }
    return 1;
}

void myteams_server_cmd_channels(client_t *client, char **args,
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
    if (!require_sub(client, server, args[0]))
        return;
    for (i = 0; i < server->channel_count; i++) {
        if (strcmp(server->channels[i].team_uuid, args[0]) != 0)
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"name\":\"%s\","
            "\"description\":\"%s\"}\r\n",
            server->channels[i].uuid,
            server->channels[i].name,
            server->channels[i].description);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of channels list.\r\n", 27);
}

void myteams_server_cmd_channel(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    channel_t *ch = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    ch = find_channel_by_uuid(server, args[0]);
    if (!ch) {
        write(client->fd, "404 Channel not found.\r\n", 24);
        return;
    }
    snprintf(line, BUF_SIZE,
        "214 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"description\":\"%s\"}\r\n",
        ch->uuid, ch->name, ch->description);
    write(client->fd, line, strlen(line));
}

void myteams_server_cmd_create_channel(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    channel_t *ch = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 3) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[1]) > MAX_NAME_LENGTH ||
        strlen(args[2]) > MAX_DESC_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (server->channel_count >= MAX_CHANNELS) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    ch = &server->channels[server->channel_count];
    generate_uuid(ch->uuid);
    strncpy(ch->team_uuid, args[0], UUID_LEN);
    strncpy(ch->name, args[1], MAX_NAME_LENGTH);
    strncpy(ch->description, args[2], MAX_DESC_LENGTH);
    server->channel_count++;
    server_event_channel_created(args[0], ch->uuid, ch->name);
    snprintf(line, BUF_SIZE, "200 Channel created: %s\r\n", ch->uuid);
    write(client->fd, line, strlen(line));
    snprintf(line, BUF_SIZE,
        "703 {\"uuid\":\"%s\",\"name\":\"%s\","
        "\"description\":\"%s\",\"team_uuid\":\"%s\"}\r\n",
        ch->uuid, ch->name, ch->description, ch->team_uuid);
    broadcast_team(server, args[0], line, client->fd);
}