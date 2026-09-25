import Link from "next/link";
import AdminShell, { Panel } from "@/components/admin/AdminShell";
import AppointmentList from "@/components/admin/AppointmentList";
import BookingToggle from "@/components/admin/BookingToggle";
import { requireAdmin } from "@/lib/admin-auth";
import { listRecent, listRequests, listUpcoming } from "@/lib/appointments";
import { getBookingSettings } from "@/lib/booking-settings";
import { getReadiness } from "@/lib/booking-readiness";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const settings = await getBookingSettings();
  const readiness = await getReadiness();
  const [requests, upcoming, recent] = settings.connected
    ? await Promise.all([listRequests(), listUpcoming(), listRecent()])
    : [[], [], []];

  return (
    <AdminShell active="/admin" title="Bookings">
      <BookingToggle enabled={settings.enabled} readiness={readiness} />

      {settings.connected && (
        <p className="mt-4 text-sm text-ink-soft">
          {settings.enabled ? "Clients book at " : "Preview the client booking page (only you can see it while it’s off): "}
          <Link href="/book" className="font-medium text-rouge underline underline-offset-4">
            /book
          </Link>
        </p>
      )}

      <Panel
        title={`Requests${requests.length ? ` (${requests.length})` : ""}`}
        description="New online requests. Confirming or declining emails the client."
      >
        <AppointmentList items={requests} empty="No requests waiting." />
      </Panel>

      <Panel title="Upcoming" description="Confirmed appointments, soonest first.">
        <AppointmentList items={upcoming} empty="Nothing confirmed yet." />
      </Panel>

      <Panel title="Recent history" description="Declined, cancelled, completed and no-shows.">
        <AppointmentList items={recent} empty="No history yet." />
      </Panel>
    </AdminShell>
  );
}
