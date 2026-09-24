// Source unique : diapos + notes du présentateur.
// build_pptx.js et build_docx.js lisent ce fichier ; ne jamais éditer les notes ailleurs.

const REPO = "https://github.com/StephaneBayle/creer-une-skill-claude";
const ACADEMY = "https://academy.claude.com/fr/use-cases/package-your-brand-guidelines-in-a-skill";

const AUTHOR = {
  name: "Stéphane Bayle",
  email: "stephane.bayle@gmail.com",
  linkedin: "https://www.linkedin.com/in/stephanebayle/",
  github: "https://github.com/StephaneBayle",
};

const SECTIONS = {
  intro: { label: "Introduction", icon: "FaPlay" },
  s1: { label: "1 · Comprendre", icon: "FaFileLines" },
  s2: { label: "2 · Projet ou skill", icon: "FaScaleBalanced" },
  s3: { label: "3 · Récupérer", icon: "FaDownload" },
  s4: { label: "4 · Où créer", icon: "FaDoorOpen" },
  s5: { label: "5 · Créer", icon: "FaWandMagicSparkles" },
  s6: { label: "6 · Partager", icon: "FaShareNodes" },
  quiz: { label: "Quiz", icon: "FaCircleQuestion" },
  end: { label: "Conclusion", icon: "FaFlagCheckered" },
};

// Couleurs des lettres de réponse : A rouge, B bleu, C vert, D jaune.
const QUIZ = [
  {
    q: "Qu'est-ce qui décide Claude à utiliser une skill ?",
    a: ["Son nom de fichier", "Sa description", "Sa longueur", "Sa date de création"],
    ok: 1,
    why: "Claude lit en permanence le nom et la description de chaque skill activée, et c'est la description qui fait l'essentiel du choix. Une description floue fait une skill qui ne se déclenche jamais, ou qui se déclenche à tort. C'est la phrase la plus importante de la skill.",
  },
  {
    q: "« Tout le suivi du client Dupont » : projet ou skill ?",
    a: ["Un projet", "Une skill", "Les deux, obligatoirement", "Ni l'un ni l'autre"],
    ok: 0,
    why: "Un sujet précis, avec ses documents et son historique, relève du projet. Le client Dupont n'est pas un savoir-faire réutilisable ailleurs. En revanche, « rédiger une relance client à notre manière » serait une skill… qu'on pourrait utiliser dans le projet Dupont.",
  },
  {
    q: "Quel fichier est indispensable dans une skill ?",
    a: ["README.txt", "config.json", "SKILL.md", "index.html"],
    ok: 2,
    why: "Une skill, c'est un dossier qui contient au minimum un fichier SKILL.md : un en-tête avec le nom et la description, puis les instructions en texte simple. Tout le reste (modèles, exemples, scripts) est facultatif.",
  },
  {
    q: "Une skill géniale trouvée sur GitHub. Première chose ?",
    a: ["L'installer tout de suite", "La partager à l'équipe", "La renommer", "Lire son contenu"],
    ok: 3,
    why: "Une skill donne des instructions à Claude et peut contenir des scripts qu'il exécutera. On ne l'installe donc qu'après l'avoir lue et avoir identifié son auteur. C'est la même hygiène que pour une pièce jointe inconnue.",
  },
  {
    q: "Le plus simple pour créer votre première skill ?",
    a: ["Apprendre à coder", "Le demander à Claude", "Acheter un plugin", "Écrire au support"],
    ok: 1,
    why: "Il suffit de dire à Claude « aide-moi à créer une skill qui… ». Il pose des questions, rédige le SKILL.md et propose de l'enregistrer. Aucune ligne de code n'est nécessaire.",
  },
  {
    q: "Team/Enterprise : la rendre disponible à tous ?",
    a: ["L'envoyer par mail à chacun", "La copier dans un projet", "La publier dans l'organisation", "C'est impossible"],
    ok: 2,
    why: "Dans Personnaliser › Skills, « Publier dans l'organisation » la rend disponible à tous (avec une relecture si l'administrateur l'exige). « Partager » la donne à quelques collègues choisis. En offre individuelle, on passe par le fichier .zip.",
  },
  {
    q: "En mode plan, que fait Claude ?",
    a: ["Il modifie directement vos fichiers", "Il propose un plan et attend votre feu vert", "Il programme une tâche récurrente", "Il remplit votre agenda"],
    ok: 1,
    why: "En mode plan, Claude lit et explore, mais ne modifie rien. Il présente un plan, et vous choisissez : approuver, approuver en validant chaque modification, ou continuer à planifier en le corrigeant. C'est la meilleure façon de débuter avec Claude Code.",
  },
  {
    q: "Pour utiliser Claude Code, il faut…",
    a: ["Savoir programmer", "Ouvrir un terminal", "Un dossier et des consignes en français", "Une licence développeur"],
    ok: 2,
    why: "Claude Code travaille dans n'importe quel dossier, y compris un dossier de documents. Il existe un onglet Code dans l'application de bureau, donc pas besoin de terminal, et on lui écrit en français comme dans Chat.",
  },
  {
    q: "Pour vous aider à créer une skill, Claude s'appuie sur…",
    a: ["brand-guidelines", "skill-creator", "docx", "Rien, il improvise"],
    ok: 1,
    why: "skill-creator est la skill d'Anthropic qui fabrique les skills : elle guide l'entretien, la rédaction du SKILL.md, les tests, l'amélioration et l'affinage de la description, puis empaquette le résultat. Elle est plus complète dans Cowork et Claude Code que dans Chat.",
  },
];

