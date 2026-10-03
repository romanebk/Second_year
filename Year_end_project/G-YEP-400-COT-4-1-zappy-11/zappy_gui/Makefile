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
# Les en-têtes (.hpp) vivent dans include/ et ses sous-dossiers ; on ajoute chacun
# en -I. On garde aussi les sous-dossiers de src/ pour les en-têtes tiers qui y
# restent (ex. src/renderer/stb_image.h).
INCLUDE_DIRS = $(shell find include -type d) $(shell find src -type d)
INCLUDES     = $(addprefix -I , $(INCLUDE_DIRS))

# ── Sources (auto-découvertes) ────────────────────────────────────────────────
SRCS = $(shell find src -name '*.cpp')

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
