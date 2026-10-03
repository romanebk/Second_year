/*
** EPITECH PROJECT, 2026
** Vector_hpp
** File description:
** header of a vector 
*/

#ifndef VECTOR3_HPP_
#define VECTOR3_HPP_

class Vector3 {
    public:
        double x = 0, y = 0, z = 0;                                                                                                                                                                    

        Vector3() = default;
        Vector3(double _x, double _y, double _z);

        //Distances
        double lengthSquared() const; // TRÈS IMPORTANT : Pour les comparaisons rapides
        double length() const;        // Utilise sqrt(), à utiliser avec parcimonie
        
        //Produits
        double dot(const Vector3& other) const;   // Produit scalaire
        Vector3 cross(const Vector3& other) const; // Produit vectoriel (CRITIQUE)

        //Normalisation
        void normalize();            // Modifie le vecteur sur place
        Vector3 normalized() const;  // Retourne un nouveau vecteur normalisé

        //Opérateurs arithmétiques
        Vector3 operator+(const Vector3& other) const;
        Vector3 operator-(const Vector3& other) const;
        Vector3 operator*(double scalar) const;
        Vector3 operator/(double scalar) const;
        Vector3 operator-() const;   // Inversion de direction (ex: -vecteur)

        //Opérateurs d'assignation
        void operator+=(const Vector3& other);
        void operator-=(const Vector3& other);
        void operator*=(double scal);
        void operator/=(double scal);

        ~Vector3() = default;
};

#endif