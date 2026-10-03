/*
** EPITECH PROJECT, 2026
** Parser.hpp
** File description:
** Parser for .nts (nanotekspice) configuration files
*/

#ifndef PARSER_HPP
#define PARSER_HPP

#include <string>
#include <algorithm>
#include <fstream>
#include <iostream>
#include <filesystem>
#include <sstream>
#include <vector>
#include <exception>
#include "Circuit.hpp"
#include "ComponentFactory.hpp"
#include "Error.hpp"

namespace nts {

class Parser {
    public:
        void parse_File(const std::string& filename);
        int check_pin_is_valid(std::string pin_str);
        std::string cleanLine(std::string line);
        void Chipset_parser(const std::string& line);
        void Link_parser(const std::string& line, int *cout_line_after_link);
        Circuit &getCircuit();
        bool isBinary(const std::string& filename);

    private:
        bool _inLinksSection = false;
        bool _chipsetExist = false;
        bool _linktExist = false;
        std::vector<std::string> _chipsetNames;
        Circuit _circuit;
        ComponentFactory _factory;
};

}

#endif
