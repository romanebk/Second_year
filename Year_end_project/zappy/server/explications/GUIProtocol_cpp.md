# `src/protocol/GUIProtocol.cpp` — Implémentation du protocole GUI

155 lignes, 20 méthodes de formatage + 1 parse.

---

```cpp
GUIProtocol::Request GUIProtocol::parse(const std::string &line, std::vector<std::string> &args)
{
    std::istringstream iss(line);
    std::string cmd;
    iss >> cmd;

    args.clear();
    std::string arg;
    while (iss >> arg)
        args.push_back(arg);

    if (cmd == "msz") return Request::MSZ;
    if (cmd == "bct") return Request::BCT;
    if (cmd == "mct") return Request::MCT;
    if (cmd == "tna") return Request::TNA;
    if (cmd == "ppo") return Request::PPO;
    if (cmd == "plv") return Request::PLV;
    if (cmd == "pin") return Request::PIN;
    if (cmd == "sgt") return Request::SGT;
    if (cmd == "sst") return Request::SST;
    return Request::UNKNOWN;
}
```
**Lignes 4-25** — `parse()` extrait la commande et les arguments d'une ligne. Retourne l'enum `Request` correspondant ou `UNKNOWN`.

```cpp
std::string GUIProtocol::msz(int x, int y)
{
    return "msz " + std::to_string(x) + " " + std::to_string(y) + "\n";
}
```
**Ligne 27-30** — `msz` : taille de la carte.

```cpp
std::string GUIProtocol::bct(int x, int y, const Inventory &inv)
{
    std::string out = "bct " + std::to_string(x) + " " + std::to_string(y);
    for (int i = 0; i < 7; i++)
        out += " " + std::to_string(inv.resources[i]);
    return out + "\n";
}
```
**Lignes 32-38** — `bct` : contenu d'une tuile (position + 7 ressources).

```cpp
std::string GUIProtocol::tna(const std::string &name)
{
    return "tna " + name + "\n";
}
```
**Lignes 40-43** — `tna` : nom d'équipe.

```cpp
std::string GUIProtocol::pnw(int id, int x, int y, int orient, int level, const std::string &team)
{
    return "pnw #" + std::to_string(id) + " " + std::to_string(x) + " " +
           std::to_string(y) + " " + std::to_string(orient) + " " +
           std::to_string(level) + " " + team + "\n";
}
```
**Lignes 45-50** — `pnw` : nouveau joueur (id, position, orientation, niveau, équipe).

```cpp
std::string GUIProtocol::ppo(int id, int x, int y, int orient)
{
    return "ppo #" + std::to_string(id) + " " + std::to_string(x) + " " +
           std::to_string(y) + " " + std::to_string(orient) + "\n";
}
```
**Lignes 52-56** — `ppo` : position du joueur.

```cpp
std::string GUIProtocol::plv(int id, int level)
{
    return "plv #" + std::to_string(id) + " " + std::to_string(level) + "\n";
}
```
**Lignes 58-61** — `plv` : niveau du joueur.

```cpp
std::string GUIProtocol::pin(int id, int x, int y, const Inventory &inv)
{
    std::string out = "pin #" + std::to_string(id) + " " +
                      std::to_string(x) + " " + std::to_string(y);
    for (int i = 0; i < 7; i++)
        out += " " + std::to_string(inv.resources[i]);
    return out + "\n";
}
```
**Lignes 63-70** — `pin` : inventaire du joueur.

```cpp
std::string GUIProtocol::pex(int id) { return "pex #" + std::to_string(id) + "\n"; }
std::string GUIProtocol::pbc(int id, const std::string &msg)
{
    return "pbc #" + std::to_string(id) + " " + msg + "\n";
}
std::string GUIProtocol::pic(int x, int y, int level, const std::vector<int> &players)
{
    std::string out = "pic " + std::to_string(x) + " " + std::to_string(y) +
                      " " + std::to_string(level);
    for (int p : players)
        out += " #" + std::to_string(p);
    return out + "\n";
}
std::string GUIProtocol::pie(int x, int y, int result)
{
    return "pie " + std::to_string(x) + " " + std::to_string(y) + " " +
           std::to_string(result) + "\n";
}
std::string GUIProtocol::pfk(int id) { return "pfk #" + std::to_string(id) + "\n"; }
std::string GUIProtocol::pdr(int id, int resource)
{
    return "pdr #" + std::to_string(id) + " " + std::to_string(resource) + "\n";
}
std::string GUIProtocol::pgt(int id, int resource)
{
    return "pgt #" + std::to_string(id) + " " + std::to_string(resource) + "\n";
}
std::string GUIProtocol::pdi(int id) { return "pdi #" + std::to_string(id) + "\n"; }
```
**Lignes 72-115** — Événements GUI :
- `pex` : expulsion
- `pbc` : broadcast
- `pic` : début d'incantation (position, niveau, liste des joueurs)
- `pie` : fin d'incantation (résultat 0/1)
- `pfk` : fork (pondre)
- `pdr` : pose de ressource (drop)
- `pgt` : prise de ressource (get)
- `pdi` : mort du joueur

```cpp
std::string GUIProtocol::enw(int eggId, int playerId, int x, int y)
{
    return "enw #" + std::to_string(eggId) + " #" + std::to_string(playerId) +
           " " + std::to_string(x) + " " + std::to_string(y) + "\n";
}
std::string GUIProtocol::ebo(int eggId) { return "ebo #" + std::to_string(eggId) + "\n"; }
std::string GUIProtocol::edi(int eggId) { return "edi #" + std::to_string(eggId) + "\n"; }
```
**Lignes 117-131** — Événements œuf :
- `enw` : œuf posé
- `ebo` : œuf éclos
- `edi` : œuf mort/écrasé

```cpp
std::string GUIProtocol::sgt(int timeUnit) { return "sgt " + std::to_string(timeUnit) + "\n"; }
std::string GUIProtocol::sst(int timeUnit) { return "sst " + std::to_string(timeUnit) + "\n"; }
std::string GUIProtocol::seg(const std::string &team) { return "seg " + team + "\n"; }
std::string GUIProtocol::smg(const std::string &msg) { return "smg " + msg + "\n"; }
std::string GUIProtocol::suc() { return "suc\n"; }
std::string GUIProtocol::sbp() { return "sbp\n"; }
```
**Lignes 133-155** — Commandes diverses :
- `sgt` : temps unitaire (fréquence)
- `sst` : set temps unitaire
- `seg` : fin de partie (équipe gagnante)
- `smg` : message générique
- `suc` : commande inconnue
- `sbp` : paramètre invalide
