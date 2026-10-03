import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/icons");
mkdirSync(OUT, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdf3e7"/>
      <stop offset="100%" stop-color="#ffd4b0"/>
    </linearGradient>
  </defs>
  <!-- background -->
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <rect x="20" y="20" width="472" height="472" rx="80" fill="none" stroke="#1a0510" stroke-width="14"/>

  <!-- die 1 (pink) -->
  <g transform="translate(80,140) rotate(-8)">
    <rect x="0" y="0" width="180" height="180" rx="36" fill="#ffffff" stroke="#1a0510" stroke-width="10"/>
    <rect x="14" y="14" width="152" height="152" rx="24" fill="none" stroke="#ff3d8b" stroke-width="6"/>
    <circle cx="50" cy="50" r="14" fill="#ff3d8b" stroke="#1a0510" stroke-width="4"/>
    <circle cx="130" cy="50" r="14" fill="#ff3d8b" stroke="#1a0510" stroke-width="4"/>
    <circle cx="90" cy="90" r="14" fill="#1a0510"/>
    <circle cx="50" cy="130" r="14" fill="#ff3d8b" stroke="#1a0510" stroke-width="4"/>
    <circle cx="130" cy="130" r="14" fill="#ff3d8b" stroke="#1a0510" stroke-width="4"/>
  </g>

  <!-- die 2 (yellow) -->
  <g transform="translate(220,250) rotate(15)">
    <rect x="0" y="0" width="180" height="180" rx="36" fill="#e8b835" stroke="#1a0510" stroke-width="10"/>
    <rect x="14" y="14" width="152" height="152" rx="24" fill="none" stroke="#1a0510" stroke-width="5"/>
    <circle cx="90" cy="90" r="18" fill="#1a0510"/>
    <circle cx="45" cy="45" r="18" fill="#e85a3c" stroke="#1a0510" stroke-width="4"/>
    <circle cx="135" cy="135" r="18" fill="#e85a3c" stroke="#1a0510" stroke-width="4"/>
  </g>

  <!-- heart accent -->
  <g transform="translate(360,90) rotate(15)">
    <path d="M 0 18 Q -16 0 -8 -14 Q 6 -22 12 -8 Q 18 -22 32 -14 Q 40 0 24 18 L 12 30 Z"
          fill="#ff3d8b" stroke="#1a0510" stroke-width="4"/>
  </g>
</svg>`;

const sizes = [
  { size: 192, file: "icon-192.png" },
  { size: 512, file: "icon-512.png" },
  { size: 180, file: "apple-touch-icon.png" },
];

for (const { size, file } of sizes) {
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  writeFileSync(resolve(OUT, file), buf);
  console.log(`✓ ${file} (${size}×${size})`);
}

writeFileSync(resolve(OUT, "icon.svg"), svg);
console.log("✓ icon.svg");

// Also write a favicon
const fav = await sharp(Buffer.from(svg)).resize(32, 32).png().toBuffer();
writeFileSync(resolve(__dirname, "../app/favicon.ico"), fav);
console.log("✓ favicon.ico");
