import AppointmentActions from "@/components/admin/AppointmentActions";
import { NEXT_STATUSES } from "@/lib/appointments";
import { formatCurrency } from "@/lib/format";
import { formatAppointment } from "@/lib/studio-time";
import type { Appointment } from "@/lib/supabase-admin";

const STATUS_STYLE: Record<Appointment["status"], string> = {
  requested: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  declined: "bg-ink/10 text-ink-soft",
  cancelled: "bg-ink/10 text-ink-soft",
  completed: "bg-ink/10 text-ink",
  no_show: "bg-rouge/10 text-rouge",
};

export default function AppointmentList({ items, empty }: { items: Appointment[]; empty: string }) {
  if (!items.length) return <p className="text-sm text-ink-soft">{empty}</p>;
  return (
    <ul className="divide-y divide-ink/10">
      {items.map((a) => (
        <li key={a.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-display text-xl leading-tight">
              {formatAppointment(a.starts_at)}
              <span className={`ml-2 inline-block rounded-full px-2 py-0.5 align-middle font-sans text-[0.7rem] font-medium tracking-wide uppercase ${STATUS_STYLE[a.status]}`}>
                {a.status.replace("_", "-")}
              </span>
              {a.source === "preview" && (
                <span className="ml-2 inline-block rounded-full bg-ink/10 px-2 py-0.5 align-middle font-sans text-[0.7rem] tracking-wide uppercase">
                  test
                </span>
              )}
            </p>
            <p className="mt-1 text-sm">
              {a.service_name} · {a.duration_minutes} min
              {a.price_dollars !== null && ` · ${formatCurrency(a.price_dollars)}`}
              {a.add_ons.length > 0 && ` · + ${a.add_ons.join(", ")}`}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              <span className="font-medium text-ink">{a.client_name}</span>
              {" · "}
              <a href={`tel:${a.client_phone}`} className="underline underline-offset-2">{a.client_phone}</a>
              {" · "}
              <a href={`mailto:${a.client_email}`} className="underline underline-offset-2 break-all">{a.client_email}</a>
            </p>
            {a.notes && <p className="mt-1 text-sm text-ink-soft italic">“{a.notes}”</p>}
          </div>
          <AppointmentActions id={a.id} next={NEXT_STATUSES[a.status]} />
        </li>
      ))}
    </ul>
  );
}
