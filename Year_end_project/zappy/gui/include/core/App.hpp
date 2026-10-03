#pragma once

#include "network/NetworkThread.hpp"
#include "renderer/RenderThread.hpp"
#include "core/SharedState.hpp"








class App {
public:
    App(const std::string &host, int port);
    void run();

private:
    SharedState   _shared;
    NetworkThread _netThread;
  
};