##
## EPITECH PROJECT, 2026
## Arcade
## File description:
## Unified Makefile for Arcade platform
##

CXX = g++ -std=c++17
CXXFLAGS = -Wall -Wextra -Iinclude -fno-gnu-unique
LDFLAGS = -ldl

LIB_DIR = lib
SRC_DIR = src

NAME = arcade

CORE_SRC = $(SRC_DIR)/main.cpp \
           $(SRC_DIR)/Core/Core.cpp

GRAPH_DIR = $(SRC_DIR)/Displays
NCURSES_NAME = arcade_ncurses.so
NCURSES_SRC = $(GRAPH_DIR)/NCurses.cpp

SDL2_NAME = arcade_sdl2.so
SDL2_SRC = $(GRAPH_DIR)/SDL2.cpp
SDL2_FLAGS = -lSDL2 -lSDL2_ttf -lSDL2_image

SFML_NAME = arcade_sfml.so
SFML_SRC = $(GRAPH_DIR)/SFML.cpp
SFML_FLAGS = -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio

GAME_DIR = $(SRC_DIR)/Games
SNAKE_NAME = arcade_snake.so
SNAKE_SRC = $(GAME_DIR)/Snake.cpp

NIBBLER_NAME = arcade_nibbler.so
NIBBLER_SRC = $(GAME_DIR)/Nibbler.cpp

MINESWEEPER_NAME = arcade_minesweeper.so
MINESWEEPER_SRC = $(GAME_DIR)/Minesweeper.cpp

# --- DEPENDENCY DETECTION (Silent & Robust - No pkg-config) ---
NCURSES_FOUND := $(shell [ -f /usr/include/ncurses.h ] && echo 1 || echo 0)
SDL2_FOUND    := $(shell [ -d /usr/include/SDL2 ] && echo 1 || echo 0)
SFML_FOUND    := $(shell [ -d /usr/include/SFML ] && echo 1 || echo 0)

GRAPH_LIBS = 
ifeq ($(NCURSES_FOUND), 1)
    GRAPH_LIBS += $(LIB_DIR)/$(NCURSES_NAME)
endif
ifeq ($(SDL2_FOUND), 1)
    GRAPH_LIBS += $(LIB_DIR)/$(SDL2_NAME)
endif
ifeq ($(SFML_FOUND), 1)
    GRAPH_LIBS += $(LIB_DIR)/$(SFML_NAME)
endif

all: core games graphicals

core: $(NAME)

$(NAME): $(CORE_SRC)
	$(CXX) $(CXXFLAGS) $(CORE_SRC) -o $(NAME) $(LDFLAGS)

games: $(LIB_DIR)/$(SNAKE_NAME) $(LIB_DIR)/$(NIBBLER_NAME) $(LIB_DIR)/$(MINESWEEPER_NAME)

graphicals: $(GRAPH_LIBS)

$(LIB_DIR)/$(NCURSES_NAME): $(NCURSES_SRC)
	@mkdir -p $(LIB_DIR)
	$(CXX) $(CXXFLAGS) -fPIC -shared $(NCURSES_SRC) -o $@ -lncurses

$(LIB_DIR)/$(SDL2_NAME): $(SDL2_SRC)
	@mkdir -p $(LIB_DIR)
	$(CXX) $(CXXFLAGS) -fPIC -shared $(SDL2_SRC) -o $@ $(SDL2_FLAGS)

$(LIB_DIR)/$(SFML_NAME): $(SFML_SRC)
	@mkdir -p $(LIB_DIR)
	$(CXX) $(CXXFLAGS) -fPIC -shared $(SFML_SRC) -o $@ $(SFML_FLAGS)

$(LIB_DIR)/$(SNAKE_NAME): $(SNAKE_SRC)
	@mkdir -p $(LIB_DIR)
	$(CXX) $(CXXFLAGS) -fPIC -shared $(SNAKE_SRC) -o $@

$(LIB_DIR)/$(NIBBLER_NAME): $(NIBBLER_SRC)
	@mkdir -p $(LIB_DIR)
	$(CXX) $(CXXFLAGS) -fPIC -shared $(NIBBLER_SRC) -o $@

$(LIB_DIR)/$(MINESWEEPER_NAME): $(MINESWEEPER_SRC)
	@mkdir -p $(LIB_DIR)
	$(CXX) $(CXXFLAGS) -fPIC -shared $(MINESWEEPER_SRC) -o $@

clean:
	rm -rf build

fclean: clean
	rm -f $(NAME)
	rm -f $(LIB_DIR)/*.so

re: fclean all

.PHONY: all core games graphicals clean fclean re
