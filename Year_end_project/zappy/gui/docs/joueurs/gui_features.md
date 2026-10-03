# Fonctionnalités Visuelles des Joueurs (GUI Zappy)

Suite aux recommandations de la documentation (Zappy_GUI___Last_Support.pdf), le rendu graphique des joueurs et des entités liées a été amélioré pour intégrer toutes les informations clés du serveur dans un environnement 3D/2D hybride.

## 1. Rendu Humanoïde et Couleurs d'Équipes
- Les joueurs ne sont plus de simples cubes, mais sont désormais modélisés dynamiquement sous forme de **personnages humanoïdes** (tête, torse, bras et jambes articulés).
- Ils s'adaptent visuellement : le "t-shirt" et le "pantalon" utilisent la couleur de leur équipe, tandis que la peau arbore une teinte humaine. Un système de hachage interne s'assure qu'une équipe conserve toujours la même couleur unique (`glm::vec3 teamColor`).
- L'échelle (scale) de l'humanoïde augmente en fonction de son niveau pour différencier visuellement les maîtres des novices.

## 2. Tooltips & Overlays Dynamiques (HUD 2D projeté en 3D)
Des indicateurs textuels flottent désormais en permanence au-dessus de chaque joueur :
- **Identification** : L'ID du joueur ainsi que son niveau (`P42 (Lvl 3)`) sont affichés pour un suivi facile en mode spectateur.
- **Incantation** : Si un joueur participe à une incantation (détecté via la commande `pic`), un texte clignotant **"Incanting..."** apparaît en magenta au-dessus de lui.
- **Broadcast** : Lorsqu'un joueur émet un message (commande `pbc`), l'indicateur **"Broadcast!"** apparaît brièvement en cyan près de sa position.

La position de ce texte est projetée dynamiquement depuis les coordonnées de l'espace Monde (3D) vers l'espace Écran (2D) en utilisant les matrices Vue et Projection de la Caméra (`EntityRenderer::drawOverlays`).

## 3. Rendu du Cycle de Vie des Œufs
- Les œufs (générés via `enw` et pondus par les joueurs) sont désormais visibles sur la grille de jeu.
- Ils sont affichés sous forme de cubes plus petits et teintés d'une couleur coquille d'œuf.
- Ils respectent la position exacte renvoyée par le serveur et sont détruits graphiquement si le serveur envoie un événement d'éclosion/mort (commandes `eht`, `edi`, `ebo`).

## 4. Déplacement Organique
- L'animation de marche/glissade des joueurs a été préservée et fluidifiée.
- Lors du franchissement de l'horizon de la carte torique (wrap-around), les joueurs effectuent une course accélérée (dash) à travers la map. Cette décision empêche les joueurs de marcher dans le "vide", empêche l'effet brutal de disparition/téléportation, et donne une excellente compréhension de leur déplacement final.
