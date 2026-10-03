##
## EPITECH PROJECT, 2026
## makefile
## File description:
## compiling with make
##

NAME		=	nanotekspice
SRC_DIR		=	src
INC_DIR		=	include

SRC			=	$(SRC_DIR)/Parser.cpp	\
				$(SRC_DIR)/main.cpp	\
				$(SRC_DIR)/AComponent.cpp	\
				$(SRC_DIR)/SpecialComponent.cpp	\
				$(SRC_DIR)/ElementaryComponent.cpp	\
				$(SRC_DIR)/ComponentFactory.cpp	\
				$(SRC_DIR)/Circuit.cpp	\
				$(SRC_DIR)/Error.cpp	\
				$(SRC_DIR)/GateComponent.cpp	\

OBJ			=	$(SRC:.cpp=.o)

CPPFLAGS	=	-I $(INC_DIR) -Wall -Wextra -Werror -std=c++20

CXX			=	g++

all: $(NAME)

$(NAME): $(OBJ)
	$(CXX) -o $(NAME) $(OBJ) $(LDLIBS)

clean:
	rm -f $(OBJ)
	rm -f *~
	rm -f *#
	rm -f src/*~
	rm -f src/*#
	rm -f src/*.o
	rm -f include/*~
	rm -f include/*#


fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re
