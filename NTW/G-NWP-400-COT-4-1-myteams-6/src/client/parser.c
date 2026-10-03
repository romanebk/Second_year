/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** parser
*/

#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int myteams_client_parse_args(const char *input, char *arg1, char *arg2, char *arg3)
{
    arg1[0] = '\0';
    arg2[0] = '\0';
    arg3[0] = '\0';
    return sscanf(input,
        "%*s \"%511[^\"]\" \"%511[^\"]\" \"%511[^\"]\"",
        arg1, arg2, arg3);
}

int myteams_client_validate_format(const char *input)
{
    if (strncmp(input, "/help", 5) == 0 ||
        strncmp(input, "/logout", 7) == 0 ||
        strncmp(input, "/list", 5) == 0 ||
        strncmp(input, "/info", 5) == 0 ||
        strncmp(input, "/use", 4) == 0 ||
        strncmp(input, "/subscribed", 11) == 0)
        return 1;
    if (strchr(input, '"') == NULL) {
        printf("Error: Missing or invalid quotes.\n");
        return 0;
    }
    return 1;
}