/*
** EPITECH PROJECT, 2026
** function
** File description:
** Display function
*/

#include <iostream>
#include <fstream>

int MyCat(const std::string& filename)
{
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "MyCat: " << filename << ": No such file or directory" << std::endl;
        return 84;
    }
    std::string line;
    while (std::getline(file, line)) {
        std::cout << line << std::endl;
    }
    file.close();
    return 0;
}

int main(int argc, char **argv)
{
    int i = 1;
    
    if (argc == 1) {
        std::string input;
        while (std::getline(std::cin, input)) {
            std::cout << input << std::endl;
        }
        return 0;
    }
    while (i < argc) {
        if (MyCat(argv[i]) == 84) {
            return 84;
        }
        i++;
    }
    return 0;
}
