"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, CircleAlert, CircleX } from "lucide-react";
import { setOnlineBooking } from "@/app/admin/actions";
import type { ReadinessItem } from "@/lib/booking-readiness";
import { cn } from "@/lib/utils";

/**
 * THE switch. Off = every Book button on the site calls the studio. On =
 * they open /book. Turning it on is refused (server-side too) until every
 * blocking readiness item passes.
 */
export default function BookingToggle({ enabled, readiness }: { enabled: boolean; readiness: ReadinessItem[] }) {
  const [optimistic, setOptimistic] = useOptimistic(enabled);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const blocked = readiness.some((r) => r.blocking && !r.ok);

  const flip = () => {
    const next = !optimistic;
    if (next && !window.confirm("Turn ON online booking? Every Book button on the site will open the booking page for clients.")) return;
    if (!next && !window.confirm("Turn OFF online booking? Book buttons will go back to calling the studio.")) return;
    start(async () => {
      setOptimistic(next);
      const res = await setOnlineBooking(next);
      setMessage(res.ok ? { ok: true, text: res.message ?? "Saved." } : { ok: false, text: res.error });
    });
  };

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white/85 shadow-soft">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 id="booking-switch-label" className="font-display text-2xl font-medium">
            Online booking
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {optimistic
              ? "ON — clients can request appointments at /book. You confirm each one below."
              : "OFF — every Book button calls the studio. You can still preview /book while signed in."}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={optimistic}
          aria-labelledby="booking-switch-label"
          onClick={flip}
          disabled={pending || (!optimistic && blocked)}
          className={cn(
            "relative inline-flex h-12 w-24 shrink-0 items-center rounded-full border-2 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50",
            optimistic ? "border-rouge bg-rouge" : "border-ink/25 bg-ink/10",
          )}
        >
          <span className="sr-only">{optimistic ? "On" : "Off"}</span>
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-white shadow-md transition-[left] duration-300 ease-soir",
              optimistic ? "left-[calc(100%-2.5rem)]" : "left-1",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute text-[0.68rem] font-semibold tracking-[0.14em] uppercase",
              optimistic ? "left-3 text-white" : "right-3 text-ink-soft",
            )}
          >
            {optimistic ? "On" : "Off"}
          </span>
        </button>
      </div>

      {message && (
        <p role="status" className={cn("px-6 pb-4 text-sm", message.ok ? "text-emerald-800" : "text-rouge")}>
          {message.text}
        </p>
      )}

      <div className="border-t border-ink/10 bg-papier-lift/60 p-5 sm:p-6">
        <h3 className="font-caps text-[0.68rem] font-semibold tracking-[0.26em] text-rouge uppercase">Ready-to-go checklist</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {readiness.map((item) => {
            const Icon = item.ok ? Check : item.blocking ? CircleX : CircleAlert;
            return (
              <li key={item.label} className="flex gap-3 text-sm">
                <Icon
                  className={cn("mt-0.5 h-4 w-4 shrink-0", item.ok ? "text-emerald-700" : item.blocking ? "text-rouge" : "text-amber-700")}
                  aria-hidden="true"
                />
                <span>
                  <span className="font-medium">{item.label}</span>
                  <span className="sr-only">{item.ok ? " — done" : item.blocking ? " — required" : " — recommended"}</span>
                  {!item.ok && <span className="block text-ink-soft">{item.help}</span>}
                </span>
              </li>
            );
          })}
        </ul>
        {blocked && !optimistic && (
          <p className="mt-4 text-sm text-ink-soft">The switch unlocks when every red item is done.</p>
        )}
      </div>
    </section>
  );
}
