/*
** EPITECH PROJECT, 2024
** HostnameModule.cpp
** File description:
** HostnameModule.cpp
*/

#include "../include/Module/HostnameModule.hpp"
#include <unistd.h>
#include <pwd.h>
#include <sys/utsname.h>
#include <iostream>

HostnameModule::HostnameModule()
{
    char hostname[1024];
    hostname[1023] = '\0';
    gethostname(hostname, 1023);
    _hostname = std::string(hostname);

    struct passwd *pw;
    uid_t uid;
    uid = geteuid();
    pw = getpwuid(uid);
    if (pw) {
        _username = std::string(pw->pw_name);
    } else {
        _username = "Unknown";
    }
}

HostnameModule::~HostnameModule()
{
}

void HostnameModule::update()
{
}


std::string HostnameModule::getName() const
{
    return "Hostname/User";
}

std::vector<std::string> HostnameModule::getData() const
{
    std::vector<std::string> data;
    data.push_back("Hostname: " + _hostname);
    data.push_back("User: " + _username);
    return data;
}
