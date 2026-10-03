/*
** EPITECH PROJECT, 2026
** test_buffer.cpp
** File description:
** Buffer tests
*/#include <cassert>
#include <string>
#include <iostream>

class TestBuffer {
    public:
        bool hasLine() const {
            return _buf.find('\n') != std::string::npos;
        }

        std::string popLine() {
            size_t pos = _buf.find('\n');
            if (pos == std::string::npos) {
                std::string line = _buf;
                _buf.clear();
                return line;
            }
            std::string line = _buf.substr(0, pos);
            if (!line.empty() && line.back() == '\r')
                line.pop_back();
            _buf.erase(0, pos + 1);
            return line;
        }

        void feed(const std::string &data) {
            _buf.append(data);
        }

        size_t size() const { return _buf.size(); }

    private:
        std::string _buf;
};

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

void test_empty_buffer()
{
    TEST("empty buffer has no line")
        TestBuffer buf;
        assert(!buf.hasLine());
        assert(buf.popLine() == "");
        assert(buf.size() == 0);
    END_TEST;
}

void test_single_line()
{
    TEST("single complete line")
        TestBuffer buf;
        buf.feed("Forward\n");
        assert(buf.hasLine());
        assert(buf.popLine() == "Forward");
        assert(!buf.hasLine());
    END_TEST;
}

void test_multiple_lines()
{
    TEST("multiple complete lines")
        TestBuffer buf;
        buf.feed("Forward\nLeft\nLook\n");
        assert(buf.hasLine());
        assert(buf.popLine() == "Forward");
        assert(buf.hasLine());
        assert(buf.popLine() == "Left");
        assert(buf.hasLine());
        assert(buf.popLine() == "Look");
        assert(!buf.hasLine());
    END_TEST;
}

void test_partial_line()
{
    TEST("partial line without newline")
        TestBuffer buf;
        buf.feed("Forward");
        assert(!buf.hasLine());
    END_TEST;
}

void test_line_with_crlf()
{
    TEST("line with CRLF")
        TestBuffer buf;
        buf.feed("Forward\r\n");
        assert(buf.hasLine());
        assert(buf.popLine() == "Forward");
        assert(!buf.hasLine());
    END_TEST;
}

void test_accumulated_data()
{
    TEST("accumulated data across multiple feeds")
        TestBuffer buf;
        buf.feed("Forw");
        assert(!buf.hasLine());
        buf.feed("ard\n");
        assert(buf.hasLine());
        assert(buf.popLine() == "Forward");
    END_TEST;
}

void test_large_message()
{
    TEST("large message exceeding typical buffer")
        TestBuffer buf;
        std::string large(10000, 'x');
        buf.feed(large + "\n");
        assert(buf.hasLine());
        std::string line = buf.popLine();
        assert(line.size() == 10000);
        assert(line == large);
    END_TEST;
}

void test_empty_string()
{
    TEST("empty string in buffer")
        TestBuffer buf;
        buf.feed("\n");
        assert(buf.hasLine());
        assert(buf.popLine() == "");
    END_TEST;
}

void test_fragmented_4k_message()
{
    TEST("4KB message arriving in 2 fragments")
        TestBuffer buf;
        std::string large(4096, 'a');
        buf.feed(large.substr(0, 2000));
        assert(!buf.hasLine());
        buf.feed(large.substr(2000) + "\n");
        assert(buf.hasLine());
        std::string line = buf.popLine();
        assert(line.size() == 4096);
        assert(line == large);
    END_TEST;
}

void test_fragmented_10k_message()
{
    TEST("10KB message arriving in 3 fragments")
        TestBuffer buf;
        std::string large(10000, 'b');
        buf.feed(large.substr(0, 3000));
        assert(!buf.hasLine());
        buf.feed(large.substr(3000, 4000));
        assert(!buf.hasLine());
        buf.feed(large.substr(7000) + "\n");
        assert(buf.hasLine());
        std::string line = buf.popLine();
        assert(line.size() == 10000);
        assert(line == large);
    END_TEST;
}

void test_multiple_messages_fragmented()
{
    TEST("multiple messages fragmented across boundaries")
        TestBuffer buf;
        buf.feed("Forw");
        buf.feed("ard\nLe");
        assert(buf.hasLine());
        assert(buf.popLine() == "Forward");
        buf.feed("ft\nRigh");
        assert(buf.hasLine());
        assert(buf.popLine() == "Left");
        buf.feed("t\n");
        assert(buf.hasLine());
        assert(buf.popLine() == "Right");
        assert(!buf.hasLine());
    END_TEST;
}

void test_fragmented_newline_in_middle()
{
    TEST("newline character in middle of a fragment")
        TestBuffer buf;
        buf.feed("First\nSeco");
        assert(buf.hasLine());
        assert(buf.popLine() == "First");
        buf.feed("nd\n");
        assert(buf.hasLine());
        assert(buf.popLine() == "Second");
    END_TEST;
}

void test_many_small_fragments()
{
    TEST("message rebuilt from many tiny fragments")
        TestBuffer buf;
        std::string expected = "Take linemate";
        for (char c : expected) {
            assert(!buf.hasLine());
            buf.feed(std::string(1, c));
        }
        assert(!buf.hasLine());
        buf.feed("\n");
        assert(buf.hasLine());
        assert(buf.popLine() == expected);
    END_TEST;
}

void test_alternating_reads_and_writes()
{
    TEST("interleaved pop and feed with fragments")
        TestBuffer buf;
        buf.feed("ABC\nDE");
        assert(buf.hasLine());
        assert(buf.popLine() == "ABC");
        buf.feed("F\nGHI\n");
        assert(buf.hasLine());
        assert(buf.popLine() == "DEF");
        assert(buf.hasLine());
        assert(buf.popLine() == "GHI");
        assert(!buf.hasLine());
    END_TEST;
}

int main()
{
    std::cout << "Buffer Tests" << std::endl;
    std::cout << "============" << std::endl;

    test_empty_buffer();
    test_single_line();
    test_multiple_lines();
    test_partial_line();
    test_line_with_crlf();
    test_accumulated_data();
    test_large_message();
    test_empty_string();
    test_fragmented_4k_message();
    test_fragmented_10k_message();
    test_multiple_messages_fragmented();
    test_fragmented_newline_in_middle();
    test_many_small_fragments();
    test_alternating_reads_and_writes();

    std::cout << std::endl;
    std::cout << "Results: " << tests_passed << "/" << tests_run << " passed" << std::endl;

    return (tests_passed == tests_run) ? 0 : 1;
}
