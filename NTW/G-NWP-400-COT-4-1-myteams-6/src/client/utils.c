/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** utils
*/

#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void myteams_buffer_init(buffer_t *buf)
{
    memset(buf->data, 0, BUF_SIZE);
    buf->len = 0;
}

void myteams_buffer_append(buffer_t *buf, const char *src, int len)
{
    int space = BUF_SIZE - buf->len - 1;

    if (len > space)
        len = space;
    memcpy(buf->data + buf->len, src, len);
    buf->len += len;
    buf->data[buf->len] = '\0';
}

char *myteams_buffer_get_line(buffer_t *buf)
{
    char *newline = memchr(buf->data, '\n', buf->len);
    char *line = NULL;
    int line_len = 0;

    if (!newline)
        return NULL;
    line_len = newline - buf->data;
    line = malloc(line_len + 1);
    if (!line)
        return NULL;
    memcpy(line, buf->data, line_len);
    line[line_len] = '\0';
    if (line_len > 0 && line[line_len - 1] == '\r')
        line[line_len - 1] = '\0';
    buf->len -= (line_len + 1);
    memmove(buf->data, newline + 1, buf->len);
    buf->data[buf->len] = '\0';
    return line;
}

void myteams_json_extract_str(const char *json, const char *key,
    char *dest, int dest_size)
{
    char search[64] = {0};
    const char *pos = NULL;
    const char *start = NULL;
    const char *end = NULL;
    int len = 0;

    snprintf(search, sizeof(search), "\"%s\":", key);
    pos = strstr(json, search);
    if (!pos) {
        dest[0] = '\0';
        return;
    }
    pos += strlen(search);
    while (*pos == ' ')
        pos++;
    if (*pos != '"') {
        dest[0] = '\0';
        return;
    }
    start = pos + 1;
    end = strchr(start, '"');
    if (!end) {
        dest[0] = '\0';
        return;
    }
    len = end - start;
    if (len >= dest_size)
        len = dest_size - 1;
    memcpy(dest, start, len);
    dest[len] = '\0';
}

long myteams_json_extract_long(const char *json, const char *key)
{
    char search[64] = {0};
    const char *pos = NULL;

    snprintf(search, sizeof(search), "\"%s\":", key);
    pos = strstr(json, search);
    if (!pos)
        return -1;
    pos += strlen(search);
    while (*pos == ' ' || *pos == ':' || *pos == '\t')
        pos++;
    return strtol(pos, NULL, 10);
}