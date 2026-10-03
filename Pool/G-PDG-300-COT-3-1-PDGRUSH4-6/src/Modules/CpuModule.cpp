/*
** EPITECH PROJECT, 2024
** CpuModule.cpp
** File description:
** CpuModule.cpp
*/

#include "../include/Module/CpuModule.hpp"
#include <fstream>
#include <sstream>
#include <unistd.h>
#include <iomanip>

CpuModule::CpuModule()
{
    _model = getInfoFromFile("/proc/cpuinfo", "model name");
    _freq = getInfoFromFile("/proc/cpuinfo", "cpu MHz");
    _cores = sysconf(_SC_NPROCESSORS_ONLN);
    _prevCpuStats = getCpuSnapshots();
    update();
}

CpuModule::~CpuModule()
{
}

std::string CpuModule::getInfoFromFile(const std::string& path, const std::string& key) const
{
    std::ifstream file(path);
    std::string line;
    while (std::getline(file, line)) {
        if (line.find(key) != std::string::npos) {
            size_t separatorPos = line.find(':');
            if (separatorPos != std::string::npos) {
                std::string value = line.substr(separatorPos + 1);
                value.erase(0, value.find_first_not_of(" \t"));
                return value;
            }
        }
    }
    return "Unknown";
}

std::vector<CpuTime> CpuModule::getCpuSnapshots() const
{
    std::vector<CpuTime> snapshots;
    std::ifstream file("/proc/stat");
    std::string line;
    while (std::getline(file, line)) {
        if (line.compare(0, 3, "cpu") == 0 && line[3] != ' ') {
            std::stringstream ss(line);
            std::string label;
            CpuTime t;
            ss >> label >> t.user >> t.nice >> t.system >> t.idle >> t.iowait >> t.irq >> t.softirq >> t.steal;
            snapshots.push_back(t);
        }
    }
    return snapshots;
}

void CpuModule::calculateCpuLoad()
{
    auto currentStats = getCpuSnapshots();
    _load.clear();
    
    if (_prevCpuStats.empty() || _prevCpuStats.size() != currentStats.size()) {
        _prevCpuStats = currentStats;
        for (size_t i = 0; i < currentStats.size(); ++i) {
             _load.push_back("Core " + std::to_string(i) + ": 0.0%");
        }
        return;
    }

    for (size_t i = 0; i < currentStats.size(); ++i) {
        long totalDiff = currentStats[i].getTotal() - _prevCpuStats[i].getTotal();
        long idleDiff = currentStats[i].getIdle() - _prevCpuStats[i].getIdle();
        if (totalDiff == 0) {
             _load.push_back("Core " + std::to_string(i) + ": 0.0%");
             continue;
        }
        double load = 100.0 * (totalDiff - idleDiff) / totalDiff;
        std::stringstream ss;
        ss << "Core " << i << ": " << std::fixed << std::setprecision(1) << (load < 0 ? 0 : load) << "%";
        _load.push_back(ss.str());
    }
    _prevCpuStats = currentStats;
}

void CpuModule::update()
{
    _freq = getInfoFromFile("/proc/cpuinfo", "cpu MHz");
    calculateCpuLoad();
}

std::string CpuModule::getName() const
{
    return "CPU";
}

std::vector<std::string> CpuModule::getData() const
{
    std::vector<std::string> data;
    data.push_back("Model: " + _model);
    data.push_back("Cores: " + std::to_string(_cores));
    data.push_back("Freq: " + _freq + " MHz");
    data.push_back("--- Load ---");
    for (const auto& l : _load) {
        data.push_back(l);
    }
    return data;
}
