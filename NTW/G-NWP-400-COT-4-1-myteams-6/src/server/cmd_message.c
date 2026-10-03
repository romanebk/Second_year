/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** cmd_message
*/

#include "../../include/server.h"

static int check_auth(client_t *client, int arg_count, int expected)
{
    if (!client->user) {
        write(client->fd, "401 Not logged in.\r\n", 20);
        return 0;
    }
    if (arg_count != expected) {
        write(client->fd, "400 Bad request.\r\n", 18);
        return 0;
    }
    return 1;
}

static message_t *get_free_slot(server_t *server)
{
    int i = 0;

    for (i = 0; i < MAX_MESSAGES; i++) {
        if (server->messages[i].sender_uuid[0] == '\0')
            return &server->messages[i];
    }
    return NULL;
}

static int is_exchange(message_t *msg, const char *a, const char *b)
{
    return (strcmp(msg->sender_uuid, a) == 0 &&
        strcmp(msg->receiver_uuid, b) == 0) ||
        (strcmp(msg->sender_uuid, b) == 0 &&
        strcmp(msg->receiver_uuid, a) == 0);
}

static void notify_receiver(server_t *server, client_t *sender,
    const char *receiver_uuid, const char *body)
{
    char event[BUF_SIZE] = {0};
    client_t *target = find_client_by_uuid(server, receiver_uuid);

    if (!target)
        return;
    snprintf(event, BUF_SIZE,
        "706 {\"uuid\":\"%s\",\"body\":\"%s\"}\r\n",
        sender->user->uuid, body);
    write(target->fd, event, strlen(event));
}

void myteams_server_cmd_send(client_t *client, char **args,
    int arg_count, server_t *server)
{
    message_t *slot = NULL;

    if (!check_auth(client, arg_count, 2))
        return;
    if (!find_user_by_uuid(server, args[0])) {
        write(client->fd, "404 User not found.\r\n", 21);
        return;
    }
    slot = get_free_slot(server);
    if (!slot) {
        write(client->fd, "500 Server full.\r\n", 18);
        return;
    }
    strncpy(slot->sender_uuid, client->user->uuid, UUID_LEN);
    strncpy(slot->receiver_uuid, args[0], UUID_LEN);
    strncpy(slot->body, args[1], MAX_BODY_LENGTH);
    slot->timestamp = time(NULL);
    server_event_private_message_sended(client->user->uuid,
        args[0], args[1]);
    write(client->fd, "217 Message sent.\r\n", 19);
    notify_receiver(server, client, args[0], args[1]);
}

void myteams_server_cmd_messages(client_t *client, char **args,
    int arg_count, server_t *server)
{
    char line[BUF_SIZE] = {0};
    int i = 0;

    if (!check_auth(client, arg_count, 1))
        return;
    if (!find_user_by_uuid(server, args[0])) {
        write(client->fd, "404 User not found.\r\n", 21);
        return;
    }
    for (i = 0; i < server->message_count; i++) {
        if (!is_exchange(&server->messages[i],
            client->user->uuid, args[0]))
            continue;
        snprintf(line, BUF_SIZE,
            "210 {\"sender\":\"%s\",\"body\":\"%s\","
            "\"timestamp\":%ld}\r\n",
            server->messages[i].sender_uuid,
            server->messages[i].body,
            (long)server->messages[i].timestamp);
        write(client->fd, line, strlen(line));
    }
    write(client->fd, "211 End of messages.\r\n", 22);
}