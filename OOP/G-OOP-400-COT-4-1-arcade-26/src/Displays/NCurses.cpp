#include "../../include/Displays/NCurses.hpp"
#include <unistd.h>

extern "C"
{
    IDisplay* createDisplay() { return new NCurses(); }
    void destroyDisplay(IDisplay* display) { delete display; }
}

NCurses::NCurses() {}
NCurses::~NCurses() { close(); }

void NCurses::init()
{
    initscr();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);
    nodelay(stdscr, TRUE);
    curs_set(0);
    start_color();
    init_pair(1, COLOR_RED, COLOR_BLACK);    
    init_pair(2, COLOR_GREEN, COLOR_BLACK);  
    init_pair(3, COLOR_YELLOW, COLOR_BLACK); 
    init_pair(4, COLOR_CYAN, COLOR_BLACK);   
    init_pair(5, COLOR_BLUE, COLOR_BLACK);   
    init_pair(6, COLOR_WHITE, COLOR_BLACK);  
    init_pair(7, COLOR_MAGENTA, COLOR_BLACK); 
}

void NCurses::close()
{
    endwin();
}
void NCurses::clear()
{
    erase();
}
void NCurses::display()
{
    refresh();
}

void NCurses::_drawGameBorder(int gameWidth, int gameHeight)
{
    int row, col;
    getmaxyx(stdscr, row, col);
    int offsetX = (col - (gameWidth * 2)) / 2;
    int offsetY = (row - gameHeight) / 2;
    
    attron(COLOR_PAIR(4));
    for (int i = 0; i < gameWidth * 2; i++) {
        mvaddch(offsetY - 1, offsetX + i, '#');           
        mvaddch(offsetY + gameHeight, offsetX + i, '#');   
    }
    for (int i = 0; i < gameHeight; i++) {
        mvaddch(offsetY + i, offsetX - 1, '#');           
        mvaddch(offsetY + i, offsetX + gameWidth * 2, '#'); 
    }
    mvaddch(offsetY - 1, offsetX - 1, '#');            
    mvaddch(offsetY - 1, offsetX + gameWidth * 2, '#');    
    mvaddch(offsetY + gameHeight, offsetX - 1, '#');  
    mvaddch(offsetY + gameHeight, offsetX + gameWidth * 2, '#'); 
    attroff(COLOR_PAIR(4));
}

void NCurses::render(const std::vector<Entity>& entities)
{
    if (entities.empty())
        return;
    bool isSnakeGame = false;
    int snakeEntities = 0;
    int wallEntities = 0;
    
    for (const auto& e : entities) {
        if (e.type == EntityType::SNAKE_HEAD || e.type == EntityType::SNAKE_BODY) {
            snakeEntities++;
        }
        if (e.type == EntityType::WALL) {
            wallEntities++;
        }
    }
    isSnakeGame = (snakeEntities > 0 && wallEntities == 0);

    int gameWidth = 30;
    int gameHeight = 20;

    int row, col;
    getmaxyx(stdscr, row, col);
    int offsetX = (col - (gameWidth * 2)) / 2;
    int offsetY = (row - gameHeight) / 2;

    if (isSnakeGame) {
        _drawGameBorder(gameWidth, gameHeight);
    }
    
    for (const auto& e : entities) {
        if (e.type == EntityType::EMPTY) continue;
        attron(COLOR_PAIR(e.color));
        int rx = offsetX + e.x * 2;
        int ry = offsetY + e.y;
        
        if (e.type == EntityType::CURSOR) {
            attron(A_REVERSE | A_BLINK);
            mvprintw(ry, rx, "[%c]", e.symbol);
            attroff(A_REVERSE | A_BLINK);
        } else if (e.type == EntityType::WALL) {
            mvprintw(ry, rx, "##");
        } else if (e.type == EntityType::SNAKE_HEAD) {
            mvprintw(ry, rx, "@");
        } else if (e.type == EntityType::SNAKE_BODY) {
            mvprintw(ry, rx, "O");
        } else if (e.type == EntityType::FOOD) {
            mvprintw(ry, rx, "o");
        } else {
            mvprintw(ry, rx, " %c", e.symbol);
        }
        attroff(COLOR_PAIR(e.color));
    }
}

