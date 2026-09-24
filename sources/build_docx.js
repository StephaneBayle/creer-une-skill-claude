// Génère ../skills-claude-notes-presentateur.docx (document distribué)
// Vignettes : sources/build/slide-NN.png, produites par render.sh
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType,
  HeadingLevel, AlignmentType, LevelFormat, Footer, PageNumber, PageBreak, BorderStyle, ExternalHyperlink,
} = require("docx");
const { REPO, ACADEMY, AUTHOR, QUIZ, SLIDES } = require("./content");
const slideNo = (kind) => SLIDES.findIndex((s) => s.kind === kind) + 1;
const TOTAL_MIN = Math.round(SLIDES.reduce((a, s) => a + s.time, 0) / 60);

const TK = require("./tokens.json");
const { ink: INK, muted: MUTED, accent: ACCENT, soft: SOFT, blue: BLUE, green: GREEN, line: LINE, white: WHITE } = TK.color;
const FONT = TK.font.sans, MONO = TK.font.mono;
const LANG = { value: "fr-FR" };
const BUILD = path.join(__dirname, "build");
const CONTENT_W = 9638; // A4, marges 2 cm

const p = (text, o = {}) => new Paragraph({ style: "Body", spacing: { after: 120 }, ...o, children: typeof text === "string" ? [r(text)] : text });
const r = (text, o = {}) => new TextRun({ text, font: FONT, language: LANG, ...o });
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [r(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [r(t)] });
const h3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [r(t)] });
const bullet = (children) => new Paragraph({ style: "Body", numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: typeof children === "string" ? [r(children)] : children });
const num = (children, ref = "steps") => new Paragraph({ style: "Body", numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: typeof children === "string" ? [r(children)] : children });
const code = (lines) => lines.map((l, i) => new Paragraph({
  style: "Body",
  shading: { type: ShadingType.CLEAR, fill: SOFT, color: "auto" },
  spacing: { after: i === lines.length - 1 ? 160 : 0 },
  indent: { left: 200, right: 200 },
  children: [r(l || " ", { font: MONO, size: 18 })],
}));
const link = (text, url) => new ExternalHyperlink({ link: url, children: [r(text, { style: "Hyperlink" })] });
const labelled = (label, text, color = ACCENT) => p([r(label + " — ", { bold: true, color }), r(text)]);
const fmt = (s) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "atelier";

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
function table(widths, rows, headerFill = INK) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((row, ri) => new TableRow({
      tableHeader: ri === 0,
      children: row.map((cell, ci) => new TableCell({
        width: { size: widths[ci], type: WidthType.DXA },
        borders,
        shading: ri === 0 ? { type: ShadingType.CLEAR, fill: headerFill, color: "auto" } : (ri % 2 === 0 ? { type: ShadingType.CLEAR, fill: SOFT, color: "auto" } : undefined),
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ style: "Body", children: [r(String(cell), ri === 0 ? { bold: true, color: WHITE } : {})] })],
      })),
    })),
  });
}

// Encadré : tableau d'une cellule, fond teinté, titre en accent.
function encadre(titre, paras) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: TK.color.accentTint, color: "auto" },
      borders: { top: { style: BorderStyle.SINGLE, size: 12, color: ACCENT }, bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT }, left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT }, right: { style: BorderStyle.SINGLE, size: 12, color: ACCENT } },
      margins: { top: 160, bottom: 160, left: 220, right: 220 },
      children: [
        new Paragraph({ style: "Body", spacing: { after: 120 }, children: [r(titre, { bold: true, color: ACCENT, size: 26 })] }),
        ...paras.map((runs) => new Paragraph({ style: "Body", spacing: { after: 100 }, children: runs })),
      ],
    })] })],
  });
}

// Vignettes : JPEG (poids) ; réduites pour les diapos sombres (encre à l'impression) ;
// absentes pour les ouvertures de section, qui ne portent qu'un numéro et un titre.
const DARK_KINDS = new Set(["title", "stop", "quizrules", "quizq", "quiza", "contact"]);
function thumb(n) {
  const kind = SLIDES[n - 1].kind;
  if (kind === "section") {
    return p([r("Diapo d'ouverture de partie : grand numéro et titre sur fond framboise.", { italics: true, color: MUTED })]);
  }
  const f = path.join(BUILD, `slide-${String(n).padStart(2, "0")}.jpg`);
  if (!fs.existsSync(f)) throw new Error("Vignette manquante, lancer render.sh : " + f);
  const w = DARK_KINDS.has(kind) ? 280 : 440;
  return new Paragraph({
    style: "Body", alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [new ImageRun({ type: "jpg", data: fs.readFileSync(f), transformation: { width: w, height: Math.round(w * 9 / 16) }, altText: { title: `Diapo ${n}`, description: `Diapo ${n} : ${SLIDES[n - 1].title}`, name: `diapo${n}` } })],
  });
}

// ---------- contenu ----------
const children = [];

