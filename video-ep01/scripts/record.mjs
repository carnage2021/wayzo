// Records the REAL app for Episode 1 (no mocked features). Output: ../raw/<clip>.mp4 (3840x2160, 60 fps)
// plus ../raw/<clip>.json (click points, typing and AI-wait ranges for the styled versions).
// Usage: node record.mjs [clipName ...]   (BASE env = app URL, default http://localhost:3000)
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../../package.json"));
const { chromium } = require("@playwright/test");

const BASE = process.env.BASE ?? "http://localhost:3000";
const RAW = path.join(here, "../raw");
const SEED = path.join(here, "../seed");
const VIEW = { width: 1670, height: 939 }; // CSS px; shown in a 1920x1080 frame = 115% zoom
const DPR = 2.3; // -> 3841x2160 device pixels
const OUT_SCALE = 1920 / VIEW.width; // CSS px -> 1080p frame px (for click logs)
const DEMO = { name: "Maya Lopez", email: "maya.wayzo.demo@example.com", password: "lisbon-2027-trip" };
fs.mkdirSync(RAW, { recursive: true });

// ---------- deterministic "human" helpers ----------
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CURSOR_JS = `
  (() => {
    if (window.__wzCursor) return;
    const el = document.createElement('div');
    el.id = '__wz_cursor';
    el.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2.5l15.5 9.3-6.9 1.3 3.9 7.4-3 1.5-3.9-7.4L4.8 19z" fill="#fff" stroke="#0B1020" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    Object.assign(el.style, { position: 'fixed', left: '0', top: '0', zIndex: '2147483647', pointerEvents: 'none',
      transform: 'translate(-200px,-200px)', filter: 'drop-shadow(0 4px 8px rgba(11,16,32,.35))', transition: 'scale .12s' });
    const add = () => document.body && !document.getElementById('__wz_cursor') && document.body.appendChild(el);
    add(); document.addEventListener('DOMContentLoaded', add);
    window.__wzCursor = (x, y) => { add(); el.style.transform = 'translate(' + (x - 4) + 'px,' + (y - 3) + 'px)'; };
    window.__wzPress = (down) => { el.style.scale = down ? '0.86' : '1'; };
  })();`;

