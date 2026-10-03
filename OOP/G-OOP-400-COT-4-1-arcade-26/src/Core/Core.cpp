#include "../../include/Core/ACore.hpp"
#include <chrono>
#include <thread>
#include <dirent.h>
#include <algorithm>

Core::Core(const std::string &initlib) : 
    _display(nullptr), _game(nullptr), _displayLoader(nullptr), _gameLoader(nullptr),
    currentDisplayIndex(0), currentGameIndex(0), _state(CoreState::MENU), isRunning(true),
    _splashGameName(""), _splashImagePath(""),
    _currentscore(0), _playername("player"), _initlib(initlib)
{
    scanLibFolder();
    loadDisplay(_initlib);
}

Core::~Core()
{
    if (_displayLoader) {
        if (_display) _displayLoader->destroyInstance(_display, "destroyDisplay");
        delete _displayLoader;
    }
    if (_gameLoader) {
        if (_game) _gameLoader->destroyInstance(_game, "destroyGame");
        delete _gameLoader;
    }
}

void Core::scanLibFolder()
{
    DIR *libdir = opendir("./lib/");
    struct dirent *entry;
    if (libdir == nullptr) {
        throw Error("There is not a folder named lib\n");
    }
    while((entry = readdir(libdir)) != nullptr)
    {
        std::string filename = entry->d_name;
        if (filename == "." || filename == ".." || filename[0] == '.') continue;
        if (entry->d_type == DT_REG && filename.length() > 3 && filename.substr(filename.length() - 3) == ".so")
        {
            std::string path = "./lib/" + filename;
            void *handle = dlopen(path.c_str(), RTLD_LAZY);
            if (handle) {
                if (dlsym(handle, "createDisplay")) {
                    _libdisplay.push_back(filename);
                } else if (dlsym(handle, "createGame")) {
                    _libgame.push_back(filename);
                }
                dlclose(handle);
            }
        }
    }
    closedir(libdir);
    
    
    std::sort(_libdisplay.begin(), _libdisplay.end());
    std::sort(_libgame.begin(), _libgame.end());
}

void Core::run()
{
    if (_display == nullptr) {
        throw Error("No display library loaded. Cannot run");
    }
    _display->init();
    
    
    const auto frameDuration = std::chrono::microseconds(1000000 / 60);
    
    while(isRunning)
    {
        auto start = std::chrono::steady_clock::now();
        
        _display->clear();
        Event event = _display->pollEvent();
        
        if (event == Event::EXIT) {
            isRunning = false;
        } else if (event == Event::NEXT_LIB) {
            nextDisplay();
        } else if (event == Event::PREV_LIB) {
            prevDisplay();
        } else if (event == Event::NEXT_GAME) {
            nextGame();
        } else if (event == Event::PREV_GAME) {
            prevGame();
        } else if (event == Event::MENU) {
            _state = CoreState::MENU;
        } else if (event == Event::RESTART) {
            restartGame();
        } else {
            if (_state == CoreState::MENU) {
                handleMenuLogic(event);
            } else if (_state == CoreState::PLAYING) {
                handleGameLogic(event);
            } else if (_state == CoreState::GAME_OVER) {
                _display->renderGameOver(_currentscore);
                if (event == Event::ACTION || event == Event::MENU) {
                    _state = CoreState::MENU;
                }
            } else if (_state == CoreState::SPLASH) {
                _display->renderSplash(_splashImagePath, _splashGameName);
                auto now = std::chrono::steady_clock::now();
                auto duration = std::chrono::duration_cast<std::chrono::seconds>(now - _splashStartTime).count();
                if (duration >= 2) {
                    _state = CoreState::PLAYING;
                }
            }
        }
        
        _display->display();
        auto end = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        if (elapsed < frameDuration) {
            std::this_thread::sleep_for(frameDuration - elapsed);
        }
    }
    
    _display->close();
}

