#include "exo.hpp"
#include <sstream>

Point::Point(int _x, int _y) : x(_x), y(_y) {}


std::string Point::serialize()
{
    std::ostringstream ss;
    ss << "Point(" << x << ", " << y << ")";
    return ss.str();
}
void Point::deserialize(std::string to_deserialize)
{
    size_t paren1 = to_deserialize.find('(');
    size_t comma = to_deserialize.find(',');
    size_t paren2 = to_deserialize.find(')');
    
    if (paren1 != std::string::npos && comma != std::string::npos && paren2 != std::string::npos) {
        std::string x_str = to_deserialize.substr(paren1 + 1, comma - paren1 - 1);
        std::string y_str = to_deserialize.substr(comma + 1, paren2 - comma - 1);
        
        x = std::stoi(x_str);
        y = std::stoi(y_str);
    }
}

int main()
{
    Point p(10, 20);
    std::cout << "Point initial: " << p.serialize() << std::endl;
    p.deserialize("Point(30, 40)");
    std::cout << "Point après désérialisation: " << p.serialize() << std::endl;
    return 0;
}

