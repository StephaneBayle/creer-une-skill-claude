// Génère ../assets/banner.png : bannière du README (1600 × 480), aux couleurs de tokens.json.
// Motif : le classeur de fiches de la diapo 5, avec un SKILL.md au premier plan.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const TK = require("./tokens.json");
const C = Object.fromEntries(Object.entries(TK.color).map(([k, v]) => [k, "#" + v]));

const W = 1600, H = 480, PANEL = 980;
const SANS = "Calibri, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Courier New', Menlo, monospace";

// une fiche avec son onglet ; rot en degrés autour du coin haut gauche
function card(x, y, w, h, tab, tabX, fill, tabFill, tabInk, rot, body = "") {
  return `
  <g transform="rotate(${rot} ${x} ${y})">
    <rect x="${x + tabX}" y="${y - 38}" width="230" height="48" rx="10" fill="${tabFill}"/>
    <text x="${x + tabX + 18}" y="${y - 7}" font-family="${SANS}" font-size="22" font-weight="700" fill="${tabInk}">${tab}</text>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}"/>
    ${body}
  </g>`;
}

const fx = 1080, fy = 148, fw = 450, fh = 300;
const lines = [
  ["---", C.muted],
  ["name: compte-rendu", C.blue],
  ["description: Rédige un compte", C.accent],
  ["  rendu… Utiliser quand…", C.accent],
  ["---", C.muted],
  ["# Méthode", C.ink],
  ["1. Lister les décisions", C.ink],
  ["2. Qui · quoi · quand", C.ink],
];
const front = lines.map(([t, col], i) =>
  `<text x="${fx + 28}" y="${fy + 50 + i * 31}" font-family="${MONO}" font-size="21" fill="${col}">${t}</text>`).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.ink}"/>
  <rect x="${PANEL}" width="${W - PANEL}" height="${H}" fill="${C.accent}"/>

  <!-- texte -->
  <text x="80" y="160" font-family="${SANS}" font-size="84" font-weight="700" fill="${C.white}">Créer une skill</text>
  <text x="80" y="252" font-family="${SANS}" font-size="84" font-weight="700" fill="${C.white}">dans Claude</text>
  <text x="80" y="322" font-family="${SANS}" font-size="30" fill="${C.darkSub}">Présentation, notes du présentateur et atelier,</text>
  <text x="80" y="362" font-family="${SANS}" font-size="30" fill="${C.darkSub}">pour un public non développeur</text>
  <text x="80" y="424" font-family="${SANS}" font-size="22" font-weight="700" fill="${C.accentOnDark}">Stéphane Bayle · CC BY 4.0</text>

  <!-- classeur de fiches -->
  ${card(1040, 76, 440, 280, "relance-client", 250, C.soft, C.bar, C.muted, -3)}
  ${card(1060, 110, 445, 290, "charte-graphique", 10, C.soft, C.line, C.muted, -1.5)}
  ${card(fx, fy, fw, fh, "compte-rendu", 245, C.white, C.ink, C.white, 1, front)}
</svg>`;

(async () => {
  const out = path.join(__dirname, "..", "assets", "banner.png");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  fs.writeFileSync(path.join(__dirname, "build", "banner.svg"), svg);
  console.log("OK", out);
})();
