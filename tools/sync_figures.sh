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
$S/rung4_protostar_disk/plots/collapse_to_disk.gif    solar-system/img/collapse_to_disk.gif
$S/rung4b_ignition/plots/stellar_ignition.gif         solar-system/img/stellar_ignition.gif
$S/rung5_planet_formation/plots/formation/formation.gif solar-system/img/formation.gif
07_Stat_Mech_and_Ising/checks/plots/kt_step2_vortices.png defects/img/kt_vortices.png
07_Stat_Mech_and_Ising/checks/plots/kt_quench.png     defects/img/kt_quench.png
10_Convolutions_and_Galaxies/results/step3_gallery.png sky-classifier/img/step3_gallery.png
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

echo "synced to $DST"