// kind : type de mise en page dans build_pptx.js
// sec : section (pastille en haut à gauche)
// time : secondes
const SLIDES = [
  {
    kind: "title", sec: "intro", time: 30,
    title: "Apprenez un savoir-faire à Claude",
    subtitle: "Créer, trouver et partager une skill",
    notes: {
      objectif: "Accueillir, poser le cadre et annoncer la promesse de la séance.",
      script: "Bonjour à toutes et à tous. Pendant une petite heure, on va parler d'une fonction de Claude qui change la façon de travailler avec lui : les skills, qu'on peut traduire par « compétences ». Pas besoin de savoir coder : si vous savez expliquer une tâche à un nouveau collègue, vous savez créer une skill. Le déroulé : d'abord comprendre ce que c'est, ensuite voir où en trouver, puis choisir où la créer (Chat, Cowork ou Code, avec le mode plan pour ne rien casser), la créer avec skill-creator, la skill d'Anthropic qui fabrique les skills, et enfin la partager. On finit par un petit quiz où vous répondrez à voix haute, et juste après, vous passez à la pratique sur vos propres cas.",
      question: "À main levée : qui utilise Claude au moins une fois par semaine ?",
      transition: "Je commence par une question qui fâche un peu…",
    },
  },
  {
    kind: "hook", sec: "intro", time: 90,
    title: "Combien de fois avez-vous recopié la même consigne ?",
    notes: {
      objectif: "Faire ressentir le problème avant de donner la solution.",
      script: "Regardez ces trois messages. C'est la même consigne, recopiée trois fois : « rédige dans notre ton, une page maximum, avec un tableau des actions à la fin ». Vous l'avez sans doute déjà vécu : on garde un fichier de prompts quelque part, on copie, on colle, on oublie un morceau, et le résultat change d'une fois à l'autre. Claude ne se souvient pas de votre façon de faire d'une conversation à l'autre, sauf si vous la lui rangez quelque part. Une skill, c'est justement cet endroit : vous expliquez la méthode une bonne fois, et Claude la ressort toute seule chaque fois que la tâche se présente.",
      question: "Quelle consigne recopiez-vous le plus souvent ? Deux ou trois exemples dans la salle. Notez-les au tableau : ce seront des sujets pour l'atelier.",
      transition: "Voici le chemin qu'on va parcourir ensemble.",
    },
  },
  {
    kind: "agenda", sec: "intro", time: 30,
    title: "Au programme",
    items: [
      ["FaFileLines", "Comprendre"],
      ["FaScaleBalanced", "Projet ou skill"],
      ["FaDownload", "Récupérer"],
      ["FaDoorOpen", "Où créer"],
      ["FaWandMagicSparkles", "Créer"],
      ["FaShareNodes", "Partager"],
    ],
    notes: {
      objectif: "Donner la carte du parcours, un picto par étape.",
      script: "Six étapes, un picto chacune. Chaque partie s'ouvre sur une diapo colorée avec son numéro et son picto, et le pied de page de chaque diapo rappelle la partie en cours. On termine par un quiz, à l'oral.",
      question: "",
      transition: "Première étape : qu'est-ce qu'une skill, concrètement ?",
    },
  },
  {
    kind: "cards", sec: "s1", time: 90,
    title: "Un classeur de fiches méthode",
    caption: "Claude n'ouvre que ce qui sert.",
    cards: ["Compte rendu", "Devis", "Charte graphique", "Mail client"],
    pick: 0,
    levels: [
      ["1", "Toujours lu", "nom + description"],
      ["2", "Lu si utile", "la méthode"],
      ["3", "Si besoin", "les annexes"],
    ],
    notes: {
      objectif: "Donner une image mentale simple et exacte de la façon dont Claude utilise une skill : trois niveaux de lecture.",
      script: "Imaginez un classeur de fiches méthode posé à côté de Claude. L'aide officielle de Claude décrit précisément comment il s'en sert, en trois niveaux. Niveau 1 : pour chaque skill activée, Claude a toujours sous les yeux le nom et la description, c'est-à-dire l'onglet de la fiche et la phrase qui dit quand s'en servir. Juste assez pour savoir quand la skill est utile, sans charger tout son contenu ; c'est pour cela qu'on peut avoir beaucoup de skills sans encombrer Claude. Niveau 2 : quand votre demande correspond à une description (« fais-moi le compte rendu de cette réunion »), Claude sort la fiche et lit la méthode, le corps du fichier SKILL.md. Niveau 3 : si la méthode ne suffit pas, il consulte les fichiers annexes rangés avec la fiche, un modèle, un exemple, une grille, et seulement ceux dont il a besoin. Les autres fiches restent fermées. Deux conséquences pratiques. D'abord, tout se joue au niveau 1 : une description floue, et la fiche n'est jamais sortie du classeur. Ensuite, on peut mettre beaucoup de détails dans les annexes sans alourdir le travail de Claude, à condition que la méthode dise quand les lire. Vous n'avez rien à faire pour déclencher tout cela : Claude va chercher la fiche tout seul. Vous pouvez aussi l'appeler vous-même en tapant « / » dans la zone de message.",
      question: "Si vous aviez une seule fiche à écrire pour Claude demain matin, ce serait laquelle ?",
      transition: "Ouvrons une de ces fiches pour voir ce qu'il y a dedans.",
    },
  },
  {
    kind: "anatomy", sec: "s1", time: 90,
    title: "Ce qu'il y a dans une skill",
    notes: {
      objectif: "Montrer qu'une skill est un simple dossier avec un fichier texte, sans rien de technique.",
      script: "Une skill, c'est un dossier. Dedans, un fichier obligatoire qui s'appelle SKILL.md : c'est du texte simple, comme un document Word sans mise en forme. En haut, deux lignes d'en-tête. Le nom, d'abord : court, en minuscules, avec des tirets. Puis la description, la phrase la plus importante, parce que c'est elle qui dit à Claude QUAND utiliser la skill. En dessous, les instructions, écrites comme vous les donneriez à un nouveau collègue : les étapes, le ton, ce qu'il faut éviter, un exemple de résultat réussi. En option, le dossier peut contenir d'autres fichiers : un modèle Word, votre charte, des exemples, voire un petit script. Claude ne les ouvre que s'il en a besoin. Retenez que le « .md » veut dire Markdown, un format de texte tout simple : des dièses pour les titres, des tirets pour les listes. Pas de code à apprendre.",
      question: "Qui a déjà rédigé une fiche de procédure ou un mode opératoire pour un collègue ? Vous savez donc déjà écrire une skill.",
      transition: "Concrètement, qu'est-ce que ça change au résultat ?",
    },
  },
  {
    kind: "beforeafter", sec: "s1", time: 60,
    title: "Même demande, autre résultat",
    notes: {
      objectif: "Rendre visible la valeur ajoutée d'une skill.",
      script: "Même demande à gauche et à droite : « fais le compte rendu de la réunion ». À gauche, sans skill : un texte correct mais générique, avec des titres standards, une longueur au hasard, et pas de tableau d'actions. Il faut tout reprendre. À droite, avec la skill « compte-rendu » : votre structure, votre ton, le tableau « qui fait quoi pour quand », une page maximum. Et c'est pareil la dixième fois que la première. C'est ça, le vrai gain : la régularité, sans répéter la consigne.",
      question: "",
      transition: "Vous vous dites peut-être : « mais ça, je le fais déjà avec les Projets ». Justement, voyons la différence.",
    },
  },
  {
    kind: "versus", sec: "s2", time: 90,
    title: "Projet ou skill ?",
    tagline: "Le projet sait QUOI. La skill sait COMMENT.",
    notes: {
      objectif: "Clarifier la confusion la plus fréquente : Projet et Skill sont complémentaires.",
      script: "Un projet, c'est un bureau consacré à un sujet : on y range des documents de référence et des consignes, et toutes les conversations du projet y ont accès. Par exemple « Salon de mars », « Client Dupont », « Rapport annuel ». Le projet sait QUOI : il connaît le contexte. Mais il reste dans son bureau : ses consignes ne servent pas ailleurs. Une skill, c'est une compétence : une manière de faire que Claude emporte partout, dans n'importe quelle conversation ou projet, et même dans Cowork ou Claude Code. La skill sait COMMENT. Les deux se combinent très bien : dans le projet « Client Dupont », Claude utilisera votre skill « relance client » pour écrire le mail. Un repère simple : si c'est un sujet, c'est un projet ; si c'est une façon de faire qui revient, c'est une skill.",
      question: "",
      transition: "On vérifie tout de suite que c'est clair, avec quatre cas.",
    },
  },
  {
    kind: "which", sec: "s2", time: 60,
    title: "Projet ou skill ? À vous !",
    cases: [
      ["Suivre le dossier du client Dupont", "Projet"],
      ["Appliquer notre charte à chaque document", "Skill"],
      ["Préparer le salon de mars", "Projet"],
      ["Rédiger nos offres d'emploi au même format", "Skill"],
    ],
    notes: {
      objectif: "Ancrer la distinction par l'exercice, à main levée.",
      script: "Pour chaque carte, je demande : main gauche pour projet, main droite pour skill. Réponses : Dupont, c'est un projet (un sujet, des documents). La charte à appliquer partout, c'est une skill (une façon de faire, réutilisable). Le salon de mars, c'est un projet. Les offres d'emploi au même format, c'est une skill. Piège fréquent : « mais le salon a aussi des mails à rédiger ». Oui : le projet contient le contexte du salon, et une skill « mail d'invitation » peut servir dedans. Si vous manquez de temps, ne faites que deux cartes.",
      question: "Main gauche : projet. Main droite : skill. Carte par carte.",
      transition: "Bonne nouvelle : vous n'avez pas besoin de tout créer vous-mêmes. Beaucoup de skills existent déjà.",
    },
  },
  {
    kind: "catalog", sec: "s3", time: 75,
    title: "Le catalogue : activer en un clic",
    notes: {
      objectif: "Montrer où trouver et activer les skills et plugins déjà prêts.",
      script: "Dans Claude, sur le web, dans l'application ou dans Cowork, ouvrez « Personnaliser » dans la barre de gauche (Customize en anglais). Vous y trouvez les onglets Skills et Plugins. Côté Skills, Anthropic fournit des skills prêtes à l'emploi, par exemple pour produire un document Word, un PowerPoint, un tableur ou un PDF propre. Il suffit de basculer l'interrupteur. Vérifiez au passage que skill-creator est activée : c'est la skill d'Anthropic sur laquelle Claude s'appuie pour vous aider à créer les vôtres. Côté Plugins, « Parcourir les plugins » ouvre le catalogue : un plugin, c'est un paquet prêt à l'emploi qui réunit plusieurs skills, parfois avec des connecteurs vers vos outils (Notion, Canva, Figma, Atlassian…). On clique sur « Installer ». Deux conditions : l'option « Exécution de code et création de fichiers » doit être activée dans Paramètres › Capacités ; et en offre Team ou Enterprise, c'est l'administrateur qui autorise les skills pour l'organisation. Les noms exacts des menus peuvent varier selon la version : vérifiez-les le jour J sur votre écran.",
      question: "Qui a déjà ouvert le menu Personnaliser ? Qu'y avez-vous trouvé ?",
      transition: "Et si la skill qui vous intéresse n'est pas dans le catalogue ? Direction GitHub.",
    },
  },
  {
    kind: "github", sec: "s3", time: 90,
    title: "Depuis GitHub, en trois gestes",
    steps: [
      ["FaGithub", "Trouver", "un dépôt de confiance"],
      ["FaFileZipper", "Télécharger", "le dossier en .zip"],
      ["FaUpload", "Importer", "Personnaliser › Skills › +"],
    ],
    notes: {
      objectif: "Rendre accessible la récupération d'une skill publiée sur GitHub.",
      script: "GitHub, c'est une immense bibliothèque de fichiers partagés, très utilisée pour publier des skills. La référence : le dépôt « anthropics/skills », tenu par Anthropic, qui contient des dizaines d'exemples et un modèle vierge. Trois gestes. Un : trouver la skill et ouvrir son dossier. Deux : la télécharger en .zip (bouton vert « Code », puis « Download ZIP », et ne garder que le dossier de la skill, celui qui contient SKILL.md). Trois : dans Claude, Personnaliser › Skills, bouton « + », « Importer une skill », puis choisir le .zip. Attention au format : le .zip doit contenir le dossier de la skill, pas les fichiers en vrac. Pour un plugin complet, c'est encore plus simple : Personnaliser › Plugins, « + », « Ajouter depuis un dépôt », et on colle l'adresse GitHub. Pour ceux qui utilisent Claude Code : la commande /plugin marketplace add anthropics/skills fait la même chose.",
      question: "",
      transition: "Mais avant d'importer quoi que ce soit, une règle d'or.",
    },
  },
  {
    kind: "stop", sec: "s3", time: 45,
    title: "On n'installe pas une skill qu'on n'a pas lue",
    subtitle: "Une skill donne des ordres à Claude, et peut contenir des scripts.",
    notes: {
      objectif: "Installer un réflexe de sécurité.",
      script: "Une skill, ce sont des instructions que Claude va suivre, parfois accompagnées de scripts qu'il exécutera. Une skill malveillante pourrait lui demander d'envoyer vos données ailleurs, ou de faire autre chose que ce qu'annonce son titre. Trois réflexes : je connais l'auteur, ou la source est officielle ; j'ouvre le SKILL.md et je le lis (c'est du texte, ça se lit en deux minutes) ; s'il y a des scripts que je ne comprends pas, je demande à quelqu'un de compétent, ou je demande à Claude de m'expliquer ce qu'ils font avant d'installer. Pour Claude Code, un point de plus : l'en-tête d'une skill peut contenir une ligne allowed-tools qui autorise d'avance certaines commandes sans rien vous demander. Si vous la voyez, lisez-la avec attention. En entreprise, l'offre Enterprise peut analyser automatiquement les skills importées. Ça n'empêche pas de lire.",
      question: "",
      transition: "Passons à la création. Première question : où ?",
    },
  },
  {
    kind: "doors", sec: "s4", time: 90,
    title: "Chat, Cowork ou Code ?",
    banner: "Chat et Cowork réunis",
    doors: [
      ["FaComments", "Chat", "Je décris, Claude rédige", "Le plus simple"],
      ["FaLaptopFile", "Cowork", "Claude agit sur mes fichiers", "Avec mes fichiers"],
      ["FaTerminal", "Code", "Claude agit dans un dossier", "Le plus complet"],
    ],
    notes: {
      objectif: "Présenter les trois portes d'entrée et annoncer qu'aucune n'est réservée aux experts.",
      script: "Trois portes, une même skill. Chat, c'est la conversation classique, sur le web ou dans l'application : vous dites « aide-moi à créer une skill », Claude vous interroge, rédige, et vous remet un fichier de skill à enregistrer. Cowork, c'est le mode où Claude travaille dans vos dossiers et produit de vrais fichiers. Petite actualité : Chat et Cowork ont fusionné. Il n'y a plus qu'un seul Claude, qui converse et qui agit dans vos dossiers selon ce que vous lui demandez ; on garde ici les deux noms pour distinguer les deux façons de travailler. Rien ne s'est perdu dans la fusion : vos skills, projets et connecteurs ont suivi. Code, enfin, c'est Claude Code. Son nom fait peur, mais c'est simplement Claude qui travaille dans un dossier de votre ordinateur, avec plus de contrôle. Il est disponible dans un onglet de l'application de bureau, sans écran noir ni ligne de commande. Une bonne nouvelle pour finir : une skill enregistrée dans votre compte Claude vous suit dans les trois portes. Attention, la synchronisation va dans un seul sens : une skill créée dans Claude Code reste dans son dossier, et n'apparaît pas dans Chat ou Cowork tant qu'on ne l'a pas importée dans le compte.",
      question: "Qui a déjà utilisé Cowork ? Et Claude Code ? Qui a un peu peur de Claude Code ? (Retenez le nombre de mains : on refera le test à la fin.)",
      transition: "Comparons honnêtement ce que chaque porte apporte… et ce qu'elle coûte.",
    },
  },
  {
    kind: "proscons", sec: "s4", time: 180,
    title: "Avantages et limites",
    cols: [
      ["FaComments", "Chat", ["Rien à installer", "Guidé pas à pas", "Fichier de skill prêt"], ["Ne voit pas vos dossiers", "Fichiers joints un à un"]],
      ["FaLaptopFile", "Cowork", ["Travaille dans vos dossiers", "Produit de vrais fichiers", "Idéal avec des modèles"], ["Application de bureau", "Dossiers à autoriser"]],
      ["FaTerminal", "Code", ["Voit toute la skill", "Mode plan : relire avant", "Partage d'équipe facile"], ["Intimide au début", "Quelques mots nouveaux"]],
    ],
    notes: {
      objectif: "Donner des critères de choix concrets : avantages et limites de chaque porte pour créer une skill.",
      script: "Chat. Avantages : rien à installer, ça marche dans le navigateur ; Claude vous guide avec sa skill de création de skills et vous pose les bonnes questions ; à la fin, il vous remet un fichier de skill, qu'il suffit d'enregistrer dans votre compte. Limites : Claude ne voit pas vos dossiers. Il faut joindre les fichiers un à un, et ajouter plus tard un modèle ou un exemple est moins fluide. Cowork. Avantages : Claude travaille directement dans un dossier de votre ordinateur. Il peut lire votre charte en PDF, vos anciens comptes rendus, vos modèles Word, et produire de vrais fichiers. C'est idéal quand la skill s'appuie sur des documents. Limites : il faut l'application de bureau pour travailler sur vos dossiers, et il faut autoriser l'accès à chaque dossier. Code. Avantages : Claude voit tout le dossier de la skill, donc SKILL.md, exemples et modèles ensemble ; vous pouvez relire son plan avant qu'il ne touche à quoi que ce soit (le mode plan, j'y reviens) ; la skill est un simple dossier, facile à copier, à versionner et à partager avec une équipe ; enfin, on la teste immédiatement en tapant « / » suivi de son nom. Limites : l'interface impressionne la première fois, et il y a quelques mots nouveaux (dossier de travail, permission). C'est tout. Aucune de ces limites n'est technique : c'est de l'habitude.",
      question: "Pour la skill à laquelle vous pensez depuis le début, quelle porte choisiriez-vous ? Pourquoi ?",
      transition: "Justement, parlons de ces peurs autour de Code.",
    },
  },
  {
    kind: "myths", sec: "s4", time: 150,
    title: "Code ? Même pas peur !",
    myths: [
      ["Il faut savoir coder", "On lui parle en français"],
      ["Un écran noir de hacker", "Un onglet de l'appli Claude"],
      ["Je vais tout casser", "Vous choisissez s'il demande"],
      ["C'est pour les développeurs", "Un dossier de documents suffit"],
    ],
    notes: {
      objectif: "Désamorcer une à une les quatre peurs qui empêchent d'essayer Claude Code.",
      script: "Quatre idées reçues. Première : « il faut savoir coder ». Non : on écrit à Claude Code exactement comme dans Chat, en français, avec des phrases. Il écrit le SKILL.md pour vous, et c'est du texte. Deuxième : « c'est un écran noir de hacker ». Le terminal existe pour ceux qui l'aiment, mais Claude Code est aussi un onglet de l'application Claude sur ordinateur : une zone de message, un dossier choisi dans une fenêtre, des boutons. Troisième : « je vais tout casser ». C'est vous qui réglez le niveau de contrôle. Attention : sur les offres Pro, Max et Team, Claude Code démarre en mode auto, où un second modèle vérifie les actions à votre place sans vous demander. Pour une première fois, passez en mode Manuel : Claude demande alors avant chaque modification ou commande, et vous pouvez répondre non. Le mode plan va encore plus loin : Claude lit, réfléchit et propose, mais ne modifie rien tant que vous n'avez pas validé. Pour une première fois, travaillez sur une copie de votre dossier : vous ne risquez littéralement rien. Quatrième : « c'est pour les développeurs ». Claude Code fonctionne dans n'importe quel dossier : un dossier de notes, de modèles Word, de comptes rendus. Pour créer une skill, c'est même la porte la plus naturelle, puisqu'une skill… est un dossier.",
      question: "Laquelle de ces quatre peurs était la vôtre ? Levez la main à chaque carte.",
      transition: "Le meilleur antidote à la peur, c'est le mode plan. Voyons comment il marche.",
    },
  },
  {
    kind: "planmode", sec: "s4", time: 150,
    title: "Le mode plan : réfléchir avant d'agir",
    steps: [
      ["FaComment", "Je demande", ""],
      ["FaMagnifyingGlass", "Claude explore", "sans rien modifier"],
      ["FaListCheck", "Il propose un plan", ""],
      ["FaUserCheck", "Je valide", "ou je corrige"],
      ["FaPlay", "Il exécute", ""],
    ],
    keys: ["/plan", "Sélecteur de mode"],
    notes: {
      objectif: "Expliquer le mode plan et pourquoi il rassure : on voit tout avant que rien ne bouge.",
      script: "Le mode plan est une fonction de Claude Code. Quand il est activé, Claude peut lire vos fichiers et explorer le dossier, mais il n'a pas le droit de modifier quoi que ce soit. Son travail, c'est de vous proposer un plan : « je vais lire charte.pdf, créer tel dossier, écrire tel fichier avec telles sections, puis tester ». Vous lisez ce plan comme un devis. Trois réponses possibles : approuver et le laisser travailler ; approuver en validant chaque modification une par une ; ou dire « continue à planifier » et corriger (« ajoute une section sur les logos », « ne touche pas au dossier Archives »). Deux façons d'entrer en mode plan : commencer son message par /plan, ou, dans l'application de bureau, choisir « Plan » dans le sélecteur de mode à côté de la zone de message. Pourquoi est-ce idéal pour créer une skill ? Parce qu'une skill, c'est d'abord une structure : quelles étapes, quels exemples, quels fichiers. Le plan vous montre cette structure avant qu'elle n'existe, et c'est le meilleur moment pour la corriger. Astuce : dans Chat, vous pouvez imiter ce fonctionnement en écrivant « propose-moi d'abord un plan, n'écris rien avant mon accord ».",
      question: "Dans votre métier, qu'est-ce qui ressemble à ce « plan avant d'agir » ? (devis, ordre du jour, bon de commande…)",
      transition: "Récapitulons avec une question simple : quelle porte pour moi ?",
    },
  },
  {
    kind: "decision", sec: "s4", time: 90,
    title: "Quelle porte pour moi ?",
    rows: [
      ["Une première skill, surtout du texte", "FaComments", "Chat"],
      ["Elle s'appuie sur mes fichiers", "FaLaptopFile", "Cowork"],
      ["Je veux relire le plan, partager en équipe", "FaTerminal", "Code"],
    ],
    footerNote: "Dans le doute : commencez dans Chat, finissez dans Code.",
    notes: {
      objectif: "Donner une règle de choix simple et mémorisable.",
      script: "Trois situations. Pour une première skill, surtout faite de texte (une méthode, un ton, un format) : Chat, c'est parfait. Si la skill s'appuie sur des fichiers (une charte en PDF, des modèles, des exemples) : Cowork ou Code, qui voient votre dossier. Si vous voulez relire un plan avant toute action, faire évoluer la skill dans le temps ou la partager avec une équipe : Code. Et ce n'est pas un choix définitif. Beaucoup de gens commencent une skill dans Chat, puis la reprennent dans Code quand elle grandit : on importe le dossier, et Claude Code l'améliore en mode plan.",
      question: "",
      transition: "Passons à la méthode de création, valable dans les trois portes.",
    },
  },
  {
    kind: "timeline", sec: "s5", time: 60,
    title: "Créer une skill en 5 étapes",
    steps: [
      ["FaMagnifyingGlass", "Repérer", "une tâche récurrente"],
      ["FaComment", "Décrire", "avec un exemple"],
      ["FaWandMagicSparkles", "Générer", "avec skill-creator"],
      ["FaFlask", "Tester", "sur un vrai cas"],
      ["FaSliders", "Ajuster", "la description"],
    ],
    notes: {
      objectif: "Donner une méthode simple, réutilisable pendant l'atelier.",
      script: "Un : repérer une tâche qui revient au moins une fois par semaine et qui se fait toujours de la même façon. Deux : la décrire à Claude comme à un nouveau collègue, avec si possible un exemple réussi (un ancien compte rendu, un mail type). Trois : laisser Claude générer la skill. Il s'appuie pour cela sur skill-creator, la skill d'Anthropic qui fabrique les skills : elle lui fait poser les bonnes questions, puis rédiger un SKILL.md conforme aux bonnes pratiques. Répondez-lui franchement. Quatre : tester, dans une nouvelle conversation, avec une demande naturelle, sans nommer la skill. Préparez trois demandes : deux qui doivent déclencher la skill, et une qui ne doit pas (par exemple « résume cet article » pour une skill de compte rendu). La mention « Using… » dans la réflexion de Claude indique si la skill a servi. Choisissez des demandes réalistes et un peu substantielles : Claude ne consulte pas une skill pour une tâche qu'il sait faire seul en une étape (« lis ce fichier »), même si la description correspond. Comparez aussi avec le résultat obtenu sans la skill : c'est ce qui prouve qu'elle apporte quelque chose. Anthropic résume la méthode ainsi : on conçoit avec un premier Claude, on teste avec un second dans une conversation neuve, et on rapporte au premier ce qu'on a observé. Cinq : ajuster. Si elle ne se déclenche pas, c'est presque toujours la description qu'il faut revoir. Si le résultat n'est pas bon, ce sont les instructions ou l'exemple. On boucle entre quatre et cinq deux ou trois fois : c'est normal.",
      question: "",
      transition: "L'étape 3, concrètement, qui la fait ? Une skill : skill-creator.",
    },
  },
  {
    kind: "creatorloop", sec: "s5", time: 120,
    title: "skill-creator : la skill qui fabrique les skills",
    steps: [
      ["FaComments", "Comprendre", "4 questions"],
      ["FaPenNib", "Rédiger", "le SKILL.md"],
      ["FaFlask", "Tester", "2 ou 3 cas réels"],
      ["FaScaleBalanced", "Comparer", "avec / sans skill"],
      ["FaSliders", "Améliorer", "selon vos retours"],
      ["FaBullseye", "Affiner la description", "20 demandes test"],
    ],
    pack: "Puis empaqueter : un fichier .skill et son bouton « Save skill »",
    notes: {
      objectif: "Présenter skill-creator, l'outil central de la création de skills, et sa boucle de travail.",
      script: "Quand vous demandez à Claude de créer une skill, il ne part pas de zéro : il ouvre skill-creator, une skill écrite par Anthropic dont le métier est… de fabriquer des skills. C'est elle qui donne la méthode. Un : comprendre, avec quatre questions : que doit faire la skill, quand doit-elle se déclencher (avec quels mots vous la demandez), quel format de résultat, et faut-il prévoir des tests. Elle creuse ensuite les cas particuliers et vous demande des exemples. Deux : rédiger le SKILL.md, en appliquant les bonnes pratiques (description précise, texte concis, fichiers annexes si besoin). Trois : tester sur deux ou trois demandes réalistes, celles que vous feriez vraiment. Quatre : comparer le résultat avec et sans la skill, pour vérifier qu'elle apporte quelque chose. Cinq : améliorer à partir de vos retours ; skill-creator cherche à généraliser plutôt qu'à coller à vos exemples. Six : affiner la description, en la testant sur une vingtaine de demandes, dont certaines ne doivent PAS déclencher la skill. À la fin, elle empaquette le tout en un fichier .skill : dans Claude, la carte du fichier affiche un bouton « Save skill » qui l'installe dans votre profil, si votre organisation l'autorise. Elle sait aussi améliorer une skill existante, en gardant son nom. Retenez : pour créer une skill, on ne demande pas « écris-moi un fichier », on dit « aide-moi à créer une skill », et skill-creator prend la main.",
      question: "Laquelle de ces six étapes sauteriez-vous spontanément si vous faisiez seul ? (Souvent : comparer et affiner la description.)",
      transition: "Mais skill-creator ne fait pas tout partout. Voyons ce qui change selon la porte.",
    },
  },
  {
    kind: "creatormatrix", sec: "s5", time: 90,
    title: "skill-creator selon la porte",
    rows: [
      ["Entretien et rédaction", "yes", "yes", "yes"],
      ["Tests sur cas réels", "un par un", "yes", "yes"],
      ["Comparaison avec / sans skill", "no", "yes", "yes"],
      ["Résultats à relire", "dans la conversation", "page dédiée", "page dédiée"],
      ["Affiner la description", "no", "yes", "yes"],
      ["Installation", "« Save skill »", "« Save skill »", ".claude/skills/"],
    ],
    notes: {
      objectif: "Montrer que skill-creator est plus complète dans Cowork et Code, et en faire un argument pour oser Code.",
      script: "skill-creator s'adapte à l'endroit où elle tourne, et ses propres instructions le disent. Dans Chat, elle fait l'essentiel : l'entretien, la rédaction, et des tests qu'elle exécute elle-même, un par un. En revanche, elle n'y compare pas les résultats avec et sans la skill, elle présente les résultats dans la conversation, et elle ne peut pas affiner automatiquement la description, qui demande l'outil en ligne de commande de Claude Code. Dans Cowork et dans Claude Code, elle peut lancer les tests en parallèle, les comparer à une version sans skill, vous ouvrir une page de résultats à relire et commenter, et optimiser la description sur une vingtaine de demandes. Conclusion pratique : pour une première skill simple, Chat suffit. Pour une skill qui compte, que toute une équipe va utiliser, passez par Cowork ou Code : vous aurez la version complète de la méthode. Dans Claude Code, si skill-creator n'est pas déjà disponible via votre compte, on l'installe avec le plugin d'exemples du dépôt anthropics/skills (commandes dans la fiche B8).",
      question: "",
      transition: "Entre Cowork et Code, justement : pour une skill, où est la différence ?",
    },
  },
  {
    kind: "coworkcode", sec: "s5", time: 120,
    title: "Cowork ou Code pour créer une skill ?",
    rows: [
      ["La skill vit…", "dans votre compte Claude", "dans un dossier .claude/skills/"],
      ["Pour l'enregistrer", "fichier .skill, « Save skill »", "rien à importer"],
      ["Elle est disponible", "partout : Chat, Cowork, Code", "dans Claude Code seulement"],
      ["En plus", "—", "paramètres, commandes, mode plan"],
      ["Partage en équipe", "Publier dans l'organisation", "le dépôt Git du projet"],
    ],
    bottom: "Le meilleur des deux : créer et tester dans Code, puis importer le .skill dans le compte.",
    notes: {
      objectif: "Distinguer Cowork et Code pour la création de skills : où vit la skill, ce que chacun permet, comment on partage.",
      script: "Cowork et Code savent tous deux créer une skill avec la méthode complète de skill-creator. La vraie différence, c'est l'endroit où la skill vit. Dans Cowork, elle vit dans votre compte Claude : skill-creator vous remet un fichier .skill, vous cliquez sur « Save skill », et elle est disponible partout où vous êtes connecté, dans Chat, dans Cowork et même dans Claude Code. Dans Code, la skill est un simple dossier, rangé dans .claude/skills du projet ou dans votre dossier personnel : rien à importer, elle marche tout de suite, mais seulement dans Claude Code. La synchronisation va du compte vers Code, jamais dans l'autre sens : pour l'avoir aussi dans Cowork, on compresse le dossier et on l'importe dans le compte. Deuxième différence : Code sait faire des choses que Cowork ne sait pas. Une skill écrite pour Code peut recevoir des paramètres (par exemple /compte-rendu réunion-du-12), lancer une commande pour récupérer des données fraîches avant de démarrer, ou être réservée à un lancement manuel, pour une action sensible. On y a aussi le mode plan, l'historique des versions et la relecture de chaque modification. Troisième différence, le partage : dans Cowork, on publie la skill dans l'organisation (offres Team et Enterprise) ; dans Code, on la range dans le dépôt Git du projet, et toute l'équipe l'obtient avec le projet. Un détail pratique pour la relecture des tests : dans Cowork, skill-creator produit une page de résultats à ouvrir soi-même ; dans Code, elle s'ouvre directement. En pratique : une skill métier pour tous, utilisée dans l'interface de Claude, c'est Cowork. Une skill qu'on veut versionner, faire relire ou partager avec une équipe technique, c'est Code. Et le meilleur des deux mondes : créer et tester dans Code, puis importer le fichier .skill dans le compte pour que tout le monde en profite.",
      question: "Pour la skill que vous avez en tête : qui doit l'utiliser, et où ? Cela vous dit déjà quelle porte choisir.",
      transition: "Voyons maintenant skill-creator à l'œuvre.",
    },
  },
  {
    kind: "demo", sec: "s5", time: 180,
    title: "Démo : on le demande à Claude",
    notes: {
      objectif: "Démystifier la création par une démonstration courte (en direct, ou sur la maquette si le réseau fait défaut).",
      script: "Si la connexion le permet, faites la démo en direct dans Chat ; sinon, commentez la maquette. Tapez : « Aide-moi à créer une skill qui transforme mes notes de réunion en compte rendu à notre format. » Claude ouvre skill-creator : montrez à la salle la mention correspondante dans sa réflexion. Il pose les questions de la méthode : que doit faire la skill, quand la déclencher, quel format, qui lit ces comptes rendus, avez-vous un exemple ? Répondez, collez un ancien compte rendu réussi. Claude rédige le SKILL.md et vous le montre : faites lire la description à voix haute à la salle. Il propose ensuite deux ou trois demandes test : acceptez-les, c'est l'étape que tout le monde oublie. Puis il empaquette le tout en un fichier .skill : cliquez sur « Save skill » sur la carte du fichier (si ce bouton n'apparaît pas, par exemple parce que l'organisation ne l'autorise pas, téléchargez le fichier et importez-le avec le bouton « + »), puis vérifiez qu'il est activé dans la liste des skills (Personnaliser › Skills, ou Paramètres › Capacités selon l'interface). Enfin, testez : ouvrez une nouvelle conversation, collez des notes en vrac et dites simplement « tu peux m'en faire un compte rendu ? ». La skill doit se déclencher seule : on le voit à la mention « Using compte-rendu » (utilisation de la skill) dans la réflexion de Claude. Montrez cet indice à la salle, c'est le meilleur moyen de savoir si une skill a été utilisée. Si la démo prend du retard, arrêtez-vous après l'enregistrement : le test sera fait pendant l'atelier.",
      question: "Pendant que Claude rédige : « D'après vous, quelle question va-t-il nous poser ensuite ? »",
      transition: "Ce qui fait la différence entre une skill moyenne et une bonne skill tient en trois secrets.",
    },
  },
  {
    kind: "secrets", sec: "s5", time: 75,
    title: "Les 3 secrets d'une bonne skill",
    secrets: [
      ["1", "Une description qui dit QUAND", "« Utiliser quand l'utilisateur demande un compte rendu… »"],
      ["2", "Un exemple réussi", "Claude imite mieux qu'il n'obéit"],
      ["3", "Courte et ciblée", "Une skill = une tâche"],
    ],
    notes: {
      objectif: "Donner les trois critères de qualité à appliquer dès l'atelier.",
      script: "Premier secret : la description doit dire QUAND utiliser la skill, pas seulement ce qu'elle fait. « Compte rendu » ne suffit pas. Écrivez plutôt « Rédige un compte rendu de réunion à notre format. Utiliser quand l'utilisateur colle des notes de réunion ou demande un CR, une synthèse de réunion ou un relevé de décisions. » Écrivez-la comme la notice d'un outil, à la troisième personne (« Rédige… », pas « Je peux t'aider à… »), avec les mots que vos collègues emploient vraiment pour demander cette tâche. Deuxième secret : un exemple réussi vaut dix consignes. Claude imite très bien : donnez-lui un vrai compte rendu que vous aimez. Et dosez la liberté : des consignes souples pour une tâche de jugement (un compte rendu, un mail), des consignes strictes, voire un petit script, quand le résultat doit être identique à chaque fois (une charte graphique, un calcul). Troisième secret : une skill, une tâche. Mieux vaut trois petites skills claires qu'une grosse skill « tout-en-un » que Claude ne saura pas quand déclencher. Et restez concis : Claude est déjà très compétent, n'expliquez que ce qu'il ne peut pas deviner (votre format, vos règles, vos exemples). Si la skill grossit, gardez le SKILL.md court (moins de 500 lignes selon Anthropic) et rangez le détail dans des fichiers annexes que le SKILL.md cite directement, en disant quand les lire. Deux règles de forme : la description tient en 200 caractères maximum dans Claude, et le nom s'écrit en minuscules avec des tirets, sans les mots « claude » ni « anthropic ».",
      question: "",
      transition: "Pour finir cette partie, un cas d'usage complet, proposé par Anthropic.",
    },
  },
  {
    kind: "usecase", sec: "s5", time: 150,
    title: "Cas d'usage : votre charte dans une skill",
    swatches: ["141413", "FAF9F5", "D97757", "6A9BCC", "788C5D"],
    files: ["SKILL.md", "color-typography-specs.md", "usage-examples.md", "brand_utils.py"],
    test: "Test : « Crée une présentation de bilan trimestriel »",
    notes: {
      objectif: "Montrer un cas d'usage complet et officiel, que chacun pourra refaire seul.",
      script: "Ce cas vient de Claude Academy, le site de formation d'Anthropic : « Empaquetez vos directives de marque dans un skill », environ vingt minutes. Le principe : vous donnez une fois pour toutes votre charte, et Claude l'applique à chaque présentation, document ou tableur, sans que vous ayez à la rappeler. À gauche, ce qu'on donne dans le prompt : la palette de couleurs avec le rôle de chacune (texte, fond, accent principal, accents secondaires), la typographie (une police pour les titres, une pour le texte, avec des polices de secours) et les règles d'application (quelle couleur pour quel élément, alterner les accents…). On peut aussi brancher Google Drive pour que Claude lise le fichier de charte lui-même. Au centre, ce que Claude crée : le SKILL.md, un fichier détaillé sur les couleurs et la typographie, des exemples d'usage et un petit script qui applique les couleurs toujours de la même façon. Vous n'avez pas à comprendre le script : il garantit simplement un résultat identique à chaque fois. Enfin, on teste avec une demande qui ne parle pas de charte : « crée une présentation de bilan trimestriel ». Si les couleurs et les polices sont justes, la skill fonctionne. La page propose ensuite de mettre à jour la skill et de la combiner avec d'autres. Le QR code mène à la ressource.",
      question: "Qui a une charte graphique dans sa structure ? Où est-elle rangée aujourd'hui ?",
      transition: "Ce même cas se réalise dans les trois portes. Comparons.",
    },
  },
  {
    kind: "threedoors", sec: "s5", time: 90,
    title: "Même charte, trois portes",
    doors: [
      ["FaComments", "Chat", "Je colle couleurs et règles", "Skill enregistrée"],
      ["FaLaptopFile", "Cowork", "Claude lit charte.pdf", "Skill + exemple produit"],
      ["FaTerminal", "Code", "Mode plan, je valide", "Fichiers écrits et testés"],
    ],
    notes: {
      objectif: "Relier le cas d'usage aux avantages de chaque porte, et montrer que Code est une option réaliste.",
      script: "Même objectif, trois chemins. Dans Chat, vous collez le prompt de la page Academy avec vos couleurs et vos règles : Claude crée le fichier de skill et vous l'enregistrez dans votre compte. C'est le chemin décrit par la ressource. Dans Cowork, vous pointez le dossier qui contient votre charte en PDF : Claude la lit lui-même, crée la skill et produit une présentation d'exemple pour vérifier. Dans Code, vous faites pareil en mode plan : vous relisez la structure proposée, vous la corrigez, puis Claude écrit les fichiers et vous testez aussitôt avec /charte-graphique. Le résultat est le même : une skill qui applique votre charte partout. Ce qui change, c'est votre niveau de contrôle. Pendant l'atelier, vous pourrez suivre ce cas dans la porte de votre choix.",
      question: "",
      transition: "Votre skill fonctionne : comment en faire profiter les autres ?",
    },
  },
  {
    kind: "share", sec: "s6", time: 150,
    title: "Partager : trois cercles",
    rings: [
      ["FaUser", "Moi", "Envoyer le fichier de la skill"],
      ["FaUsers", "Mon équipe", "Partager · Publier dans l'organisation"],
      ["FaGlobe", "Tout le monde", "GitHub · plugin"],
    ],
    notes: {
      objectif: "Présenter les modes de partage selon l'offre Claude et le public visé.",
      script: "Premier cercle, vous-même et quelques personnes : on envoie le fichier de la skill (celui que Claude vous a remis à la création, ou un .zip du dossier ; selon la version, le menu de la skill propose aussi de la télécharger, à vérifier le jour J). Le destinataire l'importe avec le bouton « + ». Ça marche quelle que soit l'offre, gratuite, Pro ou Max. Deuxième cercle, votre équipe : en offre Team ou Enterprise, le menu « … » d'une skill propose « Partager » à des collègues choisis (ils peuvent l'activer, pas la modifier) et « Publier dans l'organisation » pour la rendre disponible à tous. Selon le réglage de l'administrateur, la publication peut passer par une relecture ; les skills fournies par l'administrateur sont activées d'office pour tout le monde. Troisième cercle, tout le monde : on publie le dossier sur GitHub, ou on l'emballe dans un plugin avec d'autres skills. Pour les équipes tech, il suffit aussi de déposer la skill dans le dossier .claude/skills d'un projet de code : toute l'équipe l'aura. Rappel : ce que vous partagez, les autres vont le lire… et Claude va l'exécuter. Relisez avant de publier, et n'y mettez jamais de mot de passe ni de donnée personnelle.",
      question: "Dans votre structure, quelle offre avez-vous : individuelle, Team, Enterprise ? Qui est l'administrateur ?",
      transition: "Vous avez tout. Place au quiz !",
    },
  },
  {
    kind: "quizrules", sec: "quiz", time: 30,
    title: "Quiz : à vous de répondre !",
    notes: {
      objectif: "Lancer l'interaction orale et en poser la règle.",
      script: "Neuf questions, à l'oral. Je lis la question et les quatre réponses, je vous laisse quelques secondes de réflexion, puis vous répondez à voix haute : il suffit de dire la lettre. Pas de honte à se tromper : c'est justement ce qui nous intéresse. Quand les avis sont partagés, je demande à quelqu'un de défendre sa réponse avant de révéler la bonne.",
      question: "",
      transition: "Question 1.",
    },
  },
  // Questions + réponses insérées par expandQuiz()
  {
    kind: "recap", sec: "end", time: 90,
    title: "À retenir",
    ideas: [
      ["FaFileLines", "Une skill = un savoir-faire rangé"],
      ["FaBullseye", "Décrire QUAND, donner un exemple"],
      ["FaRotate", "Tester, ajuster, puis partager"],
      ["FaTerminal", "Code : commencez en mode plan"],
    ],
    workshop: "Atelier : créez la skill d'une tâche que vous répétez chaque semaine.",
    notes: {
      objectif: "Synthétiser en trois idées et lancer l'atelier.",
      script: "Quatre idées à garder. Une : une skill, c'est un savoir-faire rangé dans un dossier, que Claude ressort au bon moment. Deux : sa qualité tient à sa description, qui dit QUAND l'utiliser, et à un exemple réussi. Trois : on teste, on ajuste, et seulement ensuite on partage. Quatre : Claude Code n'est pas réservé aux développeurs. Commencez en mode plan, sur une copie de votre dossier, et vous garderez la main à chaque étape. Refaites le test du début : qui a encore peur de Claude Code ? Place à l'atelier. Consigne : choisissez une tâche que vous répétez chaque semaine (celles que nous avons notées au début peuvent servir) et créez-en la skill dans la porte de votre choix. Trois parcours sont proposés dans le document distribué : Chat, Cowork, ou Code accompagné en mode plan. Vous pouvez aussi suivre le cas de la charte graphique de Claude Academy. Objectif de fin d'atelier : une skill enregistrée, testée une fois dans une nouvelle conversation, et dont la description commence par ce qu'elle fait et continue par « Utiliser quand… ». Les notes distribuées contiennent le pas-à-pas et un prompt de départ ; tous les supports, présentation comprise, sont en ligne sur le dépôt GitHub dont l'adresse s'affiche en bas de la diapo.",
      question: "Qui sait déjà quelle skill il ou elle va créer ?",
      transition: "Je laisse mes coordonnées à l'écran pendant l'atelier.",
    },
  },
  {
    kind: "contact", sec: "end", time: 0,
    title: "Restons en contact",
    notes: {
      objectif: "Laisser les coordonnées affichées pendant l'atelier.",
      script: "Laissez cette diapo affichée pendant la mise en pratique. Le grand QR code mène au dépôt GitHub qui rassemble tous les supports de la séance : cette présentation, les notes du présentateur en PDF et en Word, et les sources pour les régénérer. Invitez la salle à le scanner dès maintenant : le pas-à-pas de l'atelier s'y trouve. Les petits QR codes mènent au profil LinkedIn, au GitHub et à la ressource Claude Academy sur la charte de marque, pour ceux qui veulent refaire le cas d'usage. Pour toute question après la séance, écrivez par mail.",
      question: "",
      transition: "",
    },
  },
];

