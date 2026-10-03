/*
** EPITECH PROJECT, 2026
** ipcmessage
** File description:
** ipcmessage
*/

#include "ipc/IpcMessage.hpp"

std::vector<std::uint8_t> buildShutdownMessage()
{
    return {static_cast<std::uint8_t>(IpcMessageKind::Shutdown)};
}

std::vector<std::uint8_t> buildPizzaMessage(const std::vector<std::uint8_t> &pizzaPayload)
{
    std::vector<std::uint8_t> msg{static_cast<std::uint8_t>(IpcMessageKind::Pizza)};
    msg.insert(msg.end(), pizzaPayload.begin(), pizzaPayload.end());
    return msg;
}

IpcMessageKind readMessageKind(const std::vector<std::uint8_t> &raw)
{
    if (raw.empty())
        return IpcMessageKind::Shutdown;
    return static_cast<IpcMessageKind>(raw[0]);
}

std::vector<std::uint8_t> extractPizzaPayload(const std::vector<std::uint8_t> &raw)
{
    if (raw.size() <= 1)
        return {};
    return std::vector<std::uint8_t>(raw.begin() + 1, raw.end());
}
