#!/bin/bash
# Solar-system beauty renders -> web media: JPEG stills (thumb + full) and 720p MP4s with mid-movie posters.
# Called from sync_figures.sh; sources are committed in COMP2026 (solar_system/beauty/out/).
set -e
SRC=${SRC:-$HOME/COMP2026/agentic}
DST=${DST:-$(cd "$(dirname "$0")/.." && pwd)}
B=$SRC/04_Mechanics_and_Electrostatics/solar_system/beauty/out
O=$DST/solar-system/img/beauty
PY=$HOME/anaconda3/envs/HaloPipeline/bin/python
mkdir -p "$O"
"$PY" - "$B" "$O" <<'PY'
import sys
from PIL import Image
b, o = sys.argv[1], sys.argv[2]
for name in ("collapse_hero", "ignition_hero", "formation_hero", "orrery_hero", "ignition_strip", "formation_panels", "orrery_panels"):
    im = Image.open(f"{b}/{name}.png").convert("RGB")
    im.save(f"{o}/{name}.jpg", quality=90, optimize=True)
    w = 900 if name.endswith("hero") else 1800
    im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(f"{o}/{name}_web.jpg", quality=86, optimize=True)
PY
FF=$("$PY" -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
for spec in "collapse 0.62" "ignition_feeding 0.3" "formation 0.45" "orrery 0.25" "ignition_evolution 0.55"; do
  set -- $spec
  "$FF" -loglevel error -y -i "$B/$1.mp4" -vf "scale=720:-2:flags=lanczos" -c:v libx264 -preset slow -crf 25 \
    -pix_fmt yuv420p -movflags +faststart -an "$O/$1.mp4"
  dur=$("$PY" -c "import subprocess,sys,re; e=subprocess.run(['$FF','-i','$B/$1.mp4'],capture_output=True,text=True).stderr; h,m,s=re.search(r'Duration: (\d+):(\d+):([\d.]+)',e).groups(); print((int(h)*3600+int(m)*60+float(s))*$2)")
  "$FF" -loglevel error -y -ss "$dur" -i "$B/$1.mp4" -frames:v 1 -vf "scale=720:-2" -q:v 3 "$O/$1_poster.jpg"
done
echo "beauty media synced"
