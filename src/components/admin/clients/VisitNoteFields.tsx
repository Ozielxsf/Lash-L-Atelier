"use client";

import { useEffect, useRef } from "react";
import { inputClass, textareaClass } from "@/components/admin/FormStatus";

const AUTHOR_KEY = "lash-admin-author";

/**
 * The visit-note fields, shared by "Add a visit note" and the walk-in form.
 * "Written by" is remembered on this device (each person tends to use their
 * own phone) until staff have their own sign-ins.
 */
export default function VisitNoteFields({
  today,
  services,
  team,
  required = false,
}: {
  today: string;
  services: string[];
  team: string[];
  required?: boolean;
}) {
  const select = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTHOR_KEY);
      if (saved && team.includes(saved) && select.current) select.current.value = saved;
    } catch {
      /* storage blocked — fine, they pick each time */
    }
  }, [team]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="flex flex-col gap-1 text-sm">
        Visit date
        <input type="date" name="visit_date" defaultValue={today} max={today} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Service
        <input type="text" name="service" list="menu-services" maxLength={200} placeholder="e.g. Volume Fill" className={inputClass} />
        <datalist id="menu-services">
          {services.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Written by
        <select
          ref={select}
          name="author"
          defaultValue=""
          onChange={(e) => {
            try {
              localStorage.setItem(AUTHOR_KEY, e.target.value);
            } catch {
              /* ignore */
            }
          }}
          className={inputClass}
        >
          <option value="">—</option>
          {team.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-3">
        Note
        <textarea
          name="note_body"
          required={required}
          maxLength={4000}
          placeholder="What was done — curl, lengths, thickness, adhesive, how the skin reacted, what to try next time…"
          className={textareaClass}
        />
      </label>
    </div>
  );
}
