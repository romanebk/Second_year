/*
** EPITECH PROJECT, 2026
** IPrimitive_hpp
** File description:
** header of a primitive interface
*/

#ifndef IPRIMITIVE_HPP_
#define IPRIMITIVE_HPP_

#include "../Core/HitRecord.hpp"
#include "../Core/Ray.hpp"

class IPrimitive {
    public:
        virtual ~IPrimitive() = default;
        
        //retourne true si le rayon touche la forme entre t_min et t_max.
        //Si oui remplit la structure 'rec' avec les infos (points, couleur, normale).
        virtual bool hit(const Ray& _ray, double t_min, double t_max, HitRecord& rec) const = 0;
};



#endif