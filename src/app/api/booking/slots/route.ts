import { NextRequest, NextResponse } from "next/server";
import { getSlots } from "@/lib/availability";
import { bookingAccess } from "@/lib/booking-access";
import { findBookableService } from "@/data/services";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { isValidYmd } from "@/lib/studio-time";

/** GET /api/booking/slots?service=classic-full-set&date=2026-10-03 */
export async function GET(req: NextRequest) {
  if (await isRateLimited(`booking-slots:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }
  if (!(await bookingAccess())) {
    return NextResponse.json({ error: "Online booking isn't open." }, { status: 403 });
  }
  const service = findBookableService(req.nextUrl.searchParams.get("service") ?? "");
  const date = req.nextUrl.searchParams.get("date");
  if (!service || !isValidYmd(date)) {
    return NextResponse.json({ error: "Choose a service and a date." }, { status: 400 });
  }
  try {
    const slots = await getSlots(date, service.duration);
    return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("slots failed:", err);
    return NextResponse.json({ error: "Couldn't load times. Please try again." }, { status: 500 });
  }
}
