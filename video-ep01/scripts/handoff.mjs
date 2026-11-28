// Writes handoff/shotlist.md and handoff/vo-timing.md from the clip logs.
// Mirrors remotion/src/RoughCut.tsx (same order, slots, speed-up rule). Run: node handoff.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FPS = 60;
const log = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, "raw", `${n}.json`), "utf8"));

function styledSec(l, speed = 8) {
  let out = 0, cursor = 0, open = null;
  const waits = [];
  for (const e of l.events) {
    if (e.type === "wait-start") open = e.t + 1.2;
    if (e.type === "wait-end" && open !== null) { if (e.t - 0.6 > open + 2) waits.push([open, e.t - 0.6]); open = null; }
  }
  for (const [a, b] of waits) { out += a - cursor + (b - a) / speed; cursor = b; }
  out += l.duration - cursor;
  return Math.ceil(out * FPS) / FPS;
}
const real = (n, note) => ({ file: `styled/${n}_styled.mp4`, raw: `raw/${n}.mp4`, sec: styledSec(log(n)), type: "real", note });
const gfx = (n, sec, note) => ({ file: `graphics/${n}.mp4`, sec, type: "graphic", note });
const hookSec = 2.2 + 2.0 + 1.8 + 2.2;

// vo: suggested narration for that block (≈2.5 words per second is a relaxed pace).
const SCENES = [
  { id: "S1", title: "Hook", slot: 30, talk: "Talk to camera: the hook", items: [
    { ...gfx("S1-hook", hookSec, "Real: splash → flight PDF dropped → AI result → dashboard"), vo: "This is Wayzo. You drop in a ticket, and your whole trip sorts itself out." },
    { ...gfx("S1-sting", 2, "Logo sting"), vo: "" },
  ], slateVo: "Planning a trip with friends is fun until someone asks: which hotel did we book? In this video I'll show you what I'm building, what already works, and what's coming next." },
  { id: "S2", title: "Who I am", slot: 45, talk: "Face cam; S2-lowerthird.mov on top for the first 6 s", items: [], slateVo: "I'm Mirage, and I'm building Wayzo in public. It's a web app for group trips: one place for every ticket, stay and plan, so nobody has to dig through emails and screenshots again." },
  { id: "S3", title: "The problem", slot: 75, talk: "Talk: why group trips are messy", items: [
    { ...gfx("S3-nine-apps", 12, "9 app chips crossed out → One trip on wayzo"), vo: "Right now a group trip lives in about nine apps. Email, the airline app, booking sites, screenshots, notes, a spreadsheet. Wayzo puts it in one trip." },
    { ...gfx("S3-group-chat", 8, "Fictional group chat"), vo: "And you know this chat. Which hotel? What time is the flight? Who's paying for the train?" },
    { ...gfx("S3-versus", 6, "Versus card"), vo: "Most travel apps ask where you want to go. But your group already booked." },
  ], slateVo: "So Wayzo starts from what you already have: your bookings." },
  { id: "S4", title: "The idea", slot: 45, talk: "Talk: the idea", items: [
    { ...real("S4-landing-scroll", "Landing page slow scroll"), vo: "Here's the landing page. The idea is simple: upload your tickets, tell us your vibe, and travel easy." },
    { ...gfx("S4-three-steps", 10, "3 steps"), vo: "Step one, upload tickets. Step two, everyone shares their vibe: budget, food, pace. Step three, Wayzo builds the plan." },
  ], slateVo: "" },
  { id: "S5", title: "Demo · sign up + log in", slot: 45, items: [
    { ...real("S5-splash-signup", "Splash, sign up, onboarding (demo account Maya Lopez)"), vo: "Let's try it for real. I'll create an account: name, email, password. Then a quick onboarding, just my home city, and I'm in." },
    { ...real("S5-login", "Sign out, log back in"), vo: "Signing out and back in works too. Your trips are waiting for you." },
  ] },
  { id: "S6", title: "Demo · create a trip", slot: 60, items: [
    { ...real("S6-create-trip", "New trip, destination search, dates, currency, empty dashboard"), vo: "Now a new trip. I'll call it Lisbon with friends, search for Lisbon, add the dates and pick euros. And here's the dashboard, empty for now, waiting for tickets." },
  ] },
  { id: "S7", title: "Demo · upload tickets", slot: 90, items: [
    { ...real("S7-upload-flight", "Flight PDF → read by AI (wait sped up ×8, labelled). Overlay S7-callouts in the last 6 s"), vo: "This is the part I'm most excited about. I drop in the flight PDF. The AI reads it: flight number, date, time, from London to Lisbon, seats, price. I didn't type anything." },
    { ...real("S7-upload-train", "Train screenshot → read by AI. Overlay S7-callouts in the last 6 s"), vo: "It also works with a screenshot. Here's the train ticket from Lisbon to Porto, straight from a phone." },
    { ...real("S7-upload-hotel", "Hotel booking PDF → read by AI"), vo: "And the hotel booking: check-in, check-out, the address and the price." },
    { ...real("S7-timeline-dashboard", "Timeline and dashboard after uploads"), vo: "Everything lands on the right day of the trip. That's the dashboard filling itself." },
  ] },
  { id: "S8", title: "Coming next", slot: 75, talk: "Talk: what's next", items: [
    { ...gfx("S8-coming-next-1-quiz", 10, "COMING NEXT mockup"), vo: "Now, what's coming next. Every friend takes a short quiz: where they like to stay, what they eat, how fast they travel." },
    { ...gfx("S8-coming-next-2-stays", 10, "COMING NEXT mockup"), vo: "Then Wayzo suggests stays that fit the whole group, and you vote." },
    { ...gfx("S8-coming-next-3-plan", 10, "COMING NEXT mockup"), vo: "A day-by-day plan you can edit, with real places, and you can ask the AI to add a spot." },
    { ...gfx("S8-coming-next-4-expenses", 10, "COMING NEXT mockup"), vo: "Shared expenses, so you always know who owes whom." },
    { ...gfx("S8-coming-next-5-brief", 10, "COMING NEXT mockup"), vo: "A seven AM brief every morning with the day's plan and the weather." },
    { ...gfx("S8-coming-next-6-whatsapp", 10, "COMING NEXT mockup"), vo: "And later, Wayzo on WhatsApp." },
  ], slateVo: "" },
  { id: "S9", title: "Ending", slot: 45, talk: "Talk: outro", items: [
    { ...gfx("S9-endscreen", 20, "End screen with empty YouTube slots"), vo: "That's episode one. I'm building this in public, so subscribe if you want to see what ships next. See you in the next one." },
  ], slateVo: "If you've ever lost a booking in a group chat, tell me in the comments. I read all of them." },
];