// Page de garde
children.push(
  new Paragraph({ style: "Body", spacing: { before: 2400, after: 200 }, children: [r("EXERCICE DE FORMATION · DOCUMENT DISTRIBUÉ", { color: ACCENT, bold: true, size: 20 })] }),
  new Paragraph({ style: "Body", spacing: { after: 200 }, children: [r("Apprenez un savoir-faire à Claude", { bold: true, size: 56, color: INK })] }),
  new Paragraph({ style: "Body", spacing: { after: 600 }, children: [r("Créer, trouver et partager une skill : notes du présentateur", { size: 30, color: MUTED })] }),
  p([r(`Présentation de ${TOTAL_MIN} minutes environ, suivie d'une mise en pratique. Public : utilisateurs de Claude, sans prérequis technique.`, { color: MUTED })]),
  new Paragraph({ style: "Body", spacing: { before: 1600, after: 80 }, children: [r(AUTHOR.name, { bold: true, size: 32, color: ACCENT })] }),
  p([r(AUTHOR.email)], { spacing: { after: 40 } }),
  p([r("LinkedIn : "), link("profil de Stéphane Bayle", AUTHOR.linkedin), r("  (linkedin.com/in/stephanebayle)", { color: MUTED })], { spacing: { after: 40 } }),
  p([r("GitHub : "), link("dépôts de Stéphane Bayle", AUTHOR.github), r("  (github.com/StephaneBayle)", { color: MUTED })]),
  new Paragraph({ style: "Body", spacing: { before: 400, after: 80 }, children: [r("Tous les supports de la séance", { bold: true, color: ACCENT })] }),
  p([link("Dépôt GitHub des supports", REPO), r("  (github.com/StephaneBayle/creer-une-skill-claude)", { color: MUTED })]),
  p([r("Supports sous licence Creative Commons Attribution 4.0 (CC BY 4.0) : réutilisation et adaptation libres en citant l'auteur et le lien du dépôt. Scripts de génération sous licence MIT.", { color: MUTED, size: 18 })], { spacing: { before: 200 } }),
  new Paragraph({ style: "Body", children: [new PageBreak()] }),
);

// Sommaire + mode d'emploi
children.push(
  h1("Sommaire"),
  ...[
    ["Mode d'emploi", "matériel et déroulé minuté"],
    ["Notes diapo par diapo", "31 fiches : objectif, timing, script, question, transition"],
    ["Annexe A · Glossaire", ""],
    ["Annexe B · Fiches pas-à-pas", "activer, importer, créer, partager, skill-creator"],
    ["Annexe C · Exemple de SKILL.md complet", ""],
    ["Annexe D · Corrigé du quiz", ""],
    ["Annexe E · Atelier de mise en pratique", "consigne, idées, grille"],
    ["Annexe F · Pour aller plus loin", "liens officiels, points à vérifier, limites"],
    ["Annexe G · Cas d'usage : la charte de marque", "ressource Claude Academy"],
  ].map(([t, d]) => p([r(t, { bold: true }), r(d ? "  —  " + d : "", { color: MUTED })], { spacing: { after: 100 } })),
  new Paragraph({ style: "Body", children: [new PageBreak()] }),
  h1("Mode d'emploi"),
  p("Ce document reprend, diapo par diapo, les notes du présentateur intégrées au fichier PowerPoint. Chaque fiche indique :"),
  bullet([r("l'objectif pédagogique", { bold: true }), r(" de la diapo ;")]),
  bullet([r("le timing", { bold: true }), r(` conseillé (total : ${TOTAL_MIN} min environ) ;`)]),
  bullet([r("le script", { bold: true }), r(", c'est-à-dire ce que l'on dit : à s'approprier, pas à lire ;")]),
  bullet([r("la question à poser à la salle", { bold: true }), r(" et la transition vers la diapo suivante.")]),
  p("En annexe : un glossaire, des fiches pas-à-pas, le corrigé du quiz, la consigne de l'atelier et les liens officiels."),
  h2("Matériel"),
  bullet(`Vidéoprojecteur et accès à Claude sur le poste du présentateur (démo de la diapo ${slideNo("demo")}).`),
  bullet("Un tableau ou paperboard pour noter les idées de skills récoltées à la diapo 2."),
  h2("Déroulé minuté"),
);
let cum = 0;
const rows = [["N°", "Diapo", "Durée", "Cumul"]];
SLIDES.forEach((s, i) => { cum += s.time; rows.push([i + 1, s.title, fmt(s.time), s.time ? fmt(cum) : "—"]); });
children.push(table([700, 6138, 1400, 1400], rows));
children.push(p([r(`Si vous prenez du retard, raccourcissez la diapo ${slideNo("which")} (ne traiter que deux cartes), la démo de la diapo ${slideNo("demo")} (s'arrêter à l'enregistrement de la skill) et la diapo ${slideNo("threedoors")} (la survoler). Ne sacrifiez pas les diapos sur Code et le mode plan (${slideNo("myths")} et ${slideNo("planmode")}) : ce sont elles qui lèvent les peurs.`, { italics: true, color: MUTED })], { spacing: { before: 160 } }));

