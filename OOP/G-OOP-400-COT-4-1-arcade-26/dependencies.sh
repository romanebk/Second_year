#!/usr/bin/bash

# Arcade Project Dependencies Installer
# Ce script installe toutes les librairies requises pour compiler et tester le projet Arcade.

if [ "$EUID" -ne 0 ]; then
  echo "Veuillez lancer ce script en tant qu'administrateur (sudo ./dependencies.sh)"
  exit
fi

echo " Mise à jour des dépôts..."
apt-get update

echo " Installation des outils de compilation (GCC)..."
apt-get install -y g++ build-essential

echo " Installation des dépendances NCurses..."
apt-get install -y libncurses5-dev libncursesw5-dev

echo " Installation des dépendances SDL2 (et extension Text)..."
apt-get install -y libsdl2-dev libsdl2-ttf-dev

echo " Installation des dépendances SFML..."
apt-get install -y libsfml-dev

echo " "
echo "Toutes les dépendances ont été installées avec succès !"
echo "Vous pouvez maintenant compiler le projet avec : make"
