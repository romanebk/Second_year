##
## EPITECH PROJECT, 2026
## makefile
## File description:
## makefile
##

NAME     = stone_analysis

CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -I include -O2 -DNDEBUG -flto
LDFLAGS  = -flto -s

SRCS     = $(wildcard src/*.cpp)
OBJS     = $(SRCS:src/%.cpp=obj/%.o)

all: $(NAME)

$(NAME): $(OBJS)
	$(CXX) $(LDFLAGS) -o $@ $^

obj/%.o: src/%.cpp | obj
	$(CXX) $(CXXFLAGS) -c $< -o $@

obj:
	mkdir -p $@

debug: fclean
	$(MAKE) $(NAME) CXXFLAGS="-std=c++17 -Wall -Wextra -I include -Og -g3 -DDEBUG" LDFLAGS=""

clean:
	rm -rf obj

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all debug clean fclean re
