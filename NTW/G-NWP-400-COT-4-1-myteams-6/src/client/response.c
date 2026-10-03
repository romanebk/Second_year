/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** response
*/

#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void print_list_user(char *json)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    int status = 0;

    myteams_json_extract_str(json, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(json, "name", name, 33);
    status = (int)myteams_json_extract_long(json, "is_connected");
    client_print_users(uuid, name, status);
}

static void print_list_team(char *json)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    char desc[256] = {0};

    myteams_json_extract_str(json, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(json, "name", name, 33);
    myteams_json_extract_str(json, "description", desc, 256);
    client_print_teams(uuid, name, desc);
}

static void print_list_channel(char *json)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    char desc[256] = {0};

    myteams_json_extract_str(json, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(json, "name", name, 33);
    myteams_json_extract_str(json, "description", desc, 256);
    client_team_print_channels(uuid, name, desc);
}

static void print_list_thread(char *json)
{
    char uuid[UUID_LEN] = {0};
    char creator[UUID_LEN] = {0};
    char title[33] = {0};
    char body[513] = {0};
    long ts = 0;

    myteams_json_extract_str(json, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(json, "creator", creator, UUID_LEN);
    myteams_json_extract_str(json, "title", title, 33);
    myteams_json_extract_str(json, "body", body, 513);
    ts = myteams_json_extract_long(json, "timestamp");
    client_channel_print_threads(uuid, creator, (time_t)ts, title, body);
}

static void print_list_comment(client_t *c, char *json)
{
    char creator[UUID_LEN] = {0};
    char body[513] = {0};
    long ts = 0;

    myteams_json_extract_str(json, "creator", creator, UUID_LEN);
    myteams_json_extract_str(json, "body", body, 513);
    ts = myteams_json_extract_long(json, "timestamp");
    client_thread_print_replies(c->thread_uuid, creator, (time_t)ts, body);
}

static void print_list_message(char *json)
{
    char sender[UUID_LEN] = {0};
    char body[513] = {0};
    long ts = 0;

    myteams_json_extract_str(json, "sender", sender, UUID_LEN);
    myteams_json_extract_str(json, "body", body, 513);
    ts = myteams_json_extract_long(json, "timestamp");
    client_private_message_print_messages(sender, (time_t)ts, body);
}

static void process_list_data(client_t *c, char *json)
{
    if (c->pending_list_type == 1)
        print_list_user(json);
    else if (c->pending_list_type == 2)
        print_list_team(json);
    else if (c->pending_list_type == 3)
        print_list_channel(json);
    else if (c->pending_list_type == 4)
        print_list_thread(json);
    else if (c->pending_list_type == 5)
        print_list_comment(c, json);
    else if (c->pending_list_type == 6)
        print_list_message(json);
}

static void process_auth(client_t *c, int code, char *p)
{
    char t[UUID_LEN] = {0};
    char ch[UUID_LEN] = {0};
    char th[UUID_LEN] = {0};

    if (code == 202) {
        sscanf(p, "%36s \"%32[^\"]\"", c->uuid, c->username);
        c->logged = true;
        client_event_logged_in(c->uuid, c->username);
        return;
    }
    if (code == 203) {
        client_event_logged_out(c->uuid, c->username);
        close(c->fd);
        exit(0);
    }
    if (code == 220) {
        sscanf(p, "%s %s %s", t, ch, th);
        strncpy(c->team_uuid, strcmp(t, "none") ? t : "", UUID_LEN);
        strncpy(c->channel_uuid, strcmp(ch, "none") ? ch : "", UUID_LEN);
        strncpy(c->thread_uuid, strcmp(th, "none") ? th : "", UUID_LEN);
    }
}

static void process_info(int code, char *p)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    char desc[256] = {0};
    char creator[UUID_LEN] = {0};
    char title[33] = {0};
    char body[513] = {0};
    long ts = 0;

    myteams_json_extract_str(p, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(p, "name", name, 33);
    if (code == 212) {
        client_print_user(uuid, name,
            (int)myteams_json_extract_long(p, "is_connected"));
        return;
    }
    myteams_json_extract_str(p, "description", desc, 256);
    if (code == 213) {
        client_print_team(uuid, name, desc);
        return;
    }
    if (code == 214) {
        client_print_channel(uuid, name, desc);
        return;
    }
    myteams_json_extract_str(p, "creator", creator, UUID_LEN);
    myteams_json_extract_str(p, "title", title, 33);
    myteams_json_extract_str(p, "body", body, 513);
    ts = myteams_json_extract_long(p, "timestamp");
    client_print_thread(uuid, creator, (time_t)ts, title, body);
}

static void process_error(int code, char *p)
{
    if (code == 400 || code == 401) {
        client_error_unauthorized();
        return;
    }
    if (code == 409) {
        client_error_already_exist();
        return;
    }
    if (code != 404 || !p)
        return;
    if (strstr(p, "Team"))
        client_error_unknown_team(p + strlen("Team "));
    else if (strstr(p, "Channel"))
        client_error_unknown_channel(p + strlen("Channel "));
    else if (strstr(p, "Thread"))
        client_error_unknown_thread(p + strlen("Thread "));
    else if (strstr(p, "User"))
        client_error_unknown_user(p + strlen("User "));
}

static void process_event(int code, char *p)
{
    char uuid[UUID_LEN] = {0};
    char name[33] = {0};
    char desc[256] = {0};
    char body[513] = {0};

    myteams_json_extract_str(p, "uuid", uuid, UUID_LEN);
    myteams_json_extract_str(p, "name", name, 33);
    if (code == 700) {
        client_event_logged_in(uuid, name);
        return;
    }
    if (code == 701) {
        client_event_logged_out(uuid, name);
        return;
    }
    if (code == 702) {
        myteams_json_extract_str(p, "description", desc, 256);
        client_event_team_created(uuid, name, desc);
        return;
    }
    if (code == 706) {
        myteams_json_extract_str(p, "body", body, 513);
        client_event_private_message_received(uuid, body);
    }
}

static void dispatch_response(client_t *c, int code, char *payload)
{
    if (code == 210 && strstr(payload, "{"))
        process_list_data(c, payload);
    else if (code == 211)
        c->pending_list_type = 0;
    else if (code >= 202 && code <= 220)
        process_auth(c, code, payload);
    else if (code >= 212 && code <= 215)
        process_info(code, payload);
    else if (code >= 400 && code <= 409)
        process_error(code, payload);
    else if (code >= 700 && code <= 706)
        process_event(code, payload);
}

void myteams_client_handle_server(client_t *c)
{
    char tmp[BUF_SIZE];
    int r = read(c->fd, tmp, BUF_SIZE);
    char *line = NULL;
    char *payload = NULL;

    if (r <= 0) {
        close(c->fd);
        exit(0);
    }
    myteams_buffer_append(&c->buf, tmp, r);
    line = myteams_buffer_get_line(&c->buf);
    while (line) {
        payload = line + 4;
        while (*payload == ' ')
            payload++;
        dispatch_response(c, atoi(line), payload);
        free(line);
        line = myteams_buffer_get_line(&c->buf);
    }
}