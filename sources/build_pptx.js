// Génère ../skills-claude-presentation.pptx à partir de content.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const QRCode = require("qrcode");
const fa = require("react-icons/fa6");
const { REPO, ACADEMY, AUTHOR, SECTIONS, SLIDES, QUIZ } = require("./content");

const TK = require("./tokens.json");
const C = TK.color;
const LETTER_COLORS = [C.A, C.B, C.C, C.D];
const W = 13.333, H = 7.5;
const FONT = TK.font.sans;
const MONO = TK.font.mono;

// Cache : chaque picto n'est rasterisé qu'une fois par couleur.
const ICONS = new Map();
async function icon(name, color, size = 256) {
  const key = `${name}:${color}`;
  if (ICONS.has(key)) return ICONS.get(key);
  const Comp = fa[name];
  if (!Comp) throw new Error("Icône inconnue : " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const data = "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
  ICONS.set(key, data);
  return data;
}

function T(slide, text, o) {
  slide.addText(text, Object.assign({ fontFace: FONT, color: C.ink, margin: 0, isTextBox: true, valign: "top", lang: "fr-FR" }, o));
}

// Pied de page : auteur · section (repère de navigation) · numéro.
function footer(slide, n, secKey, dark) {
  const col = dark ? C.darkMuted : C.footer;
  const sec = SECTIONS[secKey];
  const label = sec && secKey !== "intro" ? `${AUTHOR.name}  ·  ${sec.label}` : AUTHOR.name;
  T(slide, label, { x: 0.5, y: H - 0.5, w: 8, h: 0.35, fontSize: 14, color: col });
  T(slide, String(n), { x: W - 1.5, y: H - 0.5, w: 1, h: 0.35, fontSize: 14, bold: true, color: col, align: "right" });
}

// objectName TITLE : postprocess.py en fait l'espace réservé « titre » de la diapo.
function title(slide, text, dark, y = 0.55, w = W - 1) {
  T(slide, text, { align: "left", x: 0.5, y, w, h: 1.0, fontSize: 40, bold: true, color: dark ? C.white : C.ink, valign: "middle", fit: "shrink", objectName: "TITLE" });
}

function card(slide, x, y, w, h, fill = C.soft) {
  slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.15, fill: { color: fill }, line: { type: "none" } });
}

function iconCircle(slide, data, x, y, d, fill) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" } });
  const p = d * 0.25;
  slide.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}

function notesText(s) {
  const n = s.notes;
  const mm = Math.floor(s.time / 60), ss = String(s.time % 60).padStart(2, "0");
  let t = `OBJECTIF — ${n.objectif}\nTIMING — ${s.time ? mm + ":" + ss : "pendant l'atelier"}\n\n${n.script}`;
  if (n.question) t += `\n\nQUESTION À LA SALLE — ${n.question}`;
  if (n.transition) t += `\n\nTRANSITION — ${n.transition}`;
  return t;
}

// ---------- mises en page ----------
const L = {};

L.title = async (s, d) => {
  s.background = { color: C.ink };
  // panneau accent pleine hauteur : un fragment de SKILL.md, l'objet même de la séance
  s.addShape("rect", { x: 8.6, y: 0, w: W - 8.6, h: H, fill: { color: C.accent }, line: { type: "none" } });
  T(s, "---\nname: votre-skill\ndescription: Ce que\nfait la skill.\nUtiliser quand…\n---\n\n# Méthode\n1. …\n2. …", { x: 9.1, y: 1.2, w: 3.9, h: 5.2, fontSize: 20, fontFace: MONO, color: C.white, lineSpacingMultiple: 1.15 });
  T(s, d.title.replace(" un savoir", " un\nsavoir"), { objectName: "TITLE", align: "left", x: 0.8, y: 1.6, w: 7.4, h: 2.6, fontSize: 54, bold: true, color: C.white, valign: "bottom" });
  T(s, d.subtitle, { x: 0.8, y: 4.4, w: 7.4, h: 0.7, fontSize: 28, color: C.darkSub });
  T(s, AUTHOR.name, { x: 0.8, y: 5.9, w: 7, h: 0.5, fontSize: 22, bold: true, color: C.white });
};

L.section = async (s, d) => {
  s.background = { color: C.accent };
  T(s, d.num, { x: 0.6, y: 0.9, w: 4.2, h: 5.2, fontSize: 280, bold: true, color: C.white, valign: "middle", align: "center" });
  s.addImage({ data: await icon(d.icon, C.white), x: 5.3, y: 2.25, w: 0.8, h: 0.8 });
  T(s, d.title, { objectName: "TITLE", align: "left", x: 5.3, y: 3.15, w: 7.5, h: 1.2, fontSize: 54, bold: true, color: C.white, valign: "middle" });
  T(s, d.subtitle, { align: "left", x: 5.3, y: 4.35, w: 7.5, h: 0.8, fontSize: 28, color: C.white });
};

L.hook = async (s, d) => {
  title(s, d.title);
  const msg = "Rédige dans notre ton, une page maximum, avec un tableau des actions à la fin…";
  for (let i = 0; i < 3; i++) {
    const x = 1.2 + i * 0.55, y = 2.3 + i * 1.3;
    card(s, x, y, 8.6, 1.05, i === 2 ? C.accentTint : C.soft);
    T(s, msg, { x: x + 0.3, y, w: 8.1, h: 1.05, fontSize: 22, color: i === 2 ? C.ink : C.muted, valign: "middle", italic: true });
  }
  s.addShape("ellipse", { x: 10.4, y: 3.2, w: 2.3, h: 2.3, fill: { color: C.accent }, line: { type: "none" }, rotate: -12 });
  T(s, "encore ?", { x: 10.4, y: 3.2, w: 2.3, h: 2.3, fontSize: 30, bold: true, color: C.white, align: "center", valign: "middle", rotate: -12 });
};

L.agenda = async (s, d) => {
  title(s, d.title);
  const n = d.items.length, cw = 1.75, gap = (W - 1 - n * cw) / (n - 1);
  for (let i = 0; i < n; i++) {
    const [ic, lab] = d.items[i], x = 0.5 + i * (cw + gap);
    iconCircle(s, await icon(ic, C.white), x + 0.2, 2.6, 1.35, i % 2 ? C.ink : C.accent);
    T(s, String(i + 1), { x, y: 2.1, w: cw, h: 0.4, fontSize: 18, bold: true, color: C.muted, align: "center" });
    T(s, lab, { x: x - 0.1, y: 4.15, w: cw + 0.2, h: 0.9, fontSize: 22, bold: true, align: "center" });
  }
  card(s, 4.4, 5.5, 4.5, 0.85, C.accentTint);
  s.addImage({ data: await icon("FaCircleQuestion", C.accent), x: 4.7, y: 5.68, w: 0.5, h: 0.5 });
  T(s, "et pour finir : le quiz !", { x: 5.35, y: 5.5, w: 3.5, h: 0.85, fontSize: 22, bold: true, color: C.accent, valign: "middle" });
};

