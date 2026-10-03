##
## EPITECH PROJECT, 2024
## Zappy
## File description:
## Makefile
##

BIN_DIR = bin

all: zappy_server zappy_gui zappy_ai

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

zappy_server: | $(BIN_DIR)
	$(MAKE) -C zappy_server
	cp zappy_server/zappy_server $(BIN_DIR)/

zappy_gui: | $(BIN_DIR)
	$(MAKE) -C zappy_gui
	cp zappy_gui/zappy_gui $(BIN_DIR)/

# L'IA est un paquet Python modulaire (zappy_ai/). On génère dans bin/ un petit
# lanceur qui ajoute le dossier source au sys.path puis exécute zappy_ai.py,
# afin que les imports (reseau, cerveau, navigation, …) soient résolus quel que
# soit le répertoire courant.
zappy_ai: | $(BIN_DIR)
	@printf '%s\n' \
	  '#!/usr/bin/env python3' \
	  'import os, sys, runpy' \
	  'HERE = os.path.dirname(os.path.realpath(__file__))' \
	  'AI_DIR = os.path.join(os.path.dirname(HERE), "zappy_ai")' \
	  'sys.path.insert(0, AI_DIR)' \
	  'runpy.run_path(os.path.join(AI_DIR, "zappy_ai.py"), run_name="__main__")' \
	  > $(BIN_DIR)/zappy_ai
	chmod +x $(BIN_DIR)/zappy_ai

clean:
	$(MAKE) -C zappy_server clean
	$(MAKE) -C zappy_gui clean

fclean: clean
	$(MAKE) -C zappy_server fclean
	$(MAKE) -C zappy_gui fclean
	rm -rf $(BIN_DIR)

re: fclean all

test:
	$(MAKE) -C zappy_server test

.PHONY: all clean fclean re zappy_server zappy_gui zappy_ai test
