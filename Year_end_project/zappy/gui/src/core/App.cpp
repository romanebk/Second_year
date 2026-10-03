#include "core/App.hpp"
#include <iostream>
#include <thread>


App::App(const std::string &host, int port)
    : _netThread(host, port, _shared)
     
{}


void App::run()
{
    
    
    

    std::thread netTh([this]() {
        _netThread.run();
    });

    
    

    
    _netThread.stop();
    netTh.join();
}