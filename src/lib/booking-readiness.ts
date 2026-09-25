import "server-only";

import { getBusinessHours } from "@/lib/availability";
import { getBookingSettings } from "@/lib/booking-settings";
import { isEmailConfigured } from "@/lib/booking-email";

/**
 * The "is it ready to go?" checklist on the dashboard. `blocking` items must
 * pass before the switch can be turned on — each one, if missing, would mean
 * a broken or unprotected booking form in front of real clients.
 */
export type ReadinessItem = { label: string; ok: boolean; blocking: boolean; help: string };

export async function getReadiness(): Promise<ReadinessItem[]> {
  const settings = await getBookingSettings();
  let openDays = 0;
  if (settings.connected) {
    try {
      openDays = (await getBusinessHours()).filter((h) => h.is_open).length;
    } catch {
      /* counted as 0 */
    }
  }
  return [
    {
      label: "Database connected",
      ok: settings.connected,
      blocking: true,
      help: "Supabase URL + service-role key set in Vercel, and the booking migration applied.",
    },
    {
      label: "Studio hours set",
      ok: openDays > 0,
      blocking: true,
      help: "Open at least one day on the Schedule page. Clients can only book inside these hours.",
    },
    {
      label: "Spam protection (Turnstile)",
      ok: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY),
      blocking: true,
      help: "Cloudflare Turnstile keys set in Vercel. Without them every booking is rejected.",
    },
    {
      label: "Confirmation emails",
      ok: isEmailConfigured(),
      blocking: false,
      help: "Resend key + a verified sending address. Without them, requests still arrive here but nobody is emailed.",
    },
    {
      label: "Studio notification email",
      ok: settings.notificationEmail.includes("@"),
      blocking: false,
      help: "Where new-request alerts go. Set it on the Schedule page.",
    },
    {
      label: "Durable rate limiting (Upstash)",
      ok: Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
      blocking: false,
      help: "Connect Upstash Redis in Vercel so abuse limits hold across servers.",
    },
  ];
}