L.cards = async (s, d) => {
  title(s, d.title);
  // pile de fiches à gauche : chaque onglet reste visible
  const rest = d.cards.filter((_, i) => i !== d.pick);
  for (let i = 0; i < rest.length; i++) {
    const x = 0.8 + i * 0.25, y = 2.35 + i * 0.5, tx = x + 0.3 + (i % 2) * 2.2;
    s.addShape("roundRect", { x: tx, y: y - 0.38, w: 2.3, h: 0.5, rectRadius: 0.1, fill: { color: C.bar }, line: { color: C.white, width: 1 } });
    T(s, rest[i], { x: tx + 0.12, y: y - 0.38, w: 2.1, h: 0.4, fontSize: 16, bold: true, color: C.muted, valign: "middle" });
    s.addShape("roundRect", { x, y, w: 4.6, h: 2.1, rectRadius: 0.12, fill: { color: C.soft }, line: { color: C.line, width: 1 } });
  }
  // fiche sortie
  const xx = 6.8, yy = 2.35;
  s.addShape("roundRect", { x: xx + 0.3, y: yy - 0.38, w: 2.6, h: 0.5, rectRadius: 0.1, fill: { color: C.accent }, line: { type: "none" } });
  T(s, d.cards[d.pick], { x: xx + 0.42, y: yy - 0.38, w: 2.4, h: 0.4, fontSize: 16, bold: true, color: C.white, valign: "middle" });
  s.addShape("roundRect", { x: xx, y: yy, w: 5.4, h: 3.3, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.accent, width: 2.5 }, shadow: { type: "outer", blur: 8, offset: 3, angle: 90, color: C.shadow, opacity: 0.18 } });
  s.addImage({ data: await icon("FaFileLines", C.accent), x: xx + 0.35, y: yy + 0.35, w: 0.6, h: 0.6 });
  T(s, d.cards[d.pick], { x: xx + 1.15, y: yy + 0.35, w: 4, h: 0.6, fontSize: 26, bold: true, valign: "middle" });
  [3.9, 3.2, 4.2, 2.6].forEach((w, k) => s.addShape("roundRect", { x: xx + 0.4, y: yy + 1.35 + k * 0.42, w, h: 0.16, rectRadius: 0.08, fill: { color: C.bar }, line: { type: "none" } }));
  s.addImage({ data: await icon("FaArrowRight", C.accent), x: 6.0, y: 3.7, w: 0.6, h: 0.6 });
  T(s, d.caption, { x: 0.5, y: 6.3, w: W - 1, h: 0.6, fontSize: 26, italic: true, color: C.muted, align: "center" });
};

L.anatomy = async (s, d) => {
  title(s, d.title);
  // dossier
  iconCircle(s, await icon("FaFolderOpen", C.white), 0.8, 2.4, 1.6, C.ink);
  T(s, "compte-rendu/", { x: 0.3, y: 4.1, w: 2.6, h: 0.5, fontSize: 20, bold: true, align: "center", fontFace: MONO });
  s.addImage({ data: await icon("FaArrowRight", C.muted), x: 2.75, y: 2.95, w: 0.5, h: 0.5 });
  // fichier SKILL.md
  s.addShape("roundRect", { x: 3.5, y: 2.0, w: 5.6, h: 4.5, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.ink, width: 2 } });
  s.addShape("rect", { x: 3.5, y: 2.0, w: 5.6, h: 0.55, fill: { color: C.ink }, line: { type: "none" } });
  T(s, "SKILL.md", { x: 3.7, y: 2.0, w: 5, h: 0.55, fontSize: 20, bold: true, color: C.white, valign: "middle", fontFace: MONO });
  const rows = [
    ["name: compte-rendu", C.blue, 2.8],
    ["description: Rédige un compte\nrendu… Utiliser quand…", C.accent, 3.45],
    ["1. Lister les décisions\n2. Tableau qui / quoi / quand\n3. Une page maximum", C.green, 4.55],
  ];
  rows.forEach(([txt, col, y], k) => {
    card(s, 3.75, y, 5.1, k === 2 ? 1.65 : (k === 1 ? 0.95 : 0.5), k === 1 ? C.accentTint : (k === 0 ? C.blueTint : C.greenTint));
    T(s, txt, { x: 3.95, y, w: 4.8, h: k === 2 ? 1.65 : (k === 1 ? 0.95 : 0.5), fontSize: 17, fontFace: MONO, color: C.ink, valign: "middle" });
  });
  // étiquettes
  const labels = [["Le nom", C.blue, 2.8], ["QUAND l'utiliser", C.accent, 3.65], ["COMMENT faire", C.green, 5.1]];
  for (const [lab, col, y] of labels) {
    s.addShape("line", { x: 9.1, y: y + 0.25, w: 0.5, h: 0, line: { color: col, width: 2 } });
    T(s, lab, { x: 9.75, y, w: 3.2, h: 0.5, fontSize: 22, bold: true, color: col, valign: "middle" });
  }
  s.addImage({ data: await icon("FaPaperclip", C.muted), x: 9.75, y: 6.0, w: 0.35, h: 0.35 });
  T(s, "+ modèles, exemples (option)", { x: 10.2, y: 5.95, w: 3, h: 0.45, fontSize: 16, color: C.muted, valign: "middle" });
};

async function docMock(s, x, y, w, h, good) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: C.white }, line: { color: good ? C.green : C.line, width: good ? 2.5 : 1.25 } });
  const bar = (bx, by, bw, col, bh = 0.16) => s.addShape("roundRect", { x: bx, y: by, w: bw, h: bh, rectRadius: 0.08, fill: { color: col }, line: { type: "none" } });
  if (!good) {
    bar(x + 0.35, y + 0.4, w * 0.5, C.barStrong, 0.26);
    for (let k = 0; k < 8; k++) bar(x + 0.35, y + 0.95 + k * 0.3, (w - 0.7) * [1, 0.92, 0.97, 0.8, 1, 0.9, 0.95, 0.7, 0.85][k], C.bar);
  } else {
    s.addShape("ellipse", { x: x + 0.35, y: y + 0.32, w: 0.42, h: 0.42, fill: { color: C.accent }, line: { type: "none" } });
    bar(x + 0.95, y + 0.4, w * 0.45, C.ink, 0.26);
    bar(x + 0.35, y + 1.0, w * 0.35, C.green, 0.2);
    for (let k = 0; k < 2; k++) bar(x + 0.35, y + 1.35 + k * 0.3, (w - 0.7) * [0.95, 0.75][k], C.bar);
    // tableau d'actions
    const tx = x + 0.35, ty = y + 2.15, tw = w - 0.7;
    s.addShape("rect", { x: tx, y: ty, w: tw, h: 0.4, fill: { color: C.green }, line: { type: "none" } });
    T(s, "Qui · Quoi · Quand", { x: tx + 0.1, y: ty, w: tw, h: 0.4, fontSize: 16, bold: true, color: C.white, valign: "middle" });
    for (let r = 0; r < 3; r++) s.addShape("rect", { x: tx, y: ty + 0.36 + r * 0.34, w: tw, h: 0.34, fill: { color: r % 2 ? C.white : C.greenTint }, line: { color: C.line, width: 0.5 } });
  }
}

