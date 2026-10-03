/*
** EPITECH PROJECT, 2026
** ipcmessage
** File description:
** ipcmessage
*/

#ifndef IPC_MESSAGE_H
    #define IPC_MESSAGE_H

#include <cstdint>
#include <vector>

enum class IpcMessageKind : std::uint8_t {
    Pizza = 1,
    Shutdown = 2,
};

std::vector<std::uint8_t> buildShutdownMessage();
std::vector<std::uint8_t> buildPizzaMessage(const std::vector<std::uint8_t> &pizzaPayload);
IpcMessageKind readMessageKind(const std::vector<std::uint8_t> &raw);
std::vector<std::uint8_t> extractPizzaPayload(const std::vector<std::uint8_t> &raw);

#endif
