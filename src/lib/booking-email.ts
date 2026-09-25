import "server-only";

import { Resend } from "resend";
import { siteConfig, fullAddress } from "@/config/site.config";
import { escapeHtml } from "@/lib/escape-html";
import { formatCurrency } from "@/lib/format";
import { formatAppointment } from "@/lib/studio-time";
import type { Appointment } from "@/lib/supabase-admin";

/**
 * Every booking email, in one module (Build Standard §5), and every
 * client-typed field goes through escapeHtml() before it enters HTML (§1).
 *
 * Sending needs RESEND_API_KEY and BOOKING_FROM_EMAIL — an address on the
 * client's own VERIFIED domain (SPF/DKIM/DMARC). If either is missing we skip
 * sending and log it; a booking request is never lost because an email
 * couldn't go out — it's in the dashboard regardless. We never fall back to
 * Resend's shared onboarding@resend.dev (Wallink rule: it lands in spam).
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.BOOKING_FROM_EMAIL);
}

async function send(to: string, subject: string, html: string, text: string, replyTo?: string) {
  if (!isEmailConfigured() || !to) {
    console.warn(`booking email skipped (${!to ? "no recipient" : "email not configured"}): ${subject}`);
    return;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `${siteConfig.name} <${process.env.BOOKING_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) console.error("booking email failed:", error.message);
  } catch (err) {
    console.error("booking email failed:", err);
  }
}

/* ── Layout ─────────────────────────────────────────────────────────────── */

const C = { noir: "#110a0f", papier: "#f7e6ec", rose: "#f2a7c6", rouge: "#a8264f", ink: "#2a1420", soft: "#6b4a5a" };

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:${C.papier};font-family:Georgia,'Times New Roman',serif;color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.papier};padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="background:${C.noir};padding:28px 24px;text-align:center">
<div style="font-family:'Brush Script MT',cursive;font-size:44px;color:${C.rose};line-height:1">Lash</div>
<div style="font-size:14px;letter-spacing:6px;color:#f6eadf;margin-top:6px">L&rsquo;ATELIER</div>
</td></tr>
<tr><td style="padding:28px 28px 8px"><h1 style="margin:0 0 14px;font-size:24px;font-weight:normal">${title}</h1>${body}</td></tr>
<tr><td style="padding:20px 28px 28px;font-size:13px;color:${C.soft};border-top:1px solid #f0dce4">
${escapeHtml(siteConfig.name)} &middot; ${escapeHtml(fullAddress)}<br>${escapeHtml(siteConfig.phone.display)}
</td></tr></table></td></tr></table></body></html>`;
}

function details(a: Appointment): string {
  const rows: [string, string][] = [
    ["Service", a.service_name + (a.price_dollars !== null ? ` — ${formatCurrency(a.price_dollars)}` : "")],
    ["When", formatAppointment(a.starts_at)],
    ["Length", `about ${a.duration_minutes} minutes`],
  ];
  if (a.add_ons.length) rows.push(["Add-ons", a.add_ons.join(", ")]);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:6px 0 18px;font-size:15px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:${C.soft};white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

const p = (text: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.55">${text}</p>`;

function plain(a: Appointment): string {
  return `${a.service_name}\n${formatAppointment(a.starts_at)} (about ${a.duration_minutes} minutes)${a.add_ons.length ? `\nAdd-ons: ${a.add_ons.join(", ")}` : ""}`;
}

/* ── Messages ───────────────────────────────────────────────────────────── */

/** To the client, the moment they submit. */
export async function sendRequestReceived(a: Appointment) {
  const first = a.client_name.split(" ")[0];
  await send(
    a.client_email,
    "We received your appointment request",
    shell(
      `Merci, ${escapeHtml(first)}.`,
      p("Your appointment request is in. We&rsquo;ll look it over and send a confirmation shortly.") +
        details(a) +
        p(`Nothing is charged online and there&rsquo;s no card on file &mdash; you pay only when you&rsquo;re served. Need to change something? Call us at ${escapeHtml(siteConfig.phone.display)}.`),
    ),
    `Merci, ${first}. Your appointment request is in — we'll confirm shortly.\n\n${plain(a)}\n\nQuestions? Call ${siteConfig.phone.display}.`,
  );
}

/** To the studio, so a request never waits unseen. */
export async function sendStudioNotification(a: Appointment, to: string) {
  await send(
    to,
    `New booking request — ${a.service_name}, ${formatAppointment(a.starts_at)}`,
    shell(
      "New booking request",
      details(a) +
        p(
          `<strong>${escapeHtml(a.client_name)}</strong>${a.is_new_client ? " (new client &mdash; $25 welcome offer)" : ""}<br>${escapeHtml(a.client_phone)}<br>${escapeHtml(a.client_email)}`,
        ) +
        (a.notes ? p(`&ldquo;${escapeHtml(a.notes)}&rdquo;`) : "") +
        p(`Confirm or decline it in the admin dashboard: ${escapeHtml(siteConfig.url)}/admin`),
    ),
    `New booking request\n\n${plain(a)}\n\n${a.client_name}${a.is_new_client ? " (new client)" : ""}\n${a.client_phone}\n${a.client_email}${a.notes ? `\n\n"${a.notes}"` : ""}\n\n${siteConfig.url}/admin`,
    a.client_email,
  );
}

/** To the client, when the studio confirms, declines or cancels. */
export async function sendStatusUpdate(a: Appointment) {
  const first = a.client_name.split(" ")[0];
  const call = `Call us at ${escapeHtml(siteConfig.phone.display)}`;
  const byStatus: Partial<Record<Appointment["status"], { subject: string; title: string; body: string }>> = {
    confirmed: {
      subject: "Your appointment is confirmed",
      title: `You&rsquo;re booked, ${escapeHtml(first)}.`,
      body: p("We can&rsquo;t wait to see you.") + details(a) + p(`${escapeHtml(fullAddress)}. Running late or need to reschedule? ${call}.`),
    },
    declined: {
      subject: "About your appointment request",
      title: `We&rsquo;re sorry, ${escapeHtml(first)}.`,
      body: p("We weren&rsquo;t able to take this time.") + details(a) + p(`${call} and we&rsquo;ll find one that works.`),
    },
    cancelled: {
      subject: "Your appointment has been cancelled",
      title: "Your appointment is cancelled",
      body: details(a) + p(`If this is unexpected, or you&rsquo;d like to rebook, ${call.toLowerCase()}.`),
    },
  };
  const m = byStatus[a.status];
  if (!m) return;
  await send(a.client_email, m.subject, shell(m.title, m.body), `${m.subject}\n\n${plain(a)}\n\n${siteConfig.phone.display}`);
}
