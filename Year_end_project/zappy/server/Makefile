NAME = zappy_server

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -I include

SRC = \
	src/main.cpp \
	src/ServerApp.cpp \
	src/network/Server.cpp \
	src/network/Client.cpp \
	src/network/Session.cpp \
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
	src/game/CommandScheduler.cpp

OBJ = $(SRC:.cpp=.o)

all: $(NAME)

$(NAME): $(OBJ)
	$(CXX) $(CXXFLAGS) -o $(NAME) $(OBJ)

clean:
	rm -f $(OBJ)

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re zappy_gui zappy_ai
