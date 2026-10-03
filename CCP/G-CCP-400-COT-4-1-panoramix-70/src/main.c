/*
** EPITECH PROJECT, 2026
** panoramix
** File description:
** Main implementation
*/

#include "../include/panoramix.h"

static void init_cauldron(cauldron_t *cauldron, params_t *params)
{
    cauldron->pot_size = params->pot_size;
    cauldron->servings = params->pot_size;
    cauldron->nb_refills = params->nb_refills;
    cauldron->druid_done = 0;
    cauldron->druid_called = 0;
    cauldron->nb_villagers = params->nb_villagers;
    pthread_mutex_init(&cauldron->pot_mutex, NULL);
    sem_init(&cauldron->empty_pot, 0, 0);
    sem_init(&cauldron->full_pot, 0, 0);
}

static void create_villager_threads(pthread_t *threads,
    villager_t *villagers, cauldron_t *cauldron, int nb_fights)
{
    for (int i = 0; i < cauldron->nb_villagers; i++) {
        villagers[i] = (villager_t){
            .id = i,
            .nb_fights = nb_fights,
            .cauldron = cauldron,
        };
        pthread_create(&threads[i], NULL, villager_routine, &villagers[i]);
    }
}

static void cleanup_resources(cauldron_t *cauldron,
    pthread_t *threads, pthread_t druid_thread)
{
    for (int i = 0; i < cauldron->nb_villagers; i++)
        pthread_join(threads[i], NULL);
    pthread_mutex_lock(&cauldron->pot_mutex);
    cauldron->druid_done = 1;
    pthread_mutex_unlock(&cauldron->pot_mutex);
    sem_post(&cauldron->empty_pot);
    pthread_join(druid_thread, NULL);
    pthread_mutex_destroy(&cauldron->pot_mutex);
    sem_destroy(&cauldron->empty_pot);
    sem_destroy(&cauldron->full_pot);
}

static int run(params_t *params)
{
    cauldron_t cauldron;
    pthread_t druid_thread;
    pthread_t *threads = malloc(sizeof(pthread_t) * params->nb_villagers);
    villager_t *villagers = malloc(sizeof(villager_t) * params->nb_villagers);

    if (!threads || !villagers)
        return 84;
    init_cauldron(&cauldron, params);
    pthread_create(&druid_thread, NULL, druid_routine, &cauldron);
    create_villager_threads(threads, villagers, &cauldron, params->nb_fights);
    cleanup_resources(&cauldron, threads, druid_thread);
    free(threads);
    free(villagers);
    return 0;
}

int main(int argc, char **argv)
{
    params_t params;

    if (validate_arguments(argc, argv, &params))
        return 84;
    return run(&params);
}
