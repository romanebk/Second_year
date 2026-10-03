/*
** EPITECH PROJECT, 2026
** panoramix
** File description:
** validate arguments
*/

#include "../include/panoramix.h"

int validate_arguments(int argc, char **argv, params_t *params)
{
    if (argc != 5) {
        fprintf(stderr, "USAGE: ./panoramix <nb_villagers> <pot_size> "
            "<nb_fights> <nb_refills>\n");
        return 84;
    }
    params->nb_villagers = atoi(argv[1]);
    params->pot_size = atoi(argv[2]);
    params->nb_fights = atoi(argv[3]);
    params->nb_refills = atoi(argv[4]);
    if (params->nb_villagers <= 0 || params->pot_size <= 0
        || params->nb_fights <= 0 || params->nb_refills <= 0) {
        fprintf(stderr, "USAGE: ./panoramix <nb_villagers> <pot_size> "
            "<nb_fights> <nb_refills>\nValues must be >0.\n");
        return 84;
    }
    return 0;
}
