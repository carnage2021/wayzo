import "server-only";
import { Resend } from "resend";
import { publicEnv } from "@/lib/env";

/**
 * Outgoing email via Resend. No-ops (and logs in dev) when RESEND_API_KEY is missing,
 * so local development works without an account. Daily briefs move to React Email in Phase 5.
 */
let client: Resend | null | undefined;
function resend(): Resend | null {
  if (client === undefined)
    client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  return client;
}

const FROM = process.env.EMAIL_FROM ?? "Wayzo <hello@wayzo.app>";

export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }) {
  const r = resend();
  if (!r) {
    if (process.env.NODE_ENV !== "production")
      console.info(`[email:dev] to=${msg.to} subject="${msg.subject}"`);
    return { sent: false as const, reason: "not_configured" as const };
  }
  const { error } = await r.emails.send({ from: FROM, ...msg });
  if (error) {
    console.error("[email] send failed", error.name);
    return { sent: false as const, reason: "provider_error" as const };
  }
  return { sent: true as const };
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

/** Branded, table-free email shell that renders in all major clients. */
function layout({
  heading,
  body,
  cta,
}: {
  heading: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  const button = cta
    ? `<p style="margin:28px 0 0"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#0B1020;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:16px 28px;border-radius:999px">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#F2F4F8;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#0B1020">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
  <div style="font-size:24px;font-weight:800;letter-spacing:-0.025em;margin-bottom:20px"><span style="display:inline-block;width:28px;height:28px;border-radius:9px;background:#D7FF3D;vertical-align:-6px;margin-right:8px"></span>wayzo</div>
  <div style="background:#ffffff;border-radius:28px;padding:36px 32px">
    <h1 style="margin:0;font-size:30px;line-height:1.1;font-weight:800;letter-spacing:-0.025em">${heading}</h1>
    <div style="margin-top:14px;font-size:16px;line-height:1.6;color:#4B5565">${body}</div>
    ${button}
  </div>
  <p style="margin:20px 0 0;font-size:13px;color:#5B6478;text-align:center">Upload tickets. Travel easy.</p>
</div></body></html>`;
}

export function waitlistConfirmationEmail(to: string) {
  return {
    to,
    subject: "You're on the Wayzo waitlist",
    text: `You're on the list!\n\nThanks for joining Wayzo early access. We'll email ${to} as soon as your invite is ready.\n\nUpload tickets. Travel easy.\n${publicEnv.appUrl}`,
    html: layout({
      heading: "You're on the list!",
      body: `<p style="margin:0">Thanks for joining Wayzo early access. We'll email <b style="color:#0B1020">${escapeHtml(to)}</b> as soon as your invite is ready.</p><p style="margin:14px 0 0">Until then, start collecting those booking emails. Soon you'll just drop them in and we'll run the trip.</p>`,
    }),
  };
}

export function verifyEmailEmail(to: string, link: string) {
  return {
    to,
    subject: "Confirm your email for Wayzo",
    text: `Confirm ${to} for your Wayzo account so bookings forwarded from it land in your trips:\n\n${link}\n\nThis link expires in 24 hours. If you didn't ask for this, ignore this email.`,
    html: layout({
      heading: "Confirm this email",
      body: `<p style="margin:0">Confirm <b style="color:#0B1020">${escapeHtml(to)}</b> for your Wayzo account so bookings forwarded from it land in your trips.</p><p style="margin:14px 0 0;font-size:14px">This link expires in 24 hours. If you didn't ask for this, you can ignore this email.</p>`,
      cta: { label: "Confirm email", href: link },
    }),
  };
}
