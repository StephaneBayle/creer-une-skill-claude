# Skill d'exemple : analyse-pestel

Une skill complète, courte et lisible, pour voir à quoi ressemble une skill « en vrai » pendant l'atelier.
Elle réalise une **analyse PESTEL** (politique, économique, sociologique, technologique, écologique, légal)
d'une entreprise, d'un projet, d'un secteur ou d'un territoire, et rend un rapport dans la conversation.

## Ce qu'il y a dans le dossier

| Fichier | Rôle |
|---|---|
| [`analyse-pestel/SKILL.md`](analyse-pestel/SKILL.md) | Le seul fichier obligatoire : l'en-tête (nom, description) puis les instructions en 4 étapes |
| [`analyse-pestel/references/grille-pestel.md`](analyse-pestel/references/grille-pestel.md) | Questions guides par dimension et règles de classement ; Claude ne le lit qu'en cas de besoin |
| [`analyse-pestel/exemples/rapport-exemple.md`](analyse-pestel/exemples/rapport-exemple.md) | Un rapport réussi sur un cas fictif : « un exemple vaut dix consignes » |
| [`analyse-pestel.zip`](analyse-pestel.zip) | Le dossier zippé, prêt à importer |

À observer en lisant le `SKILL.md` : la description dit **quand** utiliser la skill (189 caractères, sous la
limite de 200), le nom est en minuscules avec tirets, les instructions expliquent le **pourquoi**, et les
fichiers annexes sont cités avec le moment où il faut les lire.

## L'installer

- **Chat ou Cowork** : Personnaliser › Skills, bouton « + », « Importer une skill », choisir `analyse-pestel.zip`.
- **Claude Code** : copier le dossier `analyse-pestel/` dans `~/.claude/skills/` (pour vous) ou dans
  `.claude/skills/` d'un projet (pour l'équipe).

## La tester

Dans une **nouvelle conversation**, sans nommer la skill :

1. « Fais-moi un PESTEL pour une start-up de vélos cargo électriques qui veut se lancer à Strasbourg. » → doit se déclencher.
2. « Quels facteurs externes vont peser sur la filière viticole alsacienne d'ici 2030 ? » → doit se déclencher.
3. « Fais-moi une SWOT de mon association sportive. » → ne doit **pas** se déclencher (c'est une autre méthode).

La mention « Using analyse-pestel » dans la réflexion de Claude indique que la skill a servi. Comparez
ensuite avec la même demande, skill désactivée : c'est ce qui montre ce qu'elle apporte (format constant,
évaluation impact × probabilité, incertitudes critiques à surveiller, recommandations, encadré de
limites).
