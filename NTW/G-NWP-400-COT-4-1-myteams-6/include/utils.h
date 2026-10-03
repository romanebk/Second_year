/*
** EPITECH PROJECT, 2024
** myteams_cli
** File description:
** Buffer and JSON utils
*/

#ifndef UTILS_H_
#define UTILS_H_

#include <stdlib.h>

#define BUF_SIZE 4096
#define UUID_LEN 37

typedef struct {
    char data[BUF_SIZE];
    int len;
} buffer_t;

void myteams_buffer_init(buffer_t *buf);
void myteams_buffer_append(buffer_t *buf, const char *src, int len);
char *myteams_buffer_get_line(buffer_t *buf);
void myteams_json_extract_str(const char *json, const char *key, char *dest, int dest_size);
long myteams_json_extract_long(const char *json, const char *key);

#endif