const tc = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
const rows = [];
let t = 0;
for (const sc of SCENES) {
  const used = sc.items.reduce((a, i) => a + i.sec, 0);
  for (const it of sc.items) { rows.push({ sc, ...it, start: t }); t += it.sec; }
  const pad = sc.slot - used;
  if (pad > 1) { rows.push({ sc, file: "—", type: "slate", sec: pad, note: sc.talk || "VO over demo", vo: sc.slateVo ?? "", start: t }); t += pad; }
}
const total = t;

const out = path.join(ROOT, "handoff");
fs.mkdirSync(out, { recursive: true });
let shot = `# Episode 1 · Shot list\n\nAll clips are silent, 1920×1080, 60 fps. Total rough cut: **${tc(total)}** (${total.toFixed(1)} s).\nReal clips are recorded from the running app with demo data only (Maya Lopez, Sam Okafor, Leo Martin; fictional SkyPort, LusoRail and Stayly tickets). Raw 4K masters are in \`raw/\`.\n\n| # | Scene | In | Length | Type | File | Notes |\n|---|---|---|---|---|---|---|\n`;
rows.forEach((r, i) => { shot += `| ${i + 1} | ${r.sc.id} ${r.sc.title} | ${tc(r.start)} | ${r.sec.toFixed(1)} s | ${r.type} | ${r.file} | ${r.note} |\n`; });
shot += `\nOverlays: \`graphics/S2-lowerthird.mov\` (ProRes 4444, alpha), \`graphics/S7-callouts.mov\` (ProRes 4444, alpha).\nWhere a real clip shows \"AI reading · sped up ×8\", the AI wait was sped up; everything else plays at real speed.\n`;
fs.writeFileSync(path.join(out, "shotlist.md"), shot);

let vo = `# Episode 1 · Voiceover timing\n\nOne slot per shot in the rough cut. Times match \`handoff/rough-cut.mp4\`. The word budget assumes a relaxed 2.5 words per second. The script is a suggestion: say it your way.\n\n`;
rows.forEach((r, i) => {
  if (!r.vo) return;
  const words = r.vo.split(/\s+/).length;
  vo += `### VO ${String(i + 1).padStart(2, "0")} · ${tc(r.start)}–${tc(r.start + r.sec)} · ${r.sc.id} ${r.sc.title}${r.type === "slate" ? " (talking part)" : ""}\n`;
  vo += `Picture: ${r.note}. Budget ≈ ${Math.floor(r.sec * 2.5)} words (script: ${words}).\n\n> ${r.vo}\n\n`;
});
fs.writeFileSync(path.join(out, "vo-timing.md"), vo);
fs.writeFileSync(path.join(out, "vo-script.json"), JSON.stringify(rows.filter((r) => r.vo).map((r) => ({ start: +r.start.toFixed(2), end: +(r.start + r.sec).toFixed(2), text: r.vo })), null, 1));
console.log("total", tc(total), "rows", rows.length);