// Diapos d'ouverture de section (fond plein) : seul endroit où la section est affichée en grand.
const DIVIDERS = {
  s1: ["1", "Comprendre", "Qu'est-ce qu'une skill ?", "On part de zéro : ce qu'est une skill, ce qu'elle contient et ce qu'elle change concrètement au résultat."],
  s2: ["2", "Projet ou skill", "Deux outils, deux usages", "Deuxième étape : lever la confusion la plus fréquente, entre un projet qui connaît un sujet et une skill qui sait faire une tâche."],
  s3: ["3", "Récupérer", "Catalogue et GitHub", "Troisième étape : avant de créer, on regarde ce qui existe déjà, dans le catalogue de Claude et sur GitHub, avec une règle de sécurité."],
  s4: ["4", "Où créer", "Chat, Cowork ou Code", "Quatrième étape, le cœur de la séance : choisir sa porte d'entrée, et découvrir que Claude Code n'a rien d'effrayant grâce au mode plan."],
  s5: ["5", "Créer", "La méthode, la démo, un cas réel", "Cinquième étape : la méthode en cinq temps, une démonstration, les trois secrets d'une bonne skill et un cas d'usage officiel."],
  s6: ["6", "Partager", "De moi à tout le monde", "Dernière étape avant le quiz : comment faire profiter les autres de votre skill, selon votre offre et votre public."],
};

