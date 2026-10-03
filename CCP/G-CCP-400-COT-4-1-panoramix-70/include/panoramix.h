/*
** EPITECH PROJECT, 2026
** panoramix
** File description:
** Panoramix header
*/

#ifndef PANORAMIX_H
    #define PANORAMIX_H

    #include <stdio.h>
    #include <stdlib.h>
    #include <pthread.h>
    #include <semaphore.h>

typedef struct {
    int nb_villagers;
    int pot_size;
    int nb_fights;
    int nb_refills;
} params_t;

typedef struct {
    int pot_size;
    int servings;
    int nb_refills;
    int druid_done;
    int druid_called;
    int nb_villagers;
    pthread_mutex_t pot_mutex;
    sem_t empty_pot;
    sem_t full_pot;
} cauldron_t;

typedef struct {
    int id;
    int nb_fights;
    cauldron_t *cauldron;
} villager_t;

void *villager_routine(void *arg);
void *druid_routine(void *arg);
int validate_arguments(int argc, char **argv, params_t *params);

#endif /* PANORAMIX_H */
