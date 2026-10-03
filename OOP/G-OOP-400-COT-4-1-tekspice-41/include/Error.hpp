/*
** EPITECH PROJECT, 2026
** Error.hpp
** File description:
** Exception handling for nanotekspice
*/

#ifndef ERROR_HPP
#define ERROR_HPP

#include <string>
#include <exception>

namespace nts {

class handle_Error : public std::exception {
    public:
        handle_Error(const std::string& message);
        const char* what() const noexcept override;

    private:
        std::string _message;
};

}

#endif
