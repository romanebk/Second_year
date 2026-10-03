##
## EPITECH PROJECT, 2026
## Paradigms Seminar Rush02
## File description:
## Makefile
##

.PHONY: all re clean fclean

all: build

re: fclean all

clean:
	rm -f src/*.o src/*.hi src/*.dyn_hi src/*.dyn_o

fclean: clean
	rm -f pushswap_checker

build:
	ghc -O2 -o pushswap_checker src/Main.hs
