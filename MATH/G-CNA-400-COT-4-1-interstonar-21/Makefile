##
## EPITECH PROJECT, 2026
## G-CNA-400-COT-4-1-interstonar-21
## File description:
## Makefile
##

NAME = interstonar

SRC = src/main.cpp \
	src/errors.cpp \
	src/help.cpp \
	src/math_utils.cpp \
	src/parser.cpp \
	src/global_sim.cpp \
	src/local_sim.cpp

OBJ = $(SRC:.cpp=.o)
CXX = g++
CXXFLAGS = -std=c++20 -Wall -Wextra -Werror -O2
LDFLAGS =

.PHONY: all clean fclean re

all: $(NAME)

$(NAME): $(OBJ)
	@$(CXX) $(OBJ) -o $(NAME) $(LDFLAGS)

%.o: %.cpp
	@$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	@rm -f $(OBJ)

fclean: clean
	@rm -f $(NAME)
	@rm -f src/*~
	@rm  -f ./*~
	@rm -f src/*#
	@rm -f ./*#

re: fclean all

