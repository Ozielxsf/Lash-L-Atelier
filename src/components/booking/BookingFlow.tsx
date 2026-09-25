"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock, Loader2, Sparkles } from "lucide-react";
import Flourish from "@/components/brand/Flourish";
import { useTurnstile } from "@/lib/turnstile";
import { formatCurrency } from "@/lib/format";
import { dayParts, formatLongDate, formatMinutes } from "@/lib/studio-time";
import type { Slot } from "@/lib/slots";
import { cn } from "@/lib/utils";

export type FlowService = {
  id: string;
  name: string;
  price: number | null;
  duration: number;
  category: string;
  french: string;
  /** One pick per group — full sets and fills share "lashes". */
  group: string;
};
export type FlowDay = { ymd: string; open: boolean };

const NUMERALS = ["I", "II", "III", "IV"];

function Step({ n, title, children, id }: { n: number; title: string; children: React.ReactNode; id: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-t border-ink/10 pt-8 first:border-0 first:pt-0">
      <h2 id={`${id}-title`} className="flex items-baseline gap-3 font-display text-[1.9rem] leading-tight font-medium text-ink">
        <span className="font-caps text-sm font-semibold text-rouge">{NUMERALS[n]}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * Cloudflare Turnstile, mounted only when the details form appears — the
 * widget needs its container to exist when the script renders it. Bump
 * `resetSignal` to issue a fresh token after a failed submit (tokens are
 * single-use).
 */
function TurnstileField({ onToken, resetSignal }: { onToken: (t: string) => void; resetSignal: number }) {
  const { token, ref, reset } = useTurnstile();
  useEffect(() => onToken(token), [token, onToken]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset identity changes each render; only the signal matters
  }, [resetSignal]);
  return <div ref={ref} className="min-h-[65px]" />;
}

function hoursLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} hr${m ? ` ${m} min` : ""}` : `${m} min`;
}

/**
 * The client booking flow. Four steps on one page — services, day, time,
 * details — each revealed as the last is answered, and the view glides to it
 * so a phone user never hunts for what's next. Submits a REQUEST; the studio
 * confirms it from the dashboard.
 *
 * Step I allows ONE service per menu section (Oziel, Sept 2026) so a client
 * can book lashes + brows + a facial as one visit; times are then found for
 * the combined length. Full sets and fills are one choice (same lashes).
 */
export default function BookingFlow({
  services,
  days,
  addOns,
  phone,
  firstVisitNote,
}: {
  services: FlowService[];
  days: FlowDay[];
  addOns: { name: string; price: number | null }[];
  phone: { display: string; href: string };
  firstVisitNote: string;
}) {
  // group → chosen service id
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [date, setDate] = useState("");
  // Times are keyed by what they were loaded for, so a stale response can
  // never show against a newly chosen day, and "loading" is simply "no result
  // for the current key yet".
  const [loaded, setLoaded] = useState<{ key: string; slots: Slot[]; error: string } | null>(null);
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [token, setToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [reload, setReload] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  // The visit, in menu order, with its totals.
  const selected = services.filter((s) => picks[s.group] === s.id);
  const serviceIds = selected.map((s) => s.id);
  const hasVisit = selected.length > 0;
  const visitName = selected.map((s) => s.name).join(" + ");
  const totalMinutes = selected.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selected.some((s) => s.price === null) ? null : selected.reduce((sum, s) => sum + (s.price ?? 0), 0);

  // Sections: one per booking group, each holding its menu categories.
  const groups = [...new Set(services.map((s) => s.group))].map((group) => {
    const inGroup = services.filter((s) => s.group === group);
    const categories = [...new Set(inGroup.map((s) => s.category))];
    return { group, categories, items: inGroup };
  });

  const toggle = (s: FlowService) => {
    setPicks((p) => {
      const next = { ...p };
      if (next[s.group] === s.id) delete next[s.group];
      else next[s.group] = s.id;
      return next;
    });
    // The length changed, so any chosen time may no longer fit.
    setStart("");
  };

  const glide = (id: string) =>
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));

  const slotKey = hasVisit && date ? `${serviceIds.join(",")}|${date}|${reload}` : "";
  const current = loaded?.key === slotKey ? loaded : null;
  const slots = current && !current.error ? current.slots : null;
  const slotsError = current?.error ?? "";

  // Load times whenever the service or the day changes.
  useEffect(() => {
    if (!slotKey) return;
    let cancelled = false;
    fetch(`/api/booking/slots?services=${encodeURIComponent(serviceIds.join(","))}&date=${date}`)
      .then(async (res) => {
        const data = await res.json();
        if (!cancelled) setLoaded({ key: slotKey, slots: data.slots ?? [], error: res.ok ? "" : data.error ?? "Couldn't load times." });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key: slotKey, slots: [], error: "Couldn't load times. Check your connection and try again." });
      });
    return () => {
      cancelled = true;
    };
    // slotKey already encodes the services and the day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotKey]);

  async function submit(form: HTMLFormElement) {
    setError("");
    if (!token) {
      setError("Please complete the security check above the button.");
      return;
    }
    const fd = new FormData(form);
    setSubmitting(true);
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceIds,
        date,
        start,
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        notes: fd.get("notes"),
        addOns: fd.getAll("addOns"),
        turnstileToken: token,
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setSubmitting(false);
    if (res?.ok) {
      setDone(true);
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }
    setToken("");
    setTurnstileReset((n) => n + 1); // tokens are single-use
    setError(data.error ?? "Something went wrong. Please try again, or call us.");
    if (res?.status === 409) {
      // The time was taken — refresh the times so they can choose again.
      setStart("");
      setReload((n) => n + 1);
      glide("step-time");
    }
  }

  if (done && hasVisit) {
    return (
      <div ref={topRef} className="scroll-mt-28 rounded-3xl bg-white/80 px-6 py-10 text-center shadow-soft sm:px-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rouge text-white">
          <Check className="h-7 w-7" aria-hidden="true" />
        </span>
        <p aria-hidden="true" className="mt-5 font-script text-5xl text-rouge">Merci</p>
        <h2 className="mt-2 font-display text-3xl font-medium text-ink" role="status">
          Your request is in.
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-soft">
          {visitName} on {formatLongDate(date)} at {formatMinutes(minutes)}. We’ll confirm by email shortly — nothing is charged
          online, and you pay only when you’re served.
        </p>
        <Flourish className="mx-auto mt-6 text-rouge/50" />
        <p className="mt-4 text-sm text-ink-soft">
          Need to change something? Call{" "}
          <a href={phone.href} className="text-rouge underline underline-offset-4">{phone.display}</a>.
        </p>
      </div>
    );
  }

  return (
    <div ref={topRef} className="space-y-10">
      {/* I — Services */}
      <Step n={0} id="step-service" title="Choose your services">
        <p className="-mt-2 mb-6 text-ink-soft">
          Pick one from each section — lashes, brows and a facial can all be one visit. Tap again to remove.
        </p>
        <div className="space-y-8">
          {groups.map(({ group, categories, items }) => (
            <div key={group} role="radiogroup" aria-labelledby={`group-${group}`}>
              <p id={`group-${group}`} className="sr-only">
                {categories.join(" or ")} — choose one
              </p>
              {categories.map((cat) => {
                const catItems = items.filter((s) => s.category === cat);
                return (
                  <div key={cat} className="mt-6 first:mt-0">
                    <h3 aria-hidden="true" className="font-caps text-[0.7rem] font-semibold tracking-[0.26em] text-rouge uppercase">
                      {cat} <span className="ml-1 font-script text-lg tracking-normal normal-case">{catItems[0].french}</span>
                    </h3>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {catItems.map((s) => {
                        const on = picks[s.group] === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => toggle(s)}
                            className={cn(
                              "flex min-h-16 items-center justify-between gap-3 rounded-2xl border bg-white/70 px-4 py-3 text-left transition-colors",
                              on ? "border-rouge ring-1 ring-rouge" : "border-ink/15 hover:border-rouge/50",
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                                  on ? "border-rouge bg-rouge text-white" : "border-ink/30",
                                )}
                              >
                                {on && <Check className="h-3 w-3" />}
                              </span>
                              <span>
                                <span className="block font-display text-lg leading-tight text-ink">{s.name}</span>
                                <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
                                  <Clock className="h-3 w-3" aria-hidden="true" /> about {hoursLabel(s.duration)}
                                </span>
                              </span>
                            </span>
                            {s.price !== null && (
                              <span className="nums-lining font-display text-xl text-ink">{formatCurrency(s.price)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {categories.length > 1 && (
                <p className="mt-2 text-xs text-ink-soft">One lash service per visit — a full set or a fill.</p>
              )}
            </div>
          ))}
        </div>

        {/* Your visit — the running total, and the way forward. */}
        {hasVisit && (
          <div
            role="status"
            className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-10 mt-8 flex flex-col gap-3 rounded-2xl bg-noir px-5 py-4 text-creme shadow-lift sm:flex-row sm:items-center sm:justify-between lg:bottom-4"
          >
            <div className="min-w-0">
              <p className="font-caps text-[0.62rem] tracking-[0.26em] text-rose uppercase">Your visit</p>
              <p className="mt-1 font-display text-lg leading-snug">{visitName}</p>
              <p className="nums-lining mt-0.5 text-sm text-creme-muted">
                about {hoursLabel(totalMinutes)}
                {totalPrice !== null && ` · ${formatCurrency(totalPrice)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => glide("step-date")}
              className="min-h-12 shrink-0 rounded-full bg-rose px-6 text-[0.75rem] font-semibold tracking-[0.18em] text-noir uppercase"
            >
              Choose a day
            </button>
          </div>
        )}
      </Step>

      {/* II — Day */}
      {hasVisit && (
        <Step n={1} id="step-date" title="Pick a day">
          {days.some((d) => d.open) ? (
            <div
              role="radiogroup"
              aria-label="Available days"
              data-lenis-prevent-horizontal
              tabIndex={0}
              className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {days.map((d) => {
                const p = dayParts(d.ymd);
                const selected = date === d.ymd;
                return (
                  <button
                    key={d.ymd}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${formatLongDate(d.ymd)}${d.open ? "" : " — closed"}`}
                    disabled={!d.open}
                    onClick={() => {
                      setDate(d.ymd);
                      setStart("");
                      glide("step-time");
                    }}
                    className={cn(
                      "flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border text-center transition-colors",
                      selected
                        ? "border-rouge bg-rouge text-white"
                        : d.open
                          ? "border-ink/15 bg-white/70 text-ink hover:border-rouge/60"
                          : "border-transparent text-ink/30 line-through",
                    )}
                  >
                    <span className="text-[0.65rem] tracking-[0.14em] uppercase">{p.weekday}</span>
                    <span className="nums-lining font-display text-2xl leading-none">{p.day}</span>
                    <span className="text-[0.65rem] tracking-[0.14em] uppercase">{p.month}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-ink-soft">
              No days are open for online booking right now. Please call{" "}
              <a href={phone.href} className="text-rouge underline underline-offset-4">{phone.display}</a>.
            </p>
          )}
        </Step>
      )}

      {/* III — Time */}
      {hasVisit && date && (
        <Step n={2} id="step-time" title={`Choose a time · ${formatLongDate(date)}`}>
          {slotsError ? (
            <p role="alert" className="text-rouge">{slotsError}</p>
          ) : slots === null ? (
            <p className="flex items-center gap-2 text-ink-soft" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Finding open times…
            </p>
          ) : slots.length === 0 ? (
            <p className="text-ink-soft">
              That day doesn’t have a {hoursLabel(totalMinutes)} opening. Please try another day{selected.length > 1 ? ", or book fewer services" : ""}.
            </p>
          ) : (
            <div role="radiogroup" aria-label="Available times" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots.map((s) => (
                <button
                  key={s.start}
                  type="button"
                  role="radio"
                  aria-checked={start === s.start}
                  onClick={() => {
                    setStart(s.start);
                    setMinutes(s.minutes);
                    glide("step-details");
                  }}
                  className={cn(
                    "nums-lining min-h-12 rounded-xl border text-sm font-medium transition-colors",
                    start === s.start ? "border-rouge bg-rouge text-white" : "border-ink/15 bg-white/70 text-ink hover:border-rouge/60",
                  )}
                >
                  {formatMinutes(s.minutes)}
                </button>
              ))}
            </div>
          )}
        </Step>
      )}

      {/* IV — Details */}
      {hasVisit && date && start && (
        <Step n={3} id="step-details" title="Your details">
          <div className="mb-6 rounded-2xl bg-noir px-5 py-4 text-creme">
            <p className="font-display text-xl">{visitName}</p>
            <p className="nums-lining mt-1 text-sm text-creme-muted">
              {formatLongDate(date)} at {formatMinutes(minutes)} · about {hoursLabel(totalMinutes)}
              {totalPrice !== null && ` · ${formatCurrency(totalPrice)}`}
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit(e.currentTarget);
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
              Full name
              <input name="name" required minLength={2} maxLength={120} autoComplete="name" className="h-12 rounded-xl border border-ink/20 bg-white px-4 text-base font-normal outline-none focus:border-rouge" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Mobile number
              <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" className="h-12 rounded-xl border border-ink/20 bg-white px-4 text-base font-normal outline-none focus:border-rouge" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Email
              <input name="email" type="email" required autoComplete="email" className="h-12 rounded-xl border border-ink/20 bg-white px-4 text-base font-normal outline-none focus:border-rouge" />
            </label>

            {addOns.length > 0 && (
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium">Add a little extra? (optional)</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {addOns.map((a) => (
                    <label key={a.name} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-4 text-sm has-[:checked]:border-rouge has-[:checked]:text-rouge">
                      <input type="checkbox" name="addOns" value={a.name} className="accent-rouge" />
                      {a.name}
                      {a.price !== null && <span className="nums-lining text-ink-soft">+{formatCurrency(a.price)}</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {/* A statement, not a checkbox: the welcome offer is redeemed in person. */}
            <p className="flex items-start gap-3 rounded-2xl border border-rouge/25 bg-rouge/[0.06] px-4 py-3 text-sm text-ink sm:col-span-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rouge" aria-hidden="true" />
              {firstVisitNote}
            </p>

            <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
              Anything we should know? (optional)
              <textarea name="notes" rows={3} maxLength={1000} className="rounded-xl border border-ink/20 bg-white px-4 py-3 text-base font-normal outline-none focus:border-rouge" />
            </label>

            <div className="sm:col-span-2">
              <TurnstileField onToken={setToken} resetSignal={turnstileReset} />
            </div>

            {error && <p role="alert" className="text-sm text-rouge sm:col-span-2">{error}</p>}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-rouge text-[0.8rem] font-medium tracking-[0.2em] text-white uppercase shadow-[0_10px_30px_-10px_rgb(168_38_79/0.7)] hover:bg-rouge-deep disabled:opacity-60 sm:w-auto sm:px-10"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {submitting ? "Sending…" : "Request appointment"}
              </button>
              <p className="mt-3 text-xs text-ink-soft">
                No card needed — you pay only when you’re served. We’ll email to confirm your time. By booking you agree to our{" "}
                <a href="/privacy" className="underline underline-offset-2">privacy policy</a>.
              </p>
            </div>
          </form>
        </Step>
      )}
    </div>
  );
}
