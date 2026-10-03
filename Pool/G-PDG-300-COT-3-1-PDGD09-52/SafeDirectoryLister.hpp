/*
** EPITECH PROJECT, 2025
** SafeDirectoryLister.hpp
** File description:
** SafeDirectoryLister
*/

#ifndef SAFEDIRECTORYLISTER_HPP
#define SAFEDIRECTORYLISTER_HPP

#include <string>
#include <dirent.h>
#include <exception>
#include "IDirectoryLister.hpp"

class SafeDirectoryLister : public IDirectoryLister {
    private:
        DIR* _dir;
        bool _hidden;
    public:
        SafeDirectoryLister();
        SafeDirectoryLister(const std::string& path, bool hidden);
        ~SafeDirectoryLister();
        bool open(const std::string& path, bool hidden);
        std::string get();
};

#endif
