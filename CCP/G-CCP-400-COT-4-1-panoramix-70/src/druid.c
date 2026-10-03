/*
** EPITECH PROJECT, 2026
** panoramix
** File description:
** Druid implementation
*/

#include "../include/panoramix.h"

static int check_druid_done(cauldron_t *c)
{
    if (c->druid_done) {
        pthread_mutex_unlock(&c->pot_mutex);
        return 1;
    }
    return 0;
}

static void refill_cauldron(cauldron_t *c)
{
    c->nb_refills--;
    printf("Druid: Ah! Yes, yes, I'm awake! Working on it! "
        "Beware I can only make %d more refills after this one.\n",
        c->nb_refills);
    c->servings = c->pot_size;
    c->druid_called = 0;
}

static void handle_last_refill(cauldron_t *c)
{
    c->druid_done = 1;
    printf("Druid: I'm out of viscum. I'm going back to... zZz\n");
    pthread_mutex_unlock(&c->pot_mutex);
    for (int i = 0; i < c->nb_villagers; i++)
        sem_post(&c->full_pot);
}

void *druid_routine(void *arg)
{
    cauldron_t *c = (cauldron_t *)arg;

    printf("Druid: I'm ready... but sleepy...\n");
    while (1) {
        sem_wait(&c->empty_pot);
        pthread_mutex_lock(&c->pot_mutex);
        if (check_druid_done(c))
            break;
        refill_cauldron(c);
        if (c->nb_refills == 0) {
            handle_last_refill(c);
            break;
        }
        pthread_mutex_unlock(&c->pot_mutex);
        sem_post(&c->full_pot);
    }
    return NULL;
}