L.beforeafter = async (s, d) => {
  title(s, d.title);
  card(s, 0.5, 1.95, W - 1, 0.7, C.soft);
  s.addImage({ data: await icon("FaComment", C.muted), x: 0.8, y: 2.1, w: 0.4, h: 0.4 });
  T(s, "« Fais le compte rendu de la réunion »", { x: 1.4, y: 1.95, w: 10, h: 0.7, fontSize: 22, italic: true, valign: "middle" });
  await docMock(s, 1.2, 3.0, 4.6, 3.6, false);
  await docMock(s, 7.5, 3.0, 4.6, 3.6, true);
  T(s, "Sans skill", { x: 1.2, y: 6.65, w: 4.6, h: 0.4, fontSize: 20, bold: true, color: C.muted, align: "center" });
  T(s, "Avec la skill", { x: 7.5, y: 6.65, w: 4.6, h: 0.4, fontSize: 20, bold: true, color: C.green, align: "center" });
  s.addImage({ data: await icon("FaArrowRight", C.accent), x: 6.3, y: 4.5, w: 0.7, h: 0.7 });
};

L.versus = async (s, d) => {
  title(s, d.title);
  const cols = [
    ["FaFolderOpen", C.blue, "Projet", "Un bureau pour UN sujet", "documents + consignes", "reste dans son bureau"],
    ["FaFileLines", C.accent, "Skill", "Un savoir-faire", "méthode + exemples", "vous suit partout"],
  ];
  for (let i = 0; i < 2; i++) {
    const [ic, col, name, l1, l2, l3] = cols[i], x = 0.9 + i * 6.1;
    card(s, x, 2.0, 5.5, 3.9, C.soft);
    iconCircle(s, await icon(ic, C.white), x + 0.4, 2.35, 1.3, col);
    T(s, name, { x: x + 1.95, y: 2.4, w: 3.3, h: 0.7, fontSize: 36, bold: true, color: col, valign: "middle" });
    T(s, l1, { x: x + 1.95, y: 3.05, w: 3.4, h: 0.5, fontSize: 20, color: C.ink });
    T(s, [
      { text: l2, options: { bullet: { indent: 18 }, breakLine: true } },
      { text: l3, options: { bullet: { indent: 18 } } },
    ], { x: x + 0.5, y: 4.1, w: 4.8, h: 1.4, fontSize: 24, color: C.ink, paraSpaceAfter: 8 });
  }
  T(s, "≠", { x: 6.1, y: 3.3, w: 1.1, h: 1.0, fontSize: 60, bold: true, color: C.muted, align: "center", valign: "middle" });
  T(s, [
    { text: "Le projet sait ", options: {} }, { text: "QUOI", options: { bold: true, color: C.blue } },
    { text: ". La skill sait ", options: {} }, { text: "COMMENT", options: { bold: true, color: C.accent } }, { text: ".", options: {} },
  ], { x: 0.5, y: 6.15, w: W - 1, h: 0.6, fontSize: 28, align: "center" });
};

L.which = async (s, d) => {
  title(s, d.title);
  for (let i = 0; i < 4; i++) {
    const x = 0.7 + (i % 2) * 6.1, y = 2.1 + Math.floor(i / 2) * 2.2;
    card(s, x, y, 5.8, 1.9, C.soft);
    T(s, "?", { x: x + 0.25, y: y + 0.35, w: 1.2, h: 1.2, fontSize: 60, bold: true, color: C.accent, align: "center", valign: "middle" });
    T(s, d.cases[i][0], { x: x + 1.6, y, w: 4, h: 1.9, fontSize: 24, bold: true, valign: "middle" });
  }
  s.addImage({ data: await icon("FaHand", C.blue), x: 3.6, y: 6.55, w: 0.4, h: 0.4 });
  T(s, "gauche = projet", { x: 4.1, y: 6.5, w: 2.6, h: 0.5, fontSize: 18, color: C.blue, bold: true, valign: "middle" });
  s.addImage({ data: await icon("FaHand", C.accent), x: 6.9, y: 6.55, w: 0.4, h: 0.4 });
  T(s, "droite = skill", { x: 7.4, y: 6.5, w: 2.6, h: 0.5, fontSize: 18, color: C.accent, bold: true, valign: "middle" });
};

async function badge(s, n, x, y) {
  s.addShape("ellipse", { x, y, w: 0.55, h: 0.55, fill: { color: C.accent }, line: { color: C.white, width: 2 } });
  T(s, String(n), { x, y, w: 0.55, h: 0.55, fontSize: 20, bold: true, color: C.white, align: "center", valign: "middle" });
}

L.catalog = async (s, d) => {
  title(s, d.title);
  // fenêtre
  const X = 1.2, Y = 2.0, WW = 10.9, HH = 4.7;
  s.addShape("roundRect", { x: X, y: Y, w: WW, h: HH, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.line, width: 1.5 }, shadow: { type: "outer", blur: 10, offset: 3, angle: 90, color: C.shadow, opacity: 0.12 } });
  s.addShape("rect", { x: X, y: Y + 0.12, w: 2.8, h: HH - 0.24, fill: { color: C.soft }, line: { type: "none" } });
  const side = [["FaComments", "Discussions"], ["FaFolderOpen", "Projets"], ["FaSliders", "Personnaliser"]];
  for (let i = 0; i < side.length; i++) {
    const y = Y + 0.4 + i * 0.7, on = i === 2;
    if (on) card(s, X + 0.15, y - 0.08, 2.5, 0.6, C.accentTint);
    s.addImage({ data: await icon(side[i][0], on ? C.accent : C.muted), x: X + 0.35, y: y + 0.06, w: 0.32, h: 0.32 });
    T(s, side[i][1], { x: X + 0.8, y: y - 0.08, w: 1.9, h: 0.6, fontSize: 18, bold: on, color: on ? C.accent : C.muted, valign: "middle" });
  }
  await badge(s, 1, X + 2.4, Y + 1.55);
  // onglets
  const tabs = ["Skills", "Plugins", "Connecteurs"];
  tabs.forEach((t, i) => {
    const x = X + 3.2 + i * 1.9, on = i === 0;
    s.addShape("roundRect", { x, y: Y + 0.3, w: 1.7, h: 0.5, rectRadius: 0.25, fill: { color: on ? C.ink : C.soft }, line: { type: "none" } });
    T(s, t, { x, y: Y + 0.3, w: 1.7, h: 0.5, fontSize: 16, bold: true, color: on ? C.white : C.muted, align: "center", valign: "middle" });
  });
  await badge(s, 2, X + 8.9, Y + 0.28);
  const rows = [["FaFileWord", "Documents Word", true], ["FaFilePowerpoint", "Présentations", true], ["FaFileExcel", "Tableurs", false], ["FaFilePdf", "PDF", false]];
  for (let i = 0; i < rows.length; i++) {
    const y = Y + 1.1 + i * 0.82;
    card(s, X + 3.2, y, 7.3, 0.66, C.soft);
    s.addImage({ data: await icon(rows[i][0], C.ink), x: X + 3.4, y: y + 0.15, w: 0.36, h: 0.36 });
    T(s, rows[i][1], { x: X + 4.0, y, w: 4.5, h: 0.66, fontSize: 20, valign: "middle" });
    const on = rows[i][2];
    s.addShape("roundRect", { x: X + 9.4, y: y + 0.16, w: 0.8, h: 0.36, rectRadius: 0.18, fill: { color: on ? C.green : C.barStrong }, line: { type: "none" } });
    s.addShape("ellipse", { x: on ? X + 9.86 : X + 9.44, y: y + 0.19, w: 0.3, h: 0.3, fill: { color: C.white }, line: { type: "none" } });
  }
  await badge(s, 3, X + 10.3, Y + 1.12);
};

