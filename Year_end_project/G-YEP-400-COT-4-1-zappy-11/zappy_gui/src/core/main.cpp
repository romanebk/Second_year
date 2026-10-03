#include <thread>
#include <atomic>
#include <iostream>
#include <filesystem>
#include <cerrno>
#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <poll.h>
#include <unistd.h>
#include "SharedState.hpp"
#include "ThemeMode.hpp"
#include "NetworkThread.hpp"
#include "RenderThread.hpp"
#include "MenuScreen.hpp"
#include "HomeScreen.hpp"
#include "LoadingScreen.hpp"
#include "BackgroundMusic.hpp"




static void resolveAssetsRoot(const char *argv0)
{
    try {
        std::filesystem::path exeDir =
            std::filesystem::canonical(argv0).parent_path();
        std::filesystem::path root = exeDir;
        for (std::filesystem::path p = exeDir; ; p = p.parent_path()) {
            if (std::filesystem::exists(p / "assets")) { root = p; break; }
            if (p == p.parent_path()) break; 
        }
        std::filesystem::current_path(root);
        std::cout << "[Zappy] CWD -> " << root << "\n";
    } catch (const std::exception &e) {
        std::cerr << "[Zappy] resolution assets impossible: " << e.what() << "\n";
    }
}

int main(int argc, char **argv)
{
    resolveAssetsRoot(argv[0]);

    BackgroundMusic bgm;
    if (bgm.load())
        BackgroundMusic::setActive(&bgm);

    int port = 4242;
    std::string host = "localhost";
    std::string errorMsg;

    for (int i = 1; i < argc; i++)
    {
        if (std::string(argv[i]) == "-p" && i + 1 < argc)
        {
            const char *val = argv[++i];
            char *end = nullptr;
            long p = std::strtol(val, &end, 10);
            if (end == val || *end != '\0' || p <= 0 || p > 65535)
                errorMsg = std::string("Port invalide: ") + val;
            else
                port = static_cast<int>(p);
        }
        else if (std::string(argv[i]) == "-h" && i + 1 < argc)
        {
            const char *val = argv[++i];
            bool valid = true;
            std::string s(val);
            if (s == "localhost") {
                host = s;
                continue;
            }
            int dots = 0;
            for (size_t j = 0; val[j] && valid; j++) {
                if (val[j] == '.') {
                    dots++;
                } else if (!std::isdigit(static_cast<unsigned char>(val[j]))) {
                    valid = false;
                }
            }
            if (valid && dots == 3) {
                unsigned a, b, c, d;
                if (std::sscanf(val, "%u.%u.%u.%u", &a, &b, &c, &d) == 4 &&
                    a <= 255 && b <= 255 && c <= 255 && d <= 255)
                    host = s;
                else
                    valid = false;
            } else {
                valid = false;
            }
            if (!valid)
                errorMsg = std::string("Adresse IP invalide: '") + s + "'";
        }
    }

    if (!errorMsg.empty()) {
        std::cerr << "Erreur: " << errorMsg << std::endl;
        bgm.stop();
        return 84;
    }

    HomeScreen home(host, std::to_string(port));
    HomeResult result = home.run();
    if (result.quit) {
        bgm.stop();
        return 0;
    }

    host = result.ip;
    port = result.port;

    MenuScreen menu;
    bool restart = true;

    while (restart) {
        restart = false;

        ThemeMode theme = menu.run();

        SharedState shared;

        NetworkThread netThread(host, port, shared);
        RenderThread renderThread(shared, theme, &netThread.getQueue(),
                                  [&restart, &bgm]() { bgm.stop(); restart = true; });

        std::atomic<bool> shuttingDown{false};
        auto requestShutdown = [&]() {
            bool expected = false;
            if (shuttingDown.compare_exchange_strong(expected, true))
                std::cout << "[Zappy] Arret en cours...\n";
            netThread.stop();
            renderThread.stop();
        };

        std::thread net([&]() {
            netThread.run();
            requestShutdown();
        });

        LoadingScreen loading;
        bool loadedOk = loading.run(shared);
        if (!loadedOk) {
            requestShutdown();
            net.join();
            bgm.stop();
            std::cout << "[Zappy] Chargement annule, au revoir !\n";
            return 0;
        }

        if (bgm.isLoaded())
            bgm.play(0.4f);

        std::thread render([&]() {
            renderThread.run();
            requestShutdown();
        });

        std::thread input;
        if (isatty(STDIN_FILENO)) {
            input = std::thread([&]() {
                while (!shuttingDown.load()) {
                    struct pollfd pfd;
                    pfd.fd      = STDIN_FILENO;
                    pfd.events  = POLLIN;
                    pfd.revents = 0;

                    int r = poll(&pfd, 1, 200);
                    if (r < 0) {
                        if (errno == EINTR) continue;
                        break;
                    }
                    if (r == 0) continue;

                    if (pfd.revents & (POLLIN | POLLHUP | POLLERR | POLLNVAL)) {
                        char buf[512];
                        ssize_t n = read(STDIN_FILENO, buf, sizeof(buf));
                        if (n <= 0) {
                            std::cout << "\n[Zappy] Ctrl+D detecte — extinction propre.\n";
                            requestShutdown();
                            break;
                        }
                    }
                }
            });
        }

        net.join();
        render.join();

        shuttingDown.store(true);
        if (input.joinable())
            input.join();
    }

    std::cout << "[Zappy] Extinction propre, au revoir !\n";
    bgm.stop();
    return 0;
}
