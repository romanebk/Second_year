/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** network
*/

#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int create_socket(const char *ip, int port)
{
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr;

    if (fd == -1)
        return -1;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = inet_addr(ip);
    if (connect(fd, (struct sockaddr *)&addr, sizeof(addr)) == -1) {
        close(fd);
        return -1;
    }
    return fd;
}

client_t *myteams_client_create(const char *ip, int port)
{
    client_t *c = calloc(1, sizeof(client_t));

    if (!c)
        return NULL;
    c->fd = create_socket(ip, port);
    if (c->fd == -1) {
        free(c);
        return NULL;
    }
    myteams_buffer_init(&c->buf);
    return c;
}

static void handle_stdin(client_t *c)
{
    char input[BUF_SIZE];

    if (!fgets(input, BUF_SIZE, stdin))
        return;
    input[strcspn(input, "\n")] = 0;
    myteams_client_handle_input(c, input);
}

void myteams_client_run(client_t *c)
{
    struct pollfd fds[2];

    fds[0].fd = STDIN_FILENO;
    fds[0].events = POLLIN;
    fds[1].fd = c->fd;
    fds[1].events = POLLIN;
    while (poll(fds, 2, -1) > 0) {
        if (fds[0].revents & POLLIN)
            handle_stdin(c);
        if (fds[1].revents & POLLIN)
            myteams_client_handle_server(c);
    }
}