#include "../../include/Displays/SDL2.hpp"
#include <SDL2/SDL_image.h>

extern "C" {
    IDisplay* createDisplay() { return new SDL2(); }
    void destroyDisplay(IDisplay* display) { delete display; }
}

SDL2::SDL2() : _window(nullptr), _renderer(nullptr), _font(nullptr), _fontLoaded(false) {}
SDL2::~SDL2() { close(); }

static void RdrText(SDL_Renderer* ren, TTF_Font* font, const std::string& text, int x, int y, SDL_Color color)
{
    if (!font || text.empty() == true) {
        return;
    }
    SDL_Surface* surf = TTF_RenderText_Blended(font, text.c_str(), color);
    if (!surf) {
        return;
    }
    SDL_Texture* tex = SDL_CreateTextureFromSurface(ren, surf);
    SDL_Rect rect = {x, y, surf->w, surf->h};
    SDL_RenderCopy(ren, tex, nullptr, &rect);
    SDL_DestroyTexture(tex);
    SDL_FreeSurface(surf);
}

void SDL2::init()
{
    SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO);
    TTF_Init();
    _window = SDL_CreateWindow("Arcade SDL2", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, 800, 600, SDL_WINDOW_SHOWN);
    _renderer = SDL_CreateRenderer(_window, -1, SDL_RENDERER_ACCELERATED);
    
    _font = TTF_OpenFont("./ProductSans-Black.ttf", 24);
    if (_font) _fontLoaded = true;
}

void SDL2::close()
{
    TTF_Quit();
    if (_renderer) SDL_DestroyRenderer(_renderer);
    if (_window) SDL_DestroyWindow(_window);
    SDL_Quit();
}

void SDL2::clear()
{
    SDL_SetRenderDrawColor(_renderer, 0, 0, 0, 255);
    SDL_RenderClear(_renderer);
}

void SDL2::display()
{
    SDL_RenderPresent(_renderer);
}

void SDL2::render(const std::vector<Entity>& entities)
{
    for (const auto& e : entities) {
        int x = e.x * 24 + 50; 
        int y = e.y * 24 + 50;
        SDL_Rect r = {x, y, 22, 22};
        
        switch (e.type) {
            case EntityType::WALL:
                SDL_SetRenderDrawColor(_renderer, 40, 44, 52, 255); 
                SDL_RenderFillRect(_renderer, &r);
                SDL_SetRenderDrawColor(_renderer, 80, 80, 100, 255);
                SDL_RenderDrawRect(_renderer, &r);
                break;
            case EntityType::SNAKE_HEAD:
                SDL_SetRenderDrawColor(_renderer, 0, 255, 0, 255); 
                SDL_RenderFillRect(_renderer, &r);
                
                SDL_SetRenderDrawColor(_renderer, 0, 0, 0, 255);
                {
                    SDL_Rect eye1 = {x + 4, y + 4, 4, 4};
                    SDL_Rect eye2 = {x + 14, y + 4, 4, 4};
                    SDL_RenderFillRect(_renderer, &eye1);
                    SDL_RenderFillRect(_renderer, &eye2);
                }
                break;
            case EntityType::SNAKE_BODY:
                SDL_SetRenderDrawColor(_renderer, 0, 200, 0, 255); 
                {
                    SDL_Rect r2 = {x + 2, y + 2, 18, 18};
                    SDL_RenderFillRect(_renderer, &r2);
                }
                break;
            case EntityType::FOOD:
                SDL_SetRenderDrawColor(_renderer, 255, 0, 0, 255); 
                {
                    SDL_Point points[5] = {
                        {x + 11, y + 2},
                        {x + 20, y + 11},
                        {x + 11, y + 20},
                        {x + 2, y + 11},
                        {x + 11, y + 2}
                    };
                    SDL_RenderDrawLines(_renderer, points, 5);
                    SDL_Rect r_f = {x + 8, y + 8, 6, 6};
                    SDL_RenderFillRect(_renderer, &r_f);
                }
                break;
            case EntityType::HIDDEN:
                SDL_SetRenderDrawColor(_renderer, 60, 60, 60, 255);
                SDL_RenderFillRect(_renderer, &r);
                SDL_SetRenderDrawColor(_renderer, 100, 100, 100, 255);
                SDL_RenderDrawRect(_renderer, &r);
                break;
            case EntityType::FLAG:
                SDL_SetRenderDrawColor(_renderer, 255, 255, 0, 255);
                {
                    SDL_Point pts[4] = {{x+4, y+18}, {x+11, y+4}, {x+18, y+18}, {x+4, y+18}};
                    SDL_RenderDrawLines(_renderer, pts, 4);
                }
                break;
            case EntityType::MINE:
                SDL_SetRenderDrawColor(_renderer, 255, 0, 0, 255);
                {
                    SDL_Rect m = {x+6, y+6, 10, 10};
                    SDL_RenderFillRect(_renderer, &m);
                }
                break;
            case EntityType::REVEALED:
            case EntityType::NUMBER:
                SDL_SetRenderDrawColor(_renderer, 200, 200, 200, 255);
                SDL_RenderFillRect(_renderer, &r);
                if (e.type == EntityType::NUMBER && _fontLoaded) {
                    SDL_Color colors[] = {{0,0,255,255}, {0,128,0,255}, {255,0,0,255}, {0,0,128,255}};
                    int idx = (e.symbol - '1') % 4;
                    RdrText(_renderer, _font, std::string(1, e.symbol), x + 6, y, colors[idx]);
                }
                break;
            case EntityType::CURSOR:
                SDL_SetRenderDrawColor(_renderer, 255, 255, 255, 255);
                SDL_RenderDrawRect(_renderer, &r);
                break;
            default:
                SDL_SetRenderDrawColor(_renderer, 200, 200, 200, 255);
                SDL_RenderFillRect(_renderer, &r);
                break;
        }
    }
}

