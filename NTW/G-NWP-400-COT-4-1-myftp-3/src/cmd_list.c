/*
** EPITECH PROJECT, 2026
** cmd_list.c
** File description:
** LIST command implementation
*/

#include "../include/myftp.h"

static void list(client_t *client)
{
    DIR *dir;
    struct dirent *entry;
    int data_fd;
    struct sockaddr_in addr;
    socklen_t len = sizeof(addr);
    char line[512];

    data_fd = accept(client->data_listen_fd, (struct sockaddr *)&addr, &len);
    if (data_fd == -1)
        exit(1);
    dir = opendir(client->cwd);
    if (!dir) {
        close(data_fd);
        exit(1);
    }

    while ((entry = readdir(dir)) != NULL) {
        snprintf(line, sizeof(line), "%s\r\n", entry->d_name);
        write(data_fd, line, strlen(line));
    }
    closedir(dir);
    close(data_fd);
    exit(0);
}

void cmd_list(server_t *srv, client_t *client, char *arg)
{
    pid_t pid;

    (void)srv;
    (void)arg;
    if (client->data_mode == MODE_NONE || client->data_listen_fd == -1) {
        client_queue_response(client, FTP_425);
        return;
    }
    client_queue_response(client, FTP_150);
    client_write(client);
    pid = fork();
    if (pid == -1) {
        client_queue_response(client, FTP_425);
        return;
    }
    if (pid == 0)
        list(client);
    close(client->data_listen_fd);
    client->data_listen_fd = -1;
    client->data_mode = MODE_NONE;
    client_queue_response(client, FTP_226);
}