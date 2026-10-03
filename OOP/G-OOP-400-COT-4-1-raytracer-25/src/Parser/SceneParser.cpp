/*
** EPITECH PROJECT, 2026
** SceneParser_cpp
** File description:
** implementation of a scene parser
*/

#include "../../include/Parser/SceneParser.hpp"
#include "../../include/Parser/SceneBuilder.hpp"
#include "../../include/Parser/Factory.hpp"
#include "../../include/Core/Camera.hpp"
#include "../../include/Math/Vector3.hpp"
#include <iostream>
#include <sstream>
#include <libconfig.h++>
#include <stdexcept>

using namespace libconfig;

SceneParser::SceneParser(const std::string& path) : filePath(path) {}

static double readDouble(const Setting& s, const std::string& key)
{
    if (s[key.c_str()].getType() == Setting::TypeFloat)
        return (double)s[key.c_str()];
    else
        return (double)(int)s[key.c_str()];
}

static Vector3 readDirectionalColor(const Setting& light)
{
    if (!light.exists("color"))
        return Vector3(1.0, 1.0, 1.0);

    const Setting& c = light["color"];
    double r = c.exists("r") ? readDouble(c, "r") : 1.0;
    double g = c.exists("g") ? readDouble(c, "g") : 1.0;
    double b = c.exists("b") ? readDouble(c, "b") : 1.0;

    if (r > 1.0 || g > 1.0 || b > 1.0)
        return Vector3(r / 255.0, g / 255.0, b / 255.0);
    return Vector3(r, g, b);
}

