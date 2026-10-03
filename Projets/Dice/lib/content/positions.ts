import type { Position } from "@/lib/types";

/**
 * 18 positions — mix Kamasutra classique (13) + 5 positions inspirées d'Afrique de l'Ouest.
 * Chaque position a :
 *  - description courte (l'ambiance, les sensations)
 *  - howTo : instructions précises "comment se positionner"
 *  - origin : kama / africa / modern
 *
 * Les noms africains sont des appellations populaires (Côte d'Ivoire, Afrique de l'Ouest)
 * — pas une référence académique. À ajuster selon ton vécu local.
 *
 * Images dans /public/images/kama/ — placeholders à remplacer par vraies illus.
 */

export const POSITIONS: Position[] = [
  // ========== POSITIONS AFRICAINES (en premier — c'est ce qui parlera le plus à l'utilisateur) ==========
  {
    id: "deboukey",
    name: "Le Déboukey",
    altName: "Côte d'Ivoire",
    origin: "africa",
    description: "La position iconique d'Afrique de l'Ouest. Animal, profond, sans tabou — pour quand l'envie monte vite.",
    howTo:
      "Elle se penche en avant, mains posées sur un meuble, le rebord du lit ou un mur, jambes légèrement écartées. Le dos creusé, les fesses tendues vers lui. Lui debout derrière, la prend par les hanches et la pénètre. Il peut empoigner ses fesses, lui caresser le dos ou lui tirer doucement les cheveux. Profondeur maximum, rythme à choisir.",
    difficulty: 1, intimacy: 2, endurance: 3,
    imageSrc: "/images/kama/01-deboukey.jpg",
    imageAlt: "Le Déboukey — debout par derrière",
  },
  {
    id: "mapouka",
    name: "Le Mapouka",
    altName: "Inspiré de la danse",
    origin: "africa",
    description: "Du nom de la danse ivoirienne. Elle bouge les fesses, lui se laisse faire — sensuel, joueur, très charnel.",
    howTo:
      "Lui assis au bord du lit ou sur une chaise solide, jambes écartées, dos droit. Elle vient s'asseoir sur lui, dos tourné. Une fois pénétrée, elle pose ses mains sur les genoux de son partenaire et fait onduler ses fesses lentement, comme dans la danse. Lui caresse ses hanches, ses seins, lui mord la nuque.",
    difficulty: 2, intimacy: 3, endurance: 4,
    imageSrc: "/images/kama/02-mapouka.jpg",
    imageAlt: "Le Mapouka — assis avec ondulation",
  },
  {
    id: "coupe-decale",
    name: "Le Coupé-Décalé",
    altName: "Énergique",
    origin: "africa",
    description: "Comme la musique : ça monte, ça descend, ça change de rythme. Pour les soirs où on a de l'énergie.",
    howTo:
      "Elle est allongée sur le dos, jambes relevées et écartées, genoux pliés vers la poitrine. Lui à genoux entre ses jambes, lui tient les cuisses ou les mollets. Il alterne : 5 mouvements lents profonds, puis 10 rapides, puis on s'arrête, on s'embrasse, on reprend. Le but est de varier sans cesse.",
    difficulty: 2, intimacy: 4, endurance: 4,
    imageSrc: "/images/kama/03-coupe-decale.jpg",
    imageAlt: "Le Coupé-Décalé — variations de rythme",
  },
  {
    id: "wahala",
    name: "Le Wahala",
    altName: "Passion intense",
    origin: "africa",
    description: "« Wahala » = trouble, agitation. Position face à face très intime, où tout devient désordre. Pour les amoureux fous.",
    howTo:
      "Lui assis en tailleur (ou jambes pliées) sur le lit. Elle vient s'asseoir face à lui, jambes croisées dans son dos, pieds croisés derrière son bassin. Elle s'empale doucement. Front contre front, vous bougez ensemble en vous accrochant mutuellement, en vous embrassant sans relâche. Très peu de mouvement vertical : c'est la connexion qui fait tout.",
    difficulty: 2, intimacy: 5, endurance: 5,
    imageSrc: "/images/kama/04-wahala.jpg",
    imageAlt: "Le Wahala — face à face enlacé",
  },
  {
    id: "djongolo",
    name: "Le Djongolo",
    altName: "Côte d'Ivoire",
    origin: "africa",
    description: "Inspiré du tube urbain. Position couchée debout — un coup vous êtes posés, un coup elle est en l'air. Joueur et chaud.",
    howTo:
      "Elle est assise au bord du lit / canapé, lui debout entre ses jambes. Il la pénètre dans cette position, puis quand elle est prête, il glisse ses bras sous ses cuisses et la soulève contre lui. Elle s'accroche à son cou, jambes nouées autour de sa taille. Il marche jusqu'au mur, l'y plaque, et continue debout.",
    difficulty: 4, intimacy: 4, endurance: 3,
    imageSrc: "/images/kama/05-djongolo.jpg",
    imageAlt: "Le Djongolo — assis puis debout au mur",
  },

  // ========== KAMASUTRA CLASSIQUE ==========
  {
    id: "lotus",
    name: "L'Étreinte du Lotus",
    altName: "Padmasana — Inde",
    origin: "kama",
    description: "Position tantrique de connexion totale. Lent, profond, intense émotionnellement.",
    howTo:
      "Lui assis en lotus (jambes croisées). Elle s'installe sur ses cuisses face à lui, jambes croisées dans son dos. Front contre front, regards plongés l'un dans l'autre, vous respirez ensemble. Mouvements minimes du bassin, baisers profonds. La pénétration est secondaire — c'est l'énergie partagée qui compte.",
    difficulty: 2, intimacy: 5, endurance: 4,
    imageSrc: "/images/kama/06-lotus.jpg",
    imageAlt: "L'Étreinte du Lotus",
  },
  {
    id: "missionary-plus",
    name: "Le Missionnaire",
    altName: "Bhugna — version revisitée",
    origin: "kama",
    description: "Le classique. Mais avec une variante : ses jambes remontent sur tes épaules pour aller plus loin.",
    howTo:
      "Elle allongée sur le dos, lui au-dessus en appui sur les coudes ou les paumes. Variante : il prend ses jambes une par une et les pose sur ses épaules. Le bassin se cambre, la pénétration devient bien plus profonde. Idéal pour les baisers, les regards et le contrôle.",
    difficulty: 1, intimacy: 4, endurance: 3,
    imageSrc: "/images/kama/07-missionary.jpg",
    imageAlt: "Le Missionnaire revisité",
  },
  {
    id: "andromaque",
    name: "L'Andromaque",
    altName: "Purushayita",
    origin: "kama",
    description: "Elle prend les commandes, elle est au-dessus, elle décide du rythme. Lui regarde et savoure.",
    howTo:
      "Lui allongé sur le dos. Elle à califourchon sur lui, genoux de chaque côté de son bassin. Une fois pénétrée, elle peut se redresser (mains sur sa poitrine ou ses cuisses) ou se pencher en avant pour les baisers. Elle contrôle profondeur, rythme et angle. Lui peut toucher ses seins, ses fesses, ses hanches.",
    difficulty: 2, intimacy: 4, endurance: 4,
    imageSrc: "/images/kama/08-andromaque.jpg",
    imageAlt: "L'Andromaque",
  },
  {
    id: "spoon",
    name: "La Cuillère",
    altName: "Kshudraka",
    origin: "kama",
    description: "Allongés sur le côté, l'un contre l'autre. Tendre, paresseux, sensationnel pour les nuits longues.",
    howTo:
      "Allongez-vous tous les deux sur le côté, dans la même direction (elle devant, lui derrière, ou inversement). Celui derrière colle son corps contre celui devant. Pour la pénétration, légère cambrure du dos suffit. Mouvements lents. Lui caresse ses seins, son ventre, son sexe — accès total à toute la face avant.",
    difficulty: 1, intimacy: 5, endurance: 5,
    imageSrc: "/images/kama/09-spoon.jpg",
    imageAlt: "La Cuillère",
  },
  {
    id: "bridge",
    name: "Le Pont",
    altName: "Setu",
    origin: "kama",
    description: "Sensations très différentes. Bassin en l'air, angle inédit, un peu acrobatique mais ça vaut le coup.",
    howTo:
      "Elle allongée sur le dos, pieds à plat sur le matelas, soulève le bassin pour former un pont (épaules au sol, hanches en l'air). Lui à genoux contre elle, soutient ses hanches et la pénètre par-dessous. Elle peut tenir la position quelques minutes, puis relâcher. À alterner avec d'autres positions.",
    difficulty: 4, intimacy: 3, endurance: 2,
    imageSrc: "/images/kama/10-bridge.jpg",
    imageAlt: "Le Pont",
  },
  {
    id: "wheelbarrow",
    name: "La Brouette",
    altName: "Vyanta",
    origin: "kama",
    description: "Acrobatique, à essayer une fois pour le fun. Pas pour tous les soirs, mais quelle expérience !",
    howTo:
      "Elle en appui sur les avant-bras (paumes au sol), comme pour faire des pompes. Lui debout derrière, soulève ses jambes et les cale contre ses hanches. Elle se cambre, lui la tient par les cuisses ou les hanches. À tester sur un tapis épais. Tenir 30 secondes à 1 min puis enchaîner.",
    difficulty: 5, intimacy: 2, endurance: 1,
    imageSrc: "/images/kama/11-wheelbarrow.jpg",
    imageAlt: "La Brouette",
  },
  {
    id: "cowgirl-reverse",
    name: "L'Amazone inversée",
    altName: "Vipariita",
    origin: "kama",
    description: "Elle décide, lui profite de la vue sur les fesses. Sensations très intenses pour elle (angle parfait).",
    howTo:
      "Lui allongé sur le dos. Elle à califourchon mais dos à lui, face à ses pieds. Elle s'empale et peut s'appuyer sur les genoux/cuisses de son partenaire pour se mouvoir. Lui peut caresser ses fesses, son dos, glisser une main entre ses jambes pour stimuler le clitoris.",
    difficulty: 3, intimacy: 2, endurance: 4,
    imageSrc: "/images/kama/12-reverse.jpg",
    imageAlt: "L'Amazone inversée",
  },
  {
    id: "face-to-face",
    name: "Le Face-à-face couché",
    altName: "Mukta",
    origin: "kama",
    description: "Sur le côté, face à face. Le plus tendre, le plus connecté — parfait pour finir une longue session.",
    howTo:
      "Allongés tous les deux sur le côté, face à face. Elle passe sa jambe du dessus par-dessus la sienne pour permettre la pénétration. Mouvements lents, peu profonds, mais on se voit, on s'embrasse, on se parle, on se touche. Idéal après les positions plus intenses.",
    difficulty: 1, intimacy: 5, endurance: 5,
    imageSrc: "/images/kama/13-face.jpg",
    imageAlt: "Le Face-à-face couché",
  },
  {
    id: "standing",
    name: "La Verticale",
    altName: "Sthitarata",
    origin: "kama",
    description: "Debout, dans l'urgence, contre un mur ou portée. Pour quand on n'a pas le temps d'aller jusqu'au lit.",
    howTo:
      "Variante 1 : elle plaquée dos au mur, lui face à elle, elle saute légèrement et noue ses jambes autour de sa taille. Il la maintient par les fesses et la pénètre. Variante 2 : elle debout, penchée en avant les mains au mur, lui derrière (très proche du Déboukey).",
    difficulty: 4, intimacy: 3, endurance: 2,
    imageSrc: "/images/kama/14-standing.jpg",
    imageAlt: "La Verticale",
  },
  {
    id: "deep",
    name: "La Cascade",
    altName: "Indrani",
    origin: "kama",
    description: "La position la plus profonde. À réserver aux moments où on en veut vraiment.",
    howTo:
      "Elle allongée sur le dos, ramène ses genoux contre sa poitrine, mollets pliés. Lui à genoux entre ses jambes, lui tient les chevilles ou les genoux et la pénètre. La cambrure du bassin permet une pénétration maximale. Aller doucement au début, c'est très intense.",
    difficulty: 3, intimacy: 4, endurance: 3,
    imageSrc: "/images/kama/15-deep.jpg",
    imageAlt: "La Cascade",
  },
  {
    id: "lazy",
    name: "Les Paresseux",
    altName: "Suvarnabhada",
    origin: "kama",
    description: "Vous êtes fatigués mais l'envie est là. Position délicieuse, presque immobile.",
    howTo:
      "Elle allongée sur le dos, jambes ouvertes mais pas relevées. Lui s'allonge sur elle, en appui sur ses bras. Pénétration peu profonde mais constante. Mouvements minuscules, du bassin uniquement. Vous pouvez vous embrasser, vous parler, vous regarder — sans presque bouger.",
    difficulty: 1, intimacy: 5, endurance: 5,
    imageSrc: "/images/kama/16-lazy.jpg",
    imageAlt: "Les Paresseux",
  },
  {
    id: "edge",
    name: "Le Bord du lit",
    altName: "Khatva",
    origin: "kama",
    description: "Lui debout, elle au bord. Combo parfait pour la pénétration profonde + accès au clitoris.",
    howTo:
      "Elle allongée sur le dos, le bassin glissé jusqu'au bord du lit, jambes pendantes ou relevées. Lui debout contre le bord, à la bonne hauteur. Il peut tenir ses cuisses, et avec une main libre, caresser le clitoris. Excellent angle, super profondeur.",
    difficulty: 2, intimacy: 3, endurance: 4,
    imageSrc: "/images/kama/17-edge.jpg",
    imageAlt: "Le Bord du lit",
  },
  {
    id: "yab-yum",
    name: "Yab-Yum tantrique",
    altName: "Yuganaddha",
    origin: "kama",
    description: "Position tantrique d'union. Lente, méditative, presque mystique. Pour atteindre une autre dimension.",
    howTo:
      "Lui assis en tailleur (jambes croisées) sur le lit ou un coussin ferme, dos droit. Elle vient s'asseoir sur ses cuisses face à lui, jambes nouées dans son dos. Front contre front. Vous synchronisez la respiration. Très peu de mouvement — l'énergie circule par les regards, les souffles, les baisers. Tenir 10–15 min minimum pour ressentir l'effet.",
    difficulty: 3, intimacy: 5, endurance: 5,
    imageSrc: "/images/kama/18-yabyum.jpg",
    imageAlt: "Yab-Yum tantrique",
  },
];

export function getRandomPosition(exclude: string[] = []): Position {
  const pool = POSITIONS.filter((p) => !exclude.includes(p.id));
  if (pool.length === 0) return POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  return pool[Math.floor(Math.random() * pool.length)];
}
