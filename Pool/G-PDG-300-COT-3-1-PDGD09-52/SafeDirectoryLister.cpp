/*
** EPITECH PROJECT, 2025
** SafeDirectoryLister.cpp
** File description:
** SafeDirectoryLister
*/

#include "SafeDirectoryLister.hpp"
#include "DirectoryLister.hpp"
#include <iostream>
#include "IDirectoryLister.hpp"
#include <cerrno>
#include <cstring>

SafeDirectoryLister::SafeDirectoryLister() : _dir(nullptr), _hidden(false) {}

SafeDirectoryLister::SafeDirectoryLister(const std::string& path, bool hidden) : _dir(nullptr), _hidden(false)
{
    open(path, hidden);
}

SafeDirectoryLister::~SafeDirectoryLister()
{
    if (_dir != nullptr)
        closedir(_dir);
}

bool SafeDirectoryLister::open(const std::string& path, bool hidden)
{
    if (_dir != nullptr)
        closedir(_dir);
    _hidden = hidden;
    _dir = opendir(path.c_str());
    if (_dir == nullptr) {
        throw IDirectoryLister::OpenFailureException();
    }
    return true;
}

std::string SafeDirectoryLister::get()
{
    if (_dir == nullptr)
        throw IDirectoryLister::NoMoreFileException();
    struct dirent* entry;
    while ((entry = readdir(_dir)) != nullptr) {
        if (_hidden == false && entry->d_name[0] == '.')
            continue;
        return entry->d_name;
    }
    throw IDirectoryLister::NoMoreFileException();
}

