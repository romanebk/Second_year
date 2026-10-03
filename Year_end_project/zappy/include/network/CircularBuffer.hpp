#ifndef CIRCULARBUFFER_HPP_
#define CIRCULARBUFFER_HPP_

#include <vector>
#include <cstddef>
#include <cstring>

template <size_t Capacity>
class CircularBuffer {
    public:
        CircularBuffer() : _buffer(Capacity), _head(0), _tail(0), _full(false) {}

        void push(const char *data, size_t len) {
            for (size_t i = 0; i < len; i++) {
                _buffer[_head] = data[i];
                _head = (_head + 1) % Capacity;
                if (_full)
                    _tail = (_tail + 1) % Capacity;
                _full = (_head == _tail);
            }
        }

        size_t pop(char *data, size_t len) {
            size_t read = 0;
            while (read < len && size() > 0) {
                data[read++] = _buffer[_tail];
                _tail = (_tail + 1) % Capacity;
                _full = false;
            }
            return read;
        }

        size_t size() const {
            if (_full)
                return Capacity;
            return (_head >= _tail) ? (_head - _tail) : (Capacity + _head - _tail);
        }

        size_t capacity() const { return Capacity; }

        bool empty() const { return !_full && _head == _tail; }

        bool full() const { return _full; }

        void clear() {
            _head = _tail = 0;
            _full = false;
        }

        const char *data() const { return _buffer.data(); }

        size_t head() const { return _head; }
        size_t tail() const { return _tail; }

    private:
        std::vector<char> _buffer;
        size_t _head;
        size_t _tail;
        bool _full;
};

#endif