function insertDividers(slides) {
  const out = [];
  let prev = null;
  for (const s of slides) {
    const d = DIVIDERS[s.sec];
    if (d && s.sec !== prev) {
      out.push({
        kind: "section", sec: s.sec, time: 10, num: d[0], title: d[1], subtitle: d[2], icon: SECTIONS[s.sec].icon,
        notes: { objectif: `Marquer le passage à la partie ${d[0]} et relancer l'attention.`, script: d[3] + " Laissez la diapo quelques secondes, le temps que la salle se repère dans le programme.", question: "", transition: "" },
      });
    }
    prev = s.sec;
    out.push(s);
  }
  return out;
}

function expandQuiz(slides) {
  const out = [];
  for (const s of slides) {
    out.push(s);
    if (s.kind !== "quizrules") continue;
    QUIZ.forEach((item, i) => {
      const n = i + 1;
      const letter = "ABCD"[item.ok];
      out.push({
        kind: "quizq", sec: "quiz", time: 40, n, item,
        title: `Question ${n}`,
        notes: {
          objectif: `Question ${n} : faire voter la salle.`,
          script: `Lire la question : « ${item.q} » Puis les réponses : ${item.a.map((t, k) => `${"ABCD"[k]}, ${t}`).join(" ; ")}. Laisser cinq secondes de réflexion, puis demander les réponses à voix haute. Relever les lettres entendues (« j'entends beaucoup de B… quelques C ») sans donner d'indice.`,
          question: "Un volontaire pour défendre une autre réponse que celle de la majorité ?",
          transition: "Clic : révélation de la réponse.",
        },
      });
      out.push({
        kind: "quiza", sec: "quiz", time: 20, n, item,
        title: `Question ${n} · réponse`,
        notes: {
          objectif: `Corriger et consolider la notion de la question ${n}.`,
          script: `Bonne réponse : ${letter}, « ${item.a[item.ok]} ». ${item.why}`,
          question: "",
          transition: n < QUIZ.length ? `Question ${n + 1}.` : "Dernière diapo avant l'atelier : ce qu'il faut retenir.",
        },
      });
    });
  }
  return out;
}

module.exports = { REPO, ACADEMY, AUTHOR, SECTIONS, QUIZ, SLIDES: insertDividers(expandQuiz(SLIDES)) };
