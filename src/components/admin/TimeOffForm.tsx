"use client";

import { useActionState, useTransition } from "react";
import { addTimeOff, deleteTimeOff } from "@/app/admin/actions";
import FormStatus, { inputClass, saveClass } from "@/components/admin/FormStatus";
import { formatLongDate } from "@/lib/studio-time";
import type { TimeOff } from "@/lib/supabase-admin";

export default function TimeOffForm({ items }: { items: TimeOff[] }) {
  const [state, action, pending] = useActionState(addTimeOff, null);
  const [removing, start] = useTransition();
  return (
    <div>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          First day
          <input type="date" name="starts_on" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Last day <span className="sr-only">(optional)</span>
          <input type="date" name="ends_on" className={inputClass} />
        </label>
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm">
          Note (optional)
          <input type="text" name="reason" maxLength={200} placeholder="e.g. Holiday" className={inputClass} />
        </label>
        <button type="submit" disabled={pending} className={saveClass}>
          {pending ? "Adding…" : "Add"}
        </button>
      </form>
      <div className="mt-2"><FormStatus state={state} /></div>

      <ul className="mt-4 divide-y divide-ink/10">
        {items.length === 0 && <li className="py-2 text-sm text-ink-soft">No days off coming up.</li>}
        {items.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>
              {formatLongDate(t.starts_on)}
              {t.ends_on !== t.starts_on && ` – ${formatLongDate(t.ends_on)}`}
              {t.reason && <span className="text-ink-soft"> · {t.reason}</span>}
            </span>
            <button
              type="button"
              disabled={removing}
              onClick={() => start(async () => void (await deleteTimeOff(t.id)))}
              className="min-h-10 rounded-full px-3 text-rouge hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
