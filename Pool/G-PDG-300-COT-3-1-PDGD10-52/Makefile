##
## EPITECH PROJECT, 2025
## makefile
## File description:
## compiling with 104neutrinos
##

TEST	=	tests/test_Algorithm.cpp

OPT	=	-lm --coverage -fprofile-arcs -ftest-coverage -lcriterion -lgcov

CFLAGS	=	-std=c++20 -Wall -Wextra -Werror

clean:
	rm -f tests/*~
	rm -f tests/*#

fclean: clean
	rm -f unit_test
	rm -f tests/*.gcda
	rm -f tests/*.gcno
	rm -f tests/*.gcov
	rm -f *.gcno
	rm -f *.gcda
	rm -f *.gcov

unit_tests: fclean
	clang++ -o unit_test $(TEST) $(OPT) $(CFLAGS)

tests_run: unit_tests
	./unit_test
