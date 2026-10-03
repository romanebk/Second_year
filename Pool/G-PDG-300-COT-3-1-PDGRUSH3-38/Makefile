##
## EPITECH PROJECT, 2026
## Makefile
## File description:
## Makefile
##

SRC	=	Exceptions.cpp \
		Float32Operand.cpp \
		Float64Operand.cpp \
		Int16Operand.cpp \
		Int32Operand.cpp \
		Int64Operand.cpp \
		Int8Operand.cpp \
		OperandCreate.cpp \
		stackCommand.cpp

OBJ	=	$(SRC:.cpp=.o)

NAME	=	bistroMatic

CC	=	g++

CPPFLAGS	=	-std=c++20 -Wall -Wextra -Werror -I.

all:	$(NAME)

$(NAME):	$(OBJ)
	$(CC) $(CPPFLAGS) -o $(NAME) $(OBJ)

clean:
	rm -f $(OBJ)

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re
