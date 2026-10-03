#include "Logger.hpp"
#include "sync/LockGuard.hpp"

#include <chrono>
#include <iomanip>
#include <sstream>
#include <iostream>

Logger& Logger::get()
{
    static Logger instance("plazza.log");
    return instance;
}

Logger::Logger(const std::string& filename)
{
    _file.open(filename, std::ios::out | std::ios::app);
    if (!_file.is_open())
        std::cerr << "[Logger] Cannot open log file: " << filename << "\n";
    info("=== Plazza session started ===");
}

Logger::~Logger()
{
    info("=== Plazza session ended ===");
}

void Logger::log(const std::string& level, const std::string& msg)
{
    std::string line = timestamp() + " [" + level + "] " + msg + "\n";
    LockGuard lock(_mutex);
    _file << line;
    _file.flush();
    std::cout << line << std::flush;
}

void Logger::info(const std::string& msg)    { log("INFO ", msg); }
void Logger::warn(const std::string& msg)    { log("WARN ", msg); }
void Logger::error(const std::string& msg)   { log("ERROR", msg); }
void Logger::order(const std::string& msg)   { log("ORDER", msg); }
void Logger::ready(const std::string& msg)   { log("READY", msg); }
void Logger::kitchen(const std::string& msg) { log("KITCH", msg); }

std::string Logger::timestamp()
{
    auto now = std::chrono::system_clock::now();
    std::time_t t = std::chrono::system_clock::to_time_t(now);
    std::tm tm{};
    localtime_r(&t, &tm);
    std::ostringstream oss;
    oss << std::put_time(&tm, "%Y-%m-%d %H:%M:%S");
    return oss.str();
}