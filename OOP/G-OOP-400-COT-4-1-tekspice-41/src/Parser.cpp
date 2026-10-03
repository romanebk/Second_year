/*
** EPITECH PROJECT, 2026
** Parser.cpp
** File description:
** Parser implementation for .nts files
*/

#include "Parser.hpp"
#include "Circuit.hpp"
#include "ComponentFactory.hpp"

nts::Circuit &nts::Parser::getCircuit()
{
    return _circuit;
}

int nts::Parser::check_pin_is_valid(std::string pin_str)
{
    if (pin_str.empty() == true)
        return 1;
    for (size_t i = 0; i < pin_str.length(); i++) {
        if (pin_str[i] >= '0' && pin_str[i] <= '9') {}
        else
            return 1;
    }
    return 0;
}

std::string nts::Parser::cleanLine(std::string line)
{
    size_t commentPos = line.find('#');
    if (commentPos != std::string::npos)
        line = line.substr(0, commentPos);
    std::istringstream cut_words(line);
    std::string word = "";
    std::string result = "";
    while (cut_words >> word) {
        if (result.empty() == false)
            result += ' ';
        result += word;
    }
    return result;
}

void nts::Parser::Chipset_parser(const std::string& line)
{
    std::stringstream ss(line);
    std::string type, name;

    if (!(ss >> type >> name))
        throw handle_Error("Erreur syntaxe chipset: " + line);
    if (std::find(_chipsetNames.begin(), _chipsetNames.end(), name) != _chipsetNames.end())
        throw handle_Error("Erreur: le composant est déclaré plusieurs fois: " + name);
    auto newComponent = _factory.createComponent(type);
    _circuit.addComponent(name, std::move(newComponent));
    _chipsetNames.push_back(name);
}

void nts::Parser::Link_parser(const std::string& line, int *cout_line_after_link)
{
    if (line.empty() == false)
        (*cout_line_after_link)++;
    std::stringstream ss(line);
    std::string part1, part2;
    if (!(ss >> part1 >> part2))
        throw handle_Error("Erreur syntaxe link: " + line);
    size_t pos1 = part1.find(':');
    size_t pos2 = part2.find(':');
    if (pos1 == std::string::npos || pos2 == std::string::npos)
        throw handle_Error("Erreur de syntaxe pour les links (format exigé name:pin): " + line);
    std::string name1 = part1.substr(0, pos1);
    std::string pin1 = part1.substr(pos1 + 1);
    if (check_pin_is_valid(pin1) == 1)
        throw handle_Error("Ce pin n'est pas un entier.");
    std::string name2 = part2.substr(0, pos2);
    std::string pin2 = part2.substr(pos2 + 1);
    if (check_pin_is_valid(pin2) == 1)
        throw handle_Error("Ce pin n'est pas un entier.");

    bool name1_target = false;
    bool name2_target = false;
    for (const auto& name : _chipsetNames) {
        if (name == name1)
            name1_target = true;
        if (name == name2)
            name2_target = true;
    }
    if (name1_target == false)
        throw handle_Error("Unknow component name '" + name1 + "'.");
    if (name2_target == false)
        throw handle_Error("Unknow component name '" + name2 + "'.");
    
    IComponent &comp1 = _circuit.getComponent(name1);
    IComponent &comp2 = _circuit.getComponent(name2);

    try {
        size_t pin1_num = std::stoul(pin1);
        size_t pin2_num = std::stoul(pin2);
        comp1.setLink(pin1_num, comp2, pin2_num);
        comp2.setLink(pin2_num, comp1, pin1_num);
    } catch (const std::exception& e) {
        throw handle_Error("Erreur de conversion des pins: " + std::string(e.what()));
    }
}

void nts::Parser::parse_File(const std::string& filename)
{
    if (filename.size() < 5 || filename.substr(filename.size() - 4) != ".nts")
        throw handle_Error("Erreur: le fichier doit avoir l'extension .nts");
    
    if (isBinary(filename))
        throw handle_Error("Erreur: le fichier est binaire et ne peut être parsé: " + filename);
    
    std::ifstream file(filename);   
    if (!file.is_open())
        throw handle_Error("Impossible d'ouvrir ce fichier: " + filename);
    if (std::filesystem::exists(filename) && std::filesystem::is_empty(filename) == true) {
        file.close();
        throw handle_Error("Erreur: le fichier est vide: " + filename);
    }

    _inLinksSection = false;
    _chipsetNames.clear();
    std::string line;
    int cout_line_after_link = 0;
    while (std::getline(file, line)) {
        line = cleanLine(line);
        if (line.empty() == true)
            continue;
        if (line == ".chipsets:") {
            _chipsetExist = true;
            _inLinksSection = false;
            continue;
        }
        if (line == ".links:") {
            _linktExist = true;
            _inLinksSection = true;
            continue;
        }
        if (_inLinksSection == false)
            Chipset_parser(line);
        else
            Link_parser(line, &cout_line_after_link);
    }
    if (_chipsetExist == false)
        throw handle_Error("Chipset doesn't exist");
    if (_linktExist == false)
        throw handle_Error("Link doesn't exist");
    if (cout_line_after_link == 0)
        throw handle_Error("Link no dey");
    file.close();
}

bool nts::Parser::isBinary(const std::string& path)
{
    std::ifstream file(path, std::ios::binary);
    if (!file.is_open())
        return false;
    char buffer[1024];
    file.read(buffer, sizeof(buffer));
    for (int i = 0; i < file.gcount(); i++) {
        if (buffer[i] == '\0') {
            file.close();
            return true;
        }
    }
    file.close();
    return false;
}
