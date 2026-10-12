-- Lash L'Atelier — client records (Oziel, Oct 2026).
--
-- A card per client: contact details, birthday, allergies & sensitivities,
-- preferences, general notes, and a dated note per visit. Bookings link to
-- their client automatically (matched on phone, then email); walk-ins are
-- added by hand from /admin/clients/new.
--
-- Same security model as every other table: RLS ON, NO policies. Only the
-- server (service-role key, behind the admin sign-in) can read or write.
-- Allergy/sensitivity notes are health-adjacent — keep it that way.

-- ── Clients ─────────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 1 and 120),
  phone        text check (char_length(phone) <= 40),
  -- Last 10 digits of the phone, so "(724) 467-3479" and "+1 724-467-3479"
  -- are the same client. Used to match bookings and to stop duplicates.
  phone_digits text generated always as (
    nullif(right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 10), '')
  ) stored,
  email        text check (char_length(email) <= 254),
  birthday     date,
  allergies    text check (char_length(allergies) <= 2000),
  preferences  text check (char_length(preferences) <= 2000),
  notes        text check (char_length(notes) <= 4000),
  source       text not null default 'admin' check (source in ('booking', 'walk_in', 'admin'))
);
create unique index if not exists clients_phone_digits_key on public.clients (phone_digits) where phone_digits is not null;
create index if not exists clients_email_idx on public.clients (lower(email));
create index if not exists clients_name_idx on public.clients (lower(name));

-- ── Visit notes ─────────────────────────────────────────────────────────────
-- One per visit (or any time something's worth writing down): what was done,
-- lash map, products, reactions. Written-by is a name chosen on the form
-- until staff have their own sign-ins.
create table if not exists public.client_notes (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  client_id      uuid not null references public.clients (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  visit_date     date not null default ((now() at time zone 'America/New_York')::date),
  service        text check (char_length(service) <= 200),
  body           text not null check (char_length(body) between 1 and 4000),
  author         text check (char_length(author) <= 80)
);
create index if not exists client_notes_client_idx on public.client_notes (client_id, visit_date desc);

-- ── Link bookings to clients ────────────────────────────────────────────────
alter table public.appointments
  add column if not exists client_id uuid references public.clients (id) on delete set null;
create index if not exists appointments_client_idx on public.appointments (client_id);

-- ── Row-Level Security: on, no policies (server-only access) ───────────────
alter table public.clients enable row level security;
alter table public.client_notes enable row level security;

-- ── Back-fill: one client per phone from real (non-test) bookings ──────────
insert into public.clients (name, phone, email, source, created_at)
select distinct on (digits) client_name, client_phone, lower(client_email), 'booking', created_at
from (
  select *, nullif(right(regexp_replace(client_phone, '\D', '', 'g'), 10), '') as digits
  from public.appointments
  where source <> 'preview' and client_id is null
) a
where digits is not null
order by digits, created_at desc
on conflict (phone_digits) where phone_digits is not null do nothing;

update public.appointments a
set client_id = c.id
from public.clients c
where a.client_id is null
  and a.source <> 'preview'
  and c.phone_digits = nullif(right(regexp_replace(a.client_phone, '\D', '', 'g'), 10), '');
