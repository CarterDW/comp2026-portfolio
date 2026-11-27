#!/usr/bin/env bash
# Copy figures from the COMP2026 working tree into the site. Re-run after regenerating a plot.
# Format: source (relative to agentic/)  ->  destination (relative to this repo)
set -euo pipefail
SRC="$HOME/COMP2026/agentic"
DST="$(cd "$(dirname "$0")/.." && pwd)"
S=04_Mechanics_and_Electrostatics/solar_system
while read -r from to; do
  [ -z "$from" ] && continue
  mkdir -p "$(dirname "$DST/$to")"
  cp "$SRC/$from" "$DST/$to"
done <<LIST
$S/final_arc/plots/ledger.png                         solar-system/img/ledger.png
$S/final_arc/plots/disk_thermal.png                   solar-system/img/disk_thermal.png
$S/final_arc/plots/collision_map.png                  solar-system/img/collision_map.png
$S/final_arc/plots/collision_gallery.png              solar-system/img/collision_gallery.png
$S/final_arc/plots/gr_mercury.png                     solar-system/img/gr_mercury.png
$S/rung6_terrestrial/plots/genealogy_seed7_pl200.png  solar-system/img/genealogy_seed7.png
$S/rung6_terrestrial/plots/terrestrial_systems.png    solar-system/img/systems_embryos_only.png
$S/rung6_terrestrial/plots/terrestrial_systems_pl200.png solar-system/img/systems_with_swarm.png
07_Stat_Mech_and_Ising/checks/plots/kt_step2_vortices.png defects/img/kt_vortices.png
07_Stat_Mech_and_Ising/checks/plots/kt_quench.png     defects/img/kt_quench.png
10_Convolutions_and_Galaxies/results/finalarc_step0_strip.png sky-classifier/img/fa0_strip.png
10_Convolutions_and_Galaxies/results/finalarc_step0_ladder.png sky-classifier/img/fa0_ladder.png
10_Convolutions_and_Galaxies/results/finalarc_step1_necessity.png sky-classifier/img/fa1_necessity.png
10_Convolutions_and_Galaxies/results/finalarc_step2_gallery.png sky-classifier/img/fa2_attribution.png
10_Convolutions_and_Galaxies/results/finalarc_step3_redshift_strip.png sky-classifier/img/fa3_redshift_strip.png
10_Convolutions_and_Galaxies/results/finalarc_star_colors.png sky-classifier/img/fa4_star_colors.png
10_Convolutions_and_Galaxies/results/finalarc_step4_catcolors.png sky-classifier/img/fa4_catcolors.png
10_Convolutions_and_Galaxies/results/finalarc_step4_blends.png sky-classifier/img/fa4_blends.png
10_Convolutions_and_Galaxies/results/finalarc_step5_gallery.png sky-classifier/img/fa5_anomalies.png
10_Convolutions_and_Galaxies/results/step7a_fields.png sky-classifier/img/step7a_fields.png
07_Stat_Mech_and_Ising/checks/plots/kt_step3_transition.png defects/img/kt_transition.png
07_Stat_Mech_and_Ising/checks/plots/kt_correlations.png defects/img/kt_correlations.png
07_Stat_Mech_and_Ising/checks/plots/defects_step0_errors.png defects/img/kt_errors.png
07_Stat_Mech_and_Ising/checks/plots/kz_quench.png defects/img/kz_quench.png
07_Stat_Mech_and_Ising/checks/plots/kz_step2_z.png defects/img/kz_step2_z.png
07_Stat_Mech_and_Ising/checks/plots/kz_step3_kz.png defects/img/kz_step3.png
07_Stat_Mech_and_Ising/checks/plots/kz_step5_slow.png defects/img/kz_step5.png
07_Stat_Mech_and_Ising/checks/plots/kz_step6_walls.png defects/img/kz_step6_walls.png
07_Stat_Mech_and_Ising/checks/plots/kz_step7_xy.png defects/img/kz_step7_xy.png
07_Stat_Mech_and_Ising/checks/plots/kz_step10_strings.png defects/img/kz_step10_strings.png
07_Stat_Mech_and_Ising/checks/plots/kz_step8_xy.png defects/img/kz_step8_xy.png
07_Stat_Mech_and_Ising/checks/plots/kz_step9_vortices.png defects/img/kz_step9_vortices.png
07_Stat_Mech_and_Ising/checks/plots/kz_step4_coarsening.png defects/img/kz_step4_coarsening.png
07_Stat_Mech_and_Ising/checks/plots/kz_step4_kawasaki.png defects/img/kz_step4_kawasaki.png
10_Convolutions_and_Galaxies/results/step2b_optics.png sky-classifier/img/step2b_optics.png
10_Convolutions_and_Galaxies/results/step3_psffix.png sky-classifier/img/step3_psffix.png
10_Convolutions_and_Galaxies/results/step4_offdiagonal.png sky-classifier/img/step4_offdiagonal.png
10_Convolutions_and_Galaxies/results/step5_ood.png sky-classifier/img/step5_ood.png
10_Convolutions_and_Galaxies/results/step6_accuracy.png sky-classifier/img/step6_accuracy.png
Gravity_Golf/results/render_demo.png gravity-golf/img/render_demo.png
Gravity_Golf/results/step1_landscape.png gravity-golf/img/step1_landscape.png
Gravity_Golf/results/step1b_longflight.png gravity-golf/img/step1b_longflight.png
Gravity_Golf/results/step2_cma_budget.png gravity-golf/img/step2_cma_budget.png
Gravity_Golf/results/step3_learning.png gravity-golf/img/step3_learning.png
Gravity_Golf/results/step3_strip_floor_wide.png gravity-golf/img/step3_strip_floor_wide.png
Gravity_Golf/results/step3_basins_tier2.png gravity-golf/img/step3_basins_tier2.png
Gravity_Golf/results/step3b_learning.png gravity-golf/img/step3b_learning.png
Gravity_Golf/results/step4_success_vs_N.png gravity-golf/img/step4_success_vs_N.png
Gravity_Golf/results/step4b_gallery_tier2.png gravity-golf/img/step4b_gallery_tier2.png
Gravity_Golf/results/play/courses.json gravity-golf/play/courses.json
Gravity_Golf/results/step6_headline.png gravity-golf/img/step6_headline.png
Gravity_Golf/results/step6_shot.mp4 gravity-golf/img/step6_shot.mp4
LIST