Scene SceneParser::parse()
{
    Config cfg;
    SceneBuilder builder;

    try {
        cfg.readFile(filePath.c_str());
    } catch (const FileIOException&) {
        throw std::runtime_error("Erreur parser: Impossible de lire le fichier " + filePath);
    } catch (const ParseException& pex) {
        throw std::runtime_error("Erreur parser: Erreur de syntaxe dans " + filePath + " à la ligne " + std::to_string(pex.getLine()));
    }

    const Setting& root = cfg.getRoot();

    if (!root.exists("camera"))
        throw std::runtime_error("Erreur parser: La section 'camera' est obligatoire");

    try {
        const Setting& cam = root["camera"];
        int width  = cam["resolution"]["width"];
        int height = cam["resolution"]["height"];
        double px = readDouble(cam["position"], "x");
        double py = readDouble(cam["position"], "y");
        double pz = readDouble(cam["position"], "z");
        double rx = readDouble(cam["rotation"], "x");
        double ry = readDouble(cam["rotation"], "y");
        double rz = readDouble(cam["rotation"], "z");
        double fov = cam["fieldOfView"];
        builder.setCamera(Camera(Vector3(px, py, pz), Vector3(rx, ry, rz), fov, width, height));
    } catch (...) {
        throw std::runtime_error("Erreur parser: Paramètres camera invalides");
    }

    if (root.exists("primitives")) {
        const Setting& primitives = root["primitives"];

        // Spheres
        if (primitives.exists("spheres")) {
            const Setting& spheres = primitives["spheres"];
            for (int a = 0; a < spheres.getLength(); a++) {
                try {
                    const Setting& s = spheres[a];
                    int x = s["x"], y = s["y"], z = s["z"];
                    int r = s["r"];
                    int cr = s["color"]["r"];
                    int cg = s["color"]["g"];
                    int cb = s["color"]["b"];
                    Vector3 translation(0, 0, 0);
                    if (s.exists("translation")) {
                        int tx = s["translation"]["x"];
                        int ty = s["translation"]["y"];
                        int tz = s["translation"]["z"];
                        translation = Vector3(tx, ty, tz);
                    }
                    Vector3 rotation(0, 0, 0);
                    if (s.exists("rotation")) {
                        int rotx = s["rotation"]["x"];
                        int roty = s["rotation"]["y"];
                        int rotz = s["rotation"]["z"];
                        rotation = Vector3(rotx, roty, rotz);
                    }
                    double reflectivity = s.exists("reflectivity") ? readDouble(s, "reflectivity") : 0.3;
                    double shininess = s.exists("shininess") ? readDouble(s, "shininess") : 32;
                    builder.addPrimitive(Factory::createSphere(
                        Vector3(x, y, z), (double)r, Vector3(cr, cg, cb), translation, rotation, reflectivity, shininess
                    ));
                } catch (...) {
                    throw std::runtime_error("Erreur Parser : Données invalides pour la sphère numéro " + std::to_string(a + 1));
                }
            }
        }

        // Planes
        if (primitives.exists("planes")) {
            const Setting& planes = primitives["planes"];
            for (int a = 0; a < planes.getLength(); a++) {
                try {
                    const Setting& p = planes[a];
                    std::string axis = p["axis"];
                    double planePos = 0;
                    if (p.exists("position"))
                        planePos = readDouble(p, "position");
                    else if (p.exists("r"))
                        planePos = readDouble(p, "r");
                    int cr = p["color"]["r"];
                    int cg = p["color"]["g"];
                    int cb = p["color"]["b"];
                    Vector3 translation(0, 0, 0);
                    if (p.exists("translation")) {
                        int tx = p["translation"]["x"];
                        int ty = p["translation"]["y"];
                        int tz = p["translation"]["z"];
                        translation = Vector3(tx, ty, tz);
                    }
                    Vector3 rotation(0, 0, 0);
                    if (p.exists("rotation")) {
                        int rotx = p["rotation"]["x"];
                        int roty = p["rotation"]["y"];
                        int rotz = p["rotation"]["z"];
                        rotation = Vector3(rotx, roty, rotz);
                    }
                    double reflectivity = p.exists("reflectivity") ? readDouble(p, "reflectivity") : 0.1;
                    double shininess = p.exists("shininess") ? readDouble(p, "shininess") : 16;
                    builder.addPrimitive(Factory::createPlane(
                        axis, planePos, Vector3(cr, cg, cb), translation, rotation, reflectivity, shininess
                    ));
                } catch (...) {
                    throw std::runtime_error("Erreur Parser : Données invalides pour le plan numéro " + std::to_string(a + 1));
                }
            }
        }

        // Cylinders
        if (primitives.exists("cylinders")) {
            const Setting& cylinders = primitives["cylinders"];
            for (int a = 0; a < cylinders.getLength(); a++) {
                try {
                    const Setting& cy = cylinders[a];
                    int x = cy["x"], y = cy["y"], z = cy["z"];
                    double radius = readDouble(cy, "radius");
                    double height = readDouble(cy, "height");
                    int cr = cy["color"]["r"];
                    int cg = cy["color"]["g"];
                    int cb = cy["color"]["b"];
                    Vector3 translation(0, 0, 0);
                    if (cy.exists("translation")) {
                        int tx = cy["translation"]["x"];
                        int ty = cy["translation"]["y"];
                        int tz = cy["translation"]["z"];
                        translation = Vector3(tx, ty, tz);
                    }
                    Vector3 rotation(0, 0, 0);
                    if (cy.exists("rotation")) {
                        int rotx = cy["rotation"]["x"];
                        int roty = cy["rotation"]["y"];
                        int rotz = cy["rotation"]["z"];
                        rotation = Vector3(rotx, roty, rotz);
                    }
                    double reflectivity = cy.exists("reflectivity") ? readDouble(cy, "reflectivity") : 0.2;
                    double shininess = cy.exists("shininess") ? readDouble(cy, "shininess") : 32;
                    builder.addPrimitive(Factory::createCylinder(
                        Vector3(x, y, z), radius, height, Vector3(cr, cg, cb), translation, rotation, reflectivity, shininess
                    ));
                } catch (...) {
                    throw std::runtime_error("Erreur Parser : Données invalides pour le cylindre numéro " + std::to_string(a + 1));
                }
            }
        }

        // Cones
        if (primitives.exists("cones")) {
            const Setting& cones = primitives["cones"];
            for (int a = 0; a < cones.getLength(); a++) {
                try {
                    const Setting& co = cones[a];
                    int x = co["x"], y = co["y"], z = co["z"];
                    double radius = readDouble(co, "radius");
                    double height = readDouble(co, "height");
                    int cr = co["color"]["r"];
                    int cg = co["color"]["g"];
                    int cb = co["color"]["b"];
                    Vector3 translation(0, 0, 0);
                    if (co.exists("translation")) {
                        int tx = co["translation"]["x"];
                        int ty = co["translation"]["y"];
                        int tz = co["translation"]["z"];
                        translation = Vector3(tx, ty, tz);
                    }
                    Vector3 rotation(0, 0, 0);
                    if (co.exists("rotation")) {
                        int rotx = co["rotation"]["x"];
                        int roty = co["rotation"]["y"];
                        int rotz = co["rotation"]["z"];
                        rotation = Vector3(rotx, roty, rotz);
                    }
                    double reflectivity = co.exists("reflectivity") ? readDouble(co, "reflectivity") : 0.2;
                    double shininess = co.exists("shininess") ? readDouble(co, "shininess") : 32;
                    builder.addPrimitive(Factory::createCone(
                        Vector3(x, y, z), radius, height, Vector3(cr, cg, cb), translation, rotation, reflectivity, shininess
                    ));
                } catch (...) {
                    throw std::runtime_error("Erreur Parser : Données invalides pour le cône numéro " + std::to_string(a + 1));
                }
            }
        }
    }

    if (root.exists("lights")) {
        const Setting& lights = root["lights"];

        try {
            if (lights.exists("ambient")) {
                double ambient = lights["ambient"];
                builder.addLight(Factory::createAmbientLight(ambient));
            }
        } catch (...) {
            throw std::runtime_error("Erreur Parser : Valeur invalide pour 'ambient'.");
        }

        try {
            if (lights.exists("diffuse")) {
                double diff = lights["diffuse"];
                builder.setDiffuseMultiplier(diff);
            }
        } catch (...) {
            throw std::runtime_error("Erreur Parser : Valeur invalide pour 'diffuse'.");
        }

        if (lights.exists("directional")) {
            const Setting& dirs = lights["directional"];
            for (int i = 0; i < dirs.getLength(); ++i) {
                try {
                    const Setting& d = dirs[i];
                    int dx = d["x"], dy = d["y"], dz = d["z"];
                    Vector3 lightColor = readDirectionalColor(d);
                    double intensity = d.exists("intensity") ? readDouble(d, "intensity") : 1.0;
                    builder.addLight(Factory::createDirectionalLight(Vector3(dx, dy, dz), lightColor, intensity));
                } catch (...) {
                    throw std::runtime_error("Erreur Parser : Données invalides pour la lumière directionnelle numéro " + std::to_string(i + 1));
                }
            }
        }

        if (lights.exists("point")) {
            const Setting& pts = lights["point"];
            for (int i = 0; i < pts.getLength(); ++i) {
                try {
                    const Setting& p = pts[i];
                    int px = p["x"], py = p["y"], pz = p["z"];
                    builder.addLight(Factory::createPointLight(Vector3(px, py, pz), 1.0));
                } catch (...) {
                    throw std::runtime_error("Erreur Parser : Données invalides pour la lumière ponctuelle numéro " + std::to_string(i + 1));
                }
            }
        }
    }

    return builder.getResult();
}
