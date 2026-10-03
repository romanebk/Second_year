/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** context
*/

#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void myteams_client_process_input_subs(client_t *c, char *input, int n, char *arg1)
{
    if (strncmp(input, "/subscribe ", 11) == 0 && n >= 1) {
        myteams_client_send_cmd(c, "SUBSCRIBE \"%s\"", arg1);
    } else if (strncmp(input, "/subscribed", 11) == 0) {
        if (n == 0) {
            c->pending_list_type = 2;
            myteams_client_send_cmd(c, "SUBSCRIBED");
        } else {
            c->pending_list_type = 1;
            myteams_client_send_cmd(c, "SUBSCRIBED \"%s\"", arg1);
        }
    } else if (strncmp(input, "/unsubscribe ", 13) == 0 && n >= 1) {
        myteams_client_send_cmd(c, "UNSUBSCRIBE \"%s\"", arg1);
    }
}

void myteams_client_process_input_context(client_t *c, char *input,
    int n, char *arg1, char *arg2, char *arg3)
{
    if (strncmp(input, "/use ", 5) == 0) {
        myteams_client_send_cmd(c, "USE %s %s %s",
            arg1[0] ? arg1 : "none",
            arg2[0] ? arg2 : "none",
            arg3[0] ? arg3 : "none");
    } else if (strcmp(input, "/use") == 0) {
        myteams_client_send_cmd(c, "USE");
    } else if (strncmp(input, "/create ", 8) == 0) {
        if (c->team_uuid[0] == '\0' && n >= 2)
            myteams_client_send_cmd(c, "CREATE_TEAM \"%s\" \"%s\"", arg1, arg2);
        else if (c->channel_uuid[0] == '\0' && n >= 2)
            myteams_client_send_cmd(c, "CREATE_CHANNEL \"%s\" \"%s\" \"%s\"",
                c->team_uuid, arg1, arg2);
        else if (c->thread_uuid[0] == '\0' && n >= 2)
            myteams_client_send_cmd(c, "CREATE_THREAD \"%s\" \"%s\" \"%s\" \"%s\"",
                c->team_uuid, c->channel_uuid, arg1, arg2);
        else if (n >= 1)
            myteams_client_send_cmd(c, "CREATE_COMMENT \"%s\" \"%s\" \"%s\" \"%s\"",
                c->team_uuid, c->channel_uuid, c->thread_uuid, arg1);
    } else if (strcmp(input, "/list") == 0) {
        if (c->team_uuid[0] == '\0') {
            c->pending_list_type = 2;
            myteams_client_send_cmd(c, "TEAMS");
        } else if (c->channel_uuid[0] == '\0') {
            c->pending_list_type = 3;
            myteams_client_send_cmd(c, "CHANNELS \"%s\"", c->team_uuid);
        } else if (c->thread_uuid[0] == '\0') {
            c->pending_list_type = 4;
            myteams_client_send_cmd(c, "THREADS \"%s\" \"%s\"",
                c->team_uuid, c->channel_uuid);
        } else {
            c->pending_list_type = 5;
            myteams_client_send_cmd(c, "COMMENTS \"%s\" \"%s\" \"%s\"",
                c->team_uuid, c->channel_uuid, c->thread_uuid);
        }
    } else if (strcmp(input, "/info") == 0) {
        if (c->team_uuid[0] == '\0')
            myteams_client_send_cmd(c, "USER \"%s\"", c->uuid);
        else if (c->channel_uuid[0] == '\0')
            myteams_client_send_cmd(c, "TEAM \"%s\"", c->team_uuid);
        else if (c->thread_uuid[0] == '\0')
            myteams_client_send_cmd(c, "CHANNEL \"%s\"", c->channel_uuid);
        else
            myteams_client_send_cmd(c, "THREAD \"%s\"", c->thread_uuid);
    }
}