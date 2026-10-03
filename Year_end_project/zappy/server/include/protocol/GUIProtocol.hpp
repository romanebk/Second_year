#ifndef GUIPROTOCOL_HPP_
#define GUIPROTOCOL_HPP_

#include "../common/Structs.hpp"
#include "../common/Enums.hpp"
#include <string>
#include <vector>

class GUIProtocol {
    public:
        enum class Request {
            MSZ, BCT, MCT, TNA, PPO, PLV, PIN, SGT, SST, UNKNOWN
        };

        static Request parse(const std::string &line, std::vector<std::string> &args);

        static std::string msz(int x, int y);
        static std::string bct(int x, int y, const Inventory &inv);
        static std::string tna(const std::string &name);
        static std::string pnw(int id, int x, int y, int orient, int level, const std::string &team);
        static std::string ppo(int id, int x, int y, int orient);
        static std::string plv(int id, int level);
        static std::string pin(int id, int x, int y, const Inventory &inv);
        static std::string pex(int id);
        static std::string pbc(int id, const std::string &msg);
        static std::string pic(int x, int y, int level, const std::vector<int> &players);
        static std::string pie(int x, int y, int result);
        static std::string pfk(int id);
        static std::string pdr(int id, int resource);
        static std::string pgt(int id, int resource);
        static std::string pdi(int id);
        static std::string enw(int eggId, int playerId, int x, int y);
        static std::string ebo(int eggId);
        static std::string edi(int eggId);
        static std::string sgt(int timeUnit);
        static std::string sst(int timeUnit);
        static std::string seg(const std::string &team);
        static std::string smg(const std::string &msg);
        static std::string suc();
        static std::string sbp();
};

#endif
