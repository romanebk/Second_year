/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** main
*/

#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void myteams_client_usage(void)
{
    printf("USAGE: ./myteams_cli ip port\n");
    printf("\tip is the server ip address on which the server socket listens\n");
    printf("\tport is the port number on which the server socket listens\n");
}

int main(int ac, char **av)
{
    client_t *c = NULL;

    if (ac != 3) {
        if (ac == 2 && strcmp(av[1], "--help") == 0) {
            myteams_client_usage();
            return 0;
        }
        return 84;
    }
    c = myteams_client_create(av[1], atoi(av[2]));
    if (c == NULL)
        return 84;
    myteams_client_run(c);
    free(c);
    return 0;
}