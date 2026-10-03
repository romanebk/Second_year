#ifndef BUFFER_HPP
#define BUFFER_HPP

#include <string>

class Buffer
{
    public:
        Buffer() = default;
        ~Buffer() = default;

        void append(const std::string& data);
        std::string getLine();
        bool hasLine() const;
    private:
        std::string _buf;
};
#endif