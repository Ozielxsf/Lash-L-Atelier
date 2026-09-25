"use client";

import { useActionState } from "react";
import { saveBookingPreferences } from "@/app/admin/actions";
import FormStatus, { inputClass, saveClass } from "@/components/admin/FormStatus";
import type { BookingSettings } from "@/lib/booking-settings";

export default function PreferencesForm({ settings }: { settings: BookingSettings }) {
  const [state, action, pending] = useActionState(saveBookingPreferences, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Send new-request alerts to
        <input type="email" name="notification_email" defaultValue={settings.notificationEmail} placeholder="studio@example.com" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Minimum notice (hours)
        <input type="number" name="lead_hours" min={0} max={336} defaultValue={settings.leadHours} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Clients can book up to (days ahead)
        <input type="number" name="window_days" min={1} max={365} defaultValue={settings.windowDays} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Offer start times every
        <select name="slot_minutes" defaultValue={String(settings.slotMinutes)} className={inputClass}>
          {[10, 15, 20, 30, 60].map((m) => (
            <option key={m} value={m}>{m} minutes</option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending} className={saveClass}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