void Core::handleMenuLogic(Event event)
{
    bool isLetter = (event >= Event::KEY_A && event <= Event::KEY_Z);
    bool isDigit = (event >= Event::KEY_0 && event <= Event::KEY_9);
    bool isSpace = (event == Event::SPACE);
    bool isBack = (event == Event::BACKSPACE);

    if (isLetter || isDigit || isSpace || isBack) {
        char c = static_cast<char>(event);
        if (isBack) {
            if (!_playername.empty()) _playername.pop_back();
        } else {
            if (_playername.length() < 15)
                _playername += c;
        }
    } else if (event == Event::UP) {
        if (currentGameIndex == 0) currentGameIndex = _libgame.size() - 1;
        else currentGameIndex--;
    } else if (event == Event::DOWN) {
        currentGameIndex = (currentGameIndex + 1) % _libgame.size();
    } else if (event == Event::LEFT) {
        if (currentDisplayIndex == 0) currentDisplayIndex = _libdisplay.size() - 1;
        else currentDisplayIndex--;
        loadDisplay(_libdisplay[currentDisplayIndex]);
        _display->init();
    } else if (event == Event::RIGHT) {
        currentDisplayIndex = (currentDisplayIndex + 1) % _libdisplay.size();
        loadDisplay(_libdisplay[currentDisplayIndex]);
        _display->init();
    } else    if (event == Event::ACTION) {
        if (!_libgame.empty()) {
            _splashGameName = _libgame[currentGameIndex];
            if (_splashGameName.find("snake") != std::string::npos) _splashImagePath = "images/snake.jpg";
            else if (_splashGameName.find("nibbler") != std::string::npos) _splashImagePath = "images/nibbler.jpg";
            else if (_splashGameName.find("minesweeper") != std::string::npos) _splashImagePath = "images/minesweeper.jpg";
            else _splashImagePath = "images/snake.jpg"; 
            
            loadGame(_libgame[currentGameIndex]);
            if (_game) {
                _game->reset();
                _splashStartTime = std::chrono::steady_clock::now();
                _state = CoreState::SPLASH;
            }
        }
        return;
    }
    _display->renderMenu(_libgame, _libdisplay, _playername, _currentscore);
}

void Core::handleGameLogic(Event event)
{
    if (!_game) return;
    _game->handleEvent(event);
    _game->update();
    for (const auto& sound : _game->getSounds()) {
        _display->playSound(sound);
    }
    if (_game->isGameOver()) {
        _currentscore = _game->getScore();
        _state = CoreState::GAME_OVER;
    }
    _display->render(_game->getEntities());
    _display->renderHUD(_playername, _game->getScore());
}

void Core::loadDisplay(const std::string &path)
{
    // Libérer proprement l'ancien display
    if (_displayLoader && _display) {
        _display->close();
        _displayLoader->destroyInstance(_display, "destroyDisplay");
        delete _displayLoader;
        _displayLoader = nullptr;
        _display = nullptr;
    }
    
    std::string fullPath = path;
    if (path.find('/') == std::string::npos)
        fullPath = "./lib/" + path;
    try {
        _displayLoader = new DLLoader<IDisplay>(fullPath);
        _display = _displayLoader->getInstance("createDisplay");
        
        std::string basename = fullPath.substr(fullPath.find_last_of('/') + 1);
        auto it = std::find(_libdisplay.begin(), _libdisplay.end(), basename);
        if (it != _libdisplay.end())
            currentDisplayIndex = std::distance(_libdisplay.begin(), it);
    } catch (const Error &e) {
        throw Error("Failed to load display library: " + std::string(e.what()));
    }
}

void Core::loadGame(const std::string &path)
{
    // Libérer proprement l'ancien game
    if (_gameLoader && _game) {
        _gameLoader->destroyInstance(_game, "destroyGame");
        delete _gameLoader;
        _gameLoader = nullptr;
        _game = nullptr;
    }
    
    std::string fullPath = path;
    if (path.find('/') == std::string::npos)
        fullPath = "./lib/" + path;
    try {
        _gameLoader = new DLLoader<IGame>(fullPath);
        _game = _gameLoader->getInstance("createGame");
        
        std::string basename = fullPath.substr(fullPath.find_last_of('/') + 1);
        auto it = std::find(_libgame.begin(), _libgame.end(), basename);
        if (it != _libgame.end())
            currentGameIndex = std::distance(_libgame.begin(), it);
    } catch (const Error &e) {
        throw Error("Failed to load game library: " + std::string(e.what()));
    }
}