class Rec {
  constructor(page, cdp) {
    this.page = page;
    this.cdp = cdp;
    this.pos = { x: VIEW.width * 0.62, y: VIEW.height * 0.7 };
    this.frames = [];
    this.events = [];
  }
  now() {
    return (Date.now() - this.t0) / 1000;
  }
  async place() {
    await this.page.evaluate(([x, y]) => window.__wzCursor?.(x, y), [this.pos.x, this.pos.y]).catch(() => {});
  }
  /** Eased curved path with a little overshoot, ~60 steps/s. */
  async moveTo(x, y, ms) {
    const from = { ...this.pos };
    const dist = Math.hypot(x - from.x, y - from.y);
    const dur = ms ?? Math.min(1100, 380 + dist * 0.55);
    const steps = Math.max(8, Math.round(dur / 16));
    const bend = (rnd() - 0.5) * Math.min(120, dist * 0.25);
    const nx = -(y - from.y) / (dist || 1), ny = (x - from.x) / (dist || 1);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
      const over = Math.sin(Math.PI * t) * bend;
      const px = from.x + (x - from.x) * e + nx * over;
      const py = from.y + (y - from.y) * e + ny * over;
      this.pos = { x: px, y: py };
      await this.page.mouse.move(px, py);
      await this.place();
      await sleep(dur / steps);
    }
  }
  async target(locator) {
    await locator.waitFor({ state: "visible", timeout: 30000 });
    await locator.scrollIntoViewIfNeeded();
    const b = await locator.boundingBox();
    return { x: b.x + b.width * (0.45 + rnd() * 0.1), y: b.y + b.height * (0.45 + rnd() * 0.1) };
  }
  async click(locator, label = "") {
    const p = await this.target(locator);
    await this.moveTo(p.x, p.y);
    await sleep(120 + rnd() * 120);
    this.events.push({ type: "click", t: this.now(), x: p.x * OUT_SCALE, y: p.y * OUT_SCALE, label });
    await this.page.evaluate(() => window.__wzPress?.(true)).catch(() => {});
    await this.page.mouse.down();
    await sleep(70);
    await this.page.mouse.up();
    await this.page.evaluate(() => window.__wzPress?.(false)).catch(() => {});
    await sleep(160);
  }
  async type(locator, text, label = "") {
    await this.click(locator, label);
    const start = this.now();
    for (const ch of text) {
      await this.page.keyboard.type(ch);
      await sleep(55 + rnd() * 70 + (ch === " " ? 60 : 0));
    }
    this.events.push({ type: "typing", t: start, end: this.now(), label });
    await sleep(250);
  }
  mark(type, extra = {}) {
    this.events.push({ type, t: this.now(), ...extra });
  }
  async start() {
    this.frames = [];
    this.events = [];
    this.t0 = Date.now();
    this.onFrame = async ({ data, metadata, sessionId }) => {
      this.frames.push({ t: metadata.timestamp * 1000, data });
      await this.cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
    };
    this.cdp.on("Page.screencastFrame", this.onFrame);
    await this.cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: 3840, maxHeight: 2160, everyNthFrame: 1 });
    await this.place();
    await sleep(2000); // still padding
  }
  async stop(name) {
    await sleep(2000); // still padding
    const end = Date.now();
    await this.cdp.send("Page.stopScreencast");
    this.cdp.off("Page.screencastFrame", this.onFrame);
    const dir = path.join(RAW, `_frames_${name}`);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir);
    const frames = this.frames.filter((f) => f.t >= this.t0 - 50);
    let list = "";
    frames.forEach((f, i) => {
      const file = `f${String(i).padStart(5, "0")}.jpg`;
      fs.writeFileSync(path.join(dir, file), Buffer.from(f.data, "base64"));
      const next = i + 1 < frames.length ? frames[i + 1].t : end;
      const first = i === 0 ? Math.max(0, f.t - this.t0) : 0; // hold first frame from t0
      list += `file '${file}'\nduration ${((next - f.t + first) / 1000).toFixed(4)}\n`;
    });
    list += `file 'f${String(frames.length - 1).padStart(5, "0")}.jpg'\n`;
    fs.writeFileSync(path.join(dir, "list.txt"), list);
    const out = path.join(RAW, `${name}.mp4`);
    execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", path.join(dir, "list.txt"),
      "-vf", "scale=3840:2160:flags=lanczos,fps=60", "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-pix_fmt", "yuv420p", out]);
    fs.writeFileSync(path.join(RAW, `${name}.json`), JSON.stringify({ duration: (end - this.t0) / 1000, frameSize: [1920, 1080], events: this.events }, null, 2));
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`clip ${name}: ${((end - this.t0) / 1000).toFixed(1)}s, ${frames.length} captured frames (${(frames.length / ((end - this.t0) / 1000)).toFixed(1)} fps)`);
  }
}

/** Smooth scroll by `px` over `ms` (eased), cursor parked. */
async function smoothScroll(page, px, ms) {
  await page.evaluate(([px, ms]) => new Promise((done) => {
    const y0 = window.scrollY, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      window.scrollTo(0, y0 + px * e);
      k < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  }), [px, ms]);
}

async function waitForUpload(page, fileName, rec) {
  const row = page.locator("li", { hasText: fileName }).first();
  await row.waitFor({ timeout: 60000 });
  rec.mark("wait-start", { label: "AI reading the ticket" });
  for (let i = 0; i < 360; i++) {
    const txt = await row.innerText();
    if (!/Uploading|Reading/.test(txt)) {
      rec.mark("wait-end", { result: txt.replace(/\s+/g, " ") });
      return txt.replace(/\s+/g, " ");
    }
    await sleep(500);
  }
  throw new Error("upload timed out");
}

/** Off-camera: make sure the demo user is signed in (each run starts a fresh browser). */
async function ensureSignedIn(page) {
  await page.goto(BASE + "/trips", { waitUntil: "load" });
  if (!/\/login/.test(page.url())) return;
  await page.fill("#login-email", DEMO.email);
  await page.fill("#login-password", DEMO.password);
  await page.getByRole("button", { name: /^Sign in/ }).last().click();
  await page.waitForURL(/\/trips$/, { timeout: 30000 });
}