// Fiches par diapo
children.push(new Paragraph({ style: "Body", children: [new PageBreak()] }), h1("Notes diapo par diapo"));
SLIDES.forEach((s, i) => {
  const n = i + 1;
  if (i > 0) children.push(new Paragraph({ style: "Body", children: [new PageBreak()] }));
  children.push(h2(`Diapo ${n} · ${s.title}`));
  children.push(thumb(n));
  children.push(labelled("Objectif", s.notes.objectif));
  children.push(labelled("Timing", s.time ? fmt(s.time) : "affichée pendant l'atelier", MUTED));
  children.push(h3("Script"));
  children.push(p(s.notes.script));
  if (s.notes.question) children.push(labelled("Question à la salle", s.notes.question, BLUE));
  if (s.notes.transition) children.push(labelled("Transition", s.notes.transition, GREEN));
});

// Annexes
children.push(new Paragraph({ style: "Body", children: [new PageBreak()] }), h1("Annexe A · Glossaire"));
children.push(table([2400, 7238], [
  ["Terme", "Définition simple"],
  ["Skill (compétence)", "Un dossier qui apprend à Claude une façon de faire. Claude l'ouvre de lui-même quand la tâche s'y prête."],
  ["SKILL.md", "Le seul fichier obligatoire d'une skill : un en-tête (nom, description) puis les instructions, en texte simple."],
  ["Description", "La phrase qui dit ce que fait la skill et QUAND l'utiliser. C'est elle qui déclenche la skill."],
  ["Markdown (.md)", "Un format de texte très simple : # pour un titre, - pour une liste. Aucun code à apprendre."],
  ["Projet", "Un espace de Claude consacré à un sujet : documents de référence et consignes partagés par toutes ses conversations."],
  ["Chat", "La conversation classique avec Claude, sur le web ou dans l'application."],
  ["Cowork", "Le mode où Claude travaille dans vos dossiers et fichiers pour mener une tâche de bout en bout. Chat et Cowork ont fusionné : c'est désormais un seul Claude."],
  ["Claude Code", "Claude qui travaille dans un dossier de votre ordinateur, avec plus de contrôle. Disponible dans un onglet de l'application de bureau ; aucun code à écrire."],
  ["skill-creator", "La skill d'Anthropic qui fabrique les skills : entretien, rédaction du SKILL.md, tests, amélioration, affinage de la description et empaquetage. Claude l'utilise dès que vous lui demandez de créer une skill."],
  ["Mode plan", "Mode de Claude Code où Claude lit et propose un plan sans rien modifier, puis attend votre accord."],
  ["Plugin", "Un paquet prêt à installer qui réunit plusieurs skills, parfois avec des connecteurs vers vos outils."],
  ["Catalogue / marketplace", "L'ensemble des skills et plugins proposés dans Personnaliser, par Anthropic et ses partenaires."],
  ["Connecteur", "Un lien entre Claude et un outil (Notion, Google Drive, Canva…) pour lire ou agir dedans."],
  ["GitHub", "Un site où l'on publie et partage des fichiers, très utilisé pour diffuser des skills."],
]));

