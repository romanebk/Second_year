#include "exo.hpp"

IntArray::IntArray(size_t n)
    : data(n > 0 ? new int[n]() : nullptr), size(n)
{
    std::cout << "Constructeur (size=" << size << ")" << std::endl;
}

IntArray::IntArray(const IntArray& other)
    : data(other.size > 0 ? new int[other.size] : nullptr), size(other.size)
{
    std::cout << "Copie (size=" << size << ")" << std::endl;
    for (size_t i = 0; i < size; ++i)
        data[i] = other.data[i];
}

IntArray& IntArray::operator=(const IntArray& other)
{
    std::cout << "Affectation par copie" << std::endl;
    if (this != &other)
    {
        delete[] data;
        size = other.size;
        data = size > 0 ? new int[size] : nullptr;
        for (size_t i = 0; i < size; ++i)
            data[i] = other.data[i];
    }
    return *this;
}

IntArray::IntArray(IntArray&& other) noexcept
    : data(other.data), size(other.size)
{
    std::cout << "Move (size=" << size << ")" << std::endl;
    other.data = nullptr;
    other.size = 0;
}

IntArray& IntArray::operator=(IntArray&& other) noexcept
{
    std::cout << "Affectation par move" << std::endl;
    if (this != &other)
    {
        delete[] data;
        data = other.data;
        size = other.size;
        other.data = nullptr;
        other.size = 0;
    }
    return *this;
}

IntArray::~IntArray()
{
    std::cout << "Destructeur (size=" << size << ")" << std::endl;
    delete[] data;
}

int& IntArray::operator[](size_t index)
{
    return data[index];
}

const int& IntArray::operator[](size_t index) const
{
    return data[index];
}

size_t IntArray::getSize() const
{
    return size;
}

int main()
{
    IntArray a(5);
    for (size_t i = 0; i < a.getSize(); ++i)
        a[i] = static_cast<int>(i * 10);

    std::cout << "\n--- Copie ---\n";
    IntArray b(a);

    std::cout << "\n--- Affectation par copie ---\n";
    IntArray c;
    c = a;

    std::cout << "\n--- Move ---\n";
    IntArray d(std::move(a));

    std::cout << "\n--- Affectation par move ---\n";
    IntArray e;
    e = std::move(b);

    std::cout << "\n--- Fin du programme ---\n";
    return 0;
}