L.github = async (s, d) => {
  title(s, d.title);
  const n = d.steps.length, cw = 3.4, gap = (W - 1.6 - n * cw) / (n - 1);
  for (let i = 0; i < n; i++) {
    const [ic, a, b] = d.steps[i], x = 0.8 + i * (cw + gap);
    card(s, x, 2.2, cw, 3.6, C.soft);
    iconCircle(s, await icon(ic, C.white), x + cw / 2 - 0.75, 2.55, 1.5, i === 2 ? C.accent : C.ink);
    T(s, a, { x, y: 4.25, w: cw, h: 0.6, fontSize: 28, bold: true, align: "center" });
    T(s, b, { x: x + 0.2, y: 4.85, w: cw - 0.4, h: 0.8, fontSize: 18, color: C.muted, align: "center" });
    if (i < n - 1) s.addImage({ data: await icon("FaArrowRight", C.accent), x: x + cw + gap / 2 - 0.3, y: 3.7, w: 0.6, h: 0.6 });
  }
  card(s, 2.4, 6.1, 8.5, 0.6, C.blueTint);
  T(s, [{ text: "Réf. : ", options: { bold: true, color: C.blue } }, { text: "github.com/anthropics/skills", options: { fontFace: MONO } }], { x: 2.4, y: 6.1, w: 8.5, h: 0.6, fontSize: 20, align: "center", valign: "middle" });
};

L.stop = async (s, d) => {
  s.background = { color: C.ink };
  s.addShape("octagon", { x: 1.0, y: 1.9, w: 3.4, h: 3.4, fill: { color: C.A }, line: { color: C.white, width: 4 } });
  T(s, "STOP", { x: 1.0, y: 1.9, w: 3.4, h: 3.4, fontSize: 54, bold: true, color: C.white, align: "center", valign: "middle" });
  T(s, d.title, { objectName: "TITLE", align: "left", x: 5.0, y: 1.9, w: 7.8, h: 2.2, fontSize: 40, bold: true, color: C.white, valign: "middle" });
  T(s, d.subtitle, { x: 5.0, y: 4.2, w: 7.6, h: 1.0, fontSize: 24, color: C.darkSub });
  const checks = ["Auteur connu", "SKILL.md lu", "Scripts compris"];
  for (let i = 0; i < 3; i++) {
    s.addImage({ data: await icon("FaCircleCheck", C.green), x: 5.0 + i * 2.6, y: 5.6, w: 0.4, h: 0.4 });
    T(s, checks[i], { x: 5.5 + i * 2.6, y: 5.55, w: 2.1, h: 0.5, fontSize: 18, bold: true, color: C.white, valign: "middle" });
  }
};

const DOOR_COLORS = [C.accent, C.blue, C.ink];

