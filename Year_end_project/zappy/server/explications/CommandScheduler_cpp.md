# `src/game/CommandScheduler.cpp` — Implémentation du planificateur

85 lignes, 6 méthodes.

---

```cpp
CommandScheduler::CommandScheduler(int freq) : _freq(freq) {}
```
**Ligne 5** — Constructeur : stocke la fréquence (tick/s) pour convertir les temps.

```cpp
void CommandScheduler::schedule(Player *player, ActionType type,
                                 const std::vector<std::string> &args)
{
    int count = 0;
    auto copy = _queue;
    while (!copy.empty()) {
        if (copy.top().player == player)
            count++;
        copy.pop();
    }
    if (count >= Constants::MAX_COMMANDS_QUEUED)
        return;

    double time = getActionTime(type);
    _queue.push({player, type, args, time, _nextId++});
}
```
**Lignes 7-22** — Planifie une action :
1. Compte combien d'actions ce joueur a déjà dans la file (en copiant la queue).
2. Si ≥ MAX_COMMANDS_QUEUED (10), ignore (back-pressure).
3. Calcule le temps via `getActionTime()` et pousse l'action.

```cpp
void CommandScheduler::update(double deltaTime)
{
    if (_queue.empty())
        return;

    std::vector<ScheduledAction> temp;
    while (!_queue.empty()) {
        auto action = _queue.top();
        _queue.pop();
        action.remainingTime -= deltaTime;
        if (action.remainingTime <= 0) {
            if (_onActionReady)
                _onActionReady(action.player, action.type, action.args);
        } else {
            temp.push_back(action);
        }
    }

    for (auto &a : temp)
        _queue.push(a);
}
```
**Lignes 24-44** — `update()` est appelée à chaque tick :
1. Vide toute la queue.
2. Pour chaque action, soustrait `deltaTime` du temps restant.
3. Si le temps est écoulé (≤ 0), exécute le callback `_onActionReady`.
4. Sinon, remet l'action dans `temp`.
5. Replace les actions non-prêtes dans la queue.

```cpp
double CommandScheduler::getTimeUntilNextAction() const
{
    if (_queue.empty())
        return -1;
    return _queue.top().remainingTime;
}
```
**Lignes 46-51** — Retourne le temps restant avant la prochaine action (ou -1 si vide). Utilisé par `ServerApp` pour savoir combien de temps sleep avant le prochain event.

```cpp
bool CommandScheduler::hasActionsForPlayer(Player *player) const
{
    auto copy = _queue;
    while (!copy.empty()) {
        if (copy.top().player == player)
            return true;
        copy.pop();
    }
    return false;
}
```
**Lignes 53-62** — Vérifie si un joueur a des actions en attente (utilisé pour Eject qui doit annuler les incantations).

```cpp
void CommandScheduler::clearPlayerActions(Player *player)
{
    std::vector<ScheduledAction> temp;
    while (!_queue.empty()) {
        auto action = _queue.top();
        _queue.pop();
        if (action.player != player)
            temp.push_back(action);
    }
    for (auto &a : temp)
        _queue.push(a);
}
```
**Lignes 64-75** — Supprime toutes les actions d'un joueur donné. Utilisé lors d'un Eject ou d'une mort.

```cpp
double CommandScheduler::getActionTime(ActionType type) const
{
    int idx = static_cast<int>(type);
    if (idx < 0 || idx >= static_cast<int>(ActionType::NONE))
        return 0;
    if (_freq <= 0)
        return 0;
    return static_cast<double>(Constants::ACTION_TIME[idx]) / _freq;
}
```
**Lignes 77-85** — Calcule le temps (en secondes) d'une action : `ACTION_TIME[idx] / freq`. Par exemple, FORWARD = 7/100 = 0.07s.