children.push(new Paragraph({ style: "Body", children: [new PageBreak()] }), h1("Annexe B · Fiches pas-à-pas"));
children.push(p([r("Les noms de menus ci-dessous proviennent de l'aide officielle de Claude (septembre 2026). L'interface évolue souvent : vérifiez-les sur votre écran avant la séance.", { italics: true, color: MUTED })]));
children.push(h2("B1. Activer les skills et le catalogue"));
children.push(num("Paramètres › Capacités : vérifier que « Exécution de code et création de fichiers » est activé (offres Free, Pro, Max).", "b1"));
children.push(num("En offre Team ou Enterprise : c'est l'administrateur qui autorise les skills, dans Paramètres de l'organisation › Plugins et skills, onglet Politique.", "b1"));
children.push(num("Dans la barre de gauche, ouvrir « Personnaliser » (Customize), puis l'onglet Skills.", "b1"));
children.push(num("Basculer l'interrupteur des skills à activer. Pour les plugins : onglet Plugins, « Parcourir les plugins », puis « Installer ».", "b1"));
children.push(h2("B2. Importer une skill téléchargée (depuis GitHub par exemple)"));
children.push(num("Lire le fichier SKILL.md et vérifier l'auteur (voir diapo 11).", "b2"));
children.push(num("Sur GitHub : bouton « Code » › « Download ZIP ». Décompresser, ne garder que le dossier de la skill (celui qui contient SKILL.md), puis le recompresser en .zip.", "b2"));
children.push(num("Dans Claude : Personnaliser › Skills › bouton « + » › « Créer une skill » › « Importer une skill », puis choisir le .zip.", "b2"));
children.push(p([r("Structure attendue du .zip : le dossier de la skill à la racine, pas les fichiers en vrac.", { italics: true })]));
children.push(...code(["compte-rendu.zip", "└── compte-rendu/", "    ├── SKILL.md", "    └── exemples/  (facultatif)"]));
children.push(h2("B3. Ajouter un plugin depuis un dépôt GitHub"));
children.push(num("Personnaliser › Plugins.", "b3"));
children.push(num("Bouton « + » dans la section Plugins personnels › « Ajouter depuis un dépôt ».", "b3"));
children.push(num("Coller l'adresse du dépôt GitHub, puis installer les plugins proposés.", "b3"));
children.push(h2("B4. Créer une skill avec Claude (Chat ou Cowork)"));
children.push(num("Vérifier que skill-creator est activée : Personnaliser › Skills, parmi les skills d'Anthropic (fiche B8).", "b4"));
children.push(num("Ouvrir une nouvelle conversation (Chat) ou une tâche Cowork, et y joindre si possible un exemple réussi.", "b4"));
children.push(num("Copier le prompt de départ ci-dessous et compléter les crochets.", "b4"));
children.push(num("Répondre aux questions de Claude, relire le SKILL.md proposé, en particulier la description.", "b4"));
children.push(num("Accepter les 2 ou 3 demandes test que propose skill-creator, puis relire les résultats.", "b4"));
children.push(num("Enregistrer le fichier .skill : bouton « Save skill » sur la carte du fichier (sinon, le télécharger et l'importer avec le bouton « + »). Vérifier qu'elle est activée : Personnaliser › Skills, ou Paramètres › Capacités selon l'interface.", "b4"));
children.push(num("Tester dans une NOUVELLE conversation, sans nommer la skill, avec trois demandes : deux qui doivent la déclencher, une qui ne doit pas. La mention « Using [nom de la skill] » dans la réflexion de Claude montre qu'elle a servi.", "b4"));
children.push(num("Si le résultat ne convient pas, revenir dans la conversation de création et décrire précisément ce qui a manqué : Claude met la skill à jour.", "b4"));
children.push(...code([
  "Aide-moi à créer une skill.",
  "Tâche : [ce que je fais chaque semaine, ex. transformer mes notes",
  "de réunion en compte rendu].",
  "Qui lit le résultat : [ex. mon équipe et ma direction].",
  "Format attendu : [ex. 1 page, décisions puis tableau qui/quoi/quand].",
  "Ton : [ex. factuel, phrases courtes].",
  "À éviter : [ex. le jargon, les noms de famille].",
  "Je joins un exemple réussi. Pose-moi tes questions avant de rédiger.",
]));
children.push(h2("B5. Partager une skill"));
children.push(table([2600, 7038], [
  ["Pour qui", "Comment"],
  ["Quelques personnes (toutes offres)", "Envoyer le fichier de la skill (celui remis par Claude à la création, ou un .zip du dossier). Selon la version, le menu « … » de la skill permet aussi de la télécharger. Le destinataire l'importe (fiche B2)."],
  ["Des collègues (Team/Enterprise)", "Menu « … » › « Partager » › saisir des noms ou des e-mails (groupes : Enterprise). Ils peuvent activer la skill, pas la modifier."],
  ["Toute l'organisation (Team/Enterprise)", "« Publier dans l'organisation ». Selon le réglage de l'administrateur, une relecture peut être exigée."],
  ["Le monde entier", "Publier le dossier sur GitHub, ou l'intégrer à un plugin."],
  ["Une équipe de développeurs", "Déposer le dossier dans .claude/skills/ du projet de code : toute l'équipe l'obtient avec le code."],
]));
children.push(p([r("Avant de partager : relire, retirer tout mot de passe, toute donnée personnelle ou confidentielle.", { bold: true, color: ACCENT })], { spacing: { before: 160 } }));
children.push(h2("B6. Claude Code : repères"));
children.push(p("Une skill enregistrée dans votre compte Claude se retrouve aussi dans Claude Code quand vous êtes connecté au même compte. Commandes utiles :"));
children.push(...code([
  "/plugin marketplace add anthropics/skills",
  "/plugin install document-skills@anthropic-agent-skills",
  "/plugin install example-skills@anthropic-agent-skills   (contient skill-creator)",
  "",
  "~/.claude/skills/<nom>/SKILL.md     skill personnelle",
  ".claude/skills/<nom>/SKILL.md       skill partagée avec le projet",
]));
children.push(h2("B7. Créer une skill avec Claude Code, sans terminal"));
children.push(p([r("Première fois ? Travaillez sur une ", {}), r("copie", { bold: true }), r(" de votre dossier : vous ne risquez rien.")]));
children.push(num("Ouvrir l'application Claude sur ordinateur, onglet Code, et choisir le dossier de travail (par exemple un dossier « charte » contenant la charte en PDF et un exemple réussi).", "b7"));
children.push(num("Vérifier le mode de départ : sur Pro, Max et Team, Claude Code démarre en mode auto (il agit sans demander, un second modèle vérifie). Pour une première fois, choisir Manuel ou Plan.", "b7"));
children.push(num("Passer en mode plan : choisir « Plan » dans le sélecteur de mode à côté de la zone de message, ou commencer le message par /plan.", "b7"));
children.push(num("Écrire la demande (prompt ci-dessous). Claude lit les fichiers mais ne modifie rien.", "b7"));
children.push(num("Relire le plan proposé. Pour corriger, répondre « continue à planifier » avec vos remarques (« ajoute une section sur le logo »).", "b7"));
children.push(num("Approuver. Pour une première fois, choisir l'option qui fait valider chaque modification une par une.", "b7"));
children.push(num("Si le dossier .claude/skills/ vient d'être créé, ouvrir une nouvelle session sur le même dossier : Claude Code ne voit pas encore ce nouveau dossier. Astuce : le créer vide à l'avance.", "b7"));
children.push(num("Tester : taper / suivi du nom de la skill (ex. /charte-graphique), ou faire une demande naturelle (« fais-moi une diapo de bienvenue »).", "b7"));
children.push(num("Retrouver la skill dans le dossier .claude/skills/ du projet. Elle reste locale : la synchronisation va du compte Claude vers Claude Code, pas l'inverse. Pour l'utiliser aussi dans Claude sur le web : demander à Claude Code de la compresser en .zip, puis l'importer (fiche B2).", "b7"));
children.push(num("Avant d'installer une skill venue d'ailleurs dans Claude Code, lire la ligne allowed-tools de son en-tête : elle peut autoriser des commandes sans rien vous demander.", "b7"));
children.push(...code([
  "/plan Crée une skill charte-graphique à partir des fichiers de ce dossier,",
  "pour appliquer notre charte à toute présentation ou tout document.",
  "Range-la dans .claude/skills/. Pose-moi tes questions avant d'écrire.",
]));
children.push(table([2600, 7038], [
  ["Mode", "Ce que fait Claude"],
  ["Manuel", "Demande votre accord avant chaque modification ou commande."],
  ["Accepter les modifications", "Modifie les fichiers sans demander, mais demande pour le reste."],
  ["Plan", "Lit et explore, propose un plan, ne modifie rien avant votre accord."],
  ["Auto", "Agit seul ; un second modèle vérifie chaque action et bloque ce qui dépasse la demande."],
]));
children.push(p([r("Dans Chat ou Cowork, on imite le mode plan en écrivant : « propose-moi d'abord un plan, n'écris rien avant mon accord ».", { italics: true, color: MUTED })], { spacing: { before: 160 } }));

