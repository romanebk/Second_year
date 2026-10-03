#include <thread>
#include <iostream>
#include "core/SharedState.hpp"
#include "core/ThemeMode.hpp"
#include "network/NetworkThread.hpp"
#include "renderer/RenderThread.hpp"
#include "menu/MenuScreen.hpp"

int main(int argc, char **argv) {
    int port = -1;
    std::string host = "localhost";

    for (int i = 1; i < argc; i++) {
        if (std::string(argv[i]) == "-p" && i + 1 < argc)
            port = std::stoi(argv[++i]);
        else if (std::string(argv[i]) == "-h" && i + 1 < argc)
            host = argv[++i];
    }
    if (port == -1) {
        std::cerr << "USAGE: ./zappy_gui -p port -h machine\n";
        return 1;
    }

    
    MenuScreen menu;
    ThemeMode theme = menu.run();

    
    SharedState shared;

    NetworkThread netThread(host, port, shared);
    RenderThread  renderThread(shared, theme);

    std::thread net([&]() { netThread.run(); });
    std::thread render([&]() { 
        renderThread.run(); 
        // Si la fenêtre est fermée, on coupe aussi le réseau
        netThread.stop();
    });

    // Thread pour écouter Ctrl+D sur l'entrée standard
    std::thread input([&]() {
        std::string line;
        while (std::getline(std::cin, line)) {
            // On ignore l'entrée, on attend juste la fin (EOF)
        }
        // Ctrl+D intercepté
        std::cout << "\n[Zappy] Ctrl+D détecté, arrêt en cours..." << std::endl;
        netThread.stop();
        renderThread.stop();
    });
    input.detach(); // On détache pour ne pas bloquer si on ferme la fenêtre

    net.join();
    renderThread.stop(); // Sécurité : on coupe le rendu si le réseau s'arrête
    render.join();

    std::cout << "[Zappy] Extinction propre, au revoir !" << std::endl;
    return 0;
}
