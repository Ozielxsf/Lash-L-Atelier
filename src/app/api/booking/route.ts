import { NextRequest, NextResponse } from "next/server";
import { createAppointment, parseBookingInput } from "@/lib/appointments";
import { bookingAccess } from "@/lib/booking-access";
import { sendRequestReceived, sendStudioNotification } from "@/lib/booking-email";
import { getBookingSettings } from "@/lib/booking-settings";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { verifyTurnstile } from "@/lib/verify-turnstile";

/**
 * POST /api/booking — create an appointment REQUEST (the studio confirms it
 * from the dashboard). Order matters: rate limit → is booking open → bot check
 * → validate → re-check the slot and insert → emails. Emails never block the
 * response on failure; the request is safely in the dashboard either way.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (await isRateLimited(`booking-create:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please call us instead." }, { status: 429 });
  }

  const access = await bookingAccess();
  if (!access) return NextResponse.json({ error: "Online booking isn't open. Please call us." }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const human = await verifyTurnstile(body.turnstileToken, ip);
  if (!human.ok) return NextResponse.json({ error: human.error }, { status: human.status });

  const parsed = parseBookingInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });

  const created = await createAppointment(parsed.value, access === "preview" ? "preview" : "online");
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: created.status });

  const { notificationEmail } = await getBookingSettings();
  await Promise.allSettled([
    sendRequestReceived(created.value),
    sendStudioNotification(created.value, notificationEmail),
  ]);

  return NextResponse.json({ ok: true, id: created.value.id });
}
