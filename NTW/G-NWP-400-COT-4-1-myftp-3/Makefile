##
## EPITECH PROJECT, 2026
## makefile
## File description:
## compiling with make
##

NAME		=	myftp

INC_DIR		=	include

SRC			=	src/main.c	\
				src/server_init.c	\
				src/server_loop.c	\
				src/server_utils.c	\
				src/client_init.c	\
				src/client_read.c	\
				src/client_write.c	\
				src/cmd_authentificator.c	\
				src/cmd_navigator.c	\
				src/cmd_transfer.c	\
				src/cmd_list.c	\
				src/cmd_miscellaneous.c	\
				src/data_passive.c	\

OBJ			=	$(SRC:.c=.o)

CPPFLAGS	=	-I $(INC_DIR) -Wall -Wextra -Werror

CXX			=	gcc

all: $(NAME)

$(NAME): $(OBJ)
	$(CXX) -o $(NAME) $(OBJ) $(LDLIBS)

clean:
	rm -f $(OBJ)
	rm -f *~
	rm -f *#
	rm -f *.o
	rm -f *.o~
	rm -f src/*~
	rm -f src/*#
	rm -f include/*~
	rm -f include/*#

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re
