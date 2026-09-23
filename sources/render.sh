#!/bin/zsh
# Rend le pptx en PDF (Keynote) puis en PNG : contrôle visuel et vignettes du document distribué.
set -e
SRC="${0:A:h}"
OUT="${1:-$SRC/build}"
mkdir -p "$OUT"
"$SRC/export_pdf.sh" keynote "$SRC/../skills-claude-presentation.pptx" "$OUT/deck.pdf"
"${PY:-$HOME/.cache/creation-skill/venv/bin/python}" - "$OUT" <<'PY'
import sys, glob, os, pymupdf
out = sys.argv[1]
for f in glob.glob(f"{out}/slide-*.png") + glob.glob(f"{out}/slide-*.jpg"): os.remove(f)
d = pymupdf.open(f"{out}/deck.pdf")
for i, p in enumerate(d):
    pix = p.get_pixmap(dpi=110)
    pix.save(f"{out}/slide-{i+1:02d}.png")                    # contrôle visuel
    pix.save(f"{out}/slide-{i+1:02d}.jpg", jpg_quality=82)    # vignettes du document distribué (plus léger)
print(d.page_count, "pages")
PY
