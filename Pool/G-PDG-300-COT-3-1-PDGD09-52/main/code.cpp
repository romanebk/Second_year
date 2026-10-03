exo0

#pragma once
#include <string>
 
//DirectoryLister.hpp
class IDirectoryLister {
public:
    virtual ~IDirectoryLister() = default;
    virtual bool open(const std::string& path, bool hidden) = 0;
    virtual std::string get() = 0;
};

//DirectoryLister.cpp
#include "IDirectoryLister.hpp"
#include <dirent.h>
#include <string>

class DirectoryLister : public IDirectoryLister {
private:
    DIR* _dir;
    bool _hidden;
public:
    DirectoryLister();
    DirectoryLister(const std::string& path, bool hidden);
    ~DirectoryLister();
    DirectoryLister(const DirectoryLister&) = delete;
    DirectoryLister& operator=(const DirectoryLister&) = delete;

    bool open(const std::string& path, bool hidden) override;
    std::string get() override;
};

//DirectoryLister.cpp

DirectoryLister::DirectoryLister() : _dir(nullptr), _hidden(false) {}

DirectoryLister::DirectoryLister(const std::string& path, bool hidden) : _dir(nullptr), _hidden(false)
{
    open(path, hidden);
}

DirectoryLister::~DirectoryLister()
{
    if (_dir)
        closedir(_dir);
}

bool DirectoryLister::open(const std::string& path, bool hidden)
{
    if (_dir)
        closedir(_dir);
    _hidden = hidden;
    _dir = opendir(path.c_str());
    if (!_dir)
    {
        perror(path.c_str());
        return false;
    }
    return true;
}

std::string DirectoryLister::get()
{
    if (!_dir)
        return "";
    struct dirent* entry;
    while ((entry = readdir(_dir)) != nullptr)
    {
        std::string name = entry->d_name;
        if (_hidden || name[0] != '.')
            return name;
    }
    return "";
}


//exo1

//SafeDirectoryLister.hpp
class IDirectoryLister {
public:
    class OpenFailureException : public std::exception {
    public:
        OpenFailureException(const std::string& msg) : _msg(msg) {}
        const char* what() const noexcept override { return _msg.c_str(); }
    private:
        std::string _msg;
    };
    
    class NoMoreFileException : public std::exception {
    public:
        const char* what() const noexcept override { return "End of stream"; }
    };
    // ... reste ...
};