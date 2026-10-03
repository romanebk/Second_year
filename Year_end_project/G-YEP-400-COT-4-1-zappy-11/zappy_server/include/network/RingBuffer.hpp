#ifndef RINGBUFFER_HPP_
#define RINGBUFFER_HPP_

#include <string>
#include <cstddef>

class RingBuffer {
    public:
        explicit RingBuffer(size_t ) {}
        ~RingBuffer() = default;

        RingBuffer(const RingBuffer &) = delete;
        RingBuffer &operator=(const RingBuffer &) = delete;
        RingBuffer(RingBuffer &&) = default;
        RingBuffer &operator=(RingBuffer &&) = default;

        ssize_t readFromFd(int fd);
        ssize_t writeToFd(int fd);
        bool push(const char *data, size_t len);
        bool push(const std::string &data);

        bool hasLine() const;
        std::string popLine();

        bool hasData() const { return !_buffer.empty(); }
        bool isFull() const { return false; }
        size_t size() const { return _buffer.size(); }
        size_t available() const { return 0; }
        size_t capacity() const { return 0; }

        void clear() { _buffer.clear(); }

    private:
        std::string _buffer;
};

#endif
