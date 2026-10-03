/**
 * Génère 18 placeholders pour les positions (mix africain + Kamasutra).
 * Remplacer ensuite par de vraies illustrations.
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/images/kama");
mkdirSync(OUT, { recursive: true });

// Clean old placeholders
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".webp")) {
    unlinkSync(resolve(OUT, f));
  }
}

const POSITIONS = [
  // African
  { id: "01-deboukey",      name: "Le Déboukey",         emoji: "🔥", colors: ["#e85a3c", "#1a0510"], origin: "Côte d'Ivoire" },
  { id: "02-mapouka",       name: "Le Mapouka",          emoji: "🌶️", colors: ["#ff3d8b", "#e8b835"], origin: "Inspiré danse" },
  { id: "03-coupe-decale",  name: "Le Coupé-Décalé",     emoji: "⚡", colors: ["#b8276f", "#e85a3c"], origin: "Énergique" },
  { id: "04-wahala",        name: "Le Wahala",           emoji: "💞", colors: ["#5a1535", "#ff3d8b"], origin: "Passion" },
  { id: "05-djongolo",      name: "Le Djongolo",         emoji: "💃", colors: ["#e8b835", "#ff3d8b"], origin: "Côte d'Ivoire" },
  // Kamasutra
  { id: "06-lotus",         name: "L'Étreinte du Lotus", emoji: "🪷", colors: ["#ff3d8b", "#ffd4b0"], origin: "Padmasana" },
  { id: "07-missionary",    name: "Le Missionnaire",     emoji: "💕", colors: ["#e85a3c", "#ffd4b0"], origin: "Bhugna" },
  { id: "08-andromaque",    name: "L'Andromaque",        emoji: "👑", colors: ["#b8276f", "#e8b835"], origin: "Purushayita" },
  { id: "09-spoon",         name: "La Cuillère",         emoji: "🌙", colors: ["#5a1535", "#ff3d8b"], origin: "Kshudraka" },
  { id: "10-bridge",        name: "Le Pont",             emoji: "🌉", colors: ["#e8b835", "#ff3d8b"], origin: "Setu" },
  { id: "11-wheelbarrow",   name: "La Brouette",         emoji: "🤸", colors: ["#e85a3c", "#5a1535"], origin: "Vyanta" },
  { id: "12-reverse",       name: "L'Amazone inversée",  emoji: "🔄", colors: ["#ff3d8b", "#5a1535"], origin: "Vipariita" },
  { id: "13-face",          name: "Le Face-à-face",      emoji: "👁️", colors: ["#ffd4b0", "#b8276f"], origin: "Mukta" },
  { id: "14-standing",      name: "La Verticale",        emoji: "⚡", colors: ["#1a0510", "#e85a3c"], origin: "Sthitarata" },
  { id: "15-deep",          name: "La Cascade",          emoji: "💦", colors: ["#5a1535", "#00b8c4"], origin: "Indrani" },
  { id: "16-lazy",          name: "Les Paresseux",       emoji: "🛌", colors: ["#ffd4b0", "#e8b835"], origin: "Suvarnabhada" },
  { id: "17-edge",          name: "Le Bord du lit",      emoji: "🛏️", colors: ["#e85a3c", "#1a0510"], origin: "Khatva" },
  { id: "18-yabyum",        name: "Yab-Yum tantrique",   emoji: "☯️", colors: ["#b8276f", "#e8b835"], origin: "Yuganaddha" },
];

const W = 800, H = 600;

function svgFor({ name, emoji, colors, origin }) {
  const [c1, c2] = colors;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.4" fill="rgba(0,0,0,0.07)"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#dots)"/>
    <circle cx="${W * 0.75}" cy="${H * 0.25}" r="120" fill="rgba(255,255,255,0.18)"/>
    <circle cx="${W * 0.2}" cy="${H * 0.85}" r="90" fill="rgba(0,0,0,0.12)"/>
    <text x="50%" y="44%" text-anchor="middle" font-size="190" dominant-baseline="middle">${emoji}</text>
    <text x="50%" y="76%" text-anchor="middle" font-size="42" font-family="Georgia, serif" font-weight="900"
          fill="rgba(255,255,255,0.95)" stroke="rgba(0,0,0,0.6)" stroke-width="1.5">${name}</text>
    <text x="50%" y="86%" text-anchor="middle" font-size="20" font-family="Georgia, serif" font-style="italic"
          fill="rgba(255,255,255,0.85)">${origin}</text>
    <text x="50%" y="94%" text-anchor="middle" font-size="11" font-family="monospace"
          letter-spacing="5" fill="rgba(255,255,255,0.6)">PLACEHOLDER · À REMPLACER</text>
  </svg>`;
}

let n = 0;
for (const pos of POSITIONS) {
  const buf = await sharp(Buffer.from(svgFor(pos))).jpeg({ quality: 80 }).toBuffer();
  writeFileSync(resolve(OUT, `${pos.id}.jpg`), buf);
  n++;
  console.log(`✓ ${pos.id}.jpg — ${pos.name}`);
}

console.log(`\n${n} placeholders générés dans public/images/kama/`);
