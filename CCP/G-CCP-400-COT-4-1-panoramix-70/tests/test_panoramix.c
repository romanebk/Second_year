/*
** EPITECH PROJECT, 2026
** panoramix
** File description:
** unit test
*/

#include "../include/panoramix.h"
#include <criterion/criterion.h>
#include <criterion/redirect.h>

void redirect_all_std(void) {
  cr_redirect_stdout();
  cr_redirect_stderr();
}

Test(validate_arguments, valid_args, .init = redirect_all_std) {
  params_t params;
  int ac = 5;
  char *av[] = {"./panoramix", "4", "5", "8", "1"};
  int r = validate_arguments(ac, av, &params);
  cr_assert_eq(r, 0);
  cr_assert_eq(params.nb_villagers, 4);
  cr_assert_eq(params.pot_size, 5);
  cr_assert_eq(params.nb_fights, 8);
  cr_assert_eq(params.nb_refills, 1);
}

Test(validate_arguments, not_enough_args, .init = redirect_all_std) {
  params_t params;
  int ac = 4;
  char *av[] = {"./panoramix", "4", "5", "8"};
  int r = validate_arguments(ac, av, &params);
  cr_assert_eq(r, 84);
}

Test(validate_arguments, negative_args, .init = redirect_all_std) {
  params_t params;
  int ac = 5;
  char *av[] = {"./panoramix", "-4", "5", "8", "1"};
  int r = validate_arguments(ac, av, &params);
  cr_assert_eq(r, 84);
}

Test(validate_arguments, zero_args, .init = redirect_all_std) {
  params_t params;
  int ac = 5;
  char *av[] = {"./panoramix", "4", "5", "0", "1"};
  int r = validate_arguments(ac, av, &params);
  cr_assert_eq(r, 84);
}

Test(validate_arguments, invalid_chars, .init = redirect_all_std) {
  params_t params;
  int ac = 5;
  char *av[] = {"./panoramix", "aai", "5", "8", "10;"};
  int r = validate_arguments(ac, av, &params);
  cr_assert_eq(r, 84);
}

Test(villager, normal_fights, .init = redirect_all_std) {
  params_t params = {
      .nb_villagers = 1, .pot_size = 10, .nb_fights = 3, .nb_refills = 0};
  cauldron_t cauldron;
  cauldron.pot_size = params.pot_size;
  cauldron.servings = params.pot_size;
  cauldron.nb_refills = params.nb_refills;
  cauldron.druid_done = 0;
  pthread_mutex_init(&cauldron.pot_mutex, NULL);
  sem_init(&cauldron.empty_pot, 0, 0);
  sem_init(&cauldron.full_pot, 0, 0);

  villager_t villager = {
      .id = 0, .nb_fights = params.nb_fights, .cauldron = &cauldron};
  villager_routine(&villager);

  pthread_mutex_destroy(&cauldron.pot_mutex);
  sem_destroy(&cauldron.empty_pot);
  sem_destroy(&cauldron.full_pot);
}

Test(druid, normal_refills, .init = redirect_all_std) {
  params_t params = {
      .nb_villagers = 1, .pot_size = 10, .nb_fights = 0, .nb_refills = 1};
  cauldron_t cauldron;
  cauldron.pot_size = params.pot_size;
  cauldron.servings = 0;
  cauldron.nb_refills = params.nb_refills;
  cauldron.druid_done = 0;
  cauldron.nb_villagers = params.nb_villagers;
  pthread_mutex_init(&cauldron.pot_mutex, NULL);
  sem_init(&cauldron.empty_pot, 0, 0);
  sem_init(&cauldron.full_pot, 0, 0);

  pthread_t druid_thread;
  pthread_create(&druid_thread, NULL, druid_routine, &cauldron);

  sem_post(&cauldron.empty_pot);
  pthread_join(druid_thread, NULL);

  pthread_mutex_destroy(&cauldron.pot_mutex);
  sem_destroy(&cauldron.empty_pot);
  sem_destroy(&cauldron.full_pot);
}
