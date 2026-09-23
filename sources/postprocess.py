"""Corrections d'accessibilité et de poids que les bibliothèques de génération ne savent pas faire.

  postprocess.py pptx  : langue fr-FR, pictos décoratifs, espace réservé « titre », médias dédoublonnés
  postprocess.py docx  : identifiants d'images uniques (docPr)
  postprocess.py pdf   : langue et titre du PDF distribué
"""
import hashlib, re, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DECORATIVE = ('<a:extLst><a:ext uri="{C183D7F6-B498-43B3-948B-1728B52AA6E4}">'
              '<adec:decorative xmlns:adec="http://schemas.microsoft.com/office/drawing/2017/decorative" val="1"/>'
              '</a:ext></a:extLst>')


def rewrite_zip(path, transform):
    """transform(name, bytes) -> bytes | None (None = supprimer l'entrée)."""
    src = zipfile.ZipFile(path)
    items = [(i, src.read(i.filename)) for i in src.infolist()]
    src.close()
    tmp = path.with_suffix(".tmp")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as out:
        for info, data in items:
            new = transform(info.filename, data)
            if new is not None:
                out.writestr(info, new)
    tmp.replace(path)


def pptx():
    path = ROOT / "skills-claude-presentation.pptx"
    z = zipfile.ZipFile(path)
    # médias identiques -> une seule copie
    canon, drop = {}, {}
    for n in z.namelist():
        if n.startswith("ppt/media/"):
            h = hashlib.sha1(z.read(n)).hexdigest()
            if h in canon:
                drop[Path(n).name] = Path(canon[h]).name
            else:
                canon[h] = n
    z.close()

    def fix(name, data):
        if name.startswith("ppt/media/") and Path(name).name in drop:
            return None
        if name.endswith(".rels"):
            t = data.decode()
            for old, new in drop.items():
                t = t.replace(f"../media/{old}\"", f"../media/{new}\"")
            return t.encode()
        if name.endswith(".xml") and name.startswith("ppt/"):
            t = data.decode().replace('lang="en-US"', 'lang="fr-FR"')
            if re.match(r"ppt/slides/slide\d+\.xml$", name):
                # pictos sans texte alternatif = décoratifs
                t = re.sub(r'(<p:cNvPr [^>]*?)descr="preencoded\.png">(\s*)</p:cNvPr>',
                           lambda m: f'{m.group(1)}descr="">{DECORATIVE}</p:cNvPr>', t)
                # zone TITLE -> espace réservé titre (lu par les lecteurs d'écran et le mode plan de PowerPoint)
                t = re.sub(r'<p:cNvPr id="(\d+)" name="TITLE"></p:cNvPr><p:cNvSpPr txBox="1"/><p:nvPr></p:nvPr>',
                           r'<p:cNvPr id="\1" name="Titre"></p:cNvPr><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr>',
                           t, count=1)
            return t.encode()
        return data

    rewrite_zip(path, fix)
    print(f"pptx : {len(drop)} médias en double supprimés, langue fr-FR, pictos décoratifs, titres balisés")


def docx():
    path = ROOT / "skills-claude-notes-presentateur.docx"
    counter = iter(range(1, 10_000))

    def fix(name, data):
        if name == "word/document.xml":
            t = re.sub(r'<wp:docPr id="\d+"', lambda m: f'<wp:docPr id="{next(counter)}"', data.decode())
            return t.encode()
        return data

    rewrite_zip(path, fix)
    print("docx : identifiants d'images renumérotés")


def pdf():
    import pymupdf
    path = ROOT / "skills-claude-notes-presentateur.pdf"
    d = pymupdf.open(path)
    d.set_metadata({**d.metadata, "title": "Apprenez un savoir-faire à Claude : notes du présentateur",
                    "author": "Stéphane Bayle", "subject": "Créer, trouver et partager une skill"})
    d.xref_set_key(d.pdf_catalog(), "Lang", "(fr-FR)")
    d.save(path, incremental=True, encryption=pymupdf.PDF_ENCRYPT_KEEP)
    print("pdf : langue fr-FR et titre renseignés")


if __name__ == "__main__":
    {"pptx": pptx, "docx": docx, "pdf": pdf}[sys.argv[1]]()
