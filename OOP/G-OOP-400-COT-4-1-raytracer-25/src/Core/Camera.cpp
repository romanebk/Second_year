/* 
** EPITECH PROJECT, 2026
** Camera_cpp
** File description:
** implementation of a camera
*/

#include "../../include/Core/Camera.hpp"
#include <cmath>

static double degToRad(double degrees) {
    return degrees * M_PI / 180.0;
}

Camera::Camera(const Vector3& pos, const Vector3& rot, double fov_val, int w, int h)
    : position(pos), rotation(rot), fov(fov_val), width(w), height(h) {}

void Camera::setPosition(const Vector3& pos) { position = pos; }
void Camera::setRotation(const Vector3& rot) { rotation = rot; }
void Camera::setFov(double f) { fov = f; }
void Camera::setResolution(int w, int h) { width = w; height = h; }

int Camera::getWidth() const { return width; }
int Camera::getHeight() const { return height; }

void Camera::init() {
    // On convertit les angles de rotation en radians
    double pitch = degToRad(rotation.x); // Regarder en haut/en bas (tourne autour de X)
    double yaw   = degToRad(rotation.y); // Regarder à gauche/à droite (tourne autour de Z, le haut)

    // 1. Calcul du vecteur FORWARD (Où regarde la caméra ?)
    // Par défaut (yaw=0, pitch=0), on regarde droit devant vers +Y
    forward.x = std::sin(yaw) * std::cos(pitch);
    forward.y = std::cos(yaw) * std::cos(pitch);
    forward.z = std::sin(pitch); // Z est le haut, donc le pitch fait monter/baisser le regard sur Z
    forward.normalize();

    // 2. Calcul du vecteur RIGHT (Qu'est-ce qui est à ma droite ?)
    // Le monde de base a un "Haut" global qui est l'axe Z (0, 0, 1)
    Vector3 worldUp(0, 0, 1);
    // Le produit vectoriel (cross) entre la direction qu'on regarde et le haut du monde 
    // donne forcément le vecteur à notre droite !
    right = forward.cross(worldUp);
    right.normalize();

    // 3. Calcul du vecteur UP (Qu'est-ce qui est au-dessus de ma tête ?)
    // Le produit vectoriel entre "droite" et "devant" donne le "haut" local de la caméra.
    up = right.cross(forward);
    up.normalize();
}

Ray Camera::getRay(double x, double y) const {
    // 1. On calcule le ratio de l'image (pour pas déformer l'image si elle est rectangulaire)
    double aspectRatio = static_cast<double>(width) / height;

    // 2. On calcule la taille de l'écran virtuel devant nous grâce au FOV (champ de vision)
    // tan(fov/2) nous donne la moitié de la hauteur de l'écran à une distance de 1.
    double fovRad = degToRad(fov);
    double halfHeight = std::tan(fovRad / 2.0);
    double halfWidth = aspectRatio * halfHeight;

    // 3. On convertit le pixel (x, y) en coordonnées normalisées de -1.0 à 1.0
    // Le +0.5 c'est pour viser le centre exact du pixel, pas le coin en haut à gauche.
    double u = (2.0 * (x + 0.5) / width - 1.0) * halfWidth;
    double v = (1.0 - 2.0 * (y + 0.5) / height) * halfHeight; // Le Y est inversé (0 en haut de l'écran, mais positif en bas en maths)

    // 4. On fabrique la direction du rayon !
    // On part du centre (forward), on décale à droite/gauche (right * u), et en haut/bas (up * v)
    Vector3 direction = forward + (right * u) + (up * v);
    direction.normalize();

    // 5. On renvoie le rayon partant de la position de la caméra vers cette direction
    return Ray(position, direction);
}