##
## EPITECH PROJECT, 2026
## makefile
## File description:
## makefile
##

NAME		= plazza
CXX			= g++
CXXFLAGS	= -Wall -Wextra -Werror -std=c++17 -Iinclude

SRC			= $(wildcard src/*.cpp src/*/*.cpp)
OBJ			= $(SRC:src/%.cpp=obj/%.o)

all: $(NAME)

$(NAME): $(OBJ)
	$(CXX) $(CXXFLAGS) -o $@ $^ -lpthread

obj/%.o: src/%.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CXXFLAGS) -MMD -MP -c $< -o $@

clean:
	rm -rf obj

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re