# GIF -> MP4 for movies too big to ship as GIFs (ffmpeg from imageio-ffmpeg in HaloPipeline)
FF=$("$HOME/anaconda3/envs/HaloPipeline/bin/python" -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FF" -loglevel error -y -i "$SRC/07_Stat_Mech_and_Ising/checks/plots/kt_quench.gif" \
  -movflags +faststart -pix_fmt yuv420p -c:v libx264 -preset slow -crf 32 "$DST/defects/img/kt_quench.mp4"
"$FF" -loglevel error -y -i "$SRC/07_Stat_Mech_and_Ising/checks/plots/kz_quench.gif" \
  -movflags +faststart -pix_fmt yuv420p -c:v libx264 -preset slow -crf 30 "$DST/defects/img/kz_quench.mp4"
"$FF" -loglevel error -y -i "$SRC/07_Stat_Mech_and_Ising/checks/plots/kz_step8_movie.gif" \
  -movflags +faststart -pix_fmt yuv420p -c:v libx264 -preset slow -crf 30 "$DST/defects/img/kz_step8_movie.mp4"
"$FF" -loglevel error -y -i "$SRC/07_Stat_Mech_and_Ising/checks/plots/kz_step4_sidebyside.gif" \
  -movflags +faststart -pix_fmt yuv420p -c:v libx264 -preset slow -crf 30 "$DST/defects/img/kz_step4_sidebyside.mp4"

# Solar movies: GIF -> MP4 (+ first-frame poster). crf chosen per movie; the particle-heavy collapse needs 33.
for spec in "rung4_protostar_disk/plots/collapse_to_disk 33" "rung4b_ignition/plots/stellar_ignition 26" "rung5_planet_formation/plots/formation/formation 26"; do
  set -- $spec; name=$(basename "$1")
  "$FF" -loglevel error -y -i "$SRC/$S/$1.gif" -movflags +faststart -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset slow -tune stillimage -crf "$2" "$DST/solar-system/img/$name.mp4"
  "$FF" -loglevel error -y -i "$SRC/$S/$1.gif" -vf "select=eq(n\\,0)" -frames:v 1 -update 1 "$DST/solar-system/img/${name}_poster.jpg"
done

# Compact web version of the classifier ladder (accuracy row + rung labels)
"$HOME/anaconda3/envs/HaloPipeline/bin/python" "$DST/tools/crop_ladder.py" "$DST/sky-classifier/img/fa0_ladder.png" "$DST/sky-classifier/img/fa0_ladder_web.png"
# Gravity golf: hub thumbnail cropped from the rendered course
"$HOME/anaconda3/envs/HaloPipeline/bin/python" - "$DST" <<'PY'
import sys
from PIL import Image
d = sys.argv[1]
im = Image.open(f"{d}/gravity-golf/img/render_demo.png").convert("RGB")
W, H = im.size
im.crop((int(.12*W), int(.18*H), int(.92*W), int(.78*H))).resize((800, 600), Image.LANCZOS).save(f"{d}/assets/thumb-golf.jpg", quality=86)
PY
echo "synced to $DST"