L.doors = async (s, d) => {
  title(s, d.title, false, 0.55, 6.6);
  if (d.banner) {
    s.addShape("roundRect", { x: 7.3, y: 0.82, w: 5.5, h: 0.46, rectRadius: 0.23, fill: { color: C.blueTint }, line: { type: "none" } });
    s.addImage({ data: await icon("FaCodeMerge", C.blue), x: 7.48, y: 0.91, w: 0.28, h: 0.28 });
    T(s, d.banner, { x: 7.86, y: 0.82, w: 4.9, h: 0.46, fontSize: 16, bold: true, color: C.blue, valign: "middle" });
  }
  for (let i = 0; i < 3; i++) {
    const [ic, name, desc, tag] = d.doors[i], x = 0.8 + i * 4.05, cw = 3.65;
    s.addShape("roundRect", { x, y: 2.1, w: cw, h: 4.35, rectRadius: 0.2, fill: { color: C.soft }, line: { color: DOOR_COLORS[i], width: 2.5 } });
    s.addShape("roundRect", { x: x + cw / 2 - 1.1, y: 1.85, w: 2.2, h: 0.45, rectRadius: 0.22, fill: { color: DOOR_COLORS[i] }, line: { type: "none" } });
    T(s, tag, { x: x + cw / 2 - 1.1, y: 1.85, w: 2.2, h: 0.45, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle" });
    iconCircle(s, await icon(ic, C.white), x + cw / 2 - 0.8, 2.55, 1.6, DOOR_COLORS[i]);
    T(s, name, { x, y: 4.3, w: cw, h: 0.6, fontSize: 32, bold: true, align: "center", color: DOOR_COLORS[i] });
    T(s, desc, { x: x + 0.3, y: 5.0, w: cw - 0.6, h: 0.9, fontSize: 19, align: "center" });
  }
  T(s, "Votre skill vous suit partout.", { x: 0.5, y: 6.6, w: W - 1, h: 0.4, fontSize: 18, italic: true, color: C.muted, align: "center" });
};

L.proscons = async (s, d) => {
  title(s, d.title);
  for (let i = 0; i < 3; i++) {
    const [ic, name, pros, cons] = d.cols[i], x = 0.6 + i * 4.1, cw = 3.9;
    card(s, x, 2.0, cw, 4.75, C.soft);
    iconCircle(s, await icon(ic, C.white), x + 0.25, 2.2, 0.8, DOOR_COLORS[i]);
    T(s, name, { x: x + 1.2, y: 2.2, w: 2.5, h: 0.8, fontSize: 30, bold: true, color: DOOR_COLORS[i], valign: "middle" });
    let y = 3.2;
    for (const t of pros) {
      s.addImage({ data: await icon("FaCircleCheck", C.green), x: x + 0.3, y: y + 0.07, w: 0.34, h: 0.34 });
      T(s, t, { x: x + 0.8, y, w: cw - 1.0, h: 0.5, fontSize: 18, valign: "middle" });
      y += 0.58;
    }
    s.addShape("line", { x: x + 0.3, y: y + 0.08, w: cw - 0.6, h: 0, line: { color: C.line, width: 1 } });
    y += 0.25;
    for (const t of cons) {
      s.addImage({ data: await icon("FaCircleXmark", C.A), x: x + 0.3, y: y + 0.07, w: 0.34, h: 0.34 });
      T(s, t, { x: x + 0.8, y, w: cw - 1.0, h: 0.5, fontSize: 18, color: C.muted, valign: "middle" });
      y += 0.58;
    }
  }
};

L.myths = async (s, d) => {
  title(s, d.title);
  for (let i = 0; i < d.myths.length; i++) {
    const [myth, truth] = d.myths[i], y = 2.05 + i * 1.18;
    card(s, 0.8, y, 5.2, 0.95, C.redTint);
    s.addImage({ data: await icon("FaCircleXmark", C.A), x: 1.05, y: y + 0.27, w: 0.42, h: 0.42 });
    T(s, myth, { x: 1.7, y, w: 4.2, h: 0.95, fontSize: 22, color: C.redText, valign: "middle", strike: "sngStrike" });
    s.addImage({ data: await icon("FaArrowRight", C.accent), x: 6.3, y: y + 0.22, w: 0.5, h: 0.5 });
    card(s, 7.1, y, 5.4, 0.95, C.greenTint);
    s.addImage({ data: await icon("FaCircleCheck", C.green), x: 7.35, y: y + 0.27, w: 0.42, h: 0.42 });
    T(s, truth, { x: 8.0, y, w: 4.4, h: 0.95, fontSize: 22, bold: true, valign: "middle" });
  }
};

L.planmode = async (s, d) => {
  title(s, d.title);
  const n = d.steps.length, cw = 2.2, gap = (W - 1.2 - n * cw) / (n - 1);
  s.addShape("line", { x: 1.2, y: 2.95, w: W - 2.4, h: 0, line: { color: C.line, width: 4 } });
  // zone « lecture seule » sous les étapes 2 à 4
  for (let i = 0; i < n; i++) {
    const [ic, a, b] = d.steps[i], x = 0.6 + i * (cw + gap);
    const col = i === 3 ? C.green : (i === 4 ? C.accent : C.ink);
    iconCircle(s, await icon(ic, C.white), x + cw / 2 - 0.65, 2.3, 1.3, col);
    T(s, a, { x: x - 0.15, y: 3.75, w: cw + 0.3, h: 0.55, fontSize: 22, bold: true, align: "center" });
    if (b) T(s, b, { x: x - 0.15, y: 4.3, w: cw + 0.3, h: 0.45, fontSize: 16, italic: true, color: C.muted, align: "center" });
  }
  const zx = 0.6 + (cw + gap) - 0.1, zw = 2 * (cw + gap) + cw + 0.2;
  s.addShape("roundRect", { x: zx, y: 4.85, w: zw, h: 0.5, rectRadius: 0.25, fill: { color: C.blueTint }, line: { type: "none" } });
  s.addImage({ data: await icon("FaLock", C.blue), x: zx + 0.25, y: 4.95, w: 0.3, h: 0.3 });
  T(s, "Aucun fichier modifié", { x: zx + 0.65, y: 4.85, w: zw - 0.8, h: 0.5, fontSize: 17, bold: true, color: C.blue, valign: "middle" });
  T(s, "Pour l'activer :", { x: 0.8, y: 5.85, w: 2.6, h: 0.6, fontSize: 20, bold: true, color: C.muted, valign: "middle" });
  for (let k = 0; k < d.keys.length; k++) {
    const x = 3.4 + k * 3.1;
    s.addShape("roundRect", { x, y: 5.85, w: 2.8, h: 0.6, rectRadius: 0.1, fill: { color: C.white }, line: { color: C.ink, width: 1.5 }, shadow: { type: "outer", blur: 0, offset: 3, angle: 90, color: C.ink, opacity: 0.9 } });
    T(s, d.keys[k], { x, y: 5.85, w: 2.8, h: 0.6, fontSize: 20, bold: true, align: "center", valign: "middle", fontFace: k === 1 ? MONO : FONT });
  }
};

L.codedemo = async (s, d) => {
  title(s, d.title);
  const X = 0.6, Y = 1.95, WW = 9.0, HH = 5.0;
  s.addShape("roundRect", { x: X, y: Y, w: WW, h: HH, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.line, width: 1.5 }, shadow: { type: "outer", blur: 10, offset: 3, angle: 90, color: C.shadow, opacity: 0.12 } });
  // arborescence
  s.addShape("rect", { x: X, y: Y + 0.12, w: 3.4, h: HH - 0.24, fill: { color: C.soft }, line: { type: "none" } });
  const tree = [["FaFolderOpen", "charte/", C.ink, true], ["FaFilePdf", "charte.pdf", C.muted], ["FaFileImage", "logo.png", C.muted], ["FaFilePowerpoint", "exemple.pptx", C.muted], ["FaFolderPlus", ".claude/skills/", C.green, true], ["FaFileLines", "charte-graphique", C.green]];
  for (let i = 0; i < tree.length; i++) {
    const [ic, name, col, bold] = tree[i], y = Y + 0.35 + i * 0.55, ind = (i === 0 || i === 4) ? 0 : 0.3;
    s.addImage({ data: await icon(ic, col), x: X + 0.25 + ind, y: y + 0.08, w: 0.28, h: 0.28 });
    T(s, name, { x: X + 0.65 + ind, y, w: 2.7 - ind, h: 0.45, fontSize: 16, bold: !!bold, color: col, valign: "middle", fontFace: MONO });
  }
  s.addShape("roundRect", { x: X + 0.15, y: Y + 3.7, w: 3.1, h: 0.5, rectRadius: 0.22, fill: { color: C.greenTint }, line: { type: "none" } });
  T(s, "créé à l'étape 4", { x: X + 0.15, y: Y + 3.7, w: 3.1, h: 0.5, fontSize: 16, italic: true, color: C.green, align: "center", valign: "middle" });
  // zone principale
  const mx = X + 3.6, mw = WW - 3.85;
  s.addShape("roundRect", { x: mx + mw - 2.1, y: Y + 0.25, w: 2.0, h: 0.42, rectRadius: 0.21, fill: { color: C.blueTint }, line: { type: "none" } });
  s.addImage({ data: await icon("FaPause", C.blue), x: mx + mw - 1.95, y: Y + 0.34, w: 0.24, h: 0.24 });
  T(s, "Mode plan", { x: mx + mw - 1.6, y: Y + 0.25, w: 1.5, h: 0.42, fontSize: 16, bold: true, color: C.blue, valign: "middle" });
  s.addShape("roundRect", { x: mx, y: Y + 0.85, w: mw, h: 0.85, rectRadius: 0.15, fill: { color: C.soft }, line: { type: "none" } });
  T(s, "Crée une skill charte-graphique à partir des fichiers de ce dossier.", { x: mx + 0.2, y: Y + 0.85, w: mw - 0.4, h: 0.85, fontSize: 16, valign: "middle" });
  s.addShape("roundRect", { x: mx, y: Y + 1.9, w: mw, h: 2.3, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.blue, width: 1.5 } });
  T(s, [
    { text: "Plan proposé", options: { bold: true, color: C.blue, breakLine: true } },
    { text: "Lire charte.pdf et exemple.pptx", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Créer charte-graphique/SKILL.md", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Ajouter couleurs-typo.md", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Tester sur une diapo", options: { bullet: { type: "number" } } },
  ], { x: mx + 0.2, y: Y + 2.0, w: mw - 0.4, h: 2.1, fontSize: 16, paraSpaceAfter: 3 });
  s.addShape("roundRect", { x: mx, y: Y + 4.35, w: 1.9, h: 0.48, rectRadius: 0.24, fill: { color: C.green }, line: { type: "none" } });
  T(s, "Approuver", { x: mx, y: Y + 4.35, w: 1.9, h: 0.48, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle" });
  s.addShape("roundRect", { x: mx + 2.05, y: Y + 4.35, w: 3.0, h: 0.48, rectRadius: 0.24, fill: { color: C.white }, line: { color: C.muted, width: 1 } });
  T(s, "Continuer à planifier", { x: mx + 2.05, y: Y + 4.35, w: 3.0, h: 0.48, fontSize: 16, bold: true, color: C.muted, align: "center", valign: "middle" });
  // étapes
  const steps = ["J'ouvre le dossier", "Mode plan + demande", "Je relis le plan", "J'approuve, je teste"];
  for (let i = 0; i < 4; i++) {
    const y = Y + 0.4 + i * 1.1;
    await badge(s, i + 1, 9.9, y);
    T(s, steps[i], { x: 10.6, y: y - 0.1, w: 2.3, h: 0.75, fontSize: 18, bold: true, valign: "middle" });
  }
};

L.decision = async (s, d) => {
  title(s, d.title);
  for (let i = 0; i < d.rows.length; i++) {
    const [q, ic, door] = d.rows[i], y = 2.1 + i * 1.3;
    card(s, 0.8, y, 7.4, 1.0, C.soft);
    T(s, "?", { x: 1.0, y, w: 0.6, h: 1.0, fontSize: 36, bold: true, color: C.accent, align: "center", valign: "middle" });
    T(s, q, { x: 1.7, y, w: 6.4, h: 1.0, fontSize: 22, bold: true, valign: "middle" });
    s.addImage({ data: await icon("FaArrowRight", C.accent), x: 8.5, y: y + 0.25, w: 0.5, h: 0.5 });
    s.addShape("roundRect", { x: 9.3, y, w: 3.3, h: 1.0, rectRadius: 0.5, fill: { color: DOOR_COLORS[i] }, line: { type: "none" } });
    s.addImage({ data: await icon(ic, C.white), x: 9.6, y: y + 0.28, w: 0.45, h: 0.45 });
    T(s, door, { x: 10.2, y, w: 2.3, h: 1.0, fontSize: 26, bold: true, color: C.white, valign: "middle" });
  }
  card(s, 2.4, 6.1, 8.5, 0.65, C.accentTint);
  T(s, d.footerNote, { x: 2.4, y: 6.1, w: 8.5, h: 0.65, fontSize: 20, bold: true, color: C.accent, align: "center", valign: "middle" });
};

L.usecase = async (s, d) => {
  title(s, d.title);
  // ce qu'on donne
  T(s, "Vous donnez", { x: 0.8, y: 1.95, w: 3.8, h: 0.45, fontSize: 18, bold: true, color: C.muted });
  card(s, 0.8, 2.45, 3.8, 3.1, C.soft);
  d.swatches.forEach((c, k) => s.addShape("ellipse", { x: 1.05 + k * 0.68, y: 2.7, w: 0.55, h: 0.55, fill: { color: c }, line: { color: C.line, width: 1 } }));
  T(s, [{ text: "Poppins", options: { bold: true } }, { text: " titres", options: { color: C.muted } }], { x: 1.05, y: 3.5, w: 3.4, h: 0.45, fontSize: 18 });
  T(s, [{ text: "Lora", options: { bold: true } }, { text: " texte", options: { color: C.muted } }], { x: 1.05, y: 3.95, w: 3.4, h: 0.45, fontSize: 18 });
  T(s, [{ text: "+ règles d'application", options: { bold: true } }], { x: 1.05, y: 4.55, w: 3.4, h: 0.6, fontSize: 18 });
  s.addImage({ data: await icon("FaArrowRight", C.accent), x: 4.8, y: 3.7, w: 0.55, h: 0.55 });
  // ce que Claude crée
  T(s, "Claude crée", { x: 5.55, y: 1.95, w: 3.9, h: 0.45, fontSize: 18, bold: true, color: C.muted });
  for (let k = 0; k < d.files.length; k++) {
    const y = 2.45 + k * 0.78;
    card(s, 5.55, y, 4.15, 0.62, k === 0 ? C.accentTint : C.soft);
    s.addImage({ data: await icon(d.files[k].endsWith(".py") ? "FaGear" : "FaFileLines", k === 0 ? C.accent : C.muted), x: 5.75, y: y + 0.16, w: 0.3, h: 0.3 });
    T(s, d.files[k], { x: 6.15, y, w: 3.5, h: 0.62, fontSize: 16, bold: k === 0, fontFace: MONO, valign: "middle" });
  }
  // ressource
  const png = await QRCode.toBuffer(ACADEMY, { margin: 1, width: 600, color: { dark: "#" + C.ink, light: "#" + C.white } });
    s.addShape("roundRect", { x: 10.0, y: 1.95, w: 2.8, h: 3.6, rectRadius: 0.15, fill: { color: C.white }, line: { color: C.line, width: 1 } });
  s.addImage({ data: "image/png;base64," + png.toString("base64"), x: 10.35, y: 2.15, w: 2.1, h: 2.1, altText: "QR code vers la ressource Claude Academy : empaqueter sa charte de marque dans une skill" });
  T(s, "Claude Academy", { x: 10.05, y: 4.3, w: 2.7, h: 0.4, fontSize: 16, bold: true, align: "center" });
  T(s, "Charte de marque · 20 min", { x: 10.1, y: 4.75, w: 2.6, h: 0.7, fontSize: 16, color: C.muted, align: "center" });
  s.addShape("roundRect", { x: 0.8, y: 5.95, w: 11.95, h: 0.75, rectRadius: 0.37, fill: { color: C.ink }, line: { type: "none" } });
  s.addImage({ data: await icon("FaFlask", C.accent), x: 1.1, y: 6.12, w: 0.4, h: 0.4 });
  T(s, d.test, { x: 1.7, y: 5.95, w: 10.9, h: 0.75, fontSize: 20, bold: true, color: C.white, valign: "middle" });
};

L.threedoors = async (s, d) => {
  title(s, d.title);
  for (let i = 0; i < 3; i++) {
    const [ic, name, how, result] = d.doors[i], y = 2.05 + i * 1.5;
    iconCircle(s, await icon(ic, C.white), 0.8, y, 1.15, DOOR_COLORS[i]);
    T(s, name, { x: 2.15, y, w: 2.2, h: 1.15, fontSize: 28, bold: true, color: DOOR_COLORS[i], valign: "middle" });
    card(s, 4.4, y + 0.1, 4.0, 0.95, C.soft);
    T(s, how, { x: 4.6, y: y + 0.1, w: 3.7, h: 0.95, fontSize: 20, valign: "middle" });
    s.addImage({ data: await icon("FaArrowRight", C.accent), x: 8.6, y: y + 0.33, w: 0.5, h: 0.5 });
    card(s, 9.3, y + 0.1, 3.4, 0.95, C.greenTint);
    T(s, result, { x: 9.5, y: y + 0.1, w: 3.1, h: 0.95, fontSize: 19, bold: true, color: C.green, valign: "middle" });
  }
};

L.timeline = async (s, d) => {
  title(s, d.title);
  const n = d.steps.length, cw = 2.2, gap = (W - 1.2 - n * cw) / (n - 1);
  s.addShape("line", { x: 1.2, y: 3.45, w: W - 2.4, h: 0, line: { color: C.line, width: 4 } });
  for (let i = 0; i < n; i++) {
    const [ic, a, b] = d.steps[i], x = 0.6 + i * (cw + gap);
    iconCircle(s, await icon(ic, C.white), x + cw / 2 - 0.7, 2.75, 1.4, i === 2 ? C.accent : C.ink);
    T(s, String(i + 1), { x, y: 2.2, w: cw, h: 0.45, fontSize: 18, bold: true, color: C.muted, align: "center" });
    T(s, a, { x: x - 0.1, y: 4.35, w: cw + 0.2, h: 0.6, fontSize: 26, bold: true, align: "center" });
    T(s, b, { x: x - 0.1, y: 4.95, w: cw + 0.2, h: 0.9, fontSize: 17, color: C.muted, align: "center" });
  }
  s.addShape("roundRect", { x: 7.1, y: 6.15, w: 5.5, h: 0.6, rectRadius: 0.3, fill: { color: C.accentTint }, line: { type: "none" } });
  s.addImage({ data: await icon("FaRotate", C.accent), x: 7.35, y: 6.28, w: 0.34, h: 0.34 });
  T(s, "On boucle 2 ou 3 fois : c'est normal", { x: 7.85, y: 6.15, w: 4.7, h: 0.6, fontSize: 17, bold: true, color: C.accent, valign: "middle" });
};

L.demo = async (s, d) => {
  title(s, d.title);
  const X = 0.8, Y = 2.0;
  s.addShape("roundRect", { x: X, y: Y, w: 11.7, h: 4.9, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.line, width: 1.5 }, shadow: { type: "outer", blur: 10, offset: 3, angle: 90, color: C.shadow, opacity: 0.12 } });
  // message utilisateur
  s.addShape("roundRect", { x: X + 4.4, y: Y + 0.35, w: 7.0, h: 1.0, rectRadius: 0.2, fill: { color: C.soft }, line: { type: "none" } });
  T(s, "Aide-moi à créer une skill qui transforme mes notes de réunion en compte rendu à notre format.", { x: X + 4.65, y: Y + 0.35, w: 6.6, h: 1.0, fontSize: 18, valign: "middle" });
  // réponse Claude
  s.addShape("ellipse", { x: X + 0.35, y: Y + 1.65, w: 0.55, h: 0.55, fill: { color: C.accent }, line: { type: "none" } });
  s.addImage({ data: await icon("FaWandMagicSparkles", C.white), x: X + 0.48, y: Y + 1.78, w: 0.29, h: 0.29 });
  T(s, [
    { text: "Avec plaisir ! Trois questions :", options: { bold: true, breakLine: true } },
    { text: "Qui lit ces comptes rendus ?", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Quelle longueur maximum ?", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Avez-vous un exemple réussi ?", options: { bullet: { type: "number" } } },
  ], { x: X + 1.1, y: Y + 1.6, w: 5.6, h: 1.9, fontSize: 18, paraSpaceAfter: 4 });
  // carte skill prête
  const cx = X + 1.1, cy = Y + 3.6;
  s.addShape("roundRect", { x: cx, y: cy, w: 6.2, h: 1.0, rectRadius: 0.15, fill: { color: C.greenTint }, line: { color: C.green, width: 1.5 } });
  s.addImage({ data: await icon("FaFileLines", C.green), x: cx + 0.25, y: cy + 0.25, w: 0.5, h: 0.5 });
  T(s, "compte-rendu · skill prête", { x: cx + 0.95, y: cy, w: 3.4, h: 1.0, fontSize: 18, bold: true, valign: "middle" });
  s.addShape("roundRect", { x: cx + 4.4, y: cy + 0.22, w: 1.6, h: 0.56, rectRadius: 0.28, fill: { color: C.green }, line: { type: "none" } });
  T(s, "Enregistrer", { x: cx + 4.4, y: cy + 0.22, w: 1.6, h: 0.56, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle" });
  // étapes à droite
  const steps = ["Je demande", "Je réponds", "J'enregistre", "Je teste"];
  for (let i = 0; i < 4; i++) {
    const y = Y + 1.75 + i * 0.72;
    await badge(s, i + 1, X + 7.9, y);
    T(s, steps[i], { x: X + 8.6, y, w: 2.8, h: 0.55, fontSize: 20, bold: true, valign: "middle" });
  }
};

L.secrets = async (s, d) => {
  title(s, d.title);
  for (let i = 0; i < 3; i++) {
    const [n, a, b] = d.secrets[i], y = 1.85 + i * 1.6;
    T(s, n, { x: 0.6, y, w: 1.4, h: 1.4, fontSize: 96, bold: true, color: C.accent, valign: "middle" });
    T(s, a, { x: 2.1, y: y + 0.1, w: 10.6, h: 0.7, fontSize: 32, bold: true, valign: "middle" });
    T(s, b, { x: 2.1, y: y + 0.8, w: 10.6, h: 0.5, fontSize: 20, italic: true, color: C.muted, valign: "middle" });
    if (i < 2) s.addShape("line", { x: 2.1, y: y + 1.48, w: 10.6, h: 0, line: { color: C.line, width: 1 } });
  }
};

L.share = async (s, d) => {
  title(s, d.title);
  const cx = 3.6, cy = 4.4, sizes = [4.6, 3.1, 1.6], fills = [C.blueTint, C.accentTint, C.accent];
  for (let i = 0; i < 3; i++) {
    const r = sizes[i] / 2;
    s.addShape("ellipse", { x: cx - r, y: cy - r, w: sizes[i], h: sizes[i], fill: { color: fills[i] }, line: { color: C.white, width: 3 } });
  }
  s.addImage({ data: await icon("FaUser", C.white), x: cx - 0.35, y: cy - 0.35, w: 0.7, h: 0.7 });
  s.addImage({ data: await icon("FaUsers", C.accent), x: cx - 0.3, y: cy - 1.4, w: 0.6, h: 0.5 });
  s.addImage({ data: await icon("FaGlobe", C.blue), x: cx - 0.28, y: cy - 2.15, w: 0.5, h: 0.5 });
  const cols = [C.accent, C.accent, C.blue];
  for (let i = 0; i < 3; i++) {
    const [ic, a, b] = d.rings[i], y = 2.3 + i * 1.45;
    iconCircle(s, await icon(ic, C.white), 7.0, y, 0.9, cols[i] === C.blue ? C.blue : (i === 0 ? C.accent : C.accentSoft));
    T(s, a, { x: 8.15, y: y - 0.05, w: 4.7, h: 0.5, fontSize: 26, bold: true });
    T(s, b, { x: 8.15, y: y + 0.45, w: 4.7, h: 0.5, fontSize: 18, color: C.muted });
  }
  s.addShape("roundRect", { x: 10.45, y: 3.8, w: 2.4, h: 0.38, rectRadius: 0.19, fill: { color: C.ink }, line: { type: "none" } });
  T(s, "Team / Enterprise", { x: 10.45, y: 3.8, w: 2.4, h: 0.38, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle" });
};

function letterBox(s, k, x, y, size) {
  s.addShape("roundRect", { x, y, w: size, h: size, rectRadius: 0.12, fill: { color: LETTER_COLORS[k] }, line: { type: "none" } });
  T(s, "ABCD"[k], { x, y, w: size, h: size, fontSize: size * 34, bold: true, color: k === 3 ? C.ink : C.white, align: "center", valign: "middle" });
}

L.quizrules = async (s, d) => {
  s.background = { color: C.ink };
  T(s, d.title, { objectName: "TITLE", x: 0.5, y: 1.0, w: W - 1, h: 1.0, fontSize: 48, bold: true, color: C.white, align: "center", valign: "middle" });
  for (let k = 0; k < 4; k++) letterBox(s, k, 1.9 + k * 2.55, 2.6, 2.0);
  T(s, `${QUIZ.length} questions · « 1, 2, 3, cartons ! »`, { x: 0.5, y: 5.1, w: W - 1, h: 0.6, fontSize: 26, color: C.darkSub, align: "center" });
  T(s, "Pas de carton ? 1 à 4 doigts.", { x: 0.5, y: 5.75, w: W - 1, h: 0.5, fontSize: 20, italic: true, color: C.darkMuted, align: "center" });
};

async function quizSlide(s, d, reveal) {
  s.background = { color: C.ink };
  T(s, `Question ${d.n} / ${QUIZ.length}`, { x: 0.5, y: 0.45, w: 4, h: 0.46, valign: "middle", fontSize: 20, bold: true, color: C.accentOnDark });
  T(s, d.item.q, { objectName: "TITLE", align: "left", x: 0.5, y: 1.35, w: W - 1, h: 1.4, fontSize: 36, bold: true, color: C.white, valign: "middle", fit: "shrink" });
  for (let k = 0; k < 4; k++) {
    const x = 0.6 + (k % 2) * 6.15, y = 3.05 + Math.floor(k / 2) * 1.85;
    const ok = k === d.item.ok, dim = reveal && !ok;
    s.addShape("roundRect", { x, y, w: 5.95, h: 1.6, rectRadius: 0.15, fill: { color: dim ? C.darkDim : C.dark2 }, line: reveal && ok ? { color: C.green, width: 4 } : { type: "none" } });
    s.addShape("roundRect", { x: x + 0.2, y: y + 0.25, w: 1.1, h: 1.1, rectRadius: 0.1, fill: { color: LETTER_COLORS[k] }, line: { type: "none" }, transparency: dim ? 65 : 0 });
    T(s, "ABCD"[k], { x: x + 0.2, y: y + 0.25, w: 1.1, h: 1.1, fontSize: 40, bold: true, color: k === 3 ? C.ink : C.white, align: "center", valign: "middle", transparency: dim ? 60 : 0 });
    T(s, d.item.a[k], { x: x + 1.55, y, w: 3.7, h: 1.6, fontSize: 24, bold: reveal && ok, color: dim ? C.dimText : C.white, valign: "middle" });
    if (reveal && ok) s.addImage({ data: await icon("FaCircleCheck", C.green), x: x + 5.2, y: y + 0.52, w: 0.56, h: 0.56 });
  }
}
L.quizq = (s, d) => quizSlide(s, d, false);
L.quiza = (s, d) => quizSlide(s, d, true);

L.recap = async (s, d) => {
  title(s, d.title);
  for (let i = 0; i < d.ideas.length; i++) {
    const [, txt] = d.ideas[i], x = 0.6 + (i % 2) * 6.2, y = 1.85 + Math.floor(i / 2) * 1.75;
    T(s, String(i + 1), { x, y, w: 1.0, h: 1.4, fontSize: 72, bold: true, color: i === 3 ? C.blue : C.accent, valign: "middle" });
    T(s, txt, { x: x + 1.05, y, w: 4.9, h: 1.4, fontSize: 26, bold: true, valign: "middle" });
  }
  s.addShape("roundRect", { x: 0.6, y: 5.55, w: W - 1.2, h: 1.1, rectRadius: 0.2, fill: { color: C.ink }, line: { type: "none" } });
  s.addImage({ data: await icon("FaPersonChalkboard", C.accentSoft), x: 0.95, y: 5.78, w: 0.65, h: 0.65 });
  T(s, [
    { text: d.workshop, options: { fontSize: 24, bold: true, color: C.white, breakLine: true } },
    { text: "Supports : github.com/StephaneBayle/creer-une-skill-claude", options: { fontSize: 18, color: C.darkSub } },
  ], { x: 1.9, y: 5.55, w: 10.5, h: 1.1, valign: "middle" });
};

async function qr(url) {
  const png = await QRCode.toBuffer(url, { margin: 1, width: 800, color: { dark: "#" + C.ink, light: "#" + C.white } });
  return "image/png;base64," + png.toString("base64");
}

L.contact = async (s, d) => {
  s.background = { color: C.ink };
  T(s, d.title, { objectName: "TITLE", align: "left", x: 0.8, y: 0.6, w: 6, h: 0.9, fontSize: 44, bold: true, color: C.white, valign: "middle" });
  T(s, AUTHOR.name, { x: 0.8, y: 1.6, w: 6, h: 0.7, fontSize: 32, bold: true, color: C.accentOnDark });
  const rows = [["FaEnvelope", AUTHOR.email], ["FaLinkedin", "linkedin.com/in/stephanebayle"], ["FaGithub", "github.com/StephaneBayle"]];
  for (let i = 0; i < 3; i++) {
    const y = 2.6 + i * 0.85;
    iconCircle(s, await icon(rows[i][0], C.white), 0.8, y, 0.65, C.dark2);
    T(s, rows[i][1], { x: 1.7, y, w: 5, h: 0.65, fontSize: 22, color: C.white, valign: "middle" });
  }
  // petits QR : profils et ressource Academy
  const small = [["LinkedIn", AUTHOR.linkedin], ["GitHub", AUTHOR.github], ["Cas Academy", ACADEMY]];
  for (let i = 0; i < small.length; i++) {
    const x = 0.8 + i * 1.95;
    s.addShape("roundRect", { x: x - 0.06, y: 5.2, w: 1.42, h: 1.42, rectRadius: 0.08, fill: { color: C.white }, line: { type: "none" } });
    s.addImage({ data: await qr(small[i][1]), x, y: 5.26, w: 1.3, h: 1.3, altText: `QR code : ${small[i][0]} (${small[i][1]})` });
    T(s, small[i][0], { x: x - 0.3, y: 6.72, w: 1.9, h: 0.4, fontSize: 16, bold: true, color: C.darkSub, align: "center" });
  }
  // grand QR : le dépôt qui rassemble tous les supports
  s.addShape("roundRect", { x: 7.3, y: 0.6, w: 5.5, h: 6.3, rectRadius: 0.2, fill: { color: C.white }, line: { type: "none" } });
  s.addImage({ data: await qr(REPO), x: 8.35, y: 0.95, w: 3.4, h: 3.4, altText: `QR code vers le dépôt GitHub des supports de la séance (${REPO})` });
  T(s, "Tous les supports", { x: 7.6, y: 4.55, w: 4.9, h: 0.6, fontSize: 28, bold: true, color: C.ink, align: "center", valign: "middle" });
  T(s, "github.com/StephaneBayle/\ncreer-une-skill-claude", { x: 7.6, y: 5.15, w: 4.9, h: 0.9, fontSize: 20, bold: true, color: C.accent, align: "center", valign: "middle" });
  T(s, "présentation · notes · cartons · sources", { x: 7.6, y: 6.1, w: 4.9, h: 0.5, fontSize: 16, color: C.muted, align: "center", valign: "middle" });
};

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = AUTHOR.name;
  pres.company = AUTHOR.name;
  pres.title = "Apprenez un savoir-faire à Claude : créer une skill";
  pres.subject = "Présentation pour public non développeur, 30 minutes";
  const DARK = new Set(["title", "stop", "quizrules", "quizq", "quiza", "contact", "section"]);
  let n = 0;
  for (const d of SLIDES) {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.bg };
    if (!L[d.kind]) throw new Error("Mise en page manquante : " + d.kind);
    await L[d.kind](s, d);
    const dark = DARK.has(d.kind);
    if (!["title", "contact", "section"].includes(d.kind)) footer(s, n, d.sec, dark);
    s.addNotes(notesText(d));
  }
  const out = path.join(__dirname, "..", "skills-claude-presentation.pptx");
  await pres.writeFile({ fileName: out });
  console.log("OK", out, n, "diapos");
}
main().catch((e) => { console.error(e); process.exit(1); });
