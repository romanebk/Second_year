/*
** EPITECH PROJECT, 2026
** G-NWP-400-COT-4-1-myteams
** File description:
** packet
*/

#include "../../include/client.h"
#include "../../include/utils.h"
#include <stdio.h>
#include <stdarg.h>
#include <string.h>

void myteams_client_send_cmd(client_t *c, const char *fmt, ...)
{
    char buf[BUF_SIZE] = {0};
    va_list ap;
    int len = 0;

    va_start(ap, fmt);
    len = vsnprintf(buf, BUF_SIZE - 2, fmt, ap);
    va_end(ap);
    buf[len] = '\r';
    buf[len + 1] = '\n';
    write(c->fd, buf, len + 2);
}