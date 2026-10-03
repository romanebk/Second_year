#include "../include/parser.hpp"
#include "../include/errors.hpp"
#include <algorithm>
#include <fstream>
#include <regex>
#include <string>
#include <unordered_map>

namespace interstonar {

static std::string trim(const std::string &s)
{
    const std::string ws = " \t\r\n";
    std::size_t start = s.find_first_not_of(ws);
    if (start == std::string::npos) {
        return "";
    }
    std::size_t end = s.find_last_not_of(ws);
    return s.substr(start, end - start + 1);
}

static std::string strip_comment(const std::string &line)
{
    bool in_quotes = false;
    for (std::size_t i = 0; i < line.size(); ++i) {
        if (line[i] == '"') {
            in_quotes = !in_quotes;
        } else if (line[i] == '#' && !in_quotes) {
            return line.substr(0, i);
        }
    }
    return line;
}

static std::string unquote(const std::string &value)
{
    std::string v = trim(value);
    if (v.size() >= 2 && v.front() == '"' && v.back() == '"') {
        return v.substr(1, v.size() - 2);
    }
    return v;
}

static std::string normalize_number_token(std::string token)
{
    token.erase(std::remove(token.begin(), token.end(), '_'), token.end());
    return token;
}

double parse_number(const std::string &token)
{
    std::string normalized = normalize_number_token(trim(token));
    std::size_t consumed = 0;
    double value = 0.0;
    try {
        value = std::stod(normalized, &consumed);
    } catch (...) {
        exit_with_error("Invalid numeric value: " + token);
    }
    if (consumed != normalized.size()) {
        exit_with_error("Invalid numeric value: " + token);
    }
    return value;
}

static Vec3 parse_inline_vec3(const std::string &value)
{
    std::smatch match_x;
    std::smatch match_y;
    std::smatch match_z;
    static const std::regex rx_x(R"(x\s*=\s*([^,}]+))");
    static const std::regex rx_y(R"(y\s*=\s*([^,}]+))");
    static const std::regex rx_z(R"(z\s*=\s*([^,}]+))");
    if (!std::regex_search(value, match_x, rx_x) ||
        !std::regex_search(value, match_y, rx_y) ||
        !std::regex_search(value, match_z, rx_z)) {
        exit_with_error("Invalid vec3 format in TOML.");
    }
    return Vec3{
        parse_number(match_x[1].str()),
        parse_number(match_y[1].str()),
        parse_number(match_z[1].str())
    };
}

static std::string to_lower(std::string s)
{
    std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return s;
}

static std::vector<std::unordered_map<std::string, std::string>> parse_body_tables(const std::string &path)
{
    std::ifstream file(path);
    if (!file) {
        exit_with_error("Error: Could not read config file.");
    }
    std::vector<std::unordered_map<std::string, std::string>> tables;
    std::unordered_map<std::string, std::string> current;
    bool in_body = false;
    std::string line;

    while (std::getline(file, line)) {
        line = trim(strip_comment(line));
        if (line.empty()) {
            continue;
        }
        if (line == "[[body]]") {
            if (in_body) {
                tables.push_back(current);
                current.clear();
            }
            in_body = true;
            continue;
        }
        if (!in_body) {
            continue;
        }
        std::size_t eq = line.find('=');
        if (eq == std::string::npos) {
            continue;
        }
        std::string key = trim(line.substr(0, eq));
        std::string value = trim(line.substr(eq + 1));
        current[key] = value;
    }
    if (in_body) {
        tables.push_back(current);
    }
    return tables;
}

std::vector<CelestialBody> parse_global_config(const std::string &path)
{
    auto tables = parse_body_tables(path);
    std::vector<CelestialBody> bodies;
    for (const auto &table : tables) {
        CelestialBody body;
        if (!table.count("name") || !table.count("position") || !table.count("direction") ||
            !table.count("mass") || !table.count("radius")) {
            exit_with_error("Error parsing global config: missing body fields.");
        }
        body.name = unquote(table.at("name"));
        body.position = parse_inline_vec3(table.at("position"));
        body.direction = parse_inline_vec3(table.at("direction"));
        body.mass = parse_number(table.at("mass"));
        body.radius = parse_number(table.at("radius"));
        bodies.push_back(body);
    }
    if (bodies.empty()) {
        exit_with_error("Error parsing global config: no body found.");
    }
    return bodies;
}

std::vector<LocalBody> parse_local_config(const std::string &path)
{
    auto tables = parse_body_tables(path);
    std::vector<LocalBody> bodies;
    for (const auto &table : tables) {
        if (!table.count("type") || !table.count("position")) {
            exit_with_error("Error parsing local config: missing body fields.");
        }
        LocalBody body;
        if (table.count("name")) {
            body.name = unquote(table.at("name"));
            body.has_name = true;
        }
        body.body_type = to_lower(unquote(table.at("type")));
        body.position = parse_inline_vec3(table.at("position"));
        if (table.count("radius")) {
            body.has_radius = true;
            body.radius = parse_number(table.at("radius"));
        }
        if (table.count("height")) {
            body.has_height = true;
            body.height = parse_number(table.at("height"));
        }
        if (table.count("sides")) {
            body.has_sides = true;
            body.sides = parse_inline_vec3(table.at("sides"));
        }
        if (table.count("inner_radius")) {
            body.has_inner_radius = true;
            body.inner_radius = parse_number(table.at("inner_radius"));
        }
        if (table.count("outer_radius")) {
            body.has_outer_radius = true;
            body.outer_radius = parse_number(table.at("outer_radius"));
        }
        bodies.push_back(body);
    }
    if (bodies.empty()) {
        exit_with_error("Error parsing local config: no body found.");
    }
    return bodies;
}

} // namespace interstonar
