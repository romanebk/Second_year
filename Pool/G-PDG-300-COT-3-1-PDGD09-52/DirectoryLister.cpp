/*
** EPITECH PROJECT, 2025
** DirectoryLister.hpp
** File description:
** DirectoryLister
*/

#include "DirectoryLister.hpp"
#include <iostream>
#include <cerrno>
#include <cstring>

DirectoryLister::DirectoryLister() : _dir(nullptr), _hidden(false) {}

DirectoryLister::DirectoryLister(const std::string& path, bool hidden) : _dir(nullptr), _hidden(false)
{
    open(path, hidden);
}

DirectoryLister::~DirectoryLister()
{
    if (_dir != nullptr)
        closedir(_dir);
}

bool DirectoryLister::open(const std::string& path, bool hidden)
{
    if (_dir != nullptr)
        closedir(_dir);
    _hidden = hidden;
    _dir = opendir(path.c_str());
    if (_dir == nullptr) {
        perror(path.c_str());
        return false;
    }
    return true;
}

std::string DirectoryLister::get()
{
    if (_dir == nullptr)
        return "";
    struct dirent* entry;
    while ((entry = readdir(_dir)) != nullptr) {
        if (_hidden == false && entry->d_name[0] == '.')
            continue;
        return entry->d_name;
    }
    return "";
}

