##
## ZAPPY GUI — Makefile  (SFML + OpenGL 3.3 Core + GLEW + GLM)
##

NAME     = zappy_gui

CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -pthread

# ── Bibliothèques ─────────────────────────────────────────────────────────────
LIBS  = -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio
LIBS += -lGL -lGLEW
# GLM est header-only, pas de -l nécessaire

# ── Includes ──────────────────────────────────────────────────────────────────
INCLUDES  = -I include

# ── Sources ───────────────────────────────────────────────────────────────────
SRCS  = src/core/main.cpp
SRCS += src/core/App.cpp

SRCS += src/network/Buffer.cpp
SRCS += src/network/CommandQueue.cpp
SRCS += src/network/Network.cpp
SRCS += src/network/NetworkThread.cpp
SRCS += src/network/SharedState.cpp

SRCS += src/parser/CommandHandlers.cpp
SRCS += src/parser/Parser.cpp

SRCS += src/renderer/Camera.cpp
SRCS += src/renderer/MapRenderer.cpp
SRCS += src/renderer/RenderThread.cpp
SRCS += src/renderer/Shader.cpp
SRCS += src/renderer/EntityRenderer.cpp
SRCS += src/renderer/PlayerMovement.cpp
SRCS += src/renderer/PlayerSelector.cpp
SRCS += src/renderer/Renderer.cpp

SRCS += src/state/GameState.cpp

SRCS += src/renderer/ResourceRenderer.cpp
SRCS += src/hud/HUD.cpp
SRCS += src/hud/PlayerPanel.cpp
SRCS += src/hud/TeamPanel.cpp
SRCS += src/menu/MenuScreen.cpp
SRCS += src/renderer/TileSelector.cpp
# ── Objets ────────────────────────────────────────────────────────────────────
OBJS = $(SRCS:src/%.cpp=build/%.o)

# ── Règles ────────────────────────────────────────────────────────────────────
all: $(NAME)

$(NAME): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LIBS)
	@echo "✓  $(NAME) compilé"

build/%.o: src/%.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

clean:
	rm -rf build/
	@echo "✓  objets supprimés"

fclean: clean
	rm -f $(NAME)
	@echo "✓  $(NAME) supprimé"

re: fclean all

.PHONY: all clean fclean re