const CLIPS = {
  async "S4-landing-scroll"(rec, page) {
    await page.goto(BASE + "/", { waitUntil: "load" });
    await sleep(3500); // splash intro finishes
    await page.evaluate(() => { const c = document.getElementById("__wz_cursor"); if (c) c.style.opacity = "0"; });
    await rec.start();
    const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (const frac of [0.16, 0.34, 0.52, 0.7, 0.86, 1]) {
      const target = Math.round(total * frac);
      const cur = await page.evaluate(() => scrollY);
      await smoothScroll(page, target - cur, 2400);
      await sleep(600);
    }
    await rec.stop("S4-landing-scroll");
    await page.evaluate(() => { const c = document.getElementById("__wz_cursor"); if (c) c.style.opacity = "1"; });
  },
  async "S5-splash-signup"(rec, page) {
    await page.goto("about:blank");
    await rec.start();
    rec.mark("splash");
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await sleep(4200);
    await rec.click(page.getByRole("link", { name: "Sign in" }).first(), "Sign in");
    await page.waitForURL(/\/login/);
    await sleep(900);
    await rec.click(page.getByRole("tab", { name: "Create account" }), "Create account");
    await rec.type(page.locator("#login-name"), DEMO.name, "Name");
    await rec.type(page.locator("#login-email"), DEMO.email, "Email");
    await rec.type(page.locator("#login-password"), DEMO.password, "Password");
    await rec.click(page.getByRole("button", { name: /^Create account/ }).last(), "Create account");
    await page.waitForURL(/\/onboarding/, { timeout: 40000 });
    await sleep(1500);
    await rec.type(page.locator("#p-city"), "London", "Home city");
    await rec.click(page.getByRole("button", { name: /Let's go/ }), "Let's go");
    await page.waitForURL(/\/trips$/, { timeout: 30000 });
    await sleep(2500);
    await rec.stop("S5-splash-signup");
  },
  async "S5-login"(rec, page) {
    await ensureSignedIn(page);
    await page.goto(BASE + "/trips", { waitUntil: "load" });
    await rec.start();
    await rec.click(page.getByRole("button", { name: "Account menu" }).first(), "Account menu");
    await rec.click(page.getByRole("menuitem", { name: /Sign out/ }), "Sign out");
    await page.waitForURL(/\/login/);
    await sleep(1200);
    await rec.type(page.locator("#login-email"), DEMO.email, "Email");
    await rec.type(page.locator("#login-password"), DEMO.password, "Password");
    await rec.click(page.getByRole("button", { name: /^Sign in/ }).last(), "Sign in");
    await page.waitForURL(/\/trips$/, { timeout: 30000 });
    await sleep(2500);
    await rec.stop("S5-login");
  },
  async "S6-create-trip"(rec, page) {
    await ensureSignedIn(page);
    await page.goto(BASE + "/trips", { waitUntil: "load" });
    await rec.start();
    await rec.click(page.getByRole("link", { name: /New trip|Create your first trip|Plan a trip/ }).first(), "New trip");
    await page.waitForURL(/\/trips\/new/);
    await sleep(900);
    await rec.type(page.locator("#trip-name"), "Lisbon with friends", "Trip name");
    await rec.type(page.locator("#trip-destinations"), "Lisbon", "Destination search");
    const opt = page.locator("ul[role=listbox] li[role=option]").filter({ hasText: /Lisbon/ }).filter({ hasText: /Portugal/ }).first();
    await opt.waitFor({ timeout: 15000 });
    await sleep(700);
    await rec.click(opt, "Lisbon");
    await rec.click(page.locator("#trip-start"), "Start date");
    await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft");
    for (const ch of "09042027") { await page.keyboard.type(ch); await sleep(90); }
    await rec.click(page.locator("#trip-end"), "End date");
    await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft");
    for (const ch of "12042027") { await page.keyboard.type(ch); await sleep(90); }
    const cur = page.locator("#trip-currency");
    await rec.click(cur, "Currency");
    await cur.selectOption("EUR");
    await sleep(500);
    await rec.click(page.getByRole("button", { name: /Create trip/ }), "Create trip");
    await page.waitForURL(/\/trips\/[0-9a-f-]{36}$/, { timeout: 40000 });
    await page.waitForLoadState("networkidle");
    await sleep(3500);
    await smoothScroll(page, 520, 2200);
    await sleep(1800);
    await smoothScroll(page, -520, 1800);
    await sleep(1500);
    fs.writeFileSync(path.join(RAW, "trip-url.txt"), page.url());
    await rec.stop("S6-create-trip");
  },
  async upload(rec, page, name, file, label) {
    await ensureSignedIn(page);
    const trip = fs.readFileSync(path.join(RAW, "trip-url.txt"), "utf8").trim();
    await page.goto(trip + "/bookings", { waitUntil: "load" });
    const pick = page.getByRole("button", { name: /Choose files/ }).first();
    await pick.waitFor({ state: "visible", timeout: 30000 });
    await sleep(1500);
    await rec.start();
    const chooser = page.waitForEvent("filechooser", { timeout: 60000 });
    await rec.click(pick, "Choose files");
    await (await chooser).setFiles(path.join(SEED, file));
    rec.mark("file-picked", { label });
    const result = await waitForUpload(page, file, rec);
    await sleep(2500);
    await page.reload({ waitUntil: "load" });
    await sleep(1200);
    const cards = page.locator("article");
    if (await cards.count()) await cards.last().scrollIntoViewIfNeeded();
    await sleep(3500);
    await rec.stop(name);
    console.log(`  ${label}: ${result}`);
  },
  async "S7-upload-flight"(rec, page) {
    await CLIPS.upload(rec, page, "S7-upload-flight", "SkyPort-eticket-WZ7K2Q.pdf", "Flight PDF");
  },
  async "S7-upload-train"(rec, page) {
    await CLIPS.upload(rec, page, "S7-upload-train", "LusoRail-ticket-TRN48291.png", "Train screenshot");
  },
  async "S7-upload-hotel"(rec, page) {
    await CLIPS.upload(rec, page, "S7-upload-hotel", "Stayly-booking-CAL-55210.pdf", "Hotel booking");
  },
  async "S7-timeline-dashboard"(rec, page) {
    await ensureSignedIn(page);
    const trip = fs.readFileSync(path.join(RAW, "trip-url.txt"), "utf8").trim();
    await page.goto(trip + "/bookings", { waitUntil: "load" });
    await rec.start();
    await smoothScroll(page, 700, 3500);
    await sleep(1500);
    await smoothScroll(page, 900, 3500);
    await sleep(2000);
    await rec.click(page.getByRole("link", { name: "Dashboard" }).first(), "Dashboard");
    await page.waitForURL(/\/trips\/[0-9a-f-]{36}$/);
    await page.waitForFunction(() => !document.querySelector("[aria-busy=true]"), null, { timeout: 60000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await sleep(3500);
    await smoothScroll(page, 650, 4000);
    await sleep(3000);
    await rec.stop("S7-timeline-dashboard");
  },
};

const ORDER = ["S4-landing-scroll", "S5-splash-signup", "S5-login", "S6-create-trip", "S7-upload-flight", "S7-upload-train", "S7-upload-hotel", "S7-timeline-dashboard"];
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : ORDER;

const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--hide-scrollbars"] });
const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DPR, locale: "en-GB", timezoneId: "Europe/London", reducedMotion: "no-preference" });
await context.addInitScript(CURSOR_JS);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const rec = new Rec(page, cdp);
for (const name of wanted) {
  try {
    await CLIPS[name](rec, page);
  } catch (e) {
    console.error(`clip ${name} FAILED:`, e.message);
    await page.screenshot({ path: path.join(RAW, `FAILED-${name}.png`) }).catch(() => {});
    await cdp.send("Page.stopScreencast").catch(() => {});
    process.exitCode = 1;
    break;
  }
}
await browser.close();
