-- Trendza — demo seed data (source = 'seed')
-- Realistic placeholder catalogue standing in for a future real trend-data feed.
-- Images are Unsplash product photos matching each product description.

insert into public.products
  (nom, description, categorie, image_url, prix_conseille, marge_estimee, score, pays_cible, mois_pertinents, public_cible, arguments_vente, angles_marketing)
values
  (
    'Brasero pliable en acier',
    'Brasero compact et pliable pour les soirées fraîches en fin d''année, facile à transporter et à ranger.',
    'Maison',
    'https://images.unsplash.com/photo-1628478078897-0944ef2a6fe3?w=800&q=60&auto=format&fit=crop',
    29900, '45%', 92,
    array['CI','SN','FR','CM'], array[11,12,1],
    'Familles et amateurs de soirées entre amis en extérieur',
    array['Se plie à plat pour un rangement facile', 'Acier robuste résistant aux hautes températures', 'Installation en moins de 2 minutes sans outil'],
    array['Soirées de fin d''année entre amis ou en famille', 'Idée cadeau pour les amateurs de camping et de grillades']
  ),
  (
    'Sérum visage à la vitamine C',
    'Sérum éclaircissant et anti-taches, particulièrement recherché en période de forte chaleur et d''exposition au soleil.',
    'Beauté',
    'https://images.unsplash.com/photo-1745159338135-39f6b462b382?w=800&q=60&auto=format&fit=crop',
    15900, '60%', 87,
    array['CI','CM','SN','ML'], array[6,7,8],
    'Femmes de 20 à 40 ans soucieuses de l''éclat de leur peau',
    array['Formule concentrée à 20% de vitamine C', 'Texture légère qui pénètre rapidement', 'Résultats visibles dès 2 semaines d''utilisation'],
    array['Routine "peau éclatante" pour la saison chaude', 'Avant/après en story Instagram pour prouver l''efficacité']
  ),
  (
    'Lampe solaire de jardin',
    'Éclairage autonome à énergie solaire, très demandé à l''approche de la saison sèche pour sécuriser cours et jardins.',
    'Maison',
    'https://images.unsplash.com/photo-1774265537519-05c29a22bc32?w=800&q=60&auto=format&fit=crop',
    9900, '50%', 78,
    array['ML','BJ','TG','CI'], array[11,12,1,2],
    'Propriétaires de maison et gérants de petits commerces',
    array['Aucune facture d''électricité', 'Capteur crépusculaire automatique', 'Installation sans câblage en 5 minutes'],
    array['Sécurité et économie d''énergie pour la maison', 'Solution pratique pendant les coupures de courant']
  ),
  (
    'Power bank solaire 20000mAh',
    'Batterie externe à charge solaire capable d''alimenter plusieurs appareils, essentielle en cas de coupures fréquentes.',
    'Tech',
    'https://images.unsplash.com/photo-1566554738544-d962991c3fee?w=800&q=60&auto=format&fit=crop',
    12900, '40%', 85,
    array['CI','SN','ML','BJ','TG','CM'], array[3,4,5,11,12],
    'Étudiants, commerçants et voyageurs fréquents',
    array['Charge 2 smartphones simultanément', 'Panneau solaire intégré pour recharge d''appoint', 'Résistante aux chocs et à la poussière'],
    array['Indispensable en cas de coupure d''électricité', 'Compagnon de voyage et de déplacement professionnel']
  ),
  (
    'Robe wax imprimée',
    'Robe confectionnée en tissu wax coloré, très recherchée pour les fêtes de fin d''année.',
    'Mode',
    'https://images.unsplash.com/photo-1664151100152-333a5c85efbe?w=800&q=60&auto=format&fit=crop',
    19900, '55%', 81,
    array['CI','SN','BJ','TG','CM'], array[12,1],
    'Femmes 18-35 ans souhaitant se démarquer pour les fêtes',
    array['Tissu wax 100% coton haute qualité', 'Coupe flatteuse disponible en plusieurs tailles', 'Modèle limité pour un effet exclusif'],
    array['Tenue de fêtes de fin d''année et du Nouvel An', 'Collection capsule "édition limitée" pour créer l''urgence']
  ),
  (
    'Blender portable USB',
    'Mini blender rechargeable par USB, parfait pour les smoothies healthy du début d''année.',
    'Cuisine',
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=60&auto=format&fit=crop',
    14900, '50%', 74,
    array['FR','CA','CI','SN'], array[1,2,3],
    'Actifs pressés adoptant de bonnes résolutions santé',
    array['Se recharge sur simple câble USB', 'Lames en acier inoxydable', 'Format nomade pour bureau ou salle de sport'],
    array['Résolutions healthy de janvier', 'Praticité pour les smoothies au bureau ou en salle de sport']
  ),
  (
    'Tapis de yoga antidérapant',
    'Tapis épais et antidérapant, produit phare de la période des bonnes résolutions sportives.',
    'Sport',
    'https://images.unsplash.com/photo-1593811167565-4672e6c8ce4c?w=800&q=60&auto=format&fit=crop',
    11900, '55%', 70,
    array['FR','CA','SN','CI'], array[1,9],
    'Débutants en yoga et fitness à la maison',
    array['Surface antidérapante même en conditions humides', 'Épaisseur confortable pour les articulations', 'Sangle de transport incluse'],
    array['Objectif "nouvelle année, nouvelle routine sport"', 'Rentrée de septembre et reprise du sport']
  ),
  (
    'Kit de puériculture voyage',
    'Kit compact regroupant les essentiels pour voyager sereinement avec bébé.',
    'Bébé',
    'https://images.unsplash.com/photo-1671035812257-eb3d7a3e38f3?w=800&q=60&auto=format&fit=crop',
    24900, '40%', 68,
    array['FR','CA','CI'], array[6,7,8,12],
    'Jeunes parents voyageant avec un enfant en bas âge',
    array['Regroupe 6 accessoires indispensables', 'Format compact pour valise ou sac à langer', 'Matériaux certifiés sans substances nocives'],
    array['Vacances d''été en famille l''esprit tranquille', 'Cadeau de naissance pratique et complet']
  ),
  (
    'Huile de karité brute',
    'Huile de karité 100% pure, star de la routine hydratation en saison sèche et harmattan.',
    'Beauté',
    'https://images.unsplash.com/photo-1734761563606-32cda4701920?w=800&q=60&auto=format&fit=crop',
    6900, '65%', 89,
    array['CI','SN','ML','BJ','TG'], array[11,12,1,2],
    'Toute la famille, peaux sèches en particulier',
    array['100% naturelle et non raffinée', 'Convient aux peaux les plus sensibles', 'Un seul pot pour le corps, le visage et les cheveux'],
    array['Protection de la peau contre l''harmattan', 'Argument "produit local, naturel et polyvalent"']
  ),
  (
    'Ventilateur rechargeable',
    'Ventilateur à batterie longue durée, best-seller pendant la saison chaude et les coupures d''électricité.',
    'Maison',
    'https://images.unsplash.com/photo-1559536207-e64933d5798b?w=800&q=60&auto=format&fit=crop',
    17900, '42%', 90,
    array['CI','SN','ML','BJ','TG','CM'], array[3,4,5,6],
    'Foyers et commerces en zones à forte chaleur',
    array['Jusqu''à 8h d''autonomie sur batterie', 'Fonctionne aussi bien branché que sans fil', '3 vitesses de ventilation'],
    array['Solution de confort en pleine saison chaude', 'Fiabilité en cas de coupure d''électricité']
  ),
  (
    'Ensemble bijoux fantaisie doré',
    'Parure collier et boucles d''oreilles plaqué or, accessoire incontournable des fêtes.',
    'Mode',
    'https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?w=800&q=60&auto=format&fit=crop',
    8900, '60%', 76,
    array['CI','SN','FR','CM'], array[11,12],
    'Femmes cherchant à sublimer leur tenue de fêtes',
    array['Plaqué or résistant au ternissement', 'Écrin cadeau inclus', 'Design intemporel qui se porte toute l''année'],
    array['Accessoire indispensable pour les tenues de réveillon', 'Coffret cadeau pour les fêtes de fin d''année']
  ),
  (
    'Cafetière portable nomade',
    'Cafetière compacte pour préparer un café filtre de qualité en déplacement.',
    'Cuisine',
    'https://images.unsplash.com/photo-1741908494446-23d1550a1bca?w=800&q=60&auto=format&fit=crop',
    22900, '45%', 65,
    array['FR','CA'], array[10,11,12],
    'Amateurs de café en télétravail ou en déplacement',
    array['Prépare une tasse en moins de 3 minutes', 'Format compact pour sac à dos ou bureau', 'Sans filtre papier, écologique'],
    array['Rituel café du matin version nomade', 'Cadeau pour les amateurs de café de fin d''année']
  ),
  (
    'Boîte à repas isotherme',
    'Lunch box isotherme qui garde les repas au chaud ou au frais, incontournable à la rentrée.',
    'Cuisine',
    'https://images.unsplash.com/photo-1613645540553-d98859ffeec5?w=800&q=60&auto=format&fit=crop',
    9900, '50%', 72,
    array['FR','CA','CI'], array[9,10],
    'Actifs et étudiants qui préparent leurs repas',
    array['Maintient la température jusqu''à 6h', 'Compartiments étanches inclus', 'Facile à nettoyer, sans BPA'],
    array['Rentrée scolaire et reprise du travail', 'Alternative économique à la restauration à emporter']
  ),
  (
    'Chaussures de sport running',
    'Chaussures de running légères, portées pour les objectifs sportifs de début d''année et la saison des courses.',
    'Sport',
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=60&auto=format&fit=crop',
    27900, '38%', 71,
    array['FR','CA','CI','SN'], array[1,5,6],
    'Coureurs débutants et confirmés',
    array['Semelle amortissante nouvelle génération', 'Tissu respirant et léger', 'Disponible en plusieurs coloris'],
    array['Défi sportif de janvier', 'Saison des courses populaires de printemps/été']
  ),
  (
    'Coffret cadeau soins visage',
    'Coffret regroupant 3 soins visage, best-seller des cadeaux de fin d''année.',
    'Beauté',
    'https://images.unsplash.com/photo-1765963449601-02d96e3dcfcb?w=800&q=60&auto=format&fit=crop',
    19900, '55%', 83,
    array['FR','CI','SN','CM'], array[11,12],
    'Personnes cherchant un cadeau beauté prêt à offrir',
    array['3 soins complémentaires en un seul coffret', 'Emballage cadeau prêt à offrir', 'Convient à tous types de peau'],
    array['Idée cadeau beauté clé en main pour les fêtes', 'Argument "se faire plaisir avant le Nouvel An"']
  ),
  (
    'Sac à langer multifonction',
    'Sac à langer avec matelas à langer intégré et nombreux compartiments, utile toute l''année.',
    'Bébé',
    'https://images.unsplash.com/photo-1734599397715-f030c6d206a0?w=800&q=60&auto=format&fit=crop',
    21900, '42%', 66,
    array['FR','CA','CI','SN'], array[3,4,5,9],
    'Jeunes parents actifs',
    array['Matelas à langer amovible inclus', 'Compartiments isothermes pour les biberons', 'Bandoulière ajustable et poignées poussette'],
    array['Praticité au quotidien pour jeunes parents', 'Cadeau de naissance haut de gamme']
  ),
  (
    'Montre connectée sport',
    'Montre connectée avec suivi d''activité, plébiscitée en janvier et à l''approche de l''été.',
    'Tech',
    'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=60&auto=format&fit=crop',
    34900, '35%', 84,
    array['FR','CA','CI','SN','CM'], array[1,6,7],
    'Sportifs amateurs et passionnés de bien-être connecté',
    array['Suivi du rythme cardiaque et du sommeil', 'Autonomie de 7 jours', 'Étanche pour la natation'],
    array['Objectif remise en forme de janvier', 'Préparation physique avant l''été']
  ),
  (
    'Diffuseur d''huiles essentielles',
    'Diffuseur d''ambiance à ultrasons, produit refuge pendant la saison froide.',
    'Bien-être',
    'https://images.unsplash.com/photo-1732229035217-e7e42f61af4b?w=800&q=60&auto=format&fit=crop',
    13900, '50%', 69,
    array['FR','CA','CI'], array[10,11,12,1],
    'Personnes cherchant à créer une ambiance apaisante à la maison',
    array['Diffusion silencieuse jusqu''à 8h', 'Lumière d''ambiance multicolore', 'Arrêt automatique en fin de réservoir'],
    array['Ambiance cocooning pendant la saison froide', 'Rituel bien-être et détente à la maison']
  ),
  (
    'Ensemble de cuisine en bambou',
    'Set d''ustensiles de cuisine en bambou, apprécié comme cadeau à l''occasion de la fête des mères.',
    'Cuisine',
    'https://images.unsplash.com/photo-1556037867-bc64ed32b2af?w=800&q=60&auto=format&fit=crop',
    16900, '48%', 63,
    array['FR','CA','CI','SN'], array[5],
    'Personnes équipant leur cuisine ou cherchant un cadeau écoresponsable',
    array['Matériau naturel et biodégradable', 'Set complet de 6 ustensiles', 'Ne raye pas les poêles antiadhésives'],
    array['Cadeau écoresponsable pour la fête des mères', 'Argument "cuisine zéro plastique"']
  ),
  (
    'Coussin de voyage ergonomique',
    'Coussin de voyage à mémoire de forme, indispensable pendant la période des grands départs en vacances.',
    'Mode',
    'https://images.unsplash.com/photo-1633665503417-ac060cc1dc59?w=800&q=60&auto=format&fit=crop',
    8900, '52%', 67,
    array['FR','CA','CI'], array[6,7,8],
    'Voyageurs en avion, bus ou voiture',
    array['Mousse à mémoire de forme pour un confort optimal', 'Housse lavable et compressible', 'Format compact avec sangle de transport'],
    array['Confort indispensable pour les longs trajets de vacances', 'Accessoire de voyage à petit prix']
  );
