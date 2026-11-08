#!/usr/bin/env bash
# Полная сборка: аудио → кадры (по i/60) → MP4 (H.264, yuv420p, 60 fps, AAC) → проверка декодированного файла.
# usage: bash src/build.sh [--skip-frames]
set -euo pipefail
cd "$(dirname "$0")/.."
[ -e node_modules ] || ln -s /opt/node22/lib/node_modules node_modules
python3 src/audio/make_audio.py
if [ "${1:-}" != "--skip-frames" ]; then rm -rf out/frames; node src/render.mjs out/frames 0 58 4 1; fi
# ровно 3480 кадров = 58 с × 60; звук той же длины — без -shortest, финал не обрезается
ffmpeg -y -loglevel error -framerate 60 -i out/frames/f%05d.png -i assets/audio/mix.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 60 -movflags +faststart \
  -c:a aac -b:a 192k -ar 48000 out/who_crossed_the_ocean.mp4
bash src/verify.sh out/who_crossed_the_ocean.mp4
