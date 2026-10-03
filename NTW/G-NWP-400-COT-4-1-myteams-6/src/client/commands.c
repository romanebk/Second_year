/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** commands
*/

#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void myteams_client_handle_input(client_t *c, char *input)
{
    char arg1[512] = {0};
    char arg2[512] = {0};
    char arg3[512] = {0};
    int n = 0;

    if (strlen(input) == 0)
        return;
    if (!myteams_client_validate_format(input))
        return;
    n = myteams_client_parse_args(input, arg1, arg2, arg3);
    if (strncmp(input, "/login ", 7) == 0 && n >= 1)
        myteams_client_send_cmd(c, "LOGIN \"%s\"", arg1);
    else if (strcmp(input, "/logout") == 0)
        myteams_client_send_cmd(c, "LOGOUT");
    else if (strcmp(input, "/users") == 0) {
        c->pending_list_type = 1;
        myteams_client_send_cmd(c, "USERS");
    } else if (strncmp(input, "/user ", 6) == 0 && n >= 1)
        myteams_client_send_cmd(c, "USER \"%s\"", arg1);
    else if (strncmp(input, "/send ", 6) == 0 && n >= 2)
        myteams_client_send_cmd(c, "SEND \"%s\" \"%s\"", arg1, arg2);
    else if (strncmp(input, "/messages ", 10) == 0 && n >= 1) {
        c->pending_list_type = 6;
        myteams_client_send_cmd(c, "MESSAGES \"%s\"", arg1);
    } else if (strncmp(input, "/subscribe", 10) == 0 ||
        strncmp(input, "/subscribed", 11) == 0 ||
        strncmp(input, "/unsubscribe", 12) == 0)
        myteams_client_process_input_subs(c, input, n, arg1);
    else if (strncmp(input, "/use", 4) == 0 ||
        strncmp(input, "/create ", 8) == 0 ||
        strcmp(input, "/list") == 0 ||
        strcmp(input, "/info") == 0)
        myteams_client_process_input_context(c, input, n, arg1, arg2, arg3);
    else if (strcmp(input, "/help") == 0)
        myteams_client_show_help();
}

void myteams_client_show_help(void)
{
    printf("=== MyTeams Command Help ===\n\n");
    
    printf("AUTHENTICATION:\n");
    printf("  /login \"username\"         - Connect to server with username\n");
    printf("  /logout                    - Disconnect from server\n");
    printf("  /help                      - Show this help message\n\n");
    
    printf("USER INFORMATION:\n");
    printf("  /users                     - List all connected users\n");
    printf("  /user \"user_uuid\"         - Get information about a user\n\n");
    
    printf("PRIVATE MESSAGING:\n");
    printf("  /send \"user_uuid\" \"message\" - Send private message to user\n");
    printf("  /messages \"user_uuid\"      - Show conversation history with user\n\n");
    
    printf("TEAM MANAGEMENT:\n");
    printf("  /teams                     - List all available teams\n");
    printf("  /team \"team_uuid\"          - Get information about a team\n");
    printf("  /create \"team_name\" \"desc\" - Create a new team\n");
    printf("  /subscribe \"team_uuid\"     - Subscribe to a team\n");
    printf("  /unsubscribe \"team_uuid\"   - Unsubscribe from a team\n");
    printf("  /subscribed                - List teams you're subscribed to\n");
    printf("  /subscribed \"team_uuid\"    - List users subscribed to team\n\n");
    
    printf("CONTEXT NAVIGATION:\n");
    printf("  /use                       - Reset context (no team/channel/thread)\n");
    printf("  /use \"team_uuid\"           - Set team context\n");
    printf("  /use \"team\" \"channel\"      - Set team and channel context\n");
    printf("  /use \"team\" \"chan\" \"thread\" - Set full context\n\n");
    
    printf("CONTEXT OPERATIONS:\n");
    printf("  /list                      - List items in current context\n");
    printf("  /info                      - Show info about current context\n");
    printf("  /create \"name\" \"desc\"      - Create item in current context\n\n");
    
    printf("CONTEXT DEPENDENCIES:\n");
    printf("  • No context:     /list → teams, /create → team\n");
    printf("  • Team context:   /list → channels, /create → channel\n");
    printf("  • Channel context: /list → threads, /create → thread\n");
    printf("  • Thread context: /list → comments, /create → comment\n\n");
    
    printf("USAGE EXAMPLES:\n");
    printf("  /login \"alice\"\n");
    printf("  /subscribe \"team-123-abc\"\n");
    printf("  /use \"team-123-abc\" \"chan-456-def\"\n");
    printf("  /create \"general\" \"General discussion\"\n");
    printf("  /send \"user-789-ghi\" \"Hello!\"\n\n");
    
    printf("NOTES:\n");
    printf("  • Use quotes around arguments with spaces\n");
    printf("  • UUIDs are 36 characters (e.g., 12345678-1234-1234-1234-123456789abc)\n");
    printf("  • Most operations require login and team subscription\n");
}