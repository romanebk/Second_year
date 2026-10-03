/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** server
*/

#ifndef SERVER_H_
#define SERVER_H_

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <signal.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <fcntl.h>
#include <poll.h>
#include <ctype.h>
#include <time.h>
#include <uuid/uuid.h>

#include "../libs/myteams/logging_server.h"
#include "utils.h"

#define MAX_CLIENTS 1000
#define BUFFER_SIZE 4096
#define MAX_NAME_LENGTH 32
#define MAX_DESC_LENGTH 255
#define MAX_BODY_LENGTH 512
#define MAX_USERS 100
#define MAX_TEAMS 100
#define MAX_CHANNELS 100
#define MAX_THREADS 500
#define MAX_COMMENTS 1000
#define MAX_MESSAGES 1000
#define MAX_SUBSCRIPTIONS 1000

typedef struct user_s {
    char uuid[UUID_LEN];
    char name[MAX_NAME_LENGTH + 1];
    bool is_logged_in;
} user_t;

typedef struct team_s {
    char uuid[UUID_LEN];
    char name[MAX_NAME_LENGTH + 1];
    char description[MAX_DESC_LENGTH + 1];
    char creator_uuid[UUID_LEN];
} team_t;

typedef struct channel_s {
    char uuid[UUID_LEN];
    char team_uuid[UUID_LEN];
    char name[MAX_NAME_LENGTH + 1];
    char description[MAX_DESC_LENGTH + 1];
} channel_t;

typedef struct thread_s {
    char uuid[UUID_LEN];
    char channel_uuid[UUID_LEN];
    char team_uuid[UUID_LEN];
    char creator_uuid[UUID_LEN];
    char title[MAX_NAME_LENGTH + 1];
    char body[MAX_BODY_LENGTH + 1];
    time_t timestamp;
} thread_t;

typedef struct comment_s {
    char thread_uuid[UUID_LEN];
    char channel_uuid[UUID_LEN];
    char team_uuid[UUID_LEN];
    char creator_uuid[UUID_LEN];
    char body[MAX_BODY_LENGTH + 1];
    time_t timestamp;
} comment_t;

typedef struct message_s {
    char sender_uuid[UUID_LEN];
    char receiver_uuid[UUID_LEN];
    char body[MAX_BODY_LENGTH + 1];
    time_t timestamp;
} message_t;

typedef struct subscription_s {
    char user_uuid[UUID_LEN];
    char team_uuid[UUID_LEN];
} subscription_t;

typedef struct {
    struct sockaddr_in addr;
} socket_config_t;

typedef struct client_s {
    int fd;
    char buffer[BUFFER_SIZE];
    int buf_len;
    user_t *user;
    char team_uuid[UUID_LEN];
    char channel_uuid[UUID_LEN];
    char thread_uuid[UUID_LEN];
} client_t;

typedef struct server_s {
    int fd;
    int port;
    client_t clients[MAX_CLIENTS];
    user_t users[MAX_USERS];
    int user_count;
    team_t teams[MAX_TEAMS];
    int team_count;
    channel_t channels[MAX_CHANNELS];
    int channel_count;
    thread_t threads[MAX_THREADS];
    int thread_count;
    comment_t comments[MAX_COMMENTS];
    int comment_count;
    message_t messages[MAX_MESSAGES];
    int message_count;
    subscription_t subscriptions[MAX_SUBSCRIPTIONS];
    int subscription_count;
} server_t;

typedef struct {
    char *name;
    void (*func)(client_t *client, char **args, int arg_count, server_t *server);
} command_t;

void myteams_server_usage(void);

void myteams_server_configure(server_t *server, socket_config_t *sock);
int myteams_server_init(server_t *server, socket_config_t *sock);
void myteams_server_init_client(client_t *c);
void myteams_server_signal_handler(int signum);
int myteams_server_run(server_t *server);
void myteams_server_handle_disconnection(struct pollfd *fds, client_t *clients, server_t *server);
void myteams_server_execute_command(client_t *client, char *buffer, server_t *server);


void generate_uuid(char *dest);
user_t *find_user_by_uuid(server_t *server, const char *uuid);
user_t *find_user_by_name(server_t *server, const char *name);
team_t *find_team_by_uuid(server_t *server, const char *uuid);
channel_t *find_channel_by_uuid(server_t *server, const char *uuid);
thread_t *find_thread_by_uuid(server_t *server, const char *uuid);
client_t *find_client_by_uuid(server_t *server, const char *uuid);
int is_subscribed(server_t *server, const char *user_uuid,
                const char *team_uuid);
void broadcast_all(server_t *server, const char *msg, int exclude_fd);
void broadcast_team(server_t *server, const char *team_uuid,
                const char *msg, int exclude_fd);

int save_server(server_t *server);
int load_server(server_t *server);

void myteams_server_cmd_login(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_logout(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_help(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_quit(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_users(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_user(client_t *client, char **args, int arg_count, server_t *server);

void myteams_server_cmd_teams(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_team(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_create_team(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_subscribe(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_unsubscribe(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_subscribed(client_t *client, char **args, int arg_count, server_t *server);

void myteams_server_cmd_channels(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_channel(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_create_channel(client_t *client, char **args, int arg_count, server_t *server);

void myteams_server_cmd_threads(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_thread(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_create_thread(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_comments(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_create_comment(client_t *client, char **args, int arg_count, server_t *server);

void myteams_server_cmd_send(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_messages(client_t *client, char **args, int arg_count, server_t *server);


void myteams_server_cmd_use(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_create(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_list(client_t *client, char **args, int arg_count, server_t *server);
void myteams_server_cmd_info(client_t *client, char **args, int arg_count, server_t *server);

#endif