void NCurses::renderHUD(const std::string& playerName, int score)
{
    attron(COLOR_PAIR(5) | A_BOLD);
    mvprintw(0, 2, " ARCADE ");
    attroff(COLOR_PAIR(5) | A_BOLD);
    mvprintw(0, 12, "| Player: %s", playerName.c_str());
    mvprintw(0, 35, "| Score: %d", score);
    mvhline(1, 0, ACS_HLINE, 80);
}

void NCurses::renderMenu(const std::vector<std::string>& games, const std::vector<std::string>& graphics, const std::string& playerName, int score)
{
    int row, col;
    getmaxyx(stdscr, row, col);

    attron(COLOR_PAIR(3) | A_BOLD);
    mvprintw(row/2 - 10, col/2 - 14, "==============================");
    mvprintw(row/2 - 9, col/2 - 14, "||      ARCADE LIBLOADER     ||");
    mvprintw(row/2 - 8, col/2 - 14, "==============================");
    attroff(COLOR_PAIR(3) | A_BOLD);

    mvprintw(row/2 - 6, col/2 - 10, "Welcome, %s", playerName.c_str());
    mvprintw(row/2 - 5, col/2 - 10, "Last Score: %d", score);

    attron(A_UNDERLINE);
    mvprintw(row/2 - 3, col/2 - 15, "GAMES");
    mvprintw(row/2 - 3, col/2 + 5, "GRAPHICS");
    attroff(A_UNDERLINE);

    for (size_t i = 0; i < games.size(); i++) {
        mvprintw(row/2 - 1 + i, col/2 - 18, "  [%s]", games[i].c_str());
    }
    for (size_t i = 0; i < graphics.size(); i++) {
        mvprintw(row/2 - 1 + i, col/2 + 2, "  [%s]", graphics[i].c_str());
    }

    mvprintw(row - 2, 2, "Arrows: Navigate | Enter: Play | ESC: Exit | 2/3: Libs | 4/5: Games");
}

Event NCurses::pollEvent() {
    int ch = getch();
    if (ch == KEY_UP)
        return Event::UP;
    if (ch == KEY_DOWN)
        return Event::DOWN;
    if (ch == KEY_LEFT)
        return Event::LEFT;
    if (ch == KEY_RIGHT)
        return Event::RIGHT;
    if (ch == 10)
        return Event::ACTION;
    if (ch == 27)
        return Event::EXIT;
    if (ch == '2')
        return Event::PREV_LIB;
    if (ch == '3')
        return Event::NEXT_LIB;
    if (ch == '4')
        return Event::PREV_GAME;
    if (ch == '5')
        return Event::NEXT_GAME;
    if (ch == '8')
        return Event::RESTART;
    if (ch == '9')
        return Event::MENU;
    return Event::UNKNOWN;
}

void NCurses::renderGameOver(int score)
{
    int row, col;
    getmaxyx(stdscr, row, col);

    attron(COLOR_PAIR(1) | A_BOLD);
    mvprintw(row/2 - 2, col/2 - 10, "********************");
    mvprintw(row/2 - 1, col/2 - 10, "*    GAME OVER     *");
    mvprintw(row/2,     col/2 - 10, "********************");
    attroff(COLOR_PAIR(1) | A_BOLD);

    attron(COLOR_PAIR(6));
    mvprintw(row/2 + 2, col/2 - 8, "Final Score: %d", score);
    mvprintw(row/2 + 4, col/2 - 12, "Press ENTER to go to Menu");
    attroff(COLOR_PAIR(6));
}

static void display_snake_logo(int row, int col)
{
    attron(COLOR_PAIR(2) | A_BOLD);
    mvprintw(row/2 - 7, col/2 - 25, "  ____  _   _    _    _  __ _____");
    mvprintw(row/2 - 6, col/2 - 25, " / ___|| \\ | |  / \\  | |/ /| ____|");
    mvprintw(row/2 - 5, col/2 - 25, " \\___ \\|  \\| | / _ \\ | ' / |  _|  ");
    mvprintw(row/2 - 4, col/2 - 25, "  ___) | |\\  |/ ___ \\| . \\ | |___ ");
    mvprintw(row/2 - 3, col/2 - 25, " |____/|_| \\_/_/   \\_\\_|\\_\\|_____|");
    attroff(COLOR_PAIR(2) | A_BOLD);
}