children.push(h2("B8. skill-creator : la skill qui fabrique les skills"));
children.push(p("skill-creator est une skill écrite par Anthropic. Dès que vous demandez à Claude de créer ou d'améliorer une skill, il l'ouvre et suit sa méthode. Mieux vaut donc formuler « aide-moi à créer une skill qui… » que « écris-moi un fichier »."));
children.push(h3("Où la trouver"));
children.push(bullet("Claude (web, application, Cowork) : Personnaliser › Skills, parmi les skills d'Anthropic ; vérifier qu'elle est activée."));
children.push(bullet("Claude Code : disponible via votre compte si elle y est activée ; sinon /plugin marketplace add anthropics/skills, puis /plugin install example-skills@anthropic-agent-skills."));
children.push(h3("Sa méthode, en six temps"));
children.push(num("Comprendre : que doit faire la skill ? quand doit-elle se déclencher (avec quels mots) ? quel format de résultat ? faut-il prévoir des tests ? Puis les cas particuliers, les exemples, les critères de réussite.", "b8"));
children.push(num("Rédiger le SKILL.md selon les bonnes pratiques : description précise, texte concis qui explique le pourquoi, fichiers annexes si besoin.", "b8"));
children.push(num("Tester sur 2 ou 3 demandes réalistes, celles qu'un utilisateur ferait vraiment.", "b8"));
children.push(num("Comparer les résultats avec et sans la skill (Cowork et Code).", "b8"));
children.push(num("Améliorer à partir de vos retours, en généralisant plutôt qu'en collant aux exemples ; recommencer jusqu'à satisfaction.", "b8"));
children.push(num("Affiner la description sur une vingtaine de demandes, dont une partie ne doit PAS déclencher la skill (Cowork et Code).", "b8"));
children.push(p("Enfin, elle empaquette la skill en un fichier .skill. Dans Claude, la carte du fichier affiche un bouton « Save skill » qui l'installe dans votre profil, si votre organisation autorise la création de skills."));
children.push(h3("Selon la porte"));
children.push(table([3238, 2133, 2133, 2134], [
  ["Étape", "Chat", "Cowork", "Code"],
  ["Entretien et rédaction", "oui", "oui", "oui"],
  ["Tests sur cas réels", "oui, un par un", "oui, en parallèle", "oui, en parallèle"],
  ["Comparaison avec / sans skill", "non", "oui", "oui"],
  ["Résultats à relire", "dans la conversation", "page de résultats", "page de résultats"],
  ["Affiner la description", "non", "oui", "oui"],
  ["Installation", "« Save skill »", "« Save skill »", "dossier .claude/skills/"],
]));
children.push(h3("Bon à savoir"));
children.push(bullet("Pour améliorer une skill existante, demandez-le à Claude en la nommant : skill-creator garde son nom d'origine, pour que la nouvelle version remplace l'ancienne."));
children.push(bullet("Pour des tests pertinents, choisissez des demandes un peu substantielles : Claude ne consulte pas une skill pour une tâche simple qu'il sait faire seul en une étape."));
children.push(bullet("Vous pouvez dire « pas besoin de tests, on avance » : la méthode est souple. Mais pour une skill partagée à une équipe, gardez les tests."));
children.push(encadre("Cowork ou Code pour créer une skill ?", [
  [r("Où vit la skill. ", { bold: true }), r("Cowork : dans votre compte Claude (fichier .skill, bouton « Save skill »), donc disponible partout : Chat, Cowork et Claude Code. Code : dans un dossier (.claude/skills/ du projet, ou ~/.claude/skills/ pour vous), utilisable tout de suite mais seulement dans Claude Code.")],
  [r("Sens de la synchronisation. ", { bold: true }), r("Du compte vers Code, jamais l'inverse. Une skill créée dans Code s'importe dans le compte en compressant son dossier (fiche B2).")],
  [r("Réservé à Code. ", { bold: true }), r("Paramètres ($ARGUMENTS), commande lancée avant la skill pour injecter des données, lancement manuel uniquement (disable-model-invocation), exécution isolée (context: fork), mode plan, historique des versions avec Git. Écrits pour Code, ces réglages ne fonctionnent pas ou autrement dans Cowork et Chat.")],
  [r("Relire les tests de skill-creator. ", { bold: true }), r("Cowork : une page HTML à ouvrir soi-même, les commentaires reviennent sous forme de fichier. Code : la page s'ouvre directement.")],
  [r("Partager en équipe. ", { bold: true }), r("Cowork : Partager ou Publier dans l'organisation (Team/Enterprise). Code : ranger la skill dans le dépôt Git du projet.")],
  [r("En pratique. ", { bold: true }), r("Skill métier pour tous : Cowork. Skill à versionner, relire ou partager avec une équipe technique : Code. Le meilleur des deux : créer et tester dans Code, puis importer le .skill dans le compte.")],
  [r("Le mode plan n'est documenté que pour Claude Code.", { italics: true, color: MUTED })],
]));

