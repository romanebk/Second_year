/*
** EPITECH PROJECT, 2026
** main.c
** File description:
** Entry point of the FTP server
*/

#include "../include/myftp.h"

void print_usage(void)
{
    printf("USAGE: ./myftp port path\n");
    printf(" port is the port number on which the server socket listens\n");
    printf(" path is the path to the home directory for the Anonymous user\n");
}


int check_port(char *port)
{
    for (int i = 0; port[i]; i++) {
        if (port[i] >= '0' && port[i] <= '9') {
            continue;
        } else
            return -1;
    }
    if (atoi(port) < 1 || atoi(port) > 65535)
        return -1;
    return atoi(port);
}

int check_path(char *path)
{
    if (chdir(path) == -1) {
        fprintf(stderr, "Chemin invalide: %s\n", path);
        return -1;
    }
    return 0;
}

int main(int argc, char **argv)
{
    server_t server;
    int port;

    if (argc == 2 && strcmp(argv[1], "--help") == 0) {
        print_usage();
        return 0;
    }
    if (argc != 3) {
        print_usage();
        return 84;
    }
    port = check_port(argv[1]);
    if (port == -1) {
        fprintf(stderr, "Error: invalid port '%s'\n", argv[1]);
        return 84;
    }
    if (check_path(argv[2]) == -1) {
        fprintf(stderr, "Error: invalid path '%s'\n", argv[2]);
        return 84;
    }
    if (server_init(&server, port, argv[2]) == -1)
        return 84;
    server_loop(&server);
    return 0;
}