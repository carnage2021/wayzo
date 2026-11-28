#!/usr/bin/env bash
# Draft AI narration (Kokoro, local) placed at the vo-timing.md slots.
# Output: handoff/draft-narration.wav and handoff/rough-cut-with-draft-vo.mp4. Not the final voice.
set -e
cd "$(dirname "$0")/.."
HF="../brag-output/hf.sh"
TMP=handoff/.vo; rm -rf "$TMP"; mkdir -p "$TMP"
N=$(node -e "console.log(require('./handoff/vo-script.json').length)")
inputs=(); filters=""; mix=""
for i in $(seq 0 $((N - 1))); do
  node -e "const r=require('./handoff/vo-script.json')[$i];require('fs').writeFileSync('$TMP/$i.txt',r.text)"
  bash "$HF" tts "$TMP/$i.txt" -v am_michael -s 1.0 -o "$TMP/$i.wav" > /dev/null
  start=$(node -e "console.log(require('./handoff/vo-script.json')[$i].start)")
  slot=$(node -e "const r=require('./handoff/vo-script.json')[$i];console.log(r.end-r.start)")
  len=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/$i.wav")
  # Speed up a little (max 1.25x) if the line is longer than its slot minus 0.6 s.
  tempo=$(node -e "const t=Math.min(1.25,Math.max(1,$len/Math.max(0.5,$slot-0.6)));console.log(t.toFixed(3))")
  delay=$(node -e "console.log(Math.round(($start+0.3)*1000))")
  inputs+=(-i "$TMP/$i.wav")
  filters+="[$i:a]atempo=$tempo,adelay=${delay}|${delay}[a$i];"
  mix+="[a$i]"
  echo "line $i: ${len}s in ${slot}s slot (x$tempo)"
done
TOTAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 handoff/rough-cut.mp4)
ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "${filters}${mix}amix=inputs=$N:normalize=0,apad,atrim=0:$TOTAL[out]" -map "[out]" -ar 48000 handoff/draft-narration.wav
ffmpeg -loglevel error -y -i handoff/rough-cut.mp4 -i handoff/draft-narration.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest handoff/rough-cut-with-draft-vo.mp4
rm -rf "$TMP"
echo "done"
