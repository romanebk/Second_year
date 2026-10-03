/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** save
*/

#include "../../include/server.h"

#define SAVE_FILE "myteams_save.dat"

int save_server(server_t *server)
{
    FILE *f = fopen(SAVE_FILE, "wb");

    if (!f)
        return 84;
    fwrite(&server->user_count, sizeof(int), 1, f);
    fwrite(server->users, sizeof(user_t), server->user_count, f);
    fwrite(&server->team_count, sizeof(int), 1, f);
    fwrite(server->teams, sizeof(team_t), server->team_count, f);
    fwrite(&server->channel_count, sizeof(int), 1, f);
    fwrite(server->channels, sizeof(channel_t), server->channel_count, f);
    fwrite(&server->thread_count, sizeof(int), 1, f);
    fwrite(server->threads, sizeof(thread_t), server->thread_count, f);
    fwrite(&server->comment_count, sizeof(int), 1, f);
    fwrite(server->comments, sizeof(comment_t), server->comment_count, f);
    fwrite(&server->message_count, sizeof(int), 1, f);
    fwrite(server->messages, sizeof(message_t), server->message_count, f);
    fwrite(&server->subscription_count, sizeof(int), 1, f);
    fwrite(server->subscriptions, sizeof(subscription_t),
        server->subscription_count, f);
    fclose(f);
    return 0;
}

int load_server(server_t *server)
{
    FILE *f = fopen(SAVE_FILE, "rb");

    if (!f)
        return 0;
    fread(&server->user_count, sizeof(int), 1, f);
    fread(server->users, sizeof(user_t), server->user_count, f);
    fread(&server->team_count, sizeof(int), 1, f);
    fread(server->teams, sizeof(team_t), server->team_count, f);
    fread(&server->channel_count, sizeof(int), 1, f);
    fread(server->channels, sizeof(channel_t), server->channel_count, f);
    fread(&server->thread_count, sizeof(int), 1, f);
    fread(server->threads, sizeof(thread_t), server->thread_count, f);
    fread(&server->comment_count, sizeof(int), 1, f);
    fread(server->comments, sizeof(comment_t), server->comment_count, f);
    fread(&server->message_count, sizeof(int), 1, f);
    fread(server->messages, sizeof(message_t), server->message_count, f);
    fread(&server->subscription_count, sizeof(int), 1, f);
    fread(server->subscriptions, sizeof(subscription_t),
        server->subscription_count, f);
    fclose(f);
    return 0;
}