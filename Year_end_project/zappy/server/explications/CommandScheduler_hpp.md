# `include/game/CommandScheduler.hpp` — Header du planificateur

File de priorité pour exécuter les actions des joueurs avec un délai (temps en ticks).

---

```cpp
struct ScheduledAction {
    Player *player;
    ActionType type;
    std::vector<std::string> args;
    double remainingTime;
    int id;

    bool operator>(const ScheduledAction &other) const {
        return remainingTime > other.remainingTime;
    }
};
```
**Lignes 10-20** — Structure d'une action planifiée : joueur concerné, type d'action, arguments, temps restant, et un ID unique. L'opérateur `>` permet à la `priority_queue` de trier par temps croissant (min-heap).

```cpp
class CommandScheduler {
    public:
        CommandScheduler(int freq);

        void schedule(Player *player, ActionType type, const std::vector<std::string> &args);
        void update(double deltaTime);
        double getTimeUntilNextAction() const;
        bool hasActionsForPlayer(Player *player) const;
        void clearPlayerActions(Player *player);

        using ActionCallback = std::function<void(Player *, ActionType, const std::vector<std::string> &)>;
        void setOnActionReady(ActionCallback cb) { _onActionReady = cb; }

    private:
        int _freq;
        int _nextId = 0;
        std::priority_queue<ScheduledAction, std::vector<ScheduledAction>, std::greater<ScheduledAction>> _queue;
        ActionCallback _onActionReady;

        double getActionTime(ActionType type) const;
};
```
**Lignes 22-42** — Le `CommandScheduler` utilise une `priority_queue` min-heap. `schedule()` ajoute une action, `update()` décrémente les timers et déclenche le callback quand une action est prête. `_onActionReady` est le callback vers `ActionHandler::execute`.
