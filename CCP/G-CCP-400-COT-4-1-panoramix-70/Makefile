##
## EPITECH PROJECT, 2026
## panoramix
## File description:
## Makefile
##

NAME	= panoramix

CFLAGS	= -Wall -Wextra -Werror -pthread -g3

SRCS	= src/main.c src/villager.c src/druid.c src/validate.c

TEST_SRCS	= src/villager.c src/druid.c src/validate.c tests/test_panoramix.c
TEST_FLAGS	= --coverage -lcriterion

all: $(NAME)

$(NAME): $(SRCS)
	$(CC) $(CFLAGS) -o $(NAME) $(SRCS)

clean:
	rm -f src/*~ src/*#
	rm -f include/*~ include/*#
	rm -f tests/*~ tests/*#
	rm -f *.gcda *.gcno

fclean: clean
	rm -f $(NAME)
	rm -f include/*~
	rm -f include/*#
	rm -f src/*~
	rm -f src/*#
	rm -f unit_test
	rm -f *.gcda *.gcno

re: fclean all

unit_tests: fclean all clean
	$(CC) -o unit_test $(TEST_SRCS) $(CFLAGS) $(TEST_FLAGS)

tests_run: unit_tests
	./unit_test

.PHONY: all clean fclean re unit_tests tests_run
