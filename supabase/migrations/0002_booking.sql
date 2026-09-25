-- Lash L'Atelier — online booking (phase 2).
--
-- Apply after 0001_baseline.sql. Same security model as the baseline:
-- RLS ON for every table and NO policies. The site reaches these tables only
-- server-side with the service-role key; the browser can never read or write
-- them, so a leaked anon key exposes nothing.

create extension if not exists btree_gist;

-- ── Weekly studio hours ─────────────────────────────────────────────────────
-- One row per weekday (0 = Sunday … 6 = Saturday, matching JS getDay()).
-- Seeded CLOSED: the owner sets real hours in /admin/schedule. We never guess
-- opening hours (CLAUDE.md), and booking cannot be switched on until at least
-- one day is open.
create table if not exists public.business_hours (
  weekday    smallint primary key check (weekday between 0 and 6),
  is_open    boolean  not null default false,
  open_time  time     not null default '10:00',
  close_time time     not null default '18:00',
  updated_at timestamptz not null default now(),
  check (close_time > open_time)
);

insert into public.business_hours (weekday) values (0),(1),(2),(3),(4),(5),(6)
on conflict (weekday) do nothing;

-- ── Days off (holidays, vacations, training days) ───────────────────────────
create table if not exists public.time_off (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  starts_on  date not null,
  ends_on    date not null,
  reason     text,
  check (ends_on >= starts_on)
);
create index if not exists time_off_range_idx on public.time_off (starts_on, ends_on);

-- ── Appointments ────────────────────────────────────────────────────────────
-- The service name, duration and price are COPIED onto the row at booking
-- time, so editing the menu later never rewrites the history of what a client
-- actually booked.
create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  service_id       text not null,
  service_name     text not null,
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  price_dollars    integer,
  add_ons          text[] not null default '{}',
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  client_name      text not null check (char_length(client_name) between 1 and 120),
  client_phone     text not null check (char_length(client_phone) between 7 and 40),
  client_email     text not null check (char_length(client_email) between 3 and 254),
  notes            text check (char_length(notes) <= 1000),
  is_new_client    boolean not null default false,
  status           text not null default 'requested'
                   check (status in ('requested','confirmed','declined','cancelled','completed','no_show')),
  source           text not null default 'online' check (source in ('online','preview','admin')),
  check (ends_at > starts_at),
  -- The database itself refuses two live bookings that overlap in time, so a
  -- race between two visitors submitting the same slot can never double-book.
  constraint appointments_no_overlap exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('requested','confirmed'))
);
create index if not exists appointments_starts_at_idx on public.appointments (starts_at);
create index if not exists appointments_status_idx    on public.appointments (status);

-- ── Booking settings (in the baseline site_settings key/value table) ────────
-- online_booking_enabled stays 'false' until the owner flips the switch in
-- /admin. The rest are sensible defaults the owner can change there.
insert into public.site_settings (key, value) values
  ('online_booking_enabled', 'false'),
  ('booking_notification_email', ''),
  ('booking_lead_hours', '12'),
  ('booking_window_days', '60'),
  ('booking_slot_minutes', '15')
on conflict (key) do nothing;

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.business_hours enable row level security;
alter table public.time_off       enable row level security;
alter table public.appointments   enable row level security;

-- ── Verify ──────────────────────────────────────────────────────────────────
--   select tablename, rowsecurity from pg_tables
--   where schemaname = 'public'
--     and tablename in ('leads','page_views','site_settings','business_hours','time_off','appointments');
