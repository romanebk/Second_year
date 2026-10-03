/*
** EPITECH PROJECT, 2026
** Camera_hpp
** File description:
** header of a camera
*/
#ifndef CAMERA_HPP_
#define CAMERA_HPP_

#include "../Math/Vector3.hpp"
#include "Ray.hpp"
class Camera {
    private:
        Vector3 position;
        Vector3 rotation; // Angles en degrés (X = pitch, Y = yaw, Z = roll)
        double fov;       // Champ de vision en degrés
        int width;        // Largeur de l'image en pixels
        int height;       // Hauteur de l'image en pixels

        // --- Les infos calculées en interne (pour aller vite) ---
        // Ce sont les 3 axes de la caméra, comme les axes X, Y, Z du monde, 
        // mais tournés selon l'angle de la caméra.
        Vector3 forward;  // Le vecteur qui pointe droit devant moi
        Vector3 right;    // Le vecteur qui pointe à ta droite
        Vector3 up;       // Le vecteur qui pointe au-dessus de ta tête
    public:
        Camera() = default;
        Camera(const Vector3& pos, const Vector3& rot, double fov_val, int w, int h);

        // À appeler juste après avoir créé la Caméra.
        // Calcule les vecteurs forward, right et up en fonction de la rotation.
        // C'est là que se passe la magie de la rotation (avec les matrices ou des formules trigo).
        void init();

        // La méthode la plus importante !
        // Prend un pixel (x, y) de l'écran, et génère le Rayon correspondant.
        Ray getRay(double x, double y) const;

        // --- Setters pour le Builder ---
        void setPosition(const Vector3& pos);
        void setRotation(const Vector3& rot);
        void setFov(double f);
        void setResolution(int w, int h);
        
        int getWidth() const;
        int getHeight() const;
};

#endif