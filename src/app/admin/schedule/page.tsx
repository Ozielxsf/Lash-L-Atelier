import AdminShell, { Panel } from "@/components/admin/AdminShell";
import HoursForm from "@/components/admin/HoursForm";
import PreferencesForm from "@/components/admin/PreferencesForm";
import TimeOffForm from "@/components/admin/TimeOffForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getBusinessHours, getTimeOff } from "@/lib/availability";
import { getBookingSettings } from "@/lib/booking-settings";
import { addDays, studioYmd } from "@/lib/studio-time";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  await requireAdmin();
  const settings = await getBookingSettings();

  if (!settings.connected) {
    return (
      <AdminShell active="/admin/schedule" title="Schedule">
        <Panel title="Not connected yet">
          <p className="text-sm text-ink-soft">The booking database isn’t connected, so there’s nothing to schedule yet.</p>
        </Panel>
      </AdminShell>
    );
  }

  const today = studioYmd(new Date());
  const [hours, timeOff] = await Promise.all([getBusinessHours(), getTimeOff(today, addDays(today, 400))]);

  return (
    <AdminShell active="/admin/schedule" title="Schedule">
      <Panel title="Weekly hours" description="Clients can only book inside these hours. Times are studio time (Eastern).">
        <HoursForm hours={hours} />
      </Panel>
      <Panel title="Days off" description="Holidays, vacations, training days — nobody can book these.">
        <TimeOffForm items={timeOff} />
      </Panel>
      <Panel title="Booking settings">
        <PreferencesForm settings={settings} />
      </Panel>
    </AdminShell>
  );
}
