// Renders the three FICTIONAL demo tickets for Episode 1 into ../seed/.
// All companies, people, codes and numbers are made up. Run: node make-tickets.mjs
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bwipjs from "bwip-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../../package.json"));
const { chromium } = require("@playwright/test");
const OUT = path.join(here, "../seed");

const svg = (opts) => bwipjs.toSVG(opts);
const aztec = svg({ bcid: "azteccode", text: "M1LOPEZ/MAYA MS       EWZ7K2Q LHRLISSK 0214 098Y014A0042 100", scale: 3 });
const pdf417 = svg({ bcid: "pdf417", text: "SKYPORT|WZ7K2Q|2214401237785|LOPEZ/MAYA|SK214|LHRLIS|20270409", height: 12, scale: 2 });
const trainQr = svg({ bcid: "qrcode", text: "LUSORAIL:TRN48291:IC133:LIS-OPO:20270412T0900:C4S21-23:3AD", scale: 6 });
const hotelQr = svg({ bcid: "qrcode", text: "STAYLY:CAL-55210:PIN4417:20270409-20270412", scale: 4 });

const base = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:"Segoe UI",Arial,Helvetica,sans-serif;color:#1d2433;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  table{border-collapse:collapse;width:100%}
  .muted{color:#667085}
  .small{font-size:10.5px}
`;

const flightHtml = `<html><head><style>${base}
  .page{padding:34px 40px}
  .top{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #0d3b8c;padding-bottom:14px}
  .brand{display:flex;align-items:center;gap:12px;font-weight:800;font-size:26px;color:#0d3b8c;letter-spacing:.04em}
  .brand i{width:44px;height:44px;border-radius:10px;background:#0d3b8c;display:flex;align-items:center;justify-content:center}
  h1{font-size:15px;letter-spacing:.12em;color:#0d3b8c;margin:20px 0 10px}
  .ref{display:flex;gap:28px;background:#f2f5fb;border-radius:8px;padding:14px 18px;font-size:12px}
  .ref b{display:block;font-size:20px;letter-spacing:.06em;margin-top:2px}
  th{background:#0d3b8c;color:#fff;font-size:11px;text-align:left;padding:7px 9px;letter-spacing:.04em}
  td{font-size:12px;padding:8px 9px;border-bottom:1px solid #e4e7ee;vertical-align:top}
  .seg{display:flex;justify-content:space-between;align-items:center;border:1.5px solid #d6dbe6;border-radius:10px;padding:16px 20px;margin-top:10px}
  .seg .city b{font-size:30px;display:block;letter-spacing:.02em}
  .tot td{font-weight:700;font-size:13px}
  .codes{display:flex;gap:30px;align-items:center;margin-top:18px}
</style></head><body><div class="page">
  <div class="top">
    <div class="brand"><i><svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg></i>SKYPORT AIRWAYS</div>
    <div class="small muted" style="text-align:right">Issued 14 Nov 2026 · Online booking<br/>skyportairways.example</div>
  </div>
  <h1>E-TICKET RECEIPT &amp; ITINERARY</h1>
  <div class="ref">
    <div>Booking reference<b>WZ7K2Q</b></div>
    <div>Status<b style="color:#0a7a3d">CONFIRMED</b></div>
    <div>Lead passenger<b>MS MAYA LOPEZ</b></div>
  </div>
  <h1>FLIGHT</h1>
  <div class="seg">
    <div class="city"><span class="muted small">Departure · Terminal 2</span><b>LHR 11:05</b>London Heathrow<br/><span class="small muted">Fri 09 Apr 2027</span></div>
    <div style="text-align:center" class="small"><b style="font-size:15px">SK 214</b><br/>━━━━━ ✈ ━━━━━<br/>2h 35m · Non-stop<br/>Airbus A320neo</div>
    <div class="city" style="text-align:right"><span class="muted small">Arrival · Terminal 1</span><b>LIS 13:40</b>Lisbon Humberto Delgado<br/><span class="small muted">Fri 09 Apr 2027</span></div>
  </div>
  <h1>PASSENGERS</h1>
  <table><tr><th>Passenger</th><th>E-ticket number</th><th>Cabin / fare</th><th>Seat</th><th>Baggage</th></tr>
    <tr><td>MS MAYA LOPEZ</td><td>221-4401237785</td><td>Economy (Y) · Standard</td><td>14A</td><td>1 × 23 kg + cabin bag</td></tr>
    <tr><td>MR SAM OKAFOR</td><td>221-4401237786</td><td>Economy (Y) · Standard</td><td>14B</td><td>1 × 23 kg + cabin bag</td></tr>
    <tr><td>MR LEO MARTIN</td><td>221-4401237787</td><td>Economy (Y) · Standard</td><td>14C</td><td>1 × 23 kg + cabin bag</td></tr>
  </table>
  <h1>PAYMENT</h1>
  <table>
    <tr><td>Air fare 3 × GBP 98.00</td><td style="text-align:right">GBP 294.00</td></tr>
    <tr><td>UK Air Passenger Duty 3 × GBP 13.00</td><td style="text-align:right">GBP 39.00</td></tr>
    <tr><td>Airport &amp; security charges</td><td style="text-align:right">GBP 63.36</td></tr>
    <tr><td>Checked baggage 3 × 23 kg (included)</td><td style="text-align:right">GBP 0.00</td></tr>
    <tr><td>Seat selection</td><td style="text-align:right">GBP 16.50</td></tr>
    <tr class="tot"><td>Total paid · Visa ending 4821</td><td style="text-align:right">GBP 412.86</td></tr>
  </table>
  <div class="codes">${aztec.replace("<svg", '<svg style="width:120px;height:120px"')}${pdf417.replace("<svg", '<svg style="width:300px;height:70px"')}<div class="small muted" style="max-width:300px">Check-in opens 24 hours before departure. Bag drop closes 40 minutes and the gate 20 minutes before departure. Bring a valid passport or EU ID card.</div></div>
  <p class="small muted" style="margin-top:22px;line-height:1.5">This is your e-ticket receipt. Carriage is subject to the SkyPort Airways Conditions of Carriage. Fares are non-refundable; changes are allowed up to 3 hours before departure for a fee plus any fare difference. SkyPort Airways Ltd, 1 Aviator Way, Hounslow TW6 2GA, United Kingdom.</p>
</div></body></html>`;

const trainHtml = `<html><head><style>${base}
  body{width:390px;height:844px;background:#f3f4f6;font-family:-apple-system,"Segoe UI",Arial,sans-serif}
  .status{display:flex;justify-content:space-between;padding:14px 26px 6px;font-weight:600;font-size:15px}
  .bar{display:flex;align-items:center;gap:10px;padding:10px 18px 14px;font-weight:700;font-size:17px}
  .bar i{width:30px;height:30px;border-radius:8px;background:#0f7a5c;display:flex;align-items:center;justify-content:center;color:#fff;font-style:normal;font-size:16px}
  .card{margin:0 14px;background:#fff;border-radius:18px;box-shadow:0 6px 18px rgba(0,0,0,.08);overflow:hidden}
  .head{background:#0f7a5c;color:#fff;padding:16px 18px}
  .head .r{display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px}
  .head b{font-size:30px;display:block;letter-spacing:.01em}
  .row{display:flex;justify-content:space-between;padding:10px 18px;font-size:13px;border-bottom:1px solid #eef0f3}
  .row span:first-child{color:#6b7280}
  .qr{display:flex;flex-direction:column;align-items:center;padding:14px 0 8px}
</style></head><body>
  <div class="status"><span>9:41</span><span>▂▄▆ ◔ 82%</span></div>
  <div class="bar"><i>LR</i>LusoRail · My tickets</div>
  <div class="card">
    <div class="head">
      <div style="font-size:12px;opacity:.85">Intercity IC 133 · Mon 12 Apr 2027</div>
      <div class="r"><div><b>09:00</b>Lisboa Sta. Apolónia</div><div style="font-size:20px">→</div><div style="text-align:right"><b>11:49</b>Porto Campanhã</div></div>
    </div>
    <div class="row"><span>Booking code</span><b>TRN48291</b></div>
    <div class="row"><span>Coach / seats</span><b>4 · 21, 22, 23</b></div>
    <div class="row"><span>Class</span><b>2nd class (Turística)</b></div>
    <div class="row"><span>Passengers</span><b>Maya Lopez, Sam Okafor, Leo Martin</b></div>
    <div class="row"><span>Total</span><b>EUR 87.30</b></div>
    <div class="qr">${trainQr.replace("<svg", '<svg style="width:190px;height:190px"')}<div style="font-size:11px;color:#6b7280;margin-top:6px">Show this code at the gate · valid only for this train</div></div>
  </div>
</body></html>`;

const hotelHtml = `<html><head><style>${base}
  .page{padding:36px 44px}
  .brand{font-weight:800;font-size:24px;color:#e0435a;letter-spacing:-.01em}
  h1{font-size:26px;margin:18px 0 6px}
  .hero{display:flex;gap:20px;margin-top:18px;border:1.5px solid #e4e7ee;border-radius:12px;padding:18px}
  .ph{width:170px;height:120px;border-radius:8px;background:linear-gradient(135deg,#f2b880,#c8734a 55%,#7a4a3a);flex:none}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
  .box{background:#f6f7fa;border-radius:10px;padding:14px 16px;font-size:13px}
  .box b{display:block;font-size:17px;margin-top:3px}
  td{font-size:13px;padding:8px 0;border-bottom:1px solid #eceef3}
</style></head><body><div class="page">
  <div class="brand">stayly</div>
  <h1>Your booking is confirmed, Maya!</h1>
  <div class="muted" style="font-size:13px">Confirmation number <b style="color:#1d2433">CAL-55210</b> · PIN <b style="color:#1d2433">4417</b></div>
  <div class="hero"><div class="ph"></div><div>
    <div style="font-size:20px;font-weight:800">Casa Alfama Lodge</div>
    <div class="muted" style="font-size:13px;margin-top:4px">Rua dos Remédios 87, 1100-449 Lisboa, Portugal</div>
    <div style="font-size:13px;margin-top:10px">★ 8.9 Excellent · 412 reviews</div>
    <div class="muted" style="font-size:12px;margin-top:6px">Reception +351 21 000 4417 · Free Wi-Fi · Breakfast available</div>
  </div></div>
  <div class="grid">
    <div class="box">Check-in<b>Fri 9 Apr 2027</b>from 15:00</div>
    <div class="box">Check-out<b>Mon 12 Apr 2027</b>until 11:00</div>
    <div class="box">Your stay<b>3 nights, 1 room</b>Family Room · 3 adults</div>
    <div class="box">Guest name<b>Maya Lopez</b>Arriving with Sam Okafor, Leo Martin</div>
  </div>
  <table style="margin-top:18px">
    <tr><td>Family Room × 3 nights</td><td style="text-align:right">EUR 468.00</td></tr>
    <tr><td>VAT (6%, included)</td><td style="text-align:right">EUR 26.49</td></tr>
    <tr><td>Lisbon city tax (pay at the property: EUR 4 per adult per night)</td><td style="text-align:right">EUR 36.00</td></tr>
    <tr><td><b>Total paid online</b></td><td style="text-align:right"><b>EUR 468.00</b></td></tr>
  </table>
  <div style="display:flex;gap:22px;align-items:center;margin-top:20px">${hotelQr.replace("<svg", '<svg style="width:110px;height:110px"')}
    <p class="small muted" style="line-height:1.6">Free cancellation until 2 Apr 2027, 23:59 (Lisbon time). After that the first night is charged. Show this confirmation at check-in. Need help? Manage your booking in the Stayly app.</p></div>
</div></body></html>`;

const browser = await chromium.launch();
const p1 = await browser.newPage();
await p1.setContent(flightHtml, { waitUntil: "load" });
await p1.pdf({ path: path.join(OUT, "SkyPort-eticket-WZ7K2Q.pdf"), format: "A4", printBackground: true });
const p2 = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
await p2.setContent(trainHtml, { waitUntil: "load" });
await p2.screenshot({ path: path.join(OUT, "LusoRail-ticket-TRN48291.png") });
const p3 = await browser.newPage();
await p3.setContent(hotelHtml, { waitUntil: "load" });
await p3.pdf({ path: path.join(OUT, "Stayly-booking-CAL-55210.pdf"), format: "A4", printBackground: true });
// Preview images of the PDFs (for review only).
const pv = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await pv.setContent(flightHtml); await pv.screenshot({ path: path.join(OUT, "preview-flight.png") });
await pv.setContent(hotelHtml); await pv.screenshot({ path: path.join(OUT, "preview-hotel.png") });
await browser.close();
console.log("tickets written to", OUT);
