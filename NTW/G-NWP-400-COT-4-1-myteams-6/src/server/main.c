/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** main
*/

#include "../../include/server.h"

void myteams_server_usage(void)
{
    printf("USAGE: ./myteams_server port\n");
    printf("\tport is the port number on which the server socket listens\n");
}

static int is_valid_port(char *arg)
{
    int i = 0;

    for (i = 0; arg[i]; i++) {
        if (!isdigit(arg[i]))
            return 0;
    }
    return 1;
}

int main(int ac, char **av)
{
    server_t server = {0};
    socket_config_t sock = {0};
    int ret = 0;

    setbuf(stdout, NULL);
    if (ac != 2) {
        if (ac == 2 && strcmp(av[1], "--help") == 0) {
            myteams_server_usage();
            return 0;
        }
        return 84;
    }
    if (!is_valid_port(av[1])) {
        write(2, "Invalid port number\n", 20);
        return 84;
    }
    server.port = atoi(av[1]);
    if (server.port < 1 || server.port > 65535) {
        write(2, "Invalid port number\n", 20);
        return 84;
    }
    signal(SIGINT, myteams_server_signal_handler);
    if (myteams_server_init(&server, &sock) == 84)
        return 84;
    printf("Server launched on port %d\n", server.port);
    ret = myteams_server_run(&server);
    if (server.fd > 0)
        close(server.fd);
    return ret;
}