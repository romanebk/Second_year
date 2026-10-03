# `include/interfaces/IGameEngine.hpp` — Interface moteur de jeu

Interface que le `ServerApp` (partie de Momo) utilise pour piloter le jeu sans connaître son implémentation.

---

```cpp
virtual void init(int width, int height, const std::vector<std::string> &teams, int clientsPerTeam, int freq) = 0;
virtual int getWidth() const = 0;
virtual int getHeight() const = 0;
virtual int getFreq() const = 0;
virtual void update(double deltaTime) = 0;
virtual double getTimeUntilNextEvent() const = 0;
virtual bool isGameOver() const = 0;
virtual const std::string &getWinner() const = 0;
```
**Lignes 14-22** — Contrat du moteur de jeu : initialisation, accès aux dimensions/fréquence, boucle d'update avec deltaTime (en secondes), et requêtes sur l'état de fin de partie.
