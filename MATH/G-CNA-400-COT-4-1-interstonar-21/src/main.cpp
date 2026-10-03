#include "../include/errors.hpp"
#include "../include/global_sim.hpp"
#include "../include/help.hpp"
#include "../include/local_sim.hpp"
#include "../include/parser.hpp"
#include <algorithm>
#include <string>
#include <vector>

int main(int argc, char **argv)
{
    using namespace interstonar;
    std::vector<std::string> args(argv, argv + argc);
    if (std::find(args.begin(), args.end(), "--help") != args.end()) {
        print_help_and_exit();
    }
    if (argc < 8) {
        exit_with_error("Invalid arguments. Use --help for usage information.");
    }

    std::string mode = args[1];
    std::string config_file = args[2];
    double delta_time = 1.0;
    int arg_offset = 3;

    if (mode == "--global") {
        if (argc > 3) {
            if (args[3] == "-d") {
                if (argc < 10) {
                    exit_with_error("Missing delta value after -d.");
                }
                delta_time = parse_number(args[4]);
                arg_offset = 5;
            } else if (args[3].rfind("--delta=", 0) == 0) {
                delta_time = parse_number(args[3].substr(8));
                arg_offset = 4;
            }
        }
        if (delta_time <= 0.0) {
            exit_with_error("Delta time must be strictly positive.");
        }
    } else if (mode == "--local") {
        if (args[3] == "-d" || args[3].rfind("--delta=", 0) == 0) {
            exit_with_error("Delta options are only supported in --global mode.");
        }
    } else {
        exit_with_error("Invalid mode. Use --global or --local.");
    }

    if (argc < arg_offset + 6) {
        exit_with_error("Missing required coordinates or velocity vectors.");
    }
    if (argc > arg_offset + 6) {
        exit_with_error("Too many arguments. Use --help for usage information.");
    }

    Vec3 rock_pos{
        parse_number(args[arg_offset]),
        parse_number(args[arg_offset + 1]),
        parse_number(args[arg_offset + 2])
    };
    Vec3 rock_vel{
        parse_number(args[arg_offset + 3]),
        parse_number(args[arg_offset + 4]),
        parse_number(args[arg_offset + 5])
    };

    if (mode == "--global") {
        simulate_global(parse_global_config(config_file), rock_pos, rock_vel, delta_time);
    } else {
        simulate_local(parse_local_config(config_file), rock_pos, rock_vel);
    }
    return 0;
}
