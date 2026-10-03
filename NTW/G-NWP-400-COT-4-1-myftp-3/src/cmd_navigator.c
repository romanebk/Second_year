/*
** EPITECH PROJECT, 2026
** cmd_nav.c
** File description:
** stub - etape 4
*/

#include "../include/myftp.h"


void cmd_help(client_t *client, char *arg)
{
    (void)arg;
    client_queue_response(client, "214-User and authentication commands:\r\n");
    client_queue_response(client, "USER <SP> <username> <CRLF>   : Specify user for authentication\r\n");
    client_queue_response(client, "PASS <SP> <password> <CRLF>   : Specify password for authentication\r\n");
    client_queue_response(client, "214-\r\n");
    client_queue_response(client, "214-Navigation commands:\r\n");
    client_queue_response(client, "CWD  <SP> <pathname> <CRLF>   : Change working directory\r\n");
    client_queue_response(client, "CDUP <CRLF>                   : Change working directory to parent directory\r\n");
    client_queue_response(client, "PWD  <CRLF>                   : Print working directory\r\n");
    client_queue_response(client, "214-\r\n");
    client_queue_response(client, "214-Connection commands:\r\n");
    client_queue_response(client, "QUIT <CRLF>                   : Disconnection\r\n");
    client_queue_response(client, "214-\r\n");
    client_queue_response(client, "214-File operations:\r\n");
    client_queue_response(client, "DELE <SP> <pathname> <CRLF>   : Delete file on the server\r\n");
    client_queue_response(client, "214-\r\n");
    client_queue_response(client, "214-Data transfer modes:\r\n");
    client_queue_response(client, "PASV <CRLF>                   : Enable \"passive\" mode for data transfer\r\n");
    client_queue_response(client, "PORT <SP> <host-port> <CRLF>  : Enable \"active\" mode for data transfer\r\n");
    client_queue_response(client, "214-\r\n");
    client_queue_response(client, "214-Utility commands:\r\n");
    client_queue_response(client, "HELP [<SP> <string>] <CRLF>   : List available commands\r\n");
    client_queue_response(client, "NOOP <CRLF>                   : Do nothing\r\n");
    client_queue_response(client, "214-\r\n");
    client_queue_response(client, "214-Data transfer commands:\r\n");
    client_queue_response(client, "(the following are commands using data transfer)\r\n");
    client_queue_response(client, "RETR <SP> <pathname> <CRLF>   : Download file from server to client\r\n");
    client_queue_response(client, "STOR <SP> <pathname> <CRLF>   : Upload file from client to server\r\n");
    client_queue_response(client, "LIST [<SP> <pathname>] <CRLF> : List files in the current working directory\r\n");
    client_queue_response(client, "214 End of HELP.\r\n");
}

void cmd_pwd(client_t *client)
{
    char response[FTP_PATH_MAX + 32];
    char cwd_buf[FTP_PATH_MAX];

    if (getcwd(cwd_buf, sizeof(cwd_buf)) != NULL) {
        snprintf(response, sizeof(response),
                 "257 \"%s\" is current directory.\r\n", cwd_buf);
    } else {
        snprintf(response, sizeof(response),
                 "550 Error getting directory.\r\n");
    }
    client_queue_response(client, response);
}

void cmd_cwd(server_t *server, client_t *client, char *arg)
{
    char new_path[FTP_PATH_MAX];
    char *resolved_path;
    struct stat info;
    
    if (!arg || strlen(arg) == 0) {
        client_queue_response(client, FTP_501);
        return;
    }
    
    if (arg[0] == '/') {
        strncpy(new_path, arg, FTP_PATH_MAX - 1);
        new_path[FTP_PATH_MAX - 1] = '\0';
    } else {
        int len = strlen(client->cwd) + strlen(arg) + 2;
        if (len >= FTP_PATH_MAX) {
            client_queue_response(client, FTP_501);
            return;
        }
        strcpy(new_path, client->cwd);
        strcat(new_path, "/");
        strcat(new_path, arg);
    }
    
    resolved_path = realpath(new_path, NULL);
    if (!resolved_path) {
        client_queue_response(client, FTP_550);
        return;
    }
    
    if (strncmp(resolved_path, server->root_path, strlen(server->root_path)) != 0) {
        free(resolved_path);
        client_queue_response(client, FTP_550);
        return;
    }
    
    if (stat(resolved_path, &info) != 0 || !S_ISDIR(info.st_mode)) {
        free(resolved_path);
        client_queue_response(client, FTP_550);
        return;
    }

    strncpy(client->cwd, resolved_path, FTP_PATH_MAX - 1);
    client->cwd[FTP_PATH_MAX - 1] = '\0';
    free(resolved_path);
    
    client_queue_response(client, FTP_250);
}

void cmd_cdup(server_t *server, client_t *client)
{
    cmd_cwd(server, client, "..");
    if (client->write_len > 0) {
        client->write_len = 0;
        client->write_pos = 0;
        memset(client->write_buf, 0, BUF_SIZE);
        client_queue_response(client, FTP_200);
    }
}