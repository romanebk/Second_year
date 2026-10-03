#pragma once

#include <fstream>
#include <string>

#include "sync/Mutex.hpp"

class Logger {
public:
    static Logger& get();

    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;

    void log(const std::string& level, const std::string& msg);

    void info(const std::string& msg);
    void warn(const std::string& msg);
    void error(const std::string& msg);
    void order(const std::string& msg);
    void ready(const std::string& msg);
    void kitchen(const std::string& msg);

private:
    explicit Logger(const std::string& filename);
    ~Logger();

    static std::string timestamp();

    std::ofstream _file;
    Mutex _mutex;
};