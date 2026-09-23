"""Génère ../cartons-quiz-ABCD.pdf : 4 pages A4, une lettre par page, couleurs identiques aux diapos."""
import json
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

TK = json.loads((Path(__file__).with_name("tokens.json")).read_text())["color"]
# mêmes couleurs que les diapos du quiz ; texte foncé sur le jaune
CARTONS = [("A", TK["A"], TK["white"]), ("B", TK["B"], TK["white"]), ("C", TK["C"], TK["white"]), ("D", TK["D"], TK["ink"])]
out = Path(__file__).resolve().parent.parent / "cartons-quiz-ABCD.pdf"
W, H = A4
c = canvas.Canvas(str(out), pagesize=A4)
c.setTitle("Cartons quiz A/B/C/D")
c.setAuthor("Stéphane Bayle")
for letter, bg, fg in CARTONS:
    m = 28
    c.setFillColor(HexColor("#" + bg))
    c.roundRect(m, m, W - 2 * m, H - 2 * m, 30, stroke=0, fill=1)
    c.setFillColor(HexColor("#" + fg))
    c.setFont("Helvetica-Bold", 520)
    c.drawCentredString(W / 2, H / 2 - 185, letter)
    c.setFont("Helvetica", 14)
    c.drawCentredString(W / 2, m + 22, "Quiz · Créer une skill dans Claude · Stéphane Bayle")
    c.showPage()
c.save()
print("OK", out)
