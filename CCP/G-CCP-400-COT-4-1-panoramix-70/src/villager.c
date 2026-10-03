/*
** EPITECH PROJECT, 2026
** panoramix
** File description:
** Villager implementation
*/

#include "../include/panoramix.h"
#include <unistd.h>

static void call_druid_if_needed(cauldron_t *c, int villager_id)
{
    printf("Villager %d: I need a drink... I see 0 servings left.\n",
        villager_id);
    if (!c->druid_called) {
        c->druid_called = 1;
        printf("Villager %d: Hey Pano wake up! We need more potion.\n",
            villager_id);
        pthread_mutex_unlock(&c->pot_mutex);
        sem_post(&c->empty_pot);
    } else {
        pthread_mutex_unlock(&c->pot_mutex);
    }
}

static void take_serving_and_fight(cauldron_t *c, villager_t *v, int *fights)
{
    c->servings--;
    printf("Villager %d: I need a drink... I see %d servings left.\n",
        v->id, c->servings);
    pthread_mutex_unlock(&c->pot_mutex);
    (*fights)--;
    printf("Villager %d: Take that roman scum! Only %d left.\n",
        v->id, *fights);
    usleep(1000);
}

static int handle_empty_pot(cauldron_t *c, int villager_id)
{
    if (c->druid_done) {
        pthread_mutex_unlock(&c->pot_mutex);
        return -1;
    }
    call_druid_if_needed(c, villager_id);
    sem_wait(&c->full_pot);
    return 0;
}

static int process_villager_turn(cauldron_t *c, villager_t *v, int *fights)
{
    if (c->servings == 0)
        return handle_empty_pot(c, v->id);
    take_serving_and_fight(c, v, fights);
    return 0;
}

void *villager_routine(void *arg)
{
    villager_t *v = (villager_t *)arg;
    cauldron_t *c = v->cauldron;
    int fights = v->nb_fights;

    printf("Villager %d: Going into battle!\n", v->id);
    while (fights > 0) {
        pthread_mutex_lock(&c->pot_mutex);
        if (process_villager_turn(c, v, &fights) == -1)
            break;
    }
    printf("Villager %d: I'm going to sleep now.\n", v->id);
    return NULL;
}
