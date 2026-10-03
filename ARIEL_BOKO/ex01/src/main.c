/*
** EPITECH PROJECT, 2026
** main
** File description:
** functions
*/

#include "../include/server.h"

static int print_error_and_init_server(int argc, char **argv)
{
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <port>\n", argv[0]);
        return -1;
    }
    int port = atoi(argv[1]);
    if (port < 1 || port > 65535) {
        fprintf(stderr, "Invalid port number\n");
        return -1;
    }
    int server_fd = create_server_socket(port);
    if (server_fd < 0)
        return -1;
    return server_fd;
}

int main(int argc, char **argv)
{
    int server_fd = print_error_and_init_server(argc, argv);
    if (server_fd < 0)
        return 84;
    struct pollfd poll_fds[MAX_CLIENTS + 1];
    poll_fds[0].fd = server_fd;
    poll_fds[0].events = POLLIN;
    int client_count = 0;
    client_t clients[MAX_CLIENTS];

    while (1) {
        if (poll(poll_fds, client_count + 1, -1) < 0) {
            perror("poll");
            return 1;
        }
        if (poll_fds[0].revents & POLLIN) {
            int new_fd = accept(server_fd, NULL, NULL);
            if (new_fd < 0) {
                perror("accept");
                continue;
            }
            fprintf(stdout, "client %d\n", new_fd);
            poll_fds[client_count + 1].fd = new_fd;
            poll_fds[client_count + 1].events = POLLIN;
            clients[client_count].fd = new_fd;
            clients[client_count].buffer_size = 0;
            clients[client_count].send_buffer_size = 0;
            client_count++;
        }
        for (int i = 0; i < client_count; i++) {
            if (poll_fds[i + 1].revents & POLLIN) {
                if (handle_client(&clients[i], &poll_fds[i + 1]) < 0) {}
            }
            if (poll_fds[i + 1].revents & POLLOUT) {
                handle_send_buffer(&clients[i], &poll_fds[i + 1]);
            }
        }
    }
    return 0;
}
