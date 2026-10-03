/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** network
*/

#include "../../include/server.h"

volatile sig_atomic_t keep_running = 1;

void myteams_server_signal_handler(int signum)
{
    (void)signum;
    keep_running = 0;
}

void myteams_server_init_client(client_t *c)
{
    c->fd = -1;
    c->buf_len = 0;
    c->user = NULL;
    memset(c->buffer, 0, BUFFER_SIZE);
    memset(c->team_uuid, 0, UUID_LEN);
    memset(c->channel_uuid, 0, UUID_LEN);
    memset(c->thread_uuid, 0, UUID_LEN);
}

static void init_poll(server_t *server, struct pollfd *fds)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        fds[i].fd = -1;
        fds[i].events = POLLIN;
        myteams_server_init_client(&server->clients[i]);
    }
    fds[0].fd = server->fd;
}

void myteams_server_configure(server_t *server, socket_config_t *sock)
{
    sock->addr.sin_family = AF_INET;
    sock->addr.sin_port = htons(server->port);
    sock->addr.sin_addr.s_addr = INADDR_ANY;
}

int myteams_server_init(server_t *server, socket_config_t *sock)
{
    int opt = 1;

    server->fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server->fd < 0)
        return 84;
    setsockopt(server->fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    myteams_server_configure(server, sock);
    if (bind(server->fd, (struct sockaddr *)&sock->addr,
        sizeof(sock->addr)) < 0)
        return 84;
    if (listen(server->fd, SOMAXCONN) < 0)
        return 84;
    load_server(server);
    return 0;
}

static void accept_client(server_t *server, struct pollfd *fds)
{
    struct sockaddr_in addr;
    socklen_t len = sizeof(addr);
    int fd = accept(server->fd, (struct sockaddr *)&addr, &len);
    int i = 0;

    if (fd < 0)
        return;
    for (i = 1; i < MAX_CLIENTS; i++) {
        if (fds[i].fd != -1)
            continue;
        fds[i].fd = fd;
        fds[i].events = POLLIN;
        server->clients[i].fd = fd;
        write(fd, "201 Connected to MyTeams server.\r\n", 34);
        return;
    }
    write(fd, "500 Server full.\r\n", 18);
    close(fd);
}

static void process_buffer(client_t *client, server_t *server)
{
    char *end = strstr(client->buffer, "\r\n");
    char *cmd = NULL;
    int len = 0;

    while (end) {
        *end = '\0';
        cmd = strdup(client->buffer);
        if (cmd) {
            myteams_server_execute_command(client, cmd, server);
            free(cmd);
        }
        len = (end - client->buffer) + 2;
        client->buf_len -= len;
        memmove(client->buffer, end + 2, client->buf_len);
        client->buffer[client->buf_len] = '\0';
        end = strstr(client->buffer, "\r\n");
    }
}

static void handle_client(int i, struct pollfd *fds, server_t *server)
{
    int space = BUFFER_SIZE - server->clients[i].buf_len - 1;
    ssize_t r = 0;

    if (space <= 0) {
        server->clients[i].buf_len = 0;
        space = BUFFER_SIZE - 1;
    }
    r = read(fds[i].fd,
        server->clients[i].buffer + server->clients[i].buf_len, space);
    if (r <= 0) {
        close(fds[i].fd);
        fds[i].fd = -1;
        myteams_server_init_client(&server->clients[i]);
        return;
    }
    server->clients[i].buf_len += r;
    server->clients[i].buffer[server->clients[i].buf_len] = '\0';
    process_buffer(&server->clients[i], server);
}

static void check_events(server_t *server, struct pollfd *fds)
{
    int i = 0;

    for (i = 0; i < MAX_CLIENTS; i++) {
        if (!(fds[i].revents & POLLIN))
            continue;
        if (i == 0)
            accept_client(server, fds);
        else
            handle_client(i, fds, server);
    }
}

void myteams_server_handle_disconnection(struct pollfd *fds, client_t *clients, server_t *server)
{
    int i = 0;

    (void)clients;
    save_server(server);
    for (i = 0; i < MAX_CLIENTS; i++) {
        if (fds[i].fd != -1) {
            close(fds[i].fd);
            fds[i].fd = -1;
        }
    }
}

int myteams_server_run(server_t *server)
{
    struct pollfd fds[MAX_CLIENTS] = {0};
    int status = 0;

    init_poll(server, fds);
    while (keep_running) {
        status = poll(fds, MAX_CLIENTS, -1);
        if (status < 0)
            break;
        if (status == 0)
            continue;
        check_events(server, fds);
    }
    myteams_server_handle_disconnection(fds, server->clients, server);
    return 0;
}