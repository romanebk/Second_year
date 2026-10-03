/*
** EPITECH PROJECT, 2025
** DirectoryLister.hpp
** File description:
** DirectoryLister
*/

#ifndef DIRECTORYLISTER_HPP
#define DIRECTORYLISTER_HPP

#include "IDirectoryLister.hpp"
#include <dirent.h>

class DirectoryLister : public IDirectoryLister {
private:
    DIR* _dir;
    bool _hidden;
public:
    DirectoryLister();
    DirectoryLister(const std::string& path, bool hidden);
    ~DirectoryLister();
    bool open(const std::string& path, bool hidden) override;
    std::string get() override;
};

#endif
