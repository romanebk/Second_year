/*
** EPITECH PROJECT, 2026
** test_gui_protocol.cpp
** File description:
** GUI protocol tests
*/#include "../include/protocol/GUIProtocol.hpp"
#include "../include/common/Structs.hpp"
#include <cassert>
#include <iostream>
#include <sstream>

static int tests_run = 0;
static int tests_passed = 0;

#define TEST(name) do { \
    tests_run++; \
    std::cout << "  TEST: " << name << "... "; \
    try {

#define END_TEST \
        std::cout << "PASS" << std::endl; \
        tests_passed++; \
    } catch (const std::exception &e) { \
        std::cout << "FAIL (" << e.what() << ")" << std::endl; \
    } catch (...) { \
        std::cout << "FAIL (unknown)" << std::endl; \
    } \
} while(0)

void test_msz()
{
    TEST("msz formatting")
        auto s = GUIProtocol::msz(10, 20);
        assert(s == "msz 10 20\n");
    END_TEST;
}

void test_bct()
{
    TEST("bct formatting with inventory")
        Inventory inv;
        inv.resources = {5, 3, 2, 1, 4, 0, 0};
        auto s = GUIProtocol::bct(3, 7, inv);
        assert(s == "bct 3 7 5 3 2 1 4 0 0\n");
    END_TEST;
}

void test_tna()
{
    TEST("tna formatting")
        auto s = GUIProtocol::tna("Team1");
        assert(s == "tna Team1\n");
    END_TEST;
}

void test_pnw()
{
    TEST("pnw formatting")
        auto s = GUIProtocol::pnw(1, 5, 8, 2, 3, "Team1");
        assert(s == "pnw #1 5 8 2 3 Team1\n");
    END_TEST;
}

void test_ppo()
{
    TEST("ppo formatting")
        auto s = GUIProtocol::ppo(42, 3, 9, 1);
        assert(s == "ppo #42 3 9 1\n");
    END_TEST;
}

void test_plv()
{
    TEST("plv formatting")
        auto s = GUIProtocol::plv(7, 5);
        assert(s == "plv #7 5\n");
    END_TEST;
}

void test_pin()
{
    TEST("pin formatting")
        Inventory inv;
        inv.resources = {10, 2, 0, 1, 0, 0, 0};
        auto s = GUIProtocol::pin(3, 4, 6, inv);
        assert(s == "pin #3 4 6 10 2 0 1 0 0 0\n");
    END_TEST;
}

void test_sgt()
{
    TEST("sgt formatting")
        auto s = GUIProtocol::sgt(100);
        assert(s == "sgt 100\n");
    END_TEST;
}

void test_sst()
{
    TEST("sst formatting")
        auto s = GUIProtocol::sst(50);
        assert(s == "sst 50\n");
    END_TEST;
}

void test_events()
{
    TEST("pex formatting")
        assert(GUIProtocol::pex(5) == "pex #5\n");
    END_TEST;

    TEST("pbc formatting")
        assert(GUIProtocol::pbc(1, "hello world") == "pbc #1 hello world\n");
    END_TEST;

    TEST("pic formatting")
        std::vector<int> players = {1, 2, 3};
        auto s = GUIProtocol::pic(5, 5, 2, players);
        assert(s == "pic 5 5 2 #1 #2 #3\n");
    END_TEST;

    TEST("pie formatting")
        assert(GUIProtocol::pie(3, 4, 1) == "pie 3 4 1\n");
    END_TEST;

    TEST("pfk formatting")
        assert(GUIProtocol::pfk(2) == "pfk #2\n");
    END_TEST;

    TEST("pdr formatting")
        assert(GUIProtocol::pdr(3, 1) == "pdr #3 1\n");
    END_TEST;

    TEST("pgt formatting")
        assert(GUIProtocol::pgt(3, 2) == "pgt #3 2\n");
    END_TEST;

    TEST("pdi formatting")
        assert(GUIProtocol::pdi(9) == "pdi #9\n");
    END_TEST;

    TEST("enw formatting")
        auto s = GUIProtocol::enw(10, 5, 2, 3);
        assert(s == "enw #10 #5 2 3\n");
    END_TEST;

    TEST("ebo formatting")
        assert(GUIProtocol::ebo(10) == "ebo #10\n");
    END_TEST;

    TEST("edi formatting")
        assert(GUIProtocol::edi(10) == "edi #10\n");
    END_TEST;

    TEST("seg formatting")
        assert(GUIProtocol::seg("Team1") == "seg Team1\n");
    END_TEST;

    TEST("smg formatting")
        assert(GUIProtocol::smg("msg") == "smg msg\n");
    END_TEST;

    TEST("suc formatting")
        assert(GUIProtocol::suc() == "suc\n");
    END_TEST;

    TEST("sbp formatting")
        assert(GUIProtocol::sbp() == "sbp\n");
    END_TEST;
}

