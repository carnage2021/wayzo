import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background, BODY, C, LogoMark, displayStyle, ease, springAt } from "../brand";
import { KineticText } from "../components/KineticText";
import { Callout, FeatureCard } from "../components/kit";

const card: React.CSSProperties = { background: C.white, color: C.ink, borderRadius: 28, boxShadow: "0 30px 70px rgba(0,0,0,.35)" };
const pop = (frame: number, at: number) => {
  const p = springAt(frame, at, { damping: 14, stiffness: 160 });
  return { opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - Math.min(p, 1)) * 24}px) scale(${0.92 + 0.08 * Math.min(p, 1)})` };
};
const Av = ({ i, s = 44 }: { i: string; s?: number }) => (
  <span style={{ width: s, height: s, borderRadius: "50%", background: { M: "#FFB4A2", S: "#A7F3D0", L: "#C9D3FF", A: "#FDE68A" }[i[0]!] ?? "#C9D3FF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, fontWeight: 800, fontSize: s * 0.36, color: C.ink, border: "3px solid #fff", flex: "none" }}>
    {i}
  </span>
);

// ---------- S3: messy group chat (fictional) ----------
const CHAT: { who: string; text: string; me?: boolean }[] = [
  { who: "SA", text: "wait which hotel did we book??" },
  { who: "LE", text: "check the email. or the other email" },
  { who: "MA", text: "I sent the PDF yesterday" },
  { who: "SA", text: "can't find it. what time is the flight?" },
  { who: "LE", text: "11 something? I have a screenshot somewhere" },
  { who: "MA", text: "ok who's paying for the train", me: true },
  { who: "SA", text: "can someone make a spreadsheet" },
  { who: "LE", text: "I'll do it tomorrow" },
];
export function S3GroupChat() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background glow="blue" />
      <KineticText lines={["The group chat,", "*48 hours* before the trip."]} at={0.1} size={76} align="left" style={{ position: "absolute", left: 130, top: 330, width: 760 }} />
      <div style={{ position: "absolute", left: 1060, top: 70, width: 560, height: 940, borderRadius: 60, background: C.ink2, padding: 14, border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 40px 90px rgba(0,0,0,.45)" }}>
        <div style={{ position: "absolute", inset: 14, borderRadius: 48, background: "#EFEAE2", overflow: "hidden" }}>
          <div style={{ background: "#F7F7F7", padding: "52px 24px 16px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #ddd" }}>
            <Av i="LIS" s={52} />
            <div style={{ fontFamily: BODY }}>
              <div style={{ fontWeight: 800, fontSize: 24, color: C.ink }}>Lisbon trip</div>
              <div style={{ fontSize: 17, color: "#667085" }}>Maya, Sam, Leo</div>
            </div>
          </div>
          <div style={{ padding: "18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {CHAT.map((m, i) => (
              <div key={i} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "80%", ...pop(frame, 0.5 + i * 0.55) }}>
                <div style={{ background: m.me ? "#D9FDD3" : "#fff", borderRadius: 16, padding: "10px 16px", fontFamily: BODY, fontSize: 22, color: C.ink, boxShadow: "0 1px 1px rgba(0,0,0,.08)" }}>
                  {!m.me && <div style={{ fontWeight: 700, fontSize: 16, color: { SA: "#0E8A6A", LE: "#3B5BFF", MA: "#C2410C" }[m.who] }}>{{ SA: "Sam", LE: "Leo", MA: "Maya" }[m.who]}</div>}
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------- S3: "Where do you want to go?" vs "I already booked." ----------
export function S3Versus() {
  const frame = useCurrentFrame();
  const l = springAt(frame, 0.2, { damping: 15 });
  const r = springAt(frame, 1.1, { damping: 15 });
  const vs = springAt(frame, 0.8, { damping: 12, stiffness: 180 });
  const side = (p: number, dir: number): React.CSSProperties => ({ opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - Math.min(p, 1)) * 120 * dir}px)` });
  return (
    <AbsoluteFill>
      <Background glow="both" />
      <div style={{ position: "absolute", left: 140, top: 290, width: 740, height: 500, borderRadius: 36, background: "rgba(255,255,255,.06)", border: "1.5px solid rgba(255,255,255,.16)", padding: 56, ...side(l, -1) }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", color: C.mutedDark }}>MOST TRAVEL APPS ASK</div>
        <div style={{ ...displayStyle, fontSize: 84, color: C.white, marginTop: 30 }}>“Where do you want to go?”</div>
      </div>
      <div style={{ position: "absolute", left: 1040, top: 290, width: 740, height: 500, borderRadius: 36, background: C.lime, padding: 56, boxShadow: "0 30px 80px rgba(215,255,61,.25)", ...side(r, 1) }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", color: C.ink }}>BUT YOUR GROUP ALREADY SAYS</div>
        <div style={{ ...displayStyle, fontSize: 96, color: C.ink, marginTop: 30 }}>“I already booked.”</div>
      </div>
      <div style={{ position: "absolute", left: 960 - 56, top: 540 - 56, width: 112, height: 112, borderRadius: "50%", background: C.ink, border: `3px solid ${C.lime}`, display: "flex", alignItems: "center", justifyContent: "center", ...displayStyle, fontSize: 40, color: C.lime, transform: `scale(${vs})` }}>
        vs
      </div>
    </AbsoluteFill>
  );
}

// ---------- S4: Upload tickets -> Tell us your vibe -> Travel easy ----------
export function S4ThreeSteps() {
  const frame = useCurrentFrame();
  const steps = [
    { n: "01", t: "Upload tickets", d: "PDF, screenshot or photo. The AI files it for you." },
    { n: "02", t: "Tell us your vibe", d: "Budget, food and pace for everyone in the group." },
    { n: "03", t: "Travel easy", d: "Stays, food, a day-by-day plan and a 7 AM brief." },
  ];
  return (
    <AbsoluteFill>
      <Background glow="both" />
      <KineticText lines={["How *wayzo* works"]} at={0.1} size={88} style={{ position: "absolute", top: 150, left: 0, right: 0 }} />
      <div style={{ position: "absolute", left: 170, right: 170, top: 400, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
        {steps.map((s, i) => {
          const p = springAt(frame, 0.9 + i * 0.9, { damping: 14 });
          return (
            <div key={s.n} style={{ position: "relative", borderRadius: 32, padding: "42px 40px", background: i === 0 ? C.lime : "rgba(255,255,255,.06)", border: i === 0 ? "none" : "1.5px solid rgba(255,255,255,.16)", color: i === 0 ? C.ink : C.white, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - Math.min(p, 1)) * 60}px)` }}>
              <div style={{ ...displayStyle, fontSize: 72, opacity: 0.35 }}>{s.n}</div>
              <div style={{ ...displayStyle, fontSize: 52, marginTop: 18 }}>{s.t}</div>
              <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 27, lineHeight: 1.45, marginTop: 18, opacity: 0.8 }}>{s.d}</div>
              {i < 2 && <div style={{ position: "absolute", right: -34, top: "50%", ...displayStyle, fontSize: 48, color: C.lime, transform: "translateY(-50%)" }}>→</div>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ---------- S7: transparent callout pills over the upload clips ----------
export function S7Callouts() {
  const pills = ["Flight", "Date", "Time", "From → To", "No typing"];
  return (
    <AbsoluteFill>
      {pills.map((p, i) => (
        <Callout key={p} label={p} x={1450 + (i % 2) * 70} y={300 + i * 110} at={0.3 + i * 0.5} tone={i === 4 ? "lime" : "ink"} />
      ))}
    </AbsoluteFill>
  );
}

// ---------- S8: Coming next mockups ----------
const Phone = ({ children, light = true }: { children: React.ReactNode; light?: boolean }) => (
  <div style={{ width: 440, height: 840, borderRadius: 60, background: C.ink2, padding: 13, border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 40px 90px rgba(0,0,0,.45)", position: "relative" }}>
    <div style={{ position: "absolute", inset: 13, borderRadius: 48, overflow: "hidden", background: light ? C.canvas : C.ink, padding: "70px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
  </div>
);
const opt = (label: string, on: boolean, p: number) => (
  <span key={label} style={{ padding: "11px 20px", borderRadius: 999, fontFamily: BODY, fontWeight: 700, fontSize: 21, background: on && p > 0.5 ? C.lime : "#fff", border: `2px solid ${on && p > 0.5 ? C.lime : C.line}`, color: C.ink, transform: `scale(${on && p > 0.5 ? 1 + 0.06 * Math.sin(Math.min(1, (p - 0.5) * 2) * Math.PI) : 1})` }}>
    {label}
  </span>
);

export function S8Quiz() {
  const frame = useCurrentFrame();
  const q = (t: string, opts: [string, boolean][], at: number) => (
    <div>
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 23, marginBottom: 10, color: C.ink }}>{t}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>{opts.map(([l, on]) => opt(l, on, ease(frame, at, 0.4)))}</div>
    </div>
  );
  return (
    <FeatureCard index="1" title={["Everyone picks", "their *vibe.*"]} body="A 30-second quiz for each traveller. Wayzo blends budget, diet and pace for the whole group.">
      <Phone>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 18, letterSpacing: ".14em", color: C.blue }}>YOUR VIBE</div>
        <div style={{ ...displayStyle, fontSize: 44, color: C.ink, marginTop: -8 }}>Lisbon trip</div>
        {q("Where do you want to stay?", [["Hotel", false], ["Villa", true], ["Hostel", false]], 2)}
        {q("Food?", [["Vegetarian", true], ["Anything", false]], 2.6)}
        {q("Pace?", [["Relaxed", false], ["Balanced", true], ["Packed", false]], 3.2)}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 14, background: C.ink, color: "#fff", borderRadius: 22, padding: "14px 18px", opacity: ease(frame, 4, 0.5), fontFamily: BODY, fontWeight: 700, fontSize: 21 }}>
          <span style={{ display: "flex" }}>
            <Av i="MA" s={40} />
            <span style={{ marginLeft: -10 }}><Av i="SA" s={40} /></span>
            <span style={{ marginLeft: -10 }}><Av i="LE" s={40} /></span>
          </span>
          3 of 3 friends answered
        </div>
      </Phone>
    </FeatureCard>
  );
}

export function S8Stays() {
  const frame = useCurrentFrame();
  const votes = frame >= 2.6 * 60 ? 3 : frame >= 2.1 * 60 ? 2 : 1;
  const glow = ease(frame, 3.1, 0.4);
  const stays = [
    { n: "Loft, Bairro Alto", r: "4.8", c: "#1F2740" },
    { n: "Alfama view flat", r: "4.7", c: "#3B5BFF", pick: true },
    { n: "Chiado guesthouse", r: "4.6", c: "#C9D3FF" },
  ];
  return (
    <FeatureCard index="2" title={["Stays the whole", "group *votes* on."]} body="Stays matched to everyone's budget and style. Vote, and the group pick rises to the top.">
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 640 }}>
        {stays.map((s, i) => (
          <div key={s.n} style={{ ...card, display: "flex", alignItems: "center", gap: 22, padding: 18, ...pop(frame, 0.6 + i * 0.25), outline: s.pick ? `${6 * glow}px solid ${C.lime}` : undefined, boxShadow: s.pick && glow > 0 ? "0 20px 60px rgba(215,255,61,.4)" : card.boxShadow }}>
            <div style={{ width: 150, height: 110, borderRadius: 18, background: s.c, flex: "none" }} />
            <div style={{ flex: 1, fontFamily: BODY }}>
              <div style={{ fontWeight: 800, fontSize: 28 }}>{s.n}</div>
              <div style={{ fontSize: 21, color: C.muted, marginTop: 6 }}>★ {s.r} · {s.pick ? `${votes} vote${votes > 1 ? "s" : ""}` : i === 0 ? "1 vote" : "No votes yet"}</div>
            </div>
            {s.pick && glow > 0.5 && <span style={{ padding: "12px 22px", borderRadius: 999, background: C.lime, fontFamily: BODY, fontWeight: 800, fontSize: 22 }}>Book</span>}
          </div>
        ))}
      </div>
    </FeatureCard>
  );
}

export function S8Plan() {
  const frame = useCurrentFrame();
  const swap = ease(frame, 2.2, 0.6);
  const ai = ease(frame, 3.6, 0.5);
  const row = (t: string, label: string, y: number, extra?: React.CSSProperties) => (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", alignItems: "center", gap: 18, ...extra }}>
      <span style={{ width: 74, fontFamily: BODY, fontWeight: 600, fontSize: 22, color: C.muted }}>{t}</span>
      <span style={{ flex: 1, ...card, borderRadius: 20, padding: "20px 22px", fontFamily: BODY, fontWeight: 700, fontSize: 25 }}>{label}</span>
    </div>
  );
  return (
    <FeatureCard index="3" title={["A day plan you", "can *edit.*"]} body="Drag things around, or ask the AI to add a spot. Real places only, with live hours and ratings.">
      <div style={{ ...card, width: 680, padding: 34, background: C.canvas }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ ...displayStyle, fontSize: 48 }}>Day 2</div>
          <span style={{ padding: "10px 18px", borderRadius: 999, background: C.ink, color: "#fff", fontFamily: BODY, fontWeight: 700, fontSize: 20 }}>Lisbon</span>
        </div>
        <div style={{ position: "relative", height: 420, marginTop: 26 }}>
          {row("10:00", "Belém Tower", 0)}
          {row(swap > 0.5 ? "16:00" : "13:00", "Lunch by the river", 100 + 100 * swap)}
          {row(swap > 0.5 ? "13:00" : "16:00", "Tram 28 to Alfama", 200 - 100 * swap, { zIndex: 2, transform: `scale(${1 + 0.04 * Math.sin(swap * Math.PI)})` })}
          {ai < 0.5 ? (
            <div style={{ position: "absolute", left: 92, top: 312, padding: "16px 26px", borderRadius: 999, border: `3px dashed ${C.blue}`, color: C.blue, background: "#EEF1FF", fontFamily: BODY, fontWeight: 800, fontSize: 23 }}>✦ Ask AI to add a spot</div>
          ) : (
            row("19:30", "Sunset at Miradouro", 300, { opacity: ai })
          )}
        </div>
      </div>
    </FeatureCard>
  );
}

export function S8Expenses() {
  const frame = useCurrentFrame();
  const n = (to: number, at: number) => Math.round(to * ease(frame, at, 0.7));
  return (
    <FeatureCard index="4" title={["Split costs.", "Skip the *awkward.*"]} body="Add an expense in two taps. Wayzo keeps a running balance of who owes whom.">
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 640 }}>
        <div style={{ ...card, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, ...pop(frame, 0.5) }}>
          <div style={{ flex: 1, fontFamily: BODY }}><div style={{ fontWeight: 800, fontSize: 30 }}>Dinner in Alfama</div><div style={{ fontSize: 22, color: C.muted, marginTop: 4 }}>Paid by Maya</div></div>
          <div style={{ ...displayStyle, fontSize: 52 }}>€126</div>
        </div>
        <div style={{ ...card, padding: "26px 28px", ...pop(frame, 1.1) }}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 26, marginBottom: 10 }}>Group balance</div>
          {[["SA", "Sam → Maya", n(42, 1.6)], ["LE", "Leo → Maya", n(42, 2.1)]].map(([a, l, v]) => (
            <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderTop: `1px solid ${C.line}`, fontFamily: BODY, fontWeight: 700, fontSize: 28 }}>
              <Av i={a as string} />{l}<span style={{ marginLeft: "auto", ...displayStyle, fontSize: 40 }}>€{v}</span>
            </div>
          ))}
        </div>
        <div style={{ borderRadius: 28, background: C.lime, padding: "26px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", ...pop(frame, 2.9) }}>
          <span style={{ ...displayStyle, fontSize: 44, color: C.ink }}>Leo owes you €42</span>
          <span style={{ padding: "14px 24px", borderRadius: 999, background: C.ink, color: "#fff", fontFamily: BODY, fontWeight: 800, fontSize: 22 }}>Settle up</span>
        </div>
      </div>
    </FeatureCard>
  );
}

export function S8Brief() {
  const frame = useCurrentFrame();
  return (
    <FeatureCard index="5" title={["Wake up to", "your *plan.*"]} body="Every morning at 7 AM: today's plan, weather and reminders, by email and notification.">
      <Phone light={false}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1b1f4a 0%,#6b3a6e 42%,#f08a5d 78%,#ffd27a 100%)" }} />
        <div style={{ position: "relative", textAlign: "center", color: "#fff", marginTop: 20 }}>
          <div style={{ ...displayStyle, fontSize: 120 }}>7:00</div>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 22, opacity: 0.85 }}>Day 2 in Lisbon</div>
        </div>
        <div style={{ position: "relative", marginTop: 34, background: "rgba(255,255,255,.95)", borderRadius: 28, padding: "20px 22px", ...pop(frame, 1.2) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: BODY, fontWeight: 700, fontSize: 17, color: C.muted }}>
            <LogoMark size={34} /> WAYZO <span style={{ marginLeft: "auto", fontWeight: 600 }}>now</span>
          </div>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 25, marginTop: 12, color: C.ink }}>7:00 AM brief · Day 2</div>
          {["Belém Tower 10:00", "Lunch by the river 13:00", "Sunny, 24°"].map((l, i) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: BODY, fontWeight: 600, fontSize: 22, marginTop: 10, color: C.ink, opacity: ease(frame, 1.8 + i * 0.4, 0.3) }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: i === 2 ? "#F5A524" : C.blue }} />{l}
            </div>
          ))}
        </div>
      </Phone>
    </FeatureCard>
  );
}

export function S8WhatsApp() {
  const frame = useCurrentFrame();
  const p = springAt(frame, 0.8, { damping: 13 });
  return (
    <FeatureCard index="6" title={["Wayzo on", "*WhatsApp.*"]} body="Ask about your trip and forward tickets right from the chat. On the roadmap after the web app.">
      <div style={{ ...card, width: 560, padding: 40, textAlign: "center", transform: `scale(${p})`, background: C.ink2, color: "#fff", border: "1.5px dashed rgba(255,255,255,.3)" }}>
        <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z" /></svg>
        <div style={{ ...displayStyle, fontSize: 56, marginTop: 20 }}>WhatsApp</div>
        <div style={{ display: "inline-block", marginTop: 22, padding: "12px 26px", borderRadius: 999, background: C.blue, fontFamily: BODY, fontWeight: 800, fontSize: 24, letterSpacing: ".06em" }}>COMING SOON</div>
      </div>
    </FeatureCard>
  );
}

/** Slate for rough-cut gaps (face cam / talking time). */
export function Slate({ scene, note }: { scene: string; note: string }) {
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18 }}>
      <Background glow="none" />
      <div style={{ position: "relative", ...displayStyle, fontSize: 64, color: "rgba(255,255,255,.85)" }}>{scene}</div>
      <div style={{ position: "relative", fontFamily: BODY, fontWeight: 600, fontSize: 30, color: C.mutedDark }}>{note}</div>
    </AbsoluteFill>
  );
}

