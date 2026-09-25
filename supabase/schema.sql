-- Wallink Systems — baseline schema for a new client site.
-- Run this in the Supabase SQL editor on a fresh project, once.
--
-- Build Standards §6: RLS is ON for every table, with no public policies.
-- The site reaches these tables server-side only, using the service-role key,
-- which bypasses RLS by design. That means:
--   - the browser can never read or write these tables directly
--   - a leaked anon key exposes nothing
-- Do not add a permissive policy "to make it work". If something can't read a
-- table, it's running in the wrong place.

-- ── Leads: contact-form submissions ─────────────────────────────────────────
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  business_name text,
  email         text not null,
  phone         text,
  subject       text,
  message       text not null,
  status        text not null default 'new'
                check (status in ('new','reviewed','in_progress','closed'))
);

-- The admin list is always "newest first, optionally filtered by status".
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);

-- ── Page views: lightweight analytics ───────────────────────────────────────
create table if not exists public.page_views (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path       text not null,
  session_id text
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx       on public.page_views (path);

-- ── Site settings: things the owner can toggle ──────────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.leads         enable row level security;
alter table public.page_views    enable row level security;
alter table public.site_settings enable row level security;

-- Deliberately no policies. No policy + RLS on = deny all to anon and
-- authenticated roles. The service-role key used server-side bypasses RLS.

-- ── Verify ──────────────────────────────────────────────────────────────────
-- Every row below must show rowsecurity = true before the site goes live.
--   select tablename, rowsecurity
--   from pg_tables
--   where schemaname = 'public'
--     and tablename in ('leads','page_views','site_settings');
