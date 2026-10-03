##
## EPITECH PROJECT, 2026
## myTeams
## File description:
## Makefile
##


SERVER_SRC	=	src/server/main.c		\
				src/server/network.c	\
				src/server/commands.c	\
				src/server/cmd_user.c	\
				src/server/cmd_team.c	\
				src/server/cmd_channel.c\
				src/server/cmd_thread.c	\
				src/server/cmd_message.c\
				src/server/data.c		\
				src/server/save.c

CLIENT_SRC	=	src/client/main.c		\
				src/client/network.c	\
				src/client/packet.c		\
				src/client/commands.c	\
				src/client/context.c	\
				src/client/parser.c		\
				src/client/response.c	\
				src/client/utils.c


SERVER_BIN	=	myteams_server
CLIENT_BIN	=	myteams_cli


SERVER_OBJ	=	$(SERVER_SRC:.c=.o)
CLIENT_OBJ	=	$(CLIENT_SRC:.c=.o)


CFLAGS		=	-std=gnu17 -Wall -Wextra -Werror	\
				-Iinclude						\
				-Ilibs/myteams					\
				-g3

LDFLAGS		=	-Llibs/myteams -lmyteams -luuid


all:		$(SERVER_BIN) $(CLIENT_BIN)

$(SERVER_BIN):	$(SERVER_OBJ)
		gcc $(CFLAGS) $(SERVER_OBJ) -o $@ $(LDFLAGS)

$(CLIENT_BIN):	$(CLIENT_OBJ)
		gcc $(CFLAGS) $(CLIENT_OBJ) -o $@ $(LDFLAGS)

clean:
		rm -f $(SERVER_OBJ) $(CLIENT_OBJ)

fclean:		clean
		rm -f $(SERVER_BIN) $(CLIENT_BIN)
		rm -f *~ *#
		rm -f src/server/*~ src/server/*# src/server/*.o
		rm -f src/client/*~ src/client/*# src/client/*.o
		rm -f include/*~ include/*#

re:		fclean all

.PHONY:		all clean fclean re
