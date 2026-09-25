import { NextRequest, NextResponse } from "next/server";
import { getSlots } from "@/lib/availability";
import { bookingAccess } from "@/lib/booking-access";
import { resolveSelection } from "@/data/services";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { isValidYmd } from "@/lib/studio-time";

/** GET /api/booking/slots?services=classic-full-set,brow-lamination&date=2026-10-03 */
export async function GET(req: NextRequest) {
  if (await isRateLimited(`booking-slots:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }
  if (!(await bookingAccess())) {
    return NextResponse.json({ error: "Online booking isn't open." }, { status: 403 });
  }
  // Times depend on the TOTAL length of everything booked in the visit.
  const selection = resolveSelection((req.nextUrl.searchParams.get("services") ?? "").split(",").slice(0, 6));
  const date = req.nextUrl.searchParams.get("date");
  if (!selection || !isValidYmd(date)) {
    return NextResponse.json({ error: "Choose a service and a date." }, { status: 400 });
  }
  try {
    const slots = await getSlots(date, selection.duration);
    return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("slots failed:", err);
    return NextResponse.json({ error: "Couldn't load times. Please try again." }, { status: 500 });
  }
}
