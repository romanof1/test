#!/usr/bin/env bash
# Проверка готового MP4 (§13 п.5): кодек, pix_fmt, размер, fps, число кадров, длительность, AAC, громкость.
f="$1"
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate,avg_frame_rate,nb_frames -of default=nw=1 "$f"
echo "decoded_frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$f")"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=nw=1 "$f"
ffprobe -v error -show_entries format=duration -of default=nw=1 "$f"
# ровность timestamps: все интервалы между кадрами одинаковые
ffprobe -v error -select_streams v:0 -show_entries packet=pts_time -of csv=p=0 "$f" | sort -n | awk 'NR>1{d=$1-p; if(d<0.0166||d>0.0168) bad++} {p=$1} END{print "irregular_frame_intervals=" bad+0}'
ffmpeg -hide_banner -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' '
