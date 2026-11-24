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
10_Convolutions_and_Galaxies/results/step7a_fields.png sky-classifier/img/step7a_fields.png
07_Stat_Mech_and_Ising/checks/plots/kt_step3_transition.png defects/img/kt_transition.png
07_Stat_Mech_and_Ising/checks/plots/kt_correlations.png defects/img/kt_correlations.png
10_Convolutions_and_Galaxies/results/step2b_optics.png sky-classifier/img/step2b_optics.png
10_Convolutions_and_Galaxies/results/step3_psffix.png sky-classifier/img/step3_psffix.png
10_Convolutions_and_Galaxies/results/step4_offdiagonal.png sky-classifier/img/step4_offdiagonal.png
10_Convolutions_and_Galaxies/results/step5_ood.png sky-classifier/img/step5_ood.png
10_Convolutions_and_Galaxies/results/step6_accuracy.png sky-classifier/img/step6_accuracy.png
LIST

# GIF -> MP4 for movies too big to ship as GIFs (ffmpeg from imageio-ffmpeg in HaloPipeline)
FF=$("$HOME/anaconda3/envs/HaloPipeline/bin/python" -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FF" -loglevel error -y -i "$SRC/07_Stat_Mech_and_Ising/checks/plots/kt_quench.gif" \
  -movflags +faststart -pix_fmt yuv420p -c:v libx264 -preset slow -crf 32 "$DST/defects/img/kt_quench.mp4"

# Solar movies: GIF -> MP4 (+ first-frame poster). crf chosen per movie; the particle-heavy collapse needs 33.
for spec in "rung4_protostar_disk/plots/collapse_to_disk 33" "rung4b_ignition/plots/stellar_ignition 26" "rung5_planet_formation/plots/formation/formation 26"; do
  set -- $spec; name=$(basename "$1")
  "$FF" -loglevel error -y -i "$SRC/$S/$1.gif" -movflags +faststart -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset slow -tune stillimage -crf "$2" "$DST/solar-system/img/$name.mp4"
  "$FF" -loglevel error -y -i "$SRC/$S/$1.gif" -vf "select=eq(n\\,0)" -frames:v 1 -update 1 "$DST/solar-system/img/${name}_poster.jpg"
done

# Compact web version of the classifier ladder (accuracy row + rung labels)
"$HOME/anaconda3/envs/HaloPipeline/bin/python" "$DST/tools/crop_ladder.py" "$DST/sky-classifier/img/fa0_ladder.png" "$DST/sky-classifier/img/fa0_ladder_web.png"
echo "synced to $DST"