void SDL2::renderHUD(const std::string& p, int s)
{
    SDL_Rect HUD_bar = {0, 0, 800, 30};
    SDL_SetRenderDrawColor(_renderer, 100, 100, 100, 255);
    SDL_RenderFillRect(_renderer, &HUD_bar);
    if (_fontLoaded) {
        std::string txt = "Player: " + p + " | Score: " + std::to_string(s);
        RdrText(_renderer, _font, txt, 10, 2, {255, 255, 255, 255});
    }
}

void SDL2::renderMenu(const std::vector<std::string>& g, const std::vector<std::string>& gr, const std::string& p, int s)
{
    
    SDL_Rect header = {200, 50, 400, 50};
    SDL_SetRenderDrawColor(_renderer, 255, 255, 255, 255);
    SDL_RenderFillRect(_renderer, &header);
    if (_fontLoaded) RdrText(_renderer, _font, "SDL2 --- ARCADE MENU --- GAMES", 280, 60, {0, 0, 0, 255});

    if (_fontLoaded) {
        std::string ptxt = "Player: " + p + " | Score: " + std::to_string(s);
        RdrText(_renderer, _font, ptxt, 50, 120, {255, 255, 255, 255});
    }

    
    SDL_Rect gamesBox = {50, 150, 300, 400};
    SDL_SetRenderDrawColor(_renderer, 50, 50, 50, 255);
    SDL_RenderFillRect(_renderer, &gamesBox);

    
    SDL_Rect graphicsBox = {450, 150, 300, 400};
    SDL_SetRenderDrawColor(_renderer, 50, 50, 50, 255);
    SDL_RenderFillRect(_renderer, &graphicsBox);

    
    for (size_t i = 0; i < g.size(); i++) {
        SDL_Rect item = {70, (int)(170 + i * 40), 260, 30};
        SDL_SetRenderDrawColor(_renderer, 200, 200, 200, 255);
        SDL_RenderFillRect(_renderer, &item);
        if (_fontLoaded) RdrText(_renderer, _font, "- " + g[i], 80, 172 + i * 40, {0, 0, 0, 255});
    }
    for (size_t i = 0; i < gr.size(); i++) {
        SDL_Rect item = {470, (int)(170 + i * 40), 260, 30};
        SDL_SetRenderDrawColor(_renderer, 200, 200, 200, 255);
        SDL_RenderFillRect(_renderer, &item);
        if (_fontLoaded) RdrText(_renderer, _font, "- " + gr[i], 480, 172 + i * 40, {0, 0, 0, 255});
    }
}

Event SDL2::pollEvent()
{
    SDL_Event e;
    while (SDL_PollEvent(&e)) {
        if (e.type == SDL_QUIT) return Event::EXIT;
        if (e.type == SDL_KEYDOWN) {
            switch (e.key.keysym.sym) {
                case SDLK_UP:     return Event::UP;
                case SDLK_DOWN:   return Event::DOWN;
                case SDLK_LEFT:   return Event::LEFT;
                case SDLK_RIGHT:  return Event::RIGHT;
                case SDLK_ESCAPE: return Event::EXIT;
                case SDLK_RETURN: return Event::ACTION;
                case SDLK_BACKSPACE: return Event::BACKSPACE;
                case SDLK_SPACE:  return Event::SPACE;
                case SDLK_2:      return Event::PREV_LIB;
                case SDLK_3:      return Event::NEXT_LIB;
                case SDLK_4:      return Event::PREV_GAME;
                case SDLK_5:      return Event::NEXT_GAME;
                case SDLK_8:      return Event::RESTART;
                case SDLK_9:      return Event::MENU;
                default: 
                    if (e.key.keysym.sym >= SDLK_a && e.key.keysym.sym <= SDLK_z)
                        return static_cast<Event>(static_cast<int>(Event::KEY_A) + (e.key.keysym.sym - SDLK_a));
                    if (e.key.keysym.sym >= SDLK_0 && e.key.keysym.sym <= SDLK_9)
                        return static_cast<Event>(static_cast<int>(Event::KEY_0) + (e.key.keysym.sym - SDLK_0));
                    break;
            }
        }
    }
    return Event::UNKNOWN;
}

void SDL2::renderGameOver(int score)
{
    
    SDL_SetRenderDrawBlendMode(_renderer, SDL_BLENDMODE_BLEND);
    SDL_SetRenderDrawColor(_renderer, 0, 0, 0, 180);
    SDL_Rect overlay = {0, 0, 800, 600};
    SDL_RenderFillRect(_renderer, &overlay);

    if (_fontLoaded) {
        RdrText(_renderer, _font, "G A M E   O V E R", 250, 200, {255, 50, 50, 255});
        RdrText(_renderer, _font, "Final Score: " + std::to_string(score), 300, 300, {255, 255, 255, 255});
        RdrText(_renderer, _font, "Press ENTER to return to menu", 210, 450, {200, 200, 200, 255});
    }
}

void SDL2::renderSplash(const std::string& imagePath, const std::string& gameName)
{
    SDL_Texture* texture = IMG_LoadTexture(_renderer, imagePath.c_str());
    if (texture) {
        SDL_Rect dest = {0, 0, 800, 600};
        SDL_RenderCopy(_renderer, texture, nullptr, &dest);
        SDL_DestroyTexture(texture);
    } else {
        
        SDL_SetRenderDrawColor(_renderer, 0, 0, 255, 255);
        SDL_RenderClear(_renderer);
    }

    if (_fontLoaded) {
        SDL_Rect box = {200, 500, 400, 60};
        SDL_SetRenderDrawBlendMode(_renderer, SDL_BLENDMODE_BLEND);
        SDL_SetRenderDrawColor(_renderer, 0, 0, 0, 180);
        SDL_RenderFillRect(_renderer, &box);
        RdrText(_renderer, _font, "Starting " + gameName + "...", 220, 510, {255, 255, 255, 255});
    }
}

void SDL2::playSound(const std::string& soundPath)
{
    SDL_AudioSpec wavSpec;
    Uint32 wavLength;
    Uint8 *wavBuffer;

    if (SDL_LoadWAV(soundPath.c_str(), &wavSpec, &wavBuffer, &wavLength) == nullptr) {
        return;
    }

    SDL_AudioDeviceID deviceID = SDL_OpenAudioDevice(nullptr, 0, &wavSpec, nullptr, 0);
    if (deviceID == 0) {
        SDL_FreeWAV(wavBuffer);
        return;
    }

    SDL_QueueAudio(deviceID, wavBuffer, wavLength);
    SDL_PauseAudioDevice(deviceID, 0);

    
    
    
    
    SDL_FreeWAV(wavBuffer);
    
    
    
    
}

std::string SDL2::getName() const
{
    return "SDL2";
}