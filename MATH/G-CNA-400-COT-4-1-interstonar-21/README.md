# Interstonar - Simulation Spatiale

Projet de simulation de trajectoire de roche en Rust.

## Usage
- Mode Global : `./interstonar --global scene.toml --delta=3600 Px Py Pz Vx Vy Vz`
- Mode Local : `./interstonar --local scene.toml Px Py Pz Vx Vy Vz`

## Fonctionnalités
- Intégration d'Euler et Gravité de Newton.
- Ray Marching pour les collisions de formes complexes (SDF).
