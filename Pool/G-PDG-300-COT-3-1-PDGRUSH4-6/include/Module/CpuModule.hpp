/*
** EPITECH PROJECT, 2024
** CpuModule.hpp
** File description:
** CpuModule.hpp
*/

#ifndef CPUMODULE_HPP
#define CPUMODULE_HPP

#include "IModule.hpp"
#include <string>
#include <vector>

struct CpuTime {
    long user, nice, system, idle, iowait, irq, softirq, steal;
    long getTotal() const { return user + nice + system + idle + iowait + irq + softirq + steal; }
    long getIdle() const { return idle + iowait; }
};

class CpuModule : public Krell::IModule {
public:
    CpuModule();
    ~CpuModule();

    void update();
    std::string getName() const;
    std::vector<std::string> getData() const;

private:
    std::string _model;
    std::string _freq;
    long _cores;
    std::vector<std::string> _load;
    std::vector<CpuTime> _prevCpuStats;

    std::string getInfoFromFile(const std::string& path, const std::string& key) const;
    std::vector<CpuTime> getCpuSnapshots() const;
    void calculateCpuLoad();
};

#endif
