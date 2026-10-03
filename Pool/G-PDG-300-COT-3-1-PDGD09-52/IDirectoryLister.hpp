/*
** EPITECH PROJECT, 2025
** IDirectoryLister.hpp
** File description:
** IDirectoryLister
*/

#ifndef IDIRECTORYLISTER_HPP
#define IDIRECTORYLISTER_HPP

#include <string>
#include <iostream>
#include <cstring>
#include <cerrno>
#include <dirent.h>

class IDirectoryLister {
    public:
        virtual ~IDirectoryLister() = default;
        virtual bool open(const std::string& path, bool hidden) = 0;
        virtual std::string get() = 0;

    class OpenFailureException : public std::exception {
        public:
            const char* what() const  throw();
    };

    class NoMoreFileException : public std::exception {
        public:
            const char* what() const throw();
    };
};

#endif
