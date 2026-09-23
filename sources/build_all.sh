#!/bin/zsh
# Régénère tous les livrables : pptx, vignettes, docx + PDF, cartons, contrôles.
# Les dépendances vivent hors de Documents (lectures de fichiers très lentes dans ce dossier).
# Nécessite Keynote et Pages (« Creator Studio ») pour les conversions en PDF.
set -e
cd "${0:A:h}"
export DEPS="${DEPS:-$HOME/.cache/creation-skill}"
if [[ ! -d "$DEPS/node_modules" ]]; then
  mkdir -p "$DEPS" && cp package.json "$DEPS/" && (cd "$DEPS" && npm install --silent)
fi
if [[ ! -x "$DEPS/venv/bin/python" ]]; then
  /opt/homebrew/bin/python3.12 -m venv "$DEPS/venv"
  "$DEPS/venv/bin/pip" install -q pymupdf pillow reportlab python-pptx opencv-python-headless
fi
export NODE_PATH="$DEPS/node_modules"
export PY="$DEPS/venv/bin/python"
node build_pptx.js
"$PY" postprocess.py pptx
./render.sh "$PWD/build" >/dev/null
node build_docx.js
"$PY" postprocess.py docx
ROOT="${0:A:h}/.."
./export_pdf.sh pages "$ROOT/skills-claude-notes-presentateur.docx" "$ROOT/skills-claude-notes-presentateur.pdf"
"$PY" postprocess.py pdf
"$PY" build_cartons.py
"$PY" check.py
