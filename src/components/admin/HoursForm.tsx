"use client";

import { useActionState, useState } from "react";
import { saveBusinessHours } from "@/app/admin/actions";
import FormStatus, { inputClass, saveClass } from "@/components/admin/FormStatus";
import type { BusinessHours } from "@/lib/supabase-admin";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Monday-first reads naturally for a studio week.
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function HoursForm({ hours }: { hours: BusinessHours[] }) {
  const [state, action, pending] = useActionState(saveBusinessHours, null);
  const byDay = new Map(hours.map((h) => [h.weekday, h]));
  const [open, setOpen] = useState<Record<number, boolean>>(
    Object.fromEntries(ORDER.map((d) => [d, byDay.get(d)?.is_open ?? false])),
  );

  return (
    <form action={action} className="space-y-3">
      {ORDER.map((d) => {
        const h = byDay.get(d);
        return (
          <fieldset key={d} className="flex flex-wrap items-center gap-3 border-b border-ink/10 pb-3 last:border-0">
            <legend className="sr-only">{DAYS[d]}</legend>
            <label className="flex w-40 items-center gap-3 font-medium">
              <input
                type="checkbox"
                name={`open-${d}`}
                checked={open[d]}
                onChange={(e) => setOpen((o) => ({ ...o, [d]: e.target.checked }))}
                className="h-5 w-5 accent-rouge"
              />
              {DAYS[d]}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="sr-only">{DAYS[d]} opens at</span>
              <input type="time" name={`start-${d}`} defaultValue={h?.open_time.slice(0, 5) ?? "10:00"} disabled={!open[d]} className={inputClass} />
            </label>
            <span aria-hidden="true" className="text-ink-soft">to</span>
            <label className="flex items-center gap-2 text-sm">
              <span className="sr-only">{DAYS[d]} closes at</span>
              <input type="time" name={`end-${d}`} defaultValue={h?.close_time.slice(0, 5) ?? "18:00"} disabled={!open[d]} className={inputClass} />
            </label>
            {!open[d] && <span className="text-sm text-ink-soft">Closed</span>}
            {/* Disabled inputs aren't submitted; keep the stored times for closed days. */}
            {!open[d] && (
              <>
                <input type="hidden" name={`start-${d}`} value={h?.open_time.slice(0, 5) ?? "10:00"} />
                <input type="hidden" name={`end-${d}`} value={h?.close_time.slice(0, 5) ?? "18:00"} />
              </>
            )}
          </fieldset>
        );
      })}
      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className={saveClass}>
          {pending ? "Saving…" : "Save hours"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
