/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_thread
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

void myteams_server_cmd_threads(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    if (!require_auth(client))
        return;
    if (arg_count != 2) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (!find_channel_by_uuid(server, args[1])) {
        write(client->fd, "404 Channel not found.\r\n", 24);
        return;
    }
    for (i = 0; i < server->thread_count; i++) {
        if (strcmp(server->threads[i].channel_uuid, args[1]) != 0)
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"uuid\":\"%s\",\"title\":\"%s\","
            "\"body\":\"%s\",\"timestamp\":%ld,"
            "\"creator\":\"%s\"}\r\n",
            server->threads[i].uuid,
            server->threads[i].title,
            server->threads[i].body,
            (long)server->threads[i].timestamp,
            server->threads[i].creator_uuid);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of threads list.\r\n", 26);
}

void myteams_server_cmd_thread(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    thread_t *th = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 1) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    th = find_thread_by_uuid(server, args[0]);
    if (!th) {
        write(client->fd, "404 Thread not found.\r\n", 23);
        return;
    }
    snprintf(line, BUF_SIZE,
        "215 {\"uuid\":\"%s\",\"title\":\"%s\","
        "\"body\":\"%s\",\"timestamp\":%ld,"
        "\"creator\":\"%s\"}\r\n",
        th->uuid, th->title, th->body,
        (long)th->timestamp, th->creator_uuid);
    write(client->fd, line, strlen(line));
}

void myteams_server_cmd_create_thread(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    thread_t *th = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 4) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[2]) > MAX_NAME_LENGTH ||
        strlen(args[3]) > MAX_BODY_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (!find_channel_by_uuid(server, args[1])) {
        write(client->fd, "404 Channel not found.\r\n", 24);
        return;
    }
    if (server->thread_count >= MAX_THREADS) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    th = &server->threads[server->thread_count];
    generate_uuid(th->uuid);
    strncpy(th->team_uuid, args[0], UUID_LEN);
    strncpy(th->channel_uuid, args[1], UUID_LEN);
    strncpy(th->title, args[2], MAX_NAME_LENGTH);
    strncpy(th->body, args[3], MAX_BODY_LENGTH);
    strncpy(th->creator_uuid, client->user->uuid, UUID_LEN);
    th->timestamp = time(NULL);
    server->thread_count++;
    server_event_thread_created(args[1], th->uuid, client->user->uuid, th->title, th->body);
    snprintf(line, BUF_SIZE, "200 Thread created: %s\r\n", th->uuid);
    write(client->fd, line, strlen(line));
    snprintf(line, BUF_SIZE,
        "704 {\"uuid\":\"%s\",\"title\":\"%s\","
        "\"channel_uuid\":\"%s\",\"creator\":\"%s\"}\r\n",
        th->uuid, th->title, args[1], client->user->uuid);
    broadcast_team(server, args[0], line, client->fd);
}

void myteams_server_cmd_comments(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    if (!require_auth(client))
        return;
    if (arg_count != 3) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (!find_thread_by_uuid(server, args[2])) {
        write(client->fd, "404 Thread not found.\r\n", 23);
        return;
    }
    for (i = 0; i < server->comment_count; i++) {
        if (strcmp(server->comments[i].thread_uuid, args[2]) != 0)
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"body\":\"%s\",\"timestamp\":%ld,"
            "\"creator\":\"%s\"}\r\n",
            server->comments[i].body,
            (long)server->comments[i].timestamp,
            server->comments[i].creator_uuid);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of comments list.\r\n", 27);
}

void myteams_server_cmd_create_comment(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    comment_t *c = NULL;

    if (!require_auth(client))
        return;
    if (arg_count != 4) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return;
    }
    if (strlen(args[3]) > MAX_BODY_LENGTH) {
        write(client->fd, "413 Argument too long.\r\n", 24);
        return;
    }
    if (!require_sub(client, server, args[0]))
        return;
    if (!find_thread_by_uuid(server, args[2])) {
        write(client->fd, "404 Thread not found.\r\n", 23);
        return;
    }
    if (server->comment_count >= MAX_COMMENTS) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    c = &server->comments[server->comment_count];
    strncpy(c->team_uuid, args[0], UUID_LEN);
    strncpy(c->channel_uuid, args[1], UUID_LEN);
    strncpy(c->thread_uuid, args[2], UUID_LEN);
    strncpy(c->body, args[3], MAX_BODY_LENGTH);
    strncpy(c->creator_uuid, client->user->uuid, UUID_LEN);
    c->timestamp = time(NULL);
    server->comment_count++;
    server_event_reply_created(args[2], client->user->uuid, args[3]);
    write(client->fd, "216 Comment posted.\r\n", 21);
    snprintf(line, BUF_SIZE,
        "705 {\"thread_uuid\":\"%s\",\"creator\":\"%s\","
        "\"body\":\"%s\"}\r\n",
        args[2], client->user->uuid, args[3]);
    broadcast_team(server, args[0], line, client->fd);
}