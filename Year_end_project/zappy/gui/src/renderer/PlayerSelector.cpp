#include "renderer/PlayerSelector.hpp"
#include <algorithm>
#include <vector>

bool PlayerSelector::handleEvent(const sf::Event &ev,
                                 const EntityRenderer &entities,
                                 const Camera         &camera,
                                 const GameState      &state,
                                 unsigned winW, unsigned winH)
{
    if (ev.type == sf::Event::MouseButtonPressed &&
        ev.mouseButton.button == sf::Mouse::Left &&
        sf::Keyboard::isKeyPressed(sf::Keyboard::LShift))
    {
        auto picked = entities.pickPlayer(ev.mouseButton.x, ev.mouseButton.y,
                                          camera, state, winW, winH);
        if (picked) {
            _selected = picked;
            return true;
        }
        _selected = std::nullopt;
        return false;
    }

    if (ev.type == sf::Event::KeyPressed) {
        if (ev.key.code == sf::Keyboard::Tab && !state.players.empty()) {
            std::vector<int> ids;
            ids.reserve(state.players.size());
            for (const auto &[id, _] : state.players)
                ids.push_back(id);
            std::sort(ids.begin(), ids.end());

            if (!_selected) {
                _selected = ids.front();
                return true;
            }

            for (size_t i = 0; i < ids.size(); ++i) {
                if (ids[i] == *_selected) {
                    _selected = ids[(i + 1) % ids.size()];
                    return true;
                }
            }
            _selected = ids.front();
            return true;
        }

        if (ev.key.code == sf::Keyboard::Escape && _selected) {
            _selected = std::nullopt;
            return true;
        }
    }

    return false;
}

void PlayerSelector::clearSelection()
{
    _selected = std::nullopt;
}
