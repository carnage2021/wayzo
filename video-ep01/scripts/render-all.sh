#!/usr/bin/env bash
# Renders every deliverable. Run from anywhere: bash video-ep01/scripts/render-all.sh [styled|graphics|rough|all]
# Resumable: finished files are skipped (delete one to re-render it). Unfinished renders go to *.part.* first.
cd "$(dirname "$0")/../remotion"
[[ -d out/bundle ]] || npx remotion bundle src/index.ts --out-dir=out/bundle --log=error
OPT=(--log=error --concurrency=${CONC:-3})
render() { # id output [extra flags...]
  local id=$1 out=$2; shift 2
  if [[ -s $out ]]; then echo "skip $out"; return 0; fi
  local part="${out%.*}.part.${out##*.}"
  npx remotion render out/bundle "$id" "$part" "${OPT[@]}" "$@" && mv -f "$part" "$out" && echo "ok $out"
}
want="${1:-all}"
if [[ $want == all || $want == styled ]]; then
  for c in S4-landing-scroll S5-splash-signup S5-login S6-create-trip S7-upload-flight S7-upload-train S7-upload-hotel S7-timeline-dashboard; do
    render "${c}-styled" "../styled/${c}_styled.mp4" --crf=16
  done
fi
if [[ $want == all || $want == graphics ]]; then
  for c in S1-hook S1-sting S3-nine-apps S3-group-chat S3-versus S4-three-steps S8-coming-next-1-quiz S8-coming-next-2-stays S8-coming-next-3-plan S8-coming-next-4-expenses S8-coming-next-5-brief S8-coming-next-6-whatsapp S9-endscreen; do
    render "$c" "../graphics/$c.mp4" --crf=16
  done
  for c in S2-lowerthird S7-callouts; do
    render "$c" "../graphics/$c.mov" --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png
  done
fi
if [[ $want == all || $want == rough ]]; then
  mkdir -p ../handoff
  render rough-cut ../handoff/rough-cut.mp4 --crf=20
fi