// Exemple complet
children.push(new Paragraph({ style: "Body", children: [new PageBreak()] }), h1("Annexe C · Exemple de SKILL.md complet"));
children.push(p("À montrer pendant l'atelier comme point de comparaison."));
children.push(bullet([r("Nom", { bold: true }), r(" : minuscules, chiffres et tirets, 64 caractères au plus, sans les mots « claude » ni « anthropic ».")]));
children.push(bullet([r("Description", { bold: true }), r(" : une seule ligne, 200 caractères au plus dans Claude, à la troisième personne, avec ce que fait la skill ET « Utiliser quand… ».")]));
children.push(bullet([r("Fichiers annexes", { bold: true }), r(" : les citer depuis le SKILL.md en disant quand les lire, sur un seul niveau (pas de renvoi en cascade). Garder le SKILL.md sous 500 lignes.")]));
children.push(...code([
  "---",
  "name: compte-rendu",
  "description: Rédige un compte rendu de réunion d'une page à notre format. Utiliser quand l'utilisateur colle des notes de réunion ou demande un CR ou une synthèse.",
  "---",
  "",
  "# Compte rendu de réunion",
  "",
  "## Étapes",
  "1. Repérer dans les notes : date, participants, sujets, décisions.",
  "2. Rédiger en 3 parties : Contexte (2 lignes), Décisions, Actions.",
  "3. Terminer par un tableau : Qui | Quoi | Pour quand.",
  "",
  "## Règles",
  "- Une page maximum, phrases courtes, ton factuel.",
  "- Prénoms seulement, jamais d'information personnelle.",
  "- Si une échéance manque, écrire « à définir » plutôt qu'inventer.",
  "",
  "## Exemple réussi",
  "Avant de rédiger, lire exemples/cr-type.md et en reprendre la structure.",
]));

// Corrigé du quiz
children.push(new Paragraph({ style: "Body", children: [new PageBreak()] }), h1("Annexe D · Corrigé du quiz"));
QUIZ.forEach((q, i) => {
  children.push(h3(`Question ${i + 1} · ${q.q}`));
  children.push(p(q.a.map((a, k) => r(`${"ABCD"[k]}. ${a}    `, k === q.ok ? { bold: true, color: GREEN } : { color: MUTED }))));
  children.push(labelled("Réponse " + "ABCD"[q.ok], q.why, GREEN));
});

