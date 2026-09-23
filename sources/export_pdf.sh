#!/bin/zsh
# export_pdf.sh keynote|pages <entrée absolue> <sortie absolue>
# Exporte en PDF via Keynote ou Pages, avec détection du nom de l'application et 3 tentatives.
set -e
kind=$1 in=$2 out=$3
case $kind in
  keynote) candidates=("Keynote Creator Studio" "Keynote") ;;
  pages)   candidates=("Pages Creator Studio" "Pages") ;;
  *) echo "type inconnu : $kind" >&2; exit 2 ;;
esac
app=""
for c in $candidates; do
  if [[ -d "/Applications/$c.app" ]]; then app=$c; break; fi
done
[[ -n $app ]] || { echo "Ni ${candidates[1]} ni ${candidates[2]} n'est installé" >&2; exit 1; }
rm -f "$out"
for attempt in 1 2 3; do
  open -g -a "$app"; sleep 3
  if osascript <<OSA 2>/tmp/export_pdf.err
tell application "$app"
  set d to open (POSIX file "$in")
  delay 5
  export d to (POSIX file "$out") as PDF
  close d saving no
end tell
OSA
  then
    [[ -s "$out" ]] && exit 0
  fi
  echo "export $kind : tentative $attempt échouée ($(cat /tmp/export_pdf.err))" >&2
  osascript -e "tell application \"$app\" to quit" 2>/dev/null || true
  sleep 3
done
exit 1
