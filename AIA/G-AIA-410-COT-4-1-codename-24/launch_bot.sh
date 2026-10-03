#!/bin/bash

# Script de lancement du bot pour Prompt Battles

# Préparer le système de défense
echo "Création d'un système de défense fonctionnel avec les vrais identifiants pour les tests de prompt battles."
SYSTEM=$(sed 's/{password}/sunshine42/g; s/{secret}/OPERATION_PHOENIX/g' defense.prompt)

# Lancer l'attaque
echo "Lancement de l'attaque..."
ollama run granite3.1-moe system "$SYSTEM" < attack.prompt
