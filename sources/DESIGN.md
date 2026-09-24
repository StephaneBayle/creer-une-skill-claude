# Charte : présentation « Créer une skill dans Claude »

Source des valeurs : `tokens.json`, lu par `build_pptx.js`, `build_docx.js` et `check.py`.
Ne jamais écrire une couleur en dur dans un générateur : ajouter un jeton, puis l'utiliser.

## Scène
Une salle de formation éclairée, un vidéoprojecteur souvent délavé, un public non développeur assis jusqu'au fond.
D'où : fonds clairs pour le contenu, fonds sombres pour les moments de rupture (couverture, STOP, quiz, contact),
fond framboise plein pour l'ouverture de chaque partie.

## Couleur
Stratégie « engagée » : une couleur signature (framboise `accent`, B8235A) portée en aplat sur les diapos d'ouverture,
et en touches ailleurs. Elle a été choisie pour ne pas évoquer l'orange de Claude/Anthropic.
- Neutres froids légèrement teintés vers l'encre (`soft` F1F3F6, `line`, `bar`) ; pas de fond crème.
- Chaque couleur a un usage **aplat** et un usage **texte** : sur fond sombre, le texte framboise passe en `accentOnDark`.
- Portes : Chat = `accent`, Cowork = `blue`, Code = `ink`. Lettres de réponse du quiz : `A` rouge, `B` bleu, `C` vert, `D` jaune (texte `ink`).
- Tout texte ≥ 4,5:1 : les paires sont listées dans `tokens.json › textPairs` et vérifiées par `check.py`.

## Typographie
Calibri (texte) et Courier New (fichiers, code) : polices présentes sur les postes Office, rendu fiable.
Titres 40 pt, texte porteur de sens ≥ 18 pt, maquettes ≥ 16 pt, pied de page 14 pt. Chiffres de section et de liste en très grand corps (72 à 280 pt).

## Composition
- Pas d'étiquette au-dessus des titres : la partie en cours est rappelée dans le pied de page, et affichée en grand sur la diapo d'ouverture.
- Les pictos en pastille ronde sont réservés aux étapes et aux portes ; les listes (secrets, récap) sont purement typographiques.
- Les maquettes d'écran sont stylisées, jamais des captures, et ne reprennent aucun logo.

## Accessibilité (assurée par `postprocess.py`, vérifiée par `check.py`)
Langue fr-FR partout ; pictos marqués décoratifs ; QR codes décrits ; un titre balisé par diapo ; PDF distribué balisé, en français, avec signets.
