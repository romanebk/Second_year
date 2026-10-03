#
# EPITECH PROJECT, 2026
# Raytracer_cpp
# Makefile configuration
#

NAME	=	raytracer

SRCDIR	=	src
INCDIR	=	include

SRC	=	$(SRCDIR)/main.cpp \
		$(SRCDIR)/Core/Camera.cpp \
		$(SRCDIR)/Core/Renderer.cpp \
		$(SRCDIR)/Core/Scene.cpp \
		$(SRCDIR)/Lights/AmbientLight.cpp \
		$(SRCDIR)/Lights/DirectionalLight.cpp \
		$(SRCDIR)/Lights/PointLight.cpp \
		$(SRCDIR)/Math/Matrix4.cpp \
		$(SRCDIR)/Math/Vector3.cpp \
		$(SRCDIR)/Parser/Factory.cpp \
		$(SRCDIR)/Parser/SceneBuilder.cpp \
		$(SRCDIR)/Parser/SceneParser.cpp \
		$(SRCDIR)/Primitives/Cone.cpp \
		$(SRCDIR)/Primitives/Cylinder.cpp \
		$(SRCDIR)/Primitives/Plane.cpp \
		$(SRCDIR)/Primitives/Sphere.cpp

OBJ	=	$(SRC:.cpp=.o)

CXX	=	g++

CXXFLAGS	=	-W -Wall -Wextra -std=c++20 -I$(INCDIR) -g3
LDFLAGS		=	-lm -lconfig++

all: $(NAME)

$(NAME): $(OBJ)
	$(CXX) -o $(NAME) $(OBJ) $(CXXFLAGS) $(LDFLAGS)

clean:
	rm -f $(OBJ)
	rm -f $(NAME)
	rm -f *.o
	rm -f *~
	rm -f *#
	rm -f $(SRCDIR)/Core/*.o
	rm -f $(SRCDIR)/Lights/*.o
	rm -f $(SRCDIR)/Math/*.o
	rm -f $(SRCDIR)/Parser/*.o
	rm -f $(SRCDIR)/Primitives/*.o
	rm -f $(SRCDIR)/Core/*~
	rm -f $(SRCDIR)/Lights/*~
	rm -f $(SRCDIR)/Math/*~
	rm -f $(SRCDIR)/Parser/*~
	rm -f $(SRCDIR)/Primitives/*~
	rm -f $(SRCDIR)/Core/*#
	rm -f $(SRCDIR)/Lights/*#
	rm -f $(SRCDIR)/Math/*#
	rm -f $(SRCDIR)/Parser/*#
	rm -f $(SRCDIR)/Primitives/*#


fclean: clean
	rm -f $(NAME)

re: fclean all

# Display PPM image using available viewer
view: 
	@if command -v display >/dev/null 2>&1; then \
		display *.ppm; \
	elif command -v feh >/dev/null 2>&1; then \
		feh *.ppm; \
	elif command -v eog >/dev/null 2>&1; then \
		eog *.ppm; \
	else \
		echo "No PPM viewer found. Please install display, feh, or eog."; \
	fi

# Display specific PPM file
view-%: 
	@if command -v display >/dev/null 2>&1; then \
		display $*.ppm; \
	elif command -v feh >/dev/null 2>&1; then \
		feh $*.ppm; \
	elif command -v eog >/dev/null 2>&1; then \
		eog $*.ppm; \
	else \
		echo "No PPM viewer found. Please install display, feh, or eog."; \
	fi

# Tests
TEST_SRCDIR	=	tests
TEST_SRC	=	$(TEST_SRCDIR)/main.cpp \
			$(TEST_SRCDIR)/test_vector3.cpp \
			$(TEST_SRCDIR)/test_matrix4.cpp \
			$(TEST_SRCDIR)/test_primitives.cpp
TEST_OBJ	=	$(TEST_SRC:.cpp=.o)
TEST_NAME	=	test_raytracer

# Source files without main.cpp (for linking with tests)
TEST_SRC_FILES	=	$(filter-out $(SRCDIR)/main.cpp, $(SRC))
TEST_OBJ_FILES	=	$(TEST_SRC_FILES:.cpp=.o)

test: $(TEST_NAME)
	./$(TEST_NAME)

$(TEST_NAME): $(TEST_OBJ) $(TEST_OBJ_FILES)
	$(CXX) -o $(TEST_NAME) $(TEST_OBJ) $(TEST_OBJ_FILES) $(CXXFLAGS) $(LDFLAGS)

.PHONY: all clean fclean re view view-% test
