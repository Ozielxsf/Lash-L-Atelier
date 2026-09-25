"use client";

import { useState, useTransition } from "react";
import { updateAppointmentStatus } from "@/app/admin/actions";
import type { AppointmentStatus } from "@/lib/supabase-admin";
import { cn } from "@/lib/utils";

const LABELS: Record<AppointmentStatus, string> = {
  requested: "Requested",
  confirmed: "Confirm",
  declined: "Decline",
  cancelled: "Cancel",
  completed: "Completed",
  no_show: "No-show",
};

// Anything that emails the client bad news asks first.
const CONFIRM_FIRST: Partial<Record<AppointmentStatus, string>> = {
  declined: "Decline this request? The client will be emailed.",
  cancelled: "Cancel this appointment? The client will be emailed.",
  no_show: "Mark as a no-show?",
};

export default function AppointmentActions({ id, next }: { id: string; next: AppointmentStatus[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  if (!next.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {next.map((status) => {
        const primary = status === "confirmed" || status === "completed";
        return (
          <button
            key={status}
            type="button"
            disabled={pending}
            onClick={() => {
              const q = CONFIRM_FIRST[status];
              if (q && !window.confirm(q)) return;
              start(async () => {
                const res = await updateAppointmentStatus(id, status);
                setError(res.ok ? "" : res.error);
              });
            }}
            className={cn(
              "min-h-10 rounded-full px-4 text-sm font-medium transition-colors disabled:opacity-50",
              primary ? "bg-rouge text-white hover:bg-rouge-deep" : "border border-ink/20 text-ink hover:border-rouge hover:text-rouge",
            )}
          >
            {LABELS[status]}
          </button>
        );
      })}
      {error && <p role="alert" className="w-full text-sm text-rouge">{error}</p>}
    </div>
  );
}
