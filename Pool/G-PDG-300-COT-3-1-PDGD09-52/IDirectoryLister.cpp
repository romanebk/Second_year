/*
** EPITECH PROJECT, 2025
** IDirectoryLister.hpp
** File description:
** IDirectoryLister
*/

#include "IDirectoryLister.hpp"

const char* IDirectoryLister::OpenFailureException::what() const throw()
{
    return strerror(errno);
}

const char* IDirectoryLister::NoMoreFileException::what() const throw()
{
    return "End of stream";
}
