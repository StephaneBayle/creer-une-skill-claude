# Sources de la présentation « Créer une skill dans Claude »

- `content.js` : **source unique** des diapos et des notes du présentateur. Toute correction de texte se fait ici.
- `tokens.json` : **source unique** de la charte (couleurs, polices, paires de contraste). Voir `DESIGN.md`.
- `postprocess.py` : accessibilité et poids (langue fr-FR, pictos décoratifs, titres balisés, médias dédoublonnés, langue et titre du PDF).
- `export_pdf.sh` : export PDF via Keynote ou Pages, avec nouvelles tentatives.
- `build_pptx.js` : génère le PowerPoint.
- `render.sh` : exporte le pptx en PDF via Keynote, puis en images (dossier `build/`, vignettes du document distribué).
- `build_docx.js` : génère le document distribué (.docx), exporté ensuite en PDF via Pages.
- `build_cartons.py` : génère les cartons A/B/C/D.
- `check.py` : contrôle les notes, les mots par diapo, le timing (40 à 50 min), les QR codes, les coordonnées, la langue, les textes alternatifs, les titres balisés et les contrastes de la charte.

Tout régénérer :

    ./build_all.sh

Les dépendances (Node et Python) sont installées dans `~/.cache/creation-skill` et non dans ce dossier :
lire des milliers de petits fichiers sous Documents est extrêmement lent sur cette machine.
On ne retouche jamais un fichier produit à la main : on corrige la source, puis on régénère.