// Atelier
children.push(new Paragraph({ style: "Body", children: [new PageBreak()] }), h1("Annexe E · Atelier de mise en pratique"));
children.push(p([r("Consigne : ", { bold: true }), r("créez la skill d'une tâche que vous répétez chaque semaine, dans la porte de votre choix.")]));
children.push(h2("Trois parcours au choix"));
children.push(table([2000, 3819, 3819], [
  ["Parcours", "Pour qui", "Appui"],
  ["Chat", "Première skill, surtout du texte", "Fiche B4 et prompt de départ"],
  ["Cowork", "Skill qui s'appuie sur vos fichiers", "Fiche B4, dossier avec vos modèles"],
  ["Code accompagné", "Envie d'essayer Code, en sécurité", "Fiche B7, mode plan obligatoire, copie du dossier"],
]));
children.push(p([r("Variante : suivre le cas d'usage de Claude Academy sur la charte de marque (annexe G), dans l'un des trois parcours.", { italics: true })], { spacing: { before: 160 } }));
children.push(h2("Trois idées de sujets"));
children.push(bullet([r("Compte rendu de réunion", { bold: true }), r(" : des notes en vrac deviennent un compte rendu d'une page avec un tableau d'actions.")]));
children.push(bullet([r("Réponse type à un e-mail", { bold: true }), r(" : demande d'information, relance, refus poli, dans le ton de la maison.")]));
children.push(bullet([r("Post pour les réseaux", { bold: true }), r(" : un texte d'actualité devient un post LinkedIn au format habituel (accroche, trois points, appel à l'action).")]));
children.push(h2("Déroulé conseillé"));
children.push(num("5 min : choisir la tâche et retrouver un exemple réussi.", "e1"));
children.push(num("10 min : créer la skill avec le prompt de départ (fiche B4, ou B7 pour Code).", "e1"));
children.push(num("10 min : tester dans une nouvelle conversation, puis ajuster.", "e1"));
children.push(num("5 min : présenter sa skill à son voisin, qui la teste à son tour.", "e1"));
children.push(h2("Grille d'auto-évaluation"));
children.push(table([7238, 2400], [
  ["Critère", "Oui / Non"],
  ["La description dit ce que fait la skill ET quand l'utiliser (« Utiliser quand… »)", ""],
  ["La skill se déclenche seule dans une nouvelle conversation (mention « Using… »)", ""],
  ["Elle ne se déclenche PAS sur une demande sans rapport", ""],
  ["La description tient en 200 caractères et le nom est en minuscules avec tirets", ""],
  ["Elle contient au moins un exemple réussi", ""],
  ["Elle traite une seule tâche", ""],
  ["Elle ne contient aucune donnée personnelle ni confidentielle", ""],
  ["Elle ne contient aucune date ni mention « cette année » qui vieillira", ""],
]));

