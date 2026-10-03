##
## EPITECH PROJECT, 2026
## Makefile
## File description:
## Build system for zappy_server
##

NAME = zappy_server

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -I include

SRC = \
	src/main.cpp \
	src/ServerApp.cpp \
	src/network/Server.cpp \
	src/network/Client.cpp \
	src/network/Session.cpp \
	src/network/RingBuffer.cpp \
	src/protocol/AIProtocol.cpp \
	src/protocol/GUIProtocol.cpp \
	src/game/Map.cpp \
	src/game/Tile.cpp \
	src/game/Player.cpp \
	src/game/Team.cpp \
	src/game/Egg.cpp \
	src/game/ResourceManager.cpp \
	src/game/IncantationSystem.cpp \
	src/game/LookSystem.cpp \
	src/game/BroadcastSystem.cpp \
	src/game/CommandScheduler.cpp \
	src/game/ActionHandler.cpp

OBJ = $(SRC:.cpp=.o)

all: $(NAME)

$(NAME): $(OBJ)
	$(CXX) $(CXXFLAGS) -o $(NAME) $(OBJ)

clean:
	rm -f $(OBJ)

fclean: clean
	rm -f $(NAME)

re: fclean all

TEST_SRC = tests/test_buffer.cpp
TEST_NAME = test_buffer

$(TEST_NAME): $(TEST_SRC)
	$(CXX) $(CXXFLAGS) -o $(TEST_NAME) $(TEST_SRC)

GUI_TEST_SRC = tests/test_gui_protocol.cpp src/protocol/GUIProtocol.cpp
GUI_TEST_NAME = test_gui_protocol

$(GUI_TEST_NAME): $(GUI_TEST_SRC)
	$(CXX) $(CXXFLAGS) -o $(GUI_TEST_NAME) $(GUI_TEST_SRC)

test: $(TEST_NAME) $(GUI_TEST_NAME)
	./$(TEST_NAME)
	./$(GUI_TEST_NAME)

test_clean:
	rm -f $(TEST_NAME) $(GUI_TEST_NAME)

.PHONY: all clean fclean re zappy_gui zappy_ai test test_clean
