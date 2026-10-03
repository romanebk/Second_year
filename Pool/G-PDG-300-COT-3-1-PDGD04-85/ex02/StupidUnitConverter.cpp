/*
** EPITECH PROJECT, 2026
** function
** File description:
** Display function
*/

#include <iostream>
#include <fstream>
#include <iomanip>


double celsiusToFahrenheit(double celsius)
{
    return (celsius * 9.0 / 5.0) + 32.0;
}

double fahrenheitToCelsius(double fahrenheit)
{
    return (fahrenheit - 32.0) * 5.0 / 9.0;
}

void StupidUnitConverter()
{
    double temperature;
    std::string scale;

    std::string str_temp;
    std::string input;
    while  (std::getline(std::cin, input)) {
        std::istringstream(input) >> str_temp >> scale;
        temperature = std::stof(str_temp);
        if (scale == "Celsius") {
            std::cout << std::setw(16) << std::fixed << std::setprecision(3) << celsiusToFahrenheit(temperature) << std::setw(16) << " Fahrenheit" << std::endl;
        } else if (scale == "Fahrenheit") {
            std::cout << std::setw(16) << std::fixed << std::setprecision(3) << fahrenheitToCelsius(temperature) << std::setw(16) << " Celsius" << std::endl;
        } else {
            std::cout << "Invalid scale" << std::endl;
        }
    }
}

int main()
{
    StupidUnitConverter();
}