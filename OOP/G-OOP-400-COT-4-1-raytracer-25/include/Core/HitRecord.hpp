/*
** EPITECH PROJECT, 2026
** HitRecord_hpp
** File description:
** header of a hit record
*/

#ifndef HITRECORD_HPP_ 
#define HITRECORD_HPP_
#include "../Math/Vector3.hpp"

struct HitRecord {
    double t = 0.0;    // la distance à laquelle le rayon à touché la primitive
    Vector3 point;     // Les coordonnées X,Y,Z du point d'impact
    Vector3 normal;    // La perpendiculaire à la surface au point d'impact
    Vector3 couleur;   // La couleur de base de l'objet touché (Flat color)
    Vector3 viewDir;   // Direction du rayon incident (pour le spéculaire)
    double reflectivity = 0.0;
    double shininess = 0.0;
};

#endif