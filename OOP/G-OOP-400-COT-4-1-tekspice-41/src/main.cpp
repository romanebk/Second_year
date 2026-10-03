/*
** EPITECH PROJECT, 2024
** main.cpp
** File description:
** Main function for nanotekspice
*/

#include <iostream>
#include <string>
#include "Circuit.hpp"
#include "Parser.hpp"
#include <csignal>

static volatile sig_atomic_t keep_running = 1;

static void signal_handler(int sig)
{
    (void)sig;
    keep_running = 0;
}

int main(int argc, char** argv)
{
    if (argc != 2) {
        std::cerr << "Usage:  ./nanotekspice <file.nts>" << std::endl;
        return 84;
    }
    try {
        nts::Parser parser;
        parser.parse_File(argv[1]);
        nts::Circuit &circuit = parser.getCircuit();

        std::string line;
        std::size_t tick = 0;

        std::cout << "> ";
        while (std::getline(std::cin, line)) {
            if (line == "exit")
                break;
            if (line.empty()) {
                std::cout << "> ";
                continue;
            }
            if (line == "simulate") {
                tick++;
                circuit.simulate(tick);
            } else if (line == "display") {
                circuit.display(tick);
            } else if (line == "loop") {
                keep_running = 1;
                signal(SIGINT, signal_handler);
                while (keep_running) {
                    tick++;
                    circuit.simulate(tick);
                    circuit.display(tick);
                }
                signal(SIGINT, SIG_DFL);
            } else if (line.find('=') != std::string::npos) {
                size_t pos = line.find('=');
                std::string name = line.substr(0, pos);
                std::string val = line.substr(pos + 1);
                if (val != "U" && val != "1" && val != "0") {
                    std::cerr << "Valeur invalide: " << val << std::endl;
                    return 84;
                }
                try {
                    circuit.setInputValue(name, val);
                } catch (const std::exception& e) {
                    std::cerr << e.what() << std::endl;
                }
            } else {
                std::cerr << "Commande inconnue: " << line << std::endl;
                return 84;
            }
            std::cout << "> ";
        }

    } catch (const nts::handle_Error& e) {
        std::cerr << e.what() << std::endl;
        return 84;
    }
    return 0;
}