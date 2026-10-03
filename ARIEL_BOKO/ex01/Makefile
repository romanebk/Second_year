##
## EPITECH PROJECT, 2026
## makefile
## File description:
## exam machine: creation de serveur
##

NAME_SERVER	=	chat_server

CC	=	gcc

CFLAGS	=	-Wall -Wextra -Werror -g3

SRC_SERVER	=	src/main.c \
			src/server.c \
			src/client_handler.c \
			src/send_buffer_handler.c

OBJ_SERVER	=	$(SRC_SERVER:.c=.o)

all: $(NAME_SERVER)

$(NAME_SERVER): $(OBJ_SERVER)
	$(CC) $(CFLAGS) -o $@ $^
clean:
	rm -f $(OBJ_SERVER)
	rm -f $(NAME_SERVER)

fclean: clean
	rm -f *~
	rm -f *#
	rm -f src/*~
	rm -f src/*#
	rm -f include/*#
	rm -f include/*~

re: fclean all

.PHONY: all clean fclean re