static void display_nibbler_logo(int row, int col)
{
    attron(COLOR_PAIR(2) | A_BOLD);
    mvprintw(row/2 - 7, col/2 - 30, "   _        _________ ______   ______   _        _______  _______ ");
    mvprintw(row/2 - 6, col/2 - 30, "  ( (    /|\\__   __/(  ___ \\ (  ___ \\ ( \\      (  ____ \\(  ____ )");
    mvprintw(row/2 - 5, col/2 - 30, "  |  \\  ( |   ) (   | (   ) )| (   ) )| (      | (    \\/| (    )|");
    mvprintw(row/2 - 4, col/2 - 30, "  |   \\ | |   | |   | (__/ / | (__/ / | |      | (__    | (____)|");
    mvprintw(row/2 - 3, col/2 - 30, "  | (\\ \\) |   | |   |  __ (  |  __ (  | |      |  __)   |     __)");
    mvprintw(row/2 - 2, col/2 - 30, "  | | \\   |   | |   | (  \\ \\ | (  \\ \\ | |      | (      | (\\ (   ");
    mvprintw(row/2 - 1, col/2 - 30, "  | )  \\  |___) (___| )___) )| )___) )| (____/\\| (____/\\| ) \\ \\__");
    mvprintw(row/2    , col/2 - 30, "  |/    )_)\\_______/|/ \\___/ |/ \\___/ (_______/(_______/|/   \\__/");
    attroff(COLOR_PAIR(2) | A_BOLD);
}

static void display_minesweeper_logo(int row, int col)
{
    
    attron(COLOR_PAIR(1) | A_BOLD);
    mvprintw(row/2 - 10, col/2 - 36, " * ");
    mvprintw(row/2 - 10, col/2 + 33, " * ");
    mvprintw(row/2 +  2, col/2 - 36, " * ");
    mvprintw(row/2 +  2, col/2 + 33, " * ");
    attroff(COLOR_PAIR(1) | A_BOLD);

    attron(COLOR_PAIR(1) | A_BOLD);
    mvprintw(row/2 - 9, col/2 - 35, " __  __ ___ _   _ ___ ___ ___ _    _ ___ ___ ___ ___ ___ ");
    mvprintw(row/2 - 8, col/2 - 35, "|  \\/  |_ _| \\ | | __/ __| _ \\ |  | | __| __| _ \\ __| _ \\");
    mvprintw(row/2 - 7, col/2 - 35, "| |\\/| || ||  \\| | _|\\__ \\  _/ |/\\| | _|| _||  _/ _||   /");
    mvprintw(row/2 - 6, col/2 - 35, "|_|  |_|___|_|\\__|___||___|_| |__/\\__|___|___|_| |___|_|_\\");
    attroff(COLOR_PAIR(1) | A_BOLD);

    attron(COLOR_PAIR(3) | A_BOLD);
    mvprintw(row/2 - 4, col/2 - 25, "  (*)  (*)  (*)  (*)  (*)  (*)  (*)  (*)  ");
    attroff(COLOR_PAIR(3) | A_BOLD);

    attron(COLOR_PAIR(4));
    mvprintw(row/2 - 2, col/2 - 18, "  Find the mines. Flag them. Survive.");
    attroff(COLOR_PAIR(4));
}

void NCurses::renderSplash(const std::string& imagePath, const std::string& gameName)
{
    (void)imagePath;
    int row, col;
    getmaxyx(stdscr, row, col);

    if (gameName.find("snake") != std::string::npos) {
        display_snake_logo(row, col);
    } else if (gameName.find("nibbler") != std::string::npos) {
        display_nibbler_logo(row, col);
    } else if (gameName.find("minesweeper") != std::string::npos) {
        display_minesweeper_logo(row, col);
    } else {
        attron(COLOR_PAIR(2) | A_BOLD);
        mvprintw(row/2 - 2, col/2 - 10, "LOADING %s...", gameName.c_str());
        attroff(COLOR_PAIR(2) | A_BOLD);
    }

    attron(COLOR_PAIR(6));
    mvprintw(row/2 + 3, col/2 - 10, "STABILIZING SYSTEM...");
    mvprintw(row/2 + 5, col/2 - 20, "[################################    ]");
    attroff(COLOR_PAIR(6));
}

void NCurses::playSound(const std::string& soundPath) {
    (void)soundPath;
    beep();
}

std::string NCurses::getName() const
{
    return "NCurses";
}
