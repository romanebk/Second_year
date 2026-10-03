##
## EPITECH PROJECT, 2024
## Zappy
## File description:
## Makefile
##

all: zappy_server zappy_gui

zappy_server:
	$(MAKE) -C server
	cp server/zappy_server .

zappy_gui:
	$(MAKE) -C gui
	cp gui/zappy_gui .

clean:
	$(MAKE) -C server clean
	$(MAKE) -C gui clean

fclean: clean
	$(MAKE) -C server fclean
	$(MAKE) -C gui fclean
	rm -f zappy_server
	rm -f zappy_gui

re: fclean all

.PHONY: all clean fclean re zappy_server zappy_gui