void test_parse()
{
    TEST("parse msz")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("msz", args);
        assert(r == GUIProtocol::Request::MSZ);
        assert(args.empty());
    END_TEST;

    TEST("parse bct with args")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("bct 10 20", args);
        assert(r == GUIProtocol::Request::BCT);
        assert(args.size() == 2);
        assert(args[0] == "10");
        assert(args[1] == "20");
    END_TEST;

    TEST("parse mct")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("mct", args);
        assert(r == GUIProtocol::Request::MCT);
    END_TEST;

    TEST("parse tna")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("tna", args);
        assert(r == GUIProtocol::Request::TNA);
    END_TEST;

    TEST("parse ppo with id")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("ppo 42", args);
        assert(r == GUIProtocol::Request::PPO);
        assert(args.size() == 1);
        assert(args[0] == "42");
    END_TEST;

    TEST("parse plv")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("plv 7", args);
        assert(r == GUIProtocol::Request::PLV);
        assert(args[0] == "7");
    END_TEST;

    TEST("parse pin")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("pin 3", args);
        assert(r == GUIProtocol::Request::PIN);
    END_TEST;

    TEST("parse sgt")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("sgt", args);
        assert(r == GUIProtocol::Request::SGT);
    END_TEST;

    TEST("parse sst")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("sst 100", args);
        assert(r == GUIProtocol::Request::SST);
        assert(args[0] == "100");
    END_TEST;

    TEST("parse unknown command")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("BLABLA", args);
        assert(r == GUIProtocol::Request::UNKNOWN);
    END_TEST;
}

void test_parse_edge_cases()
{
    TEST("parse empty string")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("", args);
        assert(r == GUIProtocol::Request::UNKNOWN);
    END_TEST;

    TEST("parse extra spaces")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("  bct   10   20  ", args);
        assert(r == GUIProtocol::Request::BCT);
        assert(args.size() == 2);
        assert(args[0] == "10");
        assert(args[1] == "20");
    END_TEST;

    TEST("parse case sensitivity")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("Msz", args);
        assert(r == GUIProtocol::Request::UNKNOWN);
    END_TEST;

    TEST("parse trailing newline")
        std::vector<std::string> args;
        auto r = GUIProtocol::parse("bct 10 20\n", args);
        assert(r == GUIProtocol::Request::BCT);
        assert(args.size() == 2);
        assert(args[1] == "20");
    END_TEST;
}

void test_bct_edge_cases()
{
    TEST("bct with zero inventory")
        Inventory inv;
        auto s = GUIProtocol::bct(0, 0, inv);
        assert(s == "bct 0 0 0 0 0 0 0 0 0\n");
    END_TEST;

    TEST("bct with large values")
        Inventory inv;
        for (auto &v : inv.resources) v = 99999;
        auto s = GUIProtocol::bct(100, 200, inv);
        assert(s == "bct 100 200 99999 99999 99999 99999 99999 99999 99999\n");
    END_TEST;
}

void test_pin_edge_cases()
{
    TEST("pin with zero inventory")
        Inventory inv;
        auto s = GUIProtocol::pin(0, 0, 0, inv);
        assert(s == "pin #0 0 0 0 0 0 0 0 0 0\n");
    END_TEST;
}

void test_pic_edge_cases()
{
    TEST("pic with empty player list")
        std::vector<int> players;
        auto s = GUIProtocol::pic(1, 2, 3, players);
        assert(s == "pic 1 2 3\n");
    END_TEST;

    TEST("pic with many players")
        std::vector<int> players = {1, 2, 3, 4, 5, 6};
        auto s = GUIProtocol::pic(0, 0, 8, players);
        assert(s == "pic 0 0 8 #1 #2 #3 #4 #5 #6\n");
    END_TEST;
}

int main()
{
    std::cout << "GUI Protocol Tests" << std::endl;
    std::cout << "==================" << std::endl;

    test_msz();
    test_bct();
    test_tna();
    test_pnw();
    test_ppo();
    test_plv();
    test_pin();
    test_sgt();
    test_sst();
    test_events();
    test_parse();
    test_parse_edge_cases();
    test_bct_edge_cases();
    test_pin_edge_cases();
    test_pic_edge_cases();

    std::cout << std::endl;
    std::cout << "Results: " << tests_passed << "/" << tests_run << " passed" << std::endl;

    return (tests_passed == tests_run) ? 0 : 1;
}
