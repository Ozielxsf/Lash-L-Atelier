-- Lash L'Atelier — book several services in one visit (Oziel, Sept 2026).
--
-- A client may pick one service from each menu section (lash set OR fill,
-- brows, facial). The appointment keeps:
--   service_id    — the first service (kept for compatibility / sorting)
--   service_ids   — every service booked, in menu order
--   service_name  — the combined label, e.g. "Classic Full Set + Brow Lamination"
--   duration_minutes / price_dollars — the totals
alter table public.appointments
  add column if not exists service_ids text[] not null default '{}';

-- Back-fill existing rows so every appointment lists its services.
update public.appointments set service_ids = array[service_id] where service_ids = '{}';