// Liens et points à vérifier
children.push(new Paragraph({ style: "Body", children: [new PageBreak()] }), h1("Annexe F · Pour aller plus loin"));
const links = [
  ["Tous les supports de cette séance (présentation, notes, sources)", REPO],
  ["Utiliser les skills dans Claude (aide officielle)", "https://support.claude.com/en/articles/12512180-use-skills-in-claude"],
  ["Qu'est-ce qu'une skill ?", "https://support.claude.com/en/articles/12512176-what-are-skills"],
  ["Créer une skill personnalisée", "https://support.claude.com/en/articles/12512198-how-to-create-custom-skills"],
  ["Gérer les skills d'une organisation", "https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization"],
  ["Utiliser les plugins", "https://support.claude.com/en/articles/13837440-use-plugins-in-claude"],
  ["Dépôt d'exemples d'Anthropic", "https://github.com/anthropics/skills"],
  ["skill-creator : son code source (dépôt anthropics/skills)", "https://github.com/anthropics/skills/tree/main/skills/skill-creator"],
  ["Bonnes pratiques de rédaction de skills (Anthropic)", "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices"],
  ["Skills dans Claude Code", "https://code.claude.com/docs/en/skills"],
  ["Standard ouvert Agent Skills", "https://agentskills.io"],
  ["Cas d'usage : empaqueter sa charte de marque (Claude Academy)", ACADEMY],
  ["Créer une skill en conversation avec Claude (Claude Academy)", "https://academy.claude.com/tutorials/how-to-create-a-skill-with-claude-through-conversation"],
  ["Modes de permission et mode plan (Claude Code)", "https://code.claude.com/docs/en/permission-modes"],
  ["Claude Code dans des dossiers de notes et de documents", "https://code.claude.com/docs/en/common-workflows"],
  ["Chat et Cowork réunis en un seul Claude (annonce)", "https://claude.com/blog/cowork-is-now-claude"],
];
links.forEach(([t, u]) => children.push(bullet([link(t, u), r("  " + u.replace(/^https:\/\//, ""), { color: MUTED, size: 18 })])));
children.push(h2("À vérifier le jour J"));
children.push(bullet("Le libellé exact des menus dans la langue de l'interface (« Personnaliser » / « Customize », « Importer une skill »…) et l'emplacement de la liste des skills : l'aide cite Personnaliser › Skills, le tutoriel Academy Paramètres › Capacités › Skills."));
children.push(bullet("Que skill-creator est activée sur le poste de démo et ceux des participants, et que le bouton « Save skill » apparaît bien (il dépend des droits de l'organisation)."));
children.push(bullet("Si le menu d'une skill permet de la télécharger, pour le partage."));
children.push(bullet("Pour le parcours « Code accompagné » de l'atelier : créer à l'avance le dossier vide .claude/skills/ dans le dossier de travail, et régler le mode sur Manuel ou Plan."));
children.push(bullet("Que l'option « Exécution de code et création de fichiers » est bien active sur le poste de démo et sur ceux des participants."));
children.push(bullet("En Team/Enterprise : que l'administrateur a autorisé les skills et le partage, et quel est le réglage de publication (à partir du 2 octobre 2026, « Relecture requise » s’appliquera par défaut aux organisations qui n’ont rien choisi)."));
children.push(bullet(`La démo en direct (diapo ${slideNo("demo")}) : prévoir la maquette comme solution de repli si le réseau fait défaut.`));
children.push(bullet("Que l'onglet Code de l'application de bureau est installé et connecté au compte sur le poste de démo, et sur les postes du parcours « Code accompagné »."));
children.push(bullet("En Team/Enterprise : si l'administrateur a désactivé le mode auto, l'option d'approbation du plan s'intitule « accepter automatiquement les modifications »."));
children.push(h2("Limites de ce support"));
children.push(p("Ce support décrit Claude tel que documenté en septembre 2026. Les noms de menus, les offres concernées et les modalités de partage évoluent régulièrement. Les maquettes d'écran des diapos sont stylisées : elles ne reproduisent pas l'interface réelle. En cas de doute, l'aide officielle de Claude fait foi."));

// Cas d'usage Academy
children.push(new Paragraph({ style: "Body", children: [new PageBreak()] }), h1("Annexe G · Cas d'usage : la charte de marque"));
children.push(p([r("Source : ", { bold: true }), link("Claude Academy, « Empaquetez vos directives de marque dans un skill »", ACADEMY), r(" (environ 20 min, catégorie Marketing).  " + ACADEMY.replace(/^https:\/\//, ""), { color: MUTED, size: 18 })]));
children.push(h2("L'idée"));
children.push(p("Donner une fois pour toutes votre charte graphique à Claude pour qu'il l'applique automatiquement à chaque présentation, document ou tableur, sans avoir à la rappeler."));
children.push(h2("Les étapes de la ressource"));
children.push(num("Décrire la tâche : un prompt qui donne la palette de couleurs (avec le rôle de chaque couleur), la typographie (titres, texte, polices de secours) et les règles d'application.", "g1"));
children.push(num("Donner du contexte : joindre la charte existante, ou connecter Google Drive pour que Claude lise le fichier de référence. La réflexion étendue est conseillée en option.", "g1"));
children.push(num("Ce que Claude crée : un SKILL.md avec les spécifications de la marque, un fichier détaillé couleurs et typographie, des exemples d'usage et un petit script qui applique les couleurs de manière identique à chaque fois.", "g1"));
children.push(num("Tester sans mentionner la charte, par exemple : « Crée une présentation de bilan trimestriel ».", "g1"));
children.push(num("Mettre à jour la skill au fil de l'eau, puis la combiner avec d'autres skills.", "g1"));
children.push(h2("Prompt de départ à adapter"));
children.push(...code([
  "Je souhaite créer une skill qui applique le style de marque de notre",
  "organisation à toute présentation, tout document et tout tableur.",
  "Palette : [couleur texte] ; [couleur fond] ; [accent principal] ;",
  "  [accents secondaires], avec le rôle de chacune.",
  "Typographie : titres en [police], texte en [police] ; secours : [polices].",
  "Règles : [quelle couleur pour quel élément, alternance des accents…].",
  "Crée une skill complète avec une structure adaptée, que je pourrai",
  "utiliser chaque fois que je crée un document.",
]));
children.push(p([r("Pour la démo, le prompt de la page Academy peut être utilisé tel quel ; pendant l'atelier, remplacez-le par la charte de votre organisation.", { italics: true, color: MUTED })]));
children.push(h2("Dans les trois portes"));
children.push(table([2000, 7638], [
  ["Porte", "Déroulé"],
  ["Chat", "Coller le prompt, répondre aux questions, enregistrer la skill : c'est le chemin décrit par la ressource."],
  ["Cowork", "Pointer le dossier qui contient la charte en PDF : Claude la lit, crée la skill et produit un exemple pour vérifier."],
  ["Code", "Mode plan : relire la structure proposée, la corriger, approuver ; tester aussitôt avec /charte-graphique (fiche B7)."],
]));

const doc = new Document({
  creator: AUTHOR.name,
  title: "Apprenez un savoir-faire à Claude : notes du présentateur",
  description: "Notes du présentateur et document distribué",
  styles: {
    default: { document: { run: { font: FONT, size: 22, color: INK, language: LANG } } },
    paragraphStyles: [
      { id: "Body", name: "Body Text", run: { font: FONT, language: LANG, size: 22, bold: false, color: INK }, paragraph: { spacing: { after: 120, line: 276 } } },
      { id: "Heading1", name: "Heading 1", next: "Body", quickFormat: true, run: { size: 36, bold: true, color: INK }, paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", next: "Body", quickFormat: true, run: { size: 28, bold: true, color: ACCENT }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", next: "Body", quickFormat: true, run: { size: 23, bold: true, color: INK }, paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      ...["steps", "b1", "b2", "b3", "b4", "b7", "b8", "e1", "g1"].map((ref) => ({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] })),
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          style: "Body",
          alignment: AlignmentType.CENTER,
          children: [r(`${AUTHOR.name} · ${AUTHOR.email} · page `, { size: 16, color: MUTED }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED, font: FONT, language: LANG })],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "..", "skills-claude-notes-presentateur.docx");
  fs.writeFileSync(out, buf);
  console.log("OK", out);
});
