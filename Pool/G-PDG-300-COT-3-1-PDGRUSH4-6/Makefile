##
## EPITECH PROJECT, 2025
## makefile
## File description:
## compiling with make
##

NAME		=	MyGKrellm
SRC_DIR		=	src
INC_DIR		=	include

SRC			=	$(SRC_DIR)/main.cpp \
				$(SRC_DIR)/Core.cpp \
				$(SRC_DIR)/Modules/HostnameModule.cpp \
				$(SRC_DIR)/Display/NcursesDisplay.cpp	\
				$(SRC_DIR)/Modules/KernelModule.cpp \
				$(SRC_DIR)/Modules/DateModule.cpp \
				$(SRC_DIR)/Modules/BatteryModule.cpp \
				$(SRC_DIR)/Modules/CpuModule.cpp \
				$(SRC_DIR)/Modules/RamModule.cpp \
				$(SRC_DIR)/Display/SfmlDisplay.cpp

OBJ			=	$(SRC:.cpp=.o)

CPPFLAGS	=	-I $(INC_DIR) -Wall -Wextra -Werror -std=c++20

LDLIBS		=	-lncurses -lsfml-graphics -lsfml-window -lsfml-system

CXX			=	g++

all: $(NAME)

$(NAME): $(OBJ)
	$(CXX) -o $(NAME) $(OBJ) $(LDLIBS)

clean:
	rm -f $(OBJ)
	rm -f *~
	rm -f *#

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re
