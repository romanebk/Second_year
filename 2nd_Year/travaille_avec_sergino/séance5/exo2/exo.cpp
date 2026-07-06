#include "exo.hpp"

template<typename T>
Stack<T>::Stack() {}

template<typename T>
Stack<T>::~Stack() {}

template<typename T>
void Stack<T>::push(T value)
{
    elem.push(value);
}

template<typename T>
T Stack<T>::pop()
{
    T value = elem.top();
    elem.pop();
    return value;
}

template<typename T>
T Stack<T>::top()
{
    return elem.top();
}

template<typename T>
bool Stack<T>::empty()
{
    return elem.empty();
}

template<typename T>
int Stack<T>::size()
{
    return elem.size();
}

int main() {
    Stack<int> stack;
    stack.push(1);
    stack.push(2);
    stack.push(3);
    std::cout << "Top: " << stack.top() << std::endl;
    stack.pop();
    std::cout << "Top: " << stack.top() << std::endl;
    stack.pop();
    std::cout << "Top: " << stack.top() << std::endl;
    stack.pop();
    std::cout << "Est-ce vide? " << stack.empty() << std::endl;
    std::cout << "Taille: " << stack.size() << std::endl;
    return 0;
}