void Core::nextDisplay()
{
    if (_libdisplay.empty()) return;
    currentDisplayIndex = (currentDisplayIndex + 1) % _libdisplay.size();
    try {
        loadDisplay(_libdisplay[currentDisplayIndex]);
        if (_display) _display->init();
    } catch (const Error &e) {
        // En cas d'erreur, revenir à la bibliothèque précédente
        currentDisplayIndex = (currentDisplayIndex - 1 + _libdisplay.size()) % _libdisplay.size();
        loadDisplay(_libdisplay[currentDisplayIndex]);
        if (_display) _display->init();
    }
}

void Core::prevDisplay()
{
    if (_libdisplay.empty()) return;
    int oldIndex = currentDisplayIndex;
    if (currentDisplayIndex == 0) currentDisplayIndex = _libdisplay.size() - 1;
    else currentDisplayIndex--;
    try {
        loadDisplay(_libdisplay[currentDisplayIndex]);
        if (_display) _display->init();
    } catch (const Error &e) {
        // En cas d'erreur, revenir à la bibliothèque précédente
        currentDisplayIndex = oldIndex;
        loadDisplay(_libdisplay[currentDisplayIndex]);
        if (_display) _display->init();
    }
}

void Core::nextGame()
{
    if (_libgame.empty()) return;
    currentGameIndex = (currentGameIndex + 1) % _libgame.size();
    if (_state == CoreState::PLAYING) {
        _splashGameName = _libgame[currentGameIndex];
        if (_splashGameName.find("snake") != std::string::npos) _splashImagePath = "images/snake.jpg";
        else if (_splashGameName.find("nibbler") != std::string::npos) _splashImagePath = "images/nibbler.jpg";
        else if (_splashGameName.find("minesweeper") != std::string::npos) _splashImagePath = "images/minesweeper.jpg";
        else _splashImagePath = "images/snake.jpg";
        
        try {
            loadGame(_libgame[currentGameIndex]);
            if (_game) {
                _game->reset();
                _splashStartTime = std::chrono::steady_clock::now();
                _state = CoreState::SPLASH;
            }
        } catch (const Error &e) {
            // En cas d'erreur, revenir au jeu précédent
            currentGameIndex = (currentGameIndex - 1 + _libgame.size()) % _libgame.size();
            loadGame(_libgame[currentGameIndex]);
            if (_game) {
                _game->reset();
                _splashStartTime = std::chrono::steady_clock::now();
                _state = CoreState::SPLASH;
            }
        }
    }
}

void Core::prevGame()
{
    if (_libgame.empty()) return;
    if (currentGameIndex == 0) currentGameIndex = _libgame.size() - 1;
    else currentGameIndex--;
    if (_state == CoreState::PLAYING) {
        _splashGameName = _libgame[currentGameIndex];
        if (_splashGameName.find("snake") != std::string::npos) _splashImagePath = "images/snake.jpg";
        else if (_splashGameName.find("nibbler") != std::string::npos) _splashImagePath = "images/nibbler.jpg";
        else if (_splashGameName.find("minesweeper") != std::string::npos) _splashImagePath = "images/minesweeper.jpg";
        else _splashImagePath = "images/snake.jpg";

        try {
            loadGame(_libgame[currentGameIndex]);
            if (_game) {
                _game->reset();
                _splashStartTime = std::chrono::steady_clock::now();
                _state = CoreState::SPLASH;
            }
        } catch (const Error &e) {
            // En cas d'erreur, revenir au jeu précédent
            currentGameIndex = (currentGameIndex + 1) % _libgame.size();
            loadGame(_libgame[currentGameIndex]);
            if (_game) {
                _game->reset();
                _splashStartTime = std::chrono::steady_clock::now();
                _state = CoreState::SPLASH;
            }
        }
    }
}

void Core::restartGame()
{
    if (_state == CoreState::PLAYING && _game) {
        _game->reset();
    }
}

void Core::goToMenu()
{
    _state = CoreState::MENU;
}

std::vector<std::string> Core::getAvailableDisplays() const { return _libdisplay; }
std::vector<std::string> Core::getAvailableGames() const { return _libgame; }
std::string Core::getPlayerName() const { return _playername; }
void Core::setPlayerName(const std::string &name) { _playername = name; }
int Core::getScore() const { return _currentscore